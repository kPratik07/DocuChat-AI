import React, { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import PDFViewer from "./components/PDFViewer";
import Navbar from "./components/Navbar";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });
  const [currentPDF, setCurrentPDF] = useState(null);
  if (!user) return <AuthPage onAuthenticated={setUser} />;

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentPDF(null);
    setUser(null);
  };

  if (!currentPDF)
    return <Dashboard user={user} onOpen={setCurrentPDF} onLogout={logout} />;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar onBack={() => setCurrentPDF(null)} />
      <div className="flex flex-1 flex-col overflow-hidden pt-12 sm:pt-14">
        <div className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden md:h-[calc(100vh-3.5rem)] md:flex-row">
          <div className="flex min-h-[40vh] max-h-[40vh] w-full shrink-0 flex-col overflow-hidden border-b-2 border-gray-200 bg-white md:min-h-full md:max-h-full md:w-[45%] md:border-b-0 md:border-r-2 lg:w-[40%] xl:w-[38%] 2xl:w-[35%]">
            <ChatInterface
              pdfId={currentPDF.pdfId}
              onReset={() => setCurrentPDF(null)}
            />
          </div>
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white p-2 md:h-full md:w-[55%] md:p-0 lg:w-[60%] xl:w-[62%] 2xl:w-[65%]">
            <PDFViewer
              pdfUrl={currentPDF.url}
              fileName={currentPDF.fileName}
              numPages={currentPDF.numPages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
