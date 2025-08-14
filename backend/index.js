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
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

// Store PDF data in memory (in production, use a database)
const pdfStore = new Map();

// Routes
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Read and parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    
    // Extract text content
    const textContent = pdfData.text;
    const numPages = pdfData.numpages;

    // Store PDF data with the actual filename
    const pdfId = fileName; // Use the full filename including extension
    pdfStore.set(pdfId, {
      id: pdfId,
      fileName: req.file.originalname,
      textContent: textContent,
      numPages: numPages,
      uploadTime: new Date().toISOString(),
      filePath: filePath
    });

    console.log('PDF uploaded successfully:', {
      pdfId: pdfId,
      fileName: req.file.originalname,
      numPages: numPages,
      filePath: filePath
    });

    res.json({
      success: true,
      pdfId: pdfId,
      fileName: req.file.originalname,
      numPages: numPages,
      message: 'PDF uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, pdfId } = req.body;

    if (!message || !pdfId) {
      return res.status(400).json({ error: 'Message and PDF ID are required' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-api-key-here') {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      });
    }

    const pdfData = pdfStore.get(pdfId);
    if (!pdfData) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    console.log('Processing chat request:', { message, pdfId, pdfData: pdfData.fileName });

    // Create context-aware prompt
    const systemPrompt = `You are a helpful AI assistant that helps users understand PDF documents. 
    You have access to a PDF document and should provide accurate, helpful responses based on the document content.
    When referencing information, always mention the page number if possible.
    Keep responses concise and relevant.`;

    const userPrompt = `Document Content: ${pdfData.textContent.substring(0, 8000)}
    
    User Question: ${message}
    
    Please provide a helpful response based on the document content. If you reference specific information, mention the page number.`;

    // Get AI response
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    // Extract page references (simple heuristic)
    const pageReferences = [];
    const pageMatch = aiResponse.match(/page\s+(\d+)/i);
    if (pageMatch) {
      pageReferences.push(parseInt(pageMatch[1]));
    }

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
    if (error.code === 'insufficient_quota') {
      res.status(500).json({ error: 'OpenAI API quota exceeded. Please check your account.' });
    } else if (error.code === 'invalid_api_key') {
      res.status(500).json({ error: 'Invalid OpenAI API key. Please check your configuration.' });
    } else {
      res.status(500).json({ error: 'Failed to process chat request: ' + error.message });
    }
  }
});

app.get('/api/pdf/:pdfId', (req, res) => {
  try {
    const { pdfId } = req.params;
    const pdfData = pdfStore.get(pdfId);

    if (!pdfData) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.json({
      success: true,
      pdf: {
        id: pdfData.id,
        fileName: pdfData.fileName,
        numPages: pdfData.numPages,
        uploadTime: pdfData.uploadTime
      }
    });

  } catch (error) {
    console.error('PDF fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch PDF data' });
  }
});

app.get('/api/pdf/:pdfId/content', (req, res) => {
  try {
    const { pdfId } = req.params;
    const pdfData = pdfStore.get(pdfId);

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

// Serve uploaded PDFs with debugging
app.use('/uploads', (req, res, next) => {
  console.log('File request:', req.method, req.url, 'from', req.get('Referer'));
  next();
}, express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, path) => {
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', 'inline');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, HEAD');
    res.set('Access-Control-Allow-Headers', 'Range');
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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
