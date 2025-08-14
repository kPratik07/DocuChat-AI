import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFViewer = ({ pdfUrl, fileName, numPages }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfContent, setPdfContent] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    console.log("PDFViewer props:", { pdfUrl, fileName, numPages });
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    loadPDF();
  }, [pdfUrl]);

  const loadPDF = async () => {
    try {
      console.log("Loading PDF from:", pdfUrl);
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      console.log("PDF loaded with", pdf.numPages, "pages");
      setPdfContent(pdf);
      setLoading(false);
    } catch (error) {
      console.error("Error loading PDF:", error);
      setError("Failed to load PDF");
      setLoading(false);
    }
  };

  const renderPage = async () => {
    if (!pdfContent || !canvasRef.current) return;
    try {
      const page = await pdfContent.getPage(currentPage);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Clear the canvas
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Simple render without transformations
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      console.log("Page rendered successfully");
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  };

  useEffect(() => {
    if (pdfContent && !loading) {
      renderPage();
    }
  }, [pdfContent, currentPage, scale, loading]);

  const goToPage = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= numPages) {
      setCurrentPage(pageNumber);
    }
  };
  const nextPage = () =>
    currentPage < numPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const refreshPDF = () => {
    setLoading(true);
    setError(null);
    loadPDF();
  };
  const openInNewTab = () => window.open(pdfUrl, "_blank");

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center text-gray-500">
          <p>No PDF URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {fileName || "Document Viewer"}
          </h2>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {numPages || "..."}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={openInNewTab}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={refreshPDF}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={downloadPDF}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      {numPages && (
        <div className="flex items-center justify-center space-x-4 p-4 border-b border-gray-200 bg-gray-50">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={numPages}
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-16 px-3 py-1 text-center border rounded-lg"
            />
            <span className="text-sm text-gray-600">of {numPages}</span>
          </div>
          <button
            onClick={nextPage}
            disabled={currentPage >= numPages}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border rounded-lg"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        {loading && (
          <div className="flex items-center justify-center h-full">
            Loading PDF...
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-full text-red-600">
            Failed to load PDF
          </div>
        )}
        {!loading && !error && pdfContent && (
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border border-gray-200 shadow-lg bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
