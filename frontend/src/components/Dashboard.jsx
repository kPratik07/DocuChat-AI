import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Plus,
  Trash2,
  LayoutDashboard,
} from "lucide-react";
import { api, endpoints } from "../api";
import PDFUpload from "./PDFUpload";

const getOrdinal = (number) => {
  const suffix =
    number % 100 >= 11 && number % 100 <= 13
      ? "th"
      : ["th", "st", "nd", "rd"][Math.min(number % 10, 3)];
  return `${number}${suffix}`;
};

export default function Dashboard({ user, onOpen, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDocuments = async () => {
    try {
      setDocuments((await api.get(endpoints.docs.list)).data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Could not load your library.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadDocuments();
  }, []);

  const remove = async () => {
    if (!documentToDelete) return;
    try {
      await api.delete(endpoints.docs.delete(documentToDelete));
      setDocuments((items) =>
        items.filter((item) => item._id !== documentToDelete),
      );
      setDocumentToDelete(null);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error || "Could not delete this PDF.",
      );
    }
  };

  const uploaded = (pdf) => {
    setShowUpload(false);
    loadDocuments();
    onOpen({
      ...pdf,
      url:
        pdf.url ||
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${pdf.storedName}`,
    });
  };

  const nextPdfLabel = `Add your ${getOrdinal(documents.length + 1)} PDF`;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header px-3 sm:px-10 lg:px-[72px]">
        <div className="dashboard-brand shrink-0 whitespace-nowrap text-base sm:text-lg">
          <span className="shrink-0">
            <FileText size={20} />
          </span>{" "}
          DocuChat AI
        </div>
        <div className="dashboard-actions min-w-0 gap-2 sm:gap-3">
          <div className="user-chip min-w-0 gap-2 pr-0 sm:pr-2">
            <div className="avatar shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <strong className="max-w-[84px] truncate whitespace-nowrap sm:max-w-[140px]">
              {user.name}
            </strong>
          </div>
          <button
            className="logout-button shrink-0 whitespace-nowrap px-2.5 sm:px-[15px]"
            onClick={onLogout}
          >
            <span>Log out</span>
          </button>
        </div>
      </header>
      <div className="dashboard-layout">
        <aside className="library-sidebar">
          <div className="sidebar-heading">
            <p className="dashboard-kicker">
              <LayoutDashboard size={14} /> Library
            </p>
            <span>{documents.length}</span>
          </div>
          <button
            className="sidebar-add-button"
            onClick={() => setShowUpload(true)}
          >
            <Plus size={17} /> Add PDF
          </button>
          <div className="sidebar-list">
            {loading ? (
              <p className="sidebar-muted">Loading library...</p>
            ) : documents.length === 0 ? (
              <p className="sidebar-muted">No PDFs yet</p>
            ) : (
              documents.map((document) => (
                <div className="sidebar-document" key={document._id}>
                  <button
                    className="sidebar-document-open"
                    onClick={() =>
                      onOpen({
                        pdfId: document._id,
                        storedName: document.storedName,
                        fileName: document.fileName,
                        numPages: document.numPages,
                        url: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/uploads/${document.storedName}`,
                      })
                    }
                  >
                    <FileText size={17} />
                    <span>{document.fileName}</span>
                  </button>
                  <button
                    className="delete-button"
                    title="Delete PDF"
                    onClick={() => setDocumentToDelete(document._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
        <section className="dashboard-content">
          <div className="dashboard-heading">
            <div>
              <p className="dashboard-kicker">
                <LayoutDashboard size={14} /> Personal library
              </p>
              <h1>Your reading room</h1>
              <p className="dashboard-subtitle">
                Pick up where you left off, or bring in something new.
              </p>
            </div>
          </div>
          {showUpload && (
            <div className="dashboard-upload">
              <PDFUpload
                onUpload={uploaded}
                onUploadStart={() => {}}
                onUploadProgress={() => {}}
                onUploadError={() => {}}
              />
              <button
                className="upload-back-button"
                onClick={() => setShowUpload(false)}
                type="button"
              >
                <ArrowLeft size={17} /> Back to library
              </button>
            </div>
          )}
          {error && <p className="dashboard-error">{error}</p>}
          {!showUpload &&
            (loading ? (
              <div className="dashboard-empty">Loading your library...</div>
            ) : documents.length === 0 ? (
              <div className="dashboard-empty">
                <FileText size={34} />
                <h2>Your library is quiet</h2>
                <p>Upload your first PDF to start a conversation.</p>
                <button
                  className="primary-button"
                  onClick={() => setShowUpload(true)}
                >
                  <Plus size={18} /> {nextPdfLabel}
                </button>
              </div>
            ) : (
              <div className="dashboard-empty dashboard-next-upload">
                <FileText size={34} />
                <h2>Keep building your library</h2>
                <p>Your saved PDFs are ready whenever you are.</p>
                <button
                  className="primary-button"
                  onClick={() => setShowUpload(true)}
                >
                  <Plus size={18} /> {nextPdfLabel}
                </button>
              </div>
            ))}
        </section>
      </div>
      {documentToDelete && (
        <div
          className="delete-modal-backdrop"
          role="presentation"
          onClick={() => setDocumentToDelete(null)}
        >
          <section
            className="delete-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="delete-modal-title">
              Are you sure you want to delete this PDF?
            </h2>
            <p>This document will be removed from your library.</p>
            <div className="delete-modal-actions">
              <button
                className="delete-cancel-button"
                onClick={() => setDocumentToDelete(null)}
              >
                Cancel
              </button>
              <button className="delete-confirm-button" onClick={remove}>
                Delete PDF
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
