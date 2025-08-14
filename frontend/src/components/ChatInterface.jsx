import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, FileText } from 'lucide-react';
import axios from 'axios';
import CitationButton from './CitationButton';

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
      const response = await axios.post('http://localhost:5000/api/chat', {
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">Document Chat</h1>
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Upload new document"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      {showWelcome && (
        <div className="bg-purple-100 border-l-4 border-purple-500 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-purple-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-purple-800 font-medium">Your document is ready!</h3>
                <p className="text-purple-700 text-sm mt-1">
                  You can now ask questions about your document. For example:
                </p>
                <div className="mt-2 space-y-1">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleQuestion(question)}
                      className="block text-left text-purple-600 text-sm hover:text-purple-800 transition-colors"
                    >
                      • {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-purple-400 hover:text-purple-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !showWelcome && (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Start a conversation about your document</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              
              {message.type === 'ai' && message.pageReferences && message.pageReferences.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.pageReferences.map((pageNum, index) => (
                    <CitationButton
                      key={index}
                      pageNumber={pageNum}
                      onClick={() => {
                        // This will be handled by the parent component
                        console.log(`Navigate to page ${pageNum}`);
                      }}
                    />
                  ))}
                </div>
              )}
              
              <p className={`text-xs mt-2 ${
                message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the document..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 