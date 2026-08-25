const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const OpenAI = require('openai');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { Readable } = require('stream');
const Document = require('./models/docModel');
const authRoutes = require('./routes/authRoutes');
const docRoutes = require('./routes/docRoutes');
const { connectDB } = require('./config/db');
const { protect } = require('./middlewares/authMiddleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL,
        'https://docu-chat-ai-jet.vercel.app',
        'https://docuchat-ai-frontend.onrender.com'
      ].filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

connectDB();
app.use('/api/auth', authRoutes);
app.use('/api/docs', docRoutes);

// Keep uploaded PDFs with their database record because the deployment filesystem is ephemeral.
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Use Groq by default, with OpenAI available as a compatible fallback.
const aiApiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
const isGroq = Boolean(process.env.GROQ_API_KEY);
const openai = aiApiKey
  ? new OpenAI({
      apiKey: aiApiKey,
      ...(isGroq && { baseURL: 'https://api.groq.com/openai/v1' })
    })
  : null;

const getPdfBucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
  bucketName: 'pdfs',
});

// Routes
app.post('/api/upload', protect, upload.single('pdf'), async (req, res) => {
  let uploadedFileId;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const fileName = `file-${Date.now()}-${Math.round(Math.random() * 1E9)}.pdf`;

    // Read and parse PDF
    const pdfData = await pdf(req.file.buffer, {
      pagerender: (pageData) => pageData.getTextContent().then((content) => {
        const pageText = content.items.map((item) => item.str).join(' ');
        return `[Page ${pageData.pageIndex + 1}]\n${pageText}`;
      }),
    });
    
    // Extract text content
    const textContent = pdfData.text;
    const numPages = pdfData.numpages;

    const pdfId = fileName;
    const fileUpload = getPdfBucket().openUploadStream(fileName, {
      contentType: 'application/pdf',
      metadata: { owner: req.user._id.toString(), originalName: req.file.originalname },
    });
    await new Promise((resolve, reject) => {
      fileUpload.once('finish', resolve);
      fileUpload.once('error', reject);
      Readable.from(req.file.buffer).pipe(fileUpload);
    });
    uploadedFileId = fileUpload.id;

    const document = await Document.create({
      fileName: req.file.originalname,
      storedName: fileName,
      fileId: fileUpload.id,
      textContent,
      numPages,
      owner: req.user._id,
    });

    console.log('PDF uploaded successfully:', {
      pdfId: document._id.toString(),
      storedName: document.storedName,
      fileName: req.file.originalname,
      numPages: numPages,
      storedBytes: req.file.buffer.length,
      fileId: document.fileId.toString()
    });

    res.json({
      success: true,
      pdfId: document._id.toString(),
      storedName: document.storedName,
      fileName: req.file.originalname,
      numPages: numPages,
      message: 'PDF uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    if (uploadedFileId && mongoose.connection.readyState === 1) {
      await getPdfBucket().delete(uploadedFileId).catch((cleanupError) => {
        console.error('Upload cleanup error:', cleanupError);
      });
    }
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

app.post('/api/chat', protect, async (req, res) => {
  try {
    const { message, pdfId } = req.body;

    if (!message || !pdfId) {
      return res.status(400).json({ error: 'Message and PDF ID are required' });
    }

    if (!openai) {
      return res.status(503).json({
        error: 'AI service is not configured. Set GROQ_API_KEY or OPENAI_API_KEY in backend/.env and restart the server.'
      });
    }

    const pdfData = await Document.findOne({ _id: pdfId, owner: req.user._id });
    if (!pdfData) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    console.log('Processing chat request:', { message, pdfId, pdfData: pdfData.fileName });

    // Create context-aware prompt
    const systemPrompt = `You are a careful document-analysis assistant. Answer the user's question using only the supplied PDF content.
    Give a direct answer first, then brief supporting details when useful.
    Treat [Page N] markers as the source page and cite the relevant page number(s) in the answer.
    Never invent facts, names, dates, amounts, or page numbers. If the document does not contain the answer, say so clearly.
    For summaries, cover the main purpose, important facts, and conclusions without repeating the full document.
    For comparisons or multi-part questions, organize the answer with short bullets.
    Keep the response clear and concise.`;

    const pageSections = pdfData.textContent.match(/\[Page \d+\][\s\S]*?(?=\[Page \d+\]|$)/g) || [];
    const requestedPages = [...new Set(
      [...message.matchAll(/\bpage(?:s)?\s*(?:number\s*)?(\d+)\b/gi)].map((match) => Number(match[1]))
    )].filter((page) => page >= 1 && page <= pdfData.numPages);
    const requestedPageSections = pageSections.filter((section) =>
      requestedPages.some((page) => section.startsWith(`[Page ${page}]`))
    );
    const documentContext = requestedPageSections.length > 0
      ? requestedPageSections.join('\n\n')
      : pdfData.textContent;

    const userPrompt = `PDF CONTENT:
  ${documentContext.substring(0, 50000)}
    
  USER QUESTION: ${message}
    
  Use the page markers to support your answer. Mention page numbers naturally, for example "(Page 2)".`;

    // Get AI response from Groq
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || (isGroq ? 'openai/gpt-oss-20b' : 'gpt-4o-mini'),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
      reasoning_effort: 'low'
    });

    const aiResponse = completion.choices?.[0]?.message?.content?.trim();
    if (!aiResponse) {
      return res.status(502).json({ error: 'AI provider returned an empty response. Please try again.' });
    }

    // Extract page references (simple heuristic)
    const pageReferences = [...new Set(
      [...aiResponse.matchAll(/(?:page|pages)\s+(?:\w+\s+)?(\d+)/gi)].map((match) => parseInt(match[1], 10))
    )].filter((page) => page >= 1 && page <= pdfData.numPages);

    console.log('Chat response generated successfully');

    res.json({
      success: true,
      response: aiResponse,
      pageReferences: pageReferences,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Provide more specific error messages
    if (error.code === 'insufficient_quota' || error.status === 429) {
      res.status(502).json({ error: 'AI provider quota or rate limit exceeded.' });
    } else if (error.code === 'invalid_api_key' || error.status === 401) {
      res.status(502).json({ error: 'AI provider rejected the API key. Check your backend configuration.' });
    } else {
      res.status(500).json({ error: 'Failed to process chat request: ' + error.message });
    }
  }
});

app.get('/api/pdf/:pdfId', protect, async (req, res) => {
  try {
    const { pdfId } = req.params;
    const pdfData = await Document.findOne({ _id: pdfId, owner: req.user._id });

    if (!pdfData) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.json({
      success: true,
      pdf: {
        id: pdfData._id,
        fileName: pdfData.fileName,
        numPages: pdfData.numPages,
        uploadTime: pdfData.createdAt
      }
    });

  } catch (error) {
    console.error('PDF fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch PDF data' });
  }
});

app.get('/api/pdf/:pdfId/content', protect, async (req, res) => {
  try {
    const { pdfId } = req.params;
    const pdfData = await Document.findOne({ _id: pdfId, owner: req.user._id });

    if (!pdfData) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.json({
      success: true,
      textContent: pdfData.textContent,
      numPages: pdfData.numPages
    });

  } catch (error) {
    console.error('PDF content fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch PDF content' });
  }
});

// Uploaded PDFs require the owning user's token.
app.get('/uploads/:storedName', protect, async (req, res) => {
  try {
    const document = await Document.findOne({ storedName: req.params.storedName, owner: req.user._id });
    if (!document) return res.status(404).json({ error: 'PDF not found' });

    if (document.fileId) {
      res.type('application/pdf');
      getPdfBucket().openDownloadStream(document.fileId).on('error', (error) => {
        console.error('PDF stream error:', error);
        if (!res.headersSent) res.status(404).json({ error: 'PDF not found' });
      }).pipe(res);
      return;
    }

    if (document.fileData) {
      res.type('application/pdf').send(document.fileData);
      return;
    }

    // Compatibility for documents uploaded before PDFs were stored in MongoDB.
    if (document.filePath && fs.existsSync(path.resolve(document.filePath))) {
      res.type('application/pdf').sendFile(path.resolve(document.filePath));
      return;
    }

    res.status(410).json({ error: 'This PDF is no longer available. Please upload it again.' });
  } catch (error) {
    console.error('PDF file error:', error);
    res.status(500).json({ error: 'Failed to load PDF' });
  }
});

// Root route - Test if backend is working
app.get('/', (req, res) => {
  res.json({ 
    message: 'DocuChat AI Backend is running! 🚀',
    status: 'active',
    version: '1.0.0',
    endpoints: {
      upload: '/api/upload',
      chat: '/api/chat',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend is healthy',
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
});
