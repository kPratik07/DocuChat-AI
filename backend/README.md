# DocuChat AI Backend

A Node.js backend API for authenticated PDF libraries and AI-powered questions about document content.

## Features

- Input validation and error handling
- CORS configuration for frontend integration
- JWT authentication and per-user document ownership
- MongoDB persistence for uploaded PDF metadata and extracted text
- AI-powered PDF chat using Groq or an OpenAI-compatible provider
- Email verification and OTP password recovery using SMTP

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/docuchat?retryWrites=true&w=majority&authSource=admin
   JWT_SECRET=replace_with_a_long_random_secret
   GROQ_API_KEY=your_groq_api_key_here
   FRONTEND_URL=http://localhost:5173
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_gmail_app_password
   EMAIL_FROM=DocuChat AI <your_email@gmail.com>
   ```

3. **Get an AI API Key:**
   - Go to [Groq Console](https://console.groq.com/keys) and create an API key
   - Add it to your `.env` file
   - **Note:** The chat functionality requires a valid `GROQ_API_KEY` or `OPENAI_API_KEY`

4. **Run the server:**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create an account
- `POST /api/auth/login` - Sign in and receive a JWT
- `GET /api/auth/verify-email/:token` - Verify an email address
- `POST /api/auth/forgot-password` - Send a password reset OTP
- `POST /api/auth/reset-password` - Set a new password with an OTP
- `GET /api/auth/me` - Get the current user

### Documents

- `GET /api/docs` - List the current user's PDFs
- `DELETE /api/docs/:id` - Delete one of the current user's PDFs

### PDF Operations

- `POST /api/upload` - Upload a PDF for the current user
- `POST /api/chat` - Chat with an owned PDF
- `GET /api/pdf/:pdfId` - Get owned PDF metadata
- `GET /api/pdf/:pdfId/content` - Get owned PDF text content
- `GET /uploads/:storedName` - Stream an owned PDF

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string (required for accounts and persistence)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `GROQ_API_KEY` or `OPENAI_API_KEY` - **Required for chat functionality**
- `FRONTEND_URL` - Frontend URL used in email links
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` - SMTP configuration for auth emails
- `EMAIL_FROM` - Sender address for auth emails

## Dependencies

- Express.js - Web framework
- CORS - Cross-origin resource sharing
- **OpenAI-compatible API** - AI chat functionality
- **Nodemailer** - SMTP email delivery
- **pdf-parse** - PDF text extraction
