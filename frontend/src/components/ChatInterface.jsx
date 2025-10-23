import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, FileText, Upload } from 'lucide-react';
import axios from 'axios';
import CitationButton from './CitationButton';
import API_BASE_URL from '../config';
import './ChatInterface.css';

const ChatInterface = ({ pdfId, onReset }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        message: inputMessage,
        pdfId: pdfId
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        pageReferences: response.data.pageReferences || [],
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const exampleQuestions = [
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the conclusions or recommendations?"
  ];

  const handleExampleQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="chat-interface">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <h1 className="chat-title">Document Chat</h1>
          <button
            onClick={onReset}
            className="new-document-button"
            title="Upload new document"
          >
            <Upload />
            <span className="new-document-button-text-full">New Document</span>
            <span className="new-document-button-text-short">New</span>
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      {showWelcome && (
        <div className="welcome-banner">
          <div className="welcome-banner-content">
            <div className="welcome-banner-main">
              <FileText className="welcome-banner-icon" />
              <div>
                <h3 className="welcome-banner-title">Your document is ready!</h3>
                <p className="welcome-banner-text">
                  You can now ask questions about your document. For example:
                </p>
                <div className="welcome-banner-questions">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleQuestion(question)}
                      className="example-question-button"
                    >
                      • {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="welcome-close-button"
            >
              <X />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && !showWelcome && (
          <div className="empty-state">
            <MessageCircle className="empty-state-icon" />
            <p>Start a conversation about your document</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-wrapper ${message.type}`}
          >
            <div className={`message ${message.type}`}>
              <p className="message-text">{message.content}</p>
              
              {message.type === 'ai' && message.pageReferences && message.pageReferences.length > 0 && (
                <div className="message-citations">
                  {message.pageReferences.map((pageNum, index) => (
                    <CitationButton
                      key={index}
                      pageNumber={pageNum}
                      onClick={() => {}}
                    />
                  ))}
                </div>
              )}
              
              <p className="message-timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="loading-wrapper">
            <div className="loading-message">
              <div className="loading-content">
                <div className="loading-spinner"></div>
                <span className="loading-text">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the document..."
            className="message-input"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="send-button"
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;