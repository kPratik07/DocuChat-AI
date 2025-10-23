import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';

const PDFUpload = ({ onUpload, onUploadStart, onUploadProgress, onUploadError }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [fileRejectionError, setFileRejectionError] = useState('');
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    // Clear previous errors
    setFileRejectionError('');
    setErrorMessage('');

    // Handle file rejections
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-invalid-type') {
        setFileRejectionError('Only PDF files are allowed. Please upload a PDF document.');
      } else if (rejection.errors[0]?.code === 'file-too-large') {
        setFileRejectionError('File is too large. Maximum size is 50MB.');
      } else {
        setFileRejectionError('Invalid file. Please upload a valid PDF.');
      }
      return;
    }

    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (file.type !== 'application/pdf') {
      setFileRejectionError('Only PDF files are allowed. Please upload a PDF document.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setProgress(0);
    onUploadStart();

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(uploadProgress);
          onUploadProgress(uploadProgress);
        },
      });

      setProgress(100);
      onUploadProgress(100);
      
      // Ensure uploading message is shown for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadStatus('processing');

      // Show processing message for at least 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pdfData = {
        pdfId: response.data.pdfId,
        fileName: response.data.fileName,
        numPages: response.data.numPages,
        url: `${API_BASE_URL}/uploads/${response.data.pdfId}`
      };
      
      setUploadStatus('success');
      
      // Show success message briefly before transitioning
      await new Promise(resolve => setTimeout(resolve, 800));
      onUpload(pdfData);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      
      // Set specific error message
      if (error.response?.status === 413) {
        setErrorMessage('File is too large. Please upload a PDF smaller than 50MB.');
      } else if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error.code === 'ECONNABORTED') {
        setErrorMessage('Upload timeout. Please check your connection and try again.');
      } else {
        setErrorMessage('Failed to upload PDF. Please try again.');
      }
      
      onUploadError();
      
      // Reset after 5 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setErrorMessage('');
        setIsUploading(false);
        setProgress(0);
      }, 5000);
    }
  }, [onUpload, onUploadStart, onUploadProgress, onUploadError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: isUploading,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  return (
    <div className="max-w-md w-full mx-4">
      <div
        {...getRootProps()}
        className={`
          bg-white rounded-lg shadow-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-2 border-purple-400 bg-purple-50' : ''}
          ${isDragReject ? 'border-2 border-red-400 bg-red-50' : ''}
          ${!isDragActive && !isDragReject ? 'border-2 border-dashed border-gray-300' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-400 hover:bg-purple-50'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="mb-6">
          <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
            uploadStatus === 'error' || fileRejectionError ? 'bg-red-100' :
            uploadStatus === 'success' ? 'bg-green-100' :
            uploadStatus === 'uploading' || uploadStatus === 'processing' ? 'bg-blue-100' :
            isDragReject ? 'bg-red-100' :
            'bg-purple-100'
          }`}>
            {uploadStatus === 'error' || fileRejectionError ? (
              <AlertCircle className="w-12 h-12 text-red-600" />
            ) : uploadStatus === 'success' ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : uploadStatus === 'uploading' || uploadStatus === 'processing' ? (
              <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            ) : isDragReject ? (
              <AlertCircle className="w-12 h-12 text-red-600" />
            ) : isDragActive ? (
              <FileText className="w-12 h-12 text-purple-600" />
            ) : (
              <Upload className="w-12 h-12 text-purple-600" />
            )}
          </div>
        </div>

        {/* Error State - Upload Failed or Invalid File */}
        {(uploadStatus === 'error' || fileRejectionError || isDragReject) && (
          <>
            <h2 className="text-2xl font-semibold text-red-600 mb-2">
              {isDragReject ? 'Invalid File Type' : 'Upload Failed'}
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700 text-sm">
                {isDragReject 
                  ? 'Only PDF files are allowed. Please drop a valid PDF document.'
                  : errorMessage || fileRejectionError}
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              Please try again with a valid PDF file
            </p>
          </>
        )}

        {/* Success State */}
        {uploadStatus === 'success' && !fileRejectionError && !isDragReject && (
          <>
            <h2 className="text-2xl font-semibold text-green-600 mb-2">
              Upload Successful!
            </h2>
            <p className="text-gray-600">
              Processing your document...
            </p>
          </>
        )}

        {/* Processing State */}
        {uploadStatus === 'processing' && !fileRejectionError && !isDragReject && (
          <>
            <h2 className="text-2xl font-semibold text-blue-600 mb-2">
              Processing PDF
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-700 text-sm">
                Please wait while we extract and analyze your document...
              </p>
            </div>
          </>
        )}

        {/* Uploading State */}
        {uploadStatus === 'uploading' && !fileRejectionError && !isDragReject && (
          <>
            <h2 className="text-xl font-semibold text-purple-600 mb-6">
              Uploading PDF
            </h2>
            
            {/* Progress Bar */}
            <div className="w-full mb-4">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            {/* Percentage */}
            <p className="text-2xl font-bold text-purple-600 mb-2">
              {progress}%
            </p>
            
            <p className="text-gray-500 text-sm">
              Please wait...
            </p>
          </>
        )}

        {/* Default/Idle State */}
        {uploadStatus === 'idle' && !fileRejectionError && !isDragReject && (
          <>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Upload PDF to start chatting
            </h2>
            
            <p className="text-gray-500 mb-6">
              Click or drag and drop your file here
            </p>

            {isDragActive && !isDragReject && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <p className="text-purple-600 font-medium">
                  Drop your PDF here
                </p>
              </div>
            )}

            {/* Info message */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
              <p className="text-gray-600 text-xs">
                📄 Only PDF files • Maximum 50MB
              </p>
            </div>
          </>
        )}

        {!isUploading && uploadStatus === 'idle' && !fileRejectionError && (
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Choose PDF File
            </button>
          </div>
        )}

        {(uploadStatus === 'error' || fileRejectionError) && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setUploadStatus('idle');
                setErrorMessage('');
                setFileRejectionError('');
              }}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFUpload; 