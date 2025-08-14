import React, { useState, useEffect } from 'react';
import PDFUpload from './components/PDFUpload';
import ChatInterface from './components/ChatInterface';
import PDFViewer from './components/PDFViewer';
import './App.css';

function App() {
  const [currentPDF, setCurrentPDF] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePDFUpload = (pdfData) => {
    console.log('App received PDF data:', pdfData); // Debug log
    setCurrentPDF(pdfData);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadStart = () => {
    console.log('Upload started'); // Debug log
    setIsUploading(true);
    setUploadProgress(0);
  };

  const handleUploadProgress = (progress) => {
    console.log('Upload progress:', progress); // Debug log
    setUploadProgress(progress);
  };

  const handleUploadError = () => {
    console.log('Upload error occurred'); // Debug log
    setIsUploading(false);
    setUploadProgress(0);
  };

  const resetApp = () => {
    console.log('Resetting app'); // Debug log
    setCurrentPDF(null);
    setIsUploading(false);
    setUploadProgress(0);
  };

  // Debug logging
  useEffect(() => {
    console.log('Current app state:', { currentPDF, isUploading, uploadProgress });
  }, [currentPDF, isUploading, uploadProgress]);

  return (
    <div className="min-h-screen bg-gray-50">
      {!currentPDF && !isUploading && (
        <div className="flex items-center justify-center min-h-screen">
          <PDFUpload 
            onUpload={handlePDFUpload}
            onUploadStart={handleUploadStart}
            onUploadProgress={handleUploadProgress}
            onUploadError={handleUploadError}
          />
        </div>
      )}

      {isUploading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
            <p className="text-gray-700 text-center mb-4">Uploading PDF</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-purple-600 text-center mt-2 font-semibold">{uploadProgress}%</p>
          </div>
        </div>
      )}

      {currentPDF && (
        <div className="flex h-screen">
          <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
            <ChatInterface 
              pdfId={currentPDF.pdfId}
              onReset={resetApp}
            />
          </div>
          <div className="w-2/3 bg-white">
            <PDFViewer 
              pdfUrl={currentPDF.url}
              fileName={currentPDF.fileName}
              numPages={currentPDF.numPages}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
