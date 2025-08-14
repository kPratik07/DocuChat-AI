import { useState } from "react";
import CitationButton from "./CitationButton";
import { api, endpoints } from "../api.js";

export default function Chat({ docId, totalPages }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!docId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Please upload a PDF first before starting the chat.",
          isError: true,
        },
      ]);
      return;
    }

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await api.post(endpoints.chat, {
        message: input,
        pdfId: docId,
      });

      const botMessage = {
        role: "bot",
        text: res.data.response,
        citations: res.data.pageReferences,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = {
        role: "bot",
        text:
          err.response?.data?.error ||
          "Sorry, I encountered an error. Please try again.",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header - Light grey bar with question and X button */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <svg
              className="w-4 h-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700">
            What tools is the candidate familiar with?
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">Start a conversation about your document</p>
            <p className="text-xs mt-2 text-gray-400">
              For example: "What is the main topic of this document?"
              <br />
              "Can you summarize the key points?"
              <br />
              "What are the conclusions or recommendations?"
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-lg ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : msg.isError
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                {msg.text}
              </p>
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.citations.map((page) => (
                    <CitationButton key={page} page={page} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-bounce">●</div>
                <div
                  className="animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                >
                  ●
                </div>
                <div
                  className="animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                >
                  ●
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm shadow-sm"
            placeholder="Ask about the document..."
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed font-medium text-sm shadow-sm hover:shadow-md"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
