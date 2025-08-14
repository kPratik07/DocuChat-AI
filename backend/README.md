# DocuChat AI Backend

A Node.js backend API for real-time collaborative document editing with authentication and AI-powered PDF chat functionality.

## Features

- User authentication (register/login) with JWT
- Document CRUD operations
- Protected routes with middleware
- MongoDB integration with Mongoose
- Input validation and error handling
- CORS configuration for frontend integration
- **NEW: AI-powered PDF chat using OpenAI GPT-3.5-turbo**

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/docuchat
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Get OpenAI API Key:**

   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env` file
   - **Note:** The chat functionality requires a valid OpenAI API key

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Run the server:**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Documents (Protected)

- `POST /api/docs` - Create document
- `GET /api/docs` - Get user's documents
- `PUT /api/docs/:id` - Update document
- `DELETE /api/docs/:id` - Delete document

### PDF Operations

- `POST /api/upload` - Upload PDF file
- `POST /api/chat` - Chat with AI about PDF content
- `GET /api/pdf/:pdfId` - Get PDF metadata
- `GET /api/pdf/:pdfId/content` - Get PDF text content

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `OPENAI_API_KEY` - **Required for chat functionality**

## Dependencies

- Express.js - Web framework
- Mongoose - MongoDB ODM
- JWT - Authentication
- bcryptjs - Password hashing
- CORS - Cross-origin resource sharing
- **OpenAI** - AI chat functionality
- **pdf-parse** - PDF text extraction
