const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const OpenAI = require('openai');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
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
    ? [process.env.FRONTEND_URL || 'https://docuchat-ai-frontend.onrender.com']
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

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'file-' + uniqueSuffix + '.pdf');
  }
});

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

// Store PDF data in memory (in production, use a database)

// Routes
app.post('/api/upload', protect, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Read and parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer, {
      pagerender: (pageData) => pageData.getTextContent().then((content) => {
        const pageText = content.items.map((item) => item.str).join(' ');
        return `[Page ${pageData.pageIndex + 1}]\n${pageText}`;
      }),
    });
    
    // Extract text content
    const textContent = pdfData.text;
    const numPages = pdfData.numpages;

    const pdfId = fileName;
    const document = await Document.create({
      fileName: req.file.originalname,
      storedName: fileName,
      textContent,
      numPages,
      filePath,
      owner: req.user._id,
    });

    console.log('PDF uploaded successfully:', {
      pdfId: document._id.toString(),
      storedName: document.storedName,
      fileName: req.file.originalname,
      numPages: numPages,
      filePath: filePath
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

    const userPrompt = `PDF CONTENT:
  ${pdfData.textContent.substring(0, 12000)}
    
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
    res.type('application/pdf').sendFile(path.resolve(document.filePath));
  } catch (error) {
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
