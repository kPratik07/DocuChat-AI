# DocuChat AI

A full-stack PDF workspace that lets authenticated users upload documents, view them, and ask questions about their content.

## Features

- **PDF Upload and Viewing**: Upload large PDF files with drag-and-drop support
- **Built-in PDF Viewer**: Navigate through uploaded documents with zoom and page controls
- **AI Chat Interface**: Ask questions about document content and get intelligent responses
- **Citation & Navigation**: Clickable page references that navigate to specific PDF pages
- **Authentication**: JWT-based accounts with per-user document ownership
- **Email Verification**: Verification email sent during registration
- **Password Recovery**: Six-digit OTP sent by email with one-hour expiry
- **Responsive UI**: Tailwind CSS layout for desktop, tablet, and mobile screens

## Tech Stack

### Frontend

- React 18
- Tailwind CSS
- React PDF (PDF.js)
- React Dropzone
- Lucide React Icons
- Axios
- Vite

### Backend

- Node.js
- Express.js
- Multer (file uploads)
- PDF-parse (PDF text extraction)
- Groq or OpenAI-compatible API
- Nodemailer SMTP email delivery

- Node.js (v16 or higher)
- npm or yarn

1. Navigate to the backend directory:

````bash
2. Install dependencies:

```bash

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/docuchat
JWT_SECRET=replace_with_a_long_random_secret
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=DocuChat AI <your_email@gmail.com>
````

Never commit `.env` or expose SMTP/API credentials in source control.

4. Start the backend server:

```bash
npm run dev
```

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

### Authentication API

- `POST /api/auth/register` - Create an account and send verification email
- `POST /api/auth/login` - Sign in after email verification
- `GET /api/auth/verify-email/:token` - Verify an email address
- `POST /api/auth/forgot-password` - Send a six-digit password reset OTP
- `POST /api/auth/reset-password` - Reset a password using email and OTP
- `GET /api/auth/me` - Get the current authenticated user

### File Upload

- Supported format: PDF only
- Maximum file size: 50MB
- PDF files are stored in MongoDB GridFS

### Chat Interface

- Uses Groq by default, with OpenAI-compatible fallback support
- Context-aware responses based on PDF content
- Automatic page reference extraction
- Token-optimized responses

## Deployment

### Backend Deployment

- Deploy to platforms like Render, Railway, or Heroku
- Set environment variables in your deployment platform
- Ensure the deployment has access to the configured MongoDB database

### Frontend Deployment

- Build the project: `npm run build`
- Deploy to Netlify, Vercel, or any static hosting service
- Update API endpoints to point to your deployed backend

## Notes

- PDF uploads accept files up to 50MB.
- Keep `.env` files and credentials out of source control.
- Run `npm run lint` and `npm run build` before deployment.
