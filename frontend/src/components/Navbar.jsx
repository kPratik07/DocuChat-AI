import { FileText } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-icon-wrapper">
              <FileText className="navbar-icon" />
            </div>
            <div className="navbar-text">
              <h1 className="navbar-title">DocuChat AI</h1>
              <p className="navbar-subtitle">Chat with your documents</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
