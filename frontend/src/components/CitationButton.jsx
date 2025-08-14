import React from 'react';

const CitationButton = ({ pageNumber, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      title={`Go to page ${pageNumber}`}
    >
      <span className="mr-1">📄</span>
      Page {pageNumber}
    </button>
  );
};

export default CitationButton;
