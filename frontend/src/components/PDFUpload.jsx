import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const PDFUpload = ({ onUpload, onUploadStart, onUploadProgress, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setIsUploading(true);
    onUploadStart();

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        onUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        },
      });

      clearInterval(progressInterval);
      onUploadProgress(100);

      setTimeout(() => {
        const pdfData = {
          pdfId: response.data.pdfId,
          fileName: response.data.fileName,
          numPages: response.data.numPages,
          url: `${API_BASE_URL}/uploads/${response.data.pdfId}`
        };
        
        onUpload(pdfData);
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      onUploadError();
      alert('Failed to upload PDF. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, onUploadStart, onUploadProgress, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isUploading
  });

  return (
    <div className="max-w-md w-full mx-4">
      <div
        {...getRootProps()}
        className={`
          bg-white rounded-lg shadow-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-2 border-purple-400 bg-purple-50' : 'border-2 border-dashed border-gray-300'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 hover:bg-purple-50'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
            {isDragActive ? (
              <FileText className="w-12 h-12 text-purple-600" />
            ) : (
              <Upload className="w-12 h-12 text-purple-600" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Upload PDF to start chatting
        </h2>
        
        <p className="text-gray-500 mb-6">
          Click or drag and drop your file here
        </p>

        {isDragActive && (
          <p className="text-purple-600 font-medium">
            Drop your PDF here
          </p>
        )}

        {!isUploading && (
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Choose PDF File
            </button>
          </div>
        )}

        {isUploading && (
          <div className="mt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mr-3"></div>
              <span className="text-purple-600 font-medium">Uploading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUpload; 