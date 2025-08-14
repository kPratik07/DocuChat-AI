# DocuChat AI - Google NotebookLM Clone

A web-based application that enables users to upload and interact with PDF documents through a chat interface, built with React and Node.js.

## Features

- **PDF Upload and Viewing**: Upload large PDF files with drag-and-drop support
- **Built-in PDF Viewer**: Navigate through uploaded documents with zoom and page controls
- **AI Chat Interface**: Ask questions about document content and get intelligent responses
- **Citation & Navigation**: Clickable page references that navigate to specific PDF pages
- **Modern UI**: Clean, intuitive interface matching the Google NotebookLM design

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- React PDF (PDF.js)
- React Dropzone
- Lucide React Icons
- Axios

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- PDF-parse (PDF text extraction)
- OpenAI API (GPT-3.5-turbo)
- CORS, Helmet, Compression

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key-here
```

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Upload PDF**: Drag and drop a PDF file or click to browse
2. **View Document**: Navigate through pages using the PDF viewer controls
3. **Chat**: Ask questions about the document content in the chat interface
4. **Citations**: Click on page references to navigate to specific pages
5. **Navigation**: Use zoom controls and page navigation in the PDF viewer

## API Endpoints

### Backend API

- `POST /api/upload` - Upload PDF file
- `POST /api/chat` - Send chat message and get AI response
- `GET /api/pdf/:pdfId` - Get PDF metadata
- `GET /api/pdf/:pdfId/content` - Get PDF text content
- `GET /api/health` - Health check

### File Upload

- Supported format: PDF only
- Maximum file size: 50MB
- Files are stored in the `uploads/` directory

### Chat Interface

- Uses OpenAI GPT-3.5-turbo for intelligent responses
- Context-aware responses based on PDF content
- Automatic page reference extraction
- Token-optimized responses

## Project Structure

```
DocuChat-AI/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── uploads/         # PDF storage
│   ├── utils/           # Utility functions
│   ├── index.js         # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   ├── public/          # Static assets
│   └── package.json
└── README.md
```

## Components

### Frontend Components

- **PDFUpload**: Drag-and-drop PDF upload interface
- **ChatInterface**: AI chat interface with message history
- **PDFViewer**: PDF display with navigation controls
- **CitationButton**: Clickable page reference buttons

### Key Features

- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live chat interface with typing indicators
- **Error Handling**: Graceful error handling and user feedback
- **Performance**: Optimized for large PDF files
- **Security**: File type validation and size limits

## Configuration

### Environment Variables

Create a `.env` file in the backend directory with:

```env
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your-openai-api-key-here
```

### OpenAI API Setup

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add it to your `.env` file
3. The API will be used for intelligent document analysis

## Deployment

### Backend Deployment

- Deploy to platforms like Render, Railway, or Heroku
- Set environment variables in your deployment platform
- Ensure the uploads directory is writable

### Frontend Deployment

- Build the project: `npm run build`
- Deploy to Netlify, Vercel, or any static hosting service
- Update API endpoints to point to your deployed backend

## Troubleshooting

### Common Issues

1. **PDF not loading**: Check if the backend is running and accessible
2. **Upload failures**: Verify file size and format restrictions
3. **Chat errors**: Ensure OpenAI API key is valid and has credits
4. **CORS issues**: Check backend CORS configuration

### Development Tips

- Use `npm run dev` for both frontend and backend during development
- Check browser console and server logs for error messages
- Ensure all dependencies are properly installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section
- Review the code comments
- Open an issue on the repository

---

Built with ❤️ using React and Node.js 