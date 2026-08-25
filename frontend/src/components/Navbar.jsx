import { ArrowLeft, FileText } from "lucide-react";

export default function Navbar({ onBack }) {
  return (
    <nav className="border-b border-[#dde1d6] bg-[#fffef9] shadow-sm">
      <div className="mx-auto max-w-full px-3 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between sm:h-14">
          <div className="flex shrink-0 items-center gap-2 whitespace-nowrap sm:gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#236b57] text-[#e8d88c] sm:h-10 sm:w-10">
              <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-['Geist'] whitespace-nowrap text-sm font-semibold text-[#182321] sm:text-lg lg:text-xl">
                DocuChat AI
              </h1>
              <p className="hidden text-xs text-[#78857c] sm:block">
                Chat with your documents
              </p>
            </div>
          </div>
          {onBack && (
            <button
              className="ml-auto inline-flex items-center gap-2 rounded-lg border border-[#b8cbb9] bg-[#edf4eb] px-2 py-2 text-[#236b57] transition hover:border-[#91b19a] hover:bg-[#e2eee2] sm:px-3"
              onClick={onBack}
              title="Back to dashboard"
            >
              <ArrowLeft size={16} />
              <span className="hidden text-[13px] font-semibold sm:inline">
                Back to dashboard
              </span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
