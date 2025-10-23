import { useState, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, Download, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import './PDFViewer.css'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

const PDFViewer = ({ pdfUrl, fileName, numPages: totalPages }) => {
  const [pageNumber, setPageNumber] = useState(1)
  const [numPages, setNumPages] = useState(totalPages || null)
  const [scale, setScale] = useState(1.0)
  const [containerWidth, setContainerWidth] = useState(null)

  useEffect(() => {
    const updateScale = () => {
      const width = window.innerWidth
      if (width < 480) {
        setScale(0.5)
      } else if (width < 768) {
        setScale(0.6)
      } else if (width < 1024) {
        setScale(0.8)
      } else {
        setScale(1.0)
      }
      setContainerWidth(width)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
  }

  const goToPrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1))
  const goToNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages))
  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3))
  
  const downloadPDF = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName || "document.pdf";
    link.click();
  };

  const openInNewTab = () => window.open(pdfUrl, "_blank");

  if (!pdfUrl) {
    return (
      <div className="pdf-viewer-no-url">
        <div className="pdf-viewer-no-url-text">
          <p>No PDF URL provided</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-viewer-header">
        <div className="pdf-viewer-header-left">
          <h2 className="pdf-viewer-title">
            {fileName || 'Document Viewer'}
          </h2>
          <span className="pdf-viewer-page-info">
            Page {pageNumber} of {numPages || '...'}
          </span>
        </div>
        <div className="pdf-viewer-header-right">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="pdf-viewer-button"
          >
            <ZoomOut size={20} />
          </button>
          <span className="pdf-viewer-zoom-display">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="pdf-viewer-button"
          >
            <ZoomIn size={20} />
          </button>
          <div className="pdf-viewer-divider"></div>
          <button
            onClick={openInNewTab}
            className="pdf-viewer-button"
          >
            <ExternalLink size={20} />
          </button>
          <button
            onClick={downloadPDF}
            className="pdf-viewer-button"
          >
            <Download size={20} />
          </button>
        </div>
      </div>

      {numPages && (
        <div className="pdf-viewer-navigation">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="pdf-viewer-nav-button"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <div className="pdf-viewer-page-input-wrapper">
            <input
              type="number"
              min="1"
              max={numPages}
              value={pageNumber}
              onChange={(e) => {
                const page = parseInt(e.target.value)
                if (page >= 1 && page <= numPages) {
                  setPageNumber(page)
                }
              }}
              className="pdf-viewer-page-input"
            />
            <span className="pdf-viewer-page-total">of {numPages}</span>
          </div>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="pdf-viewer-nav-button"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="pdf-viewer-content">
        <div className="pdf-viewer-document-wrapper">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="pdf-viewer-loading">
                <div className="pdf-viewer-spinner"></div>
              </div>
            }
            error={
              <div className="pdf-viewer-error">
                <span className="pdf-viewer-error-text">Failed to load PDF</span>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              loading={
                <div className="pdf-viewer-loading">
                  <div className="pdf-viewer-spinner-small"></div>
                </div>
              }
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
