import { Github, Linkedin, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span>by</span>
            <span className="font-semibold text-gray-900">Pratik Raj</span>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/kpratik07"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              title="GitHub"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://www.linkedin.com/in/pratik-raj-b4a9b2221"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
              <span className="text-sm hidden sm:inline">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
