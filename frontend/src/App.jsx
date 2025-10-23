import React, { useState } from 'react';
import PDFUpload from './components/PDFUpload';
import ChatInterface from './components/ChatInterface';
import PDFViewer from './components/PDFViewer';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [currentPDF, setCurrentPDF] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePDFUpload = (pdfData) => {
    setCurrentPDF(pdfData);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadStart = () => {
    setIsUploading(true);
    setUploadProgress(0);
  };

  const handleUploadProgress = (progress) => {
    setUploadProgress(progress);
  };

  const handleUploadError = () => {
    setIsUploading(false);
    setUploadProgress(0);
  };

  const resetApp = () => {
    setCurrentPDF(null);
    setIsUploading(false);
    setUploadProgress(0);
  };


  return (
    <div className="app-main">
      <Navbar />
      
      <div className="app-content-wrapper">
        {!currentPDF && !isUploading && (
          <div className="upload-screen-container">
            <PDFUpload 
              onUpload={handlePDFUpload}
              onUploadStart={handleUploadStart}
              onUploadProgress={handleUploadProgress}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {isUploading && (
          <div className="loading-screen-container">
            <div className="loading-card">
              <div className="loading-spinner-wrapper">
                <div className="loading-spinner"></div>
              </div>
              <p className="loading-text">Uploading PDF</p>
              <div className="loading-progress-bar">
                <div 
                  className="loading-progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="loading-percentage">{uploadProgress}%</p>
            </div>
          </div>
        )}

        {currentPDF && (
          <div className="split-view-container">
            <div className="chat-panel">
              <ChatInterface 
                pdfId={currentPDF.pdfId}
                onReset={resetApp}
              />
            </div>
            <div className="pdf-panel">
              <PDFViewer 
                pdfUrl={currentPDF.url}
                fileName={currentPDF.fileName}
                numPages={currentPDF.numPages}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
