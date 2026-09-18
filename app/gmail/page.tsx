"use client";

import { useState, useEffect } from "react";
import { getDispatchedEmails, DispatchedEmail } from "@/lib/email-store";
import Link from "next/link";
import {
  Mail,
  Search,
  Star,
  Clock,
  Send,
  FileText,
  Trash2,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function GmailSimulatorPage() {
  const [emails, setEmails] = useState<DispatchedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<DispatchedEmail | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadEmails = () => {
    const list = getDispatchedEmails();
    setEmails(list);
    if (list.length > 0 && !selectedEmail) {
      setSelectedEmail(list[0]);
    }
  };

  useEffect(() => {
    loadEmails();
    const interval = setInterval(loadEmails, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEmails = emails.filter(
    (e) =>
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.code.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#1f1f1f] flex flex-col font-sans">
      {/* Gmail Top Navbar */}
      <header className="bg-white border-b border-neutral-200 px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6">
          {/* Gmail Brand Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              M
            </div>
            <span className="text-xl font-medium tracking-tight text-neutral-800">
              Gmail <span className="text-[11px] font-mono text-neutral-400 font-normal">Inbox Simulator</span>
            </span>
          </div>
        </div>

        {/* Gmail Search Bar */}
        <div className="max-w-2xl w-full mx-8">
          <div className="bg-[#eaf1fb] hover:bg-[#dfe7f3] transition-colors rounded-full px-5 py-2.5 flex items-center space-x-3 text-neutral-600">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search in mail (e.g. Mozart, code)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] w-full text-neutral-800 placeholder:text-neutral-500"
            />
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={loadEmails}
            title="Refresh Inbox"
            className="p-2.5 hover:bg-neutral-100 rounded-full text-neutral-600 transition-colors"
          >
            <RefreshCw size={17} />
          </button>

          <Link
            href="https://mail.google.com"
            target="_blank"
            className="text-[12px] text-blue-600 hover:underline flex items-center space-x-1 px-3 py-1.5 border border-blue-200 rounded-full bg-blue-50/50"
          >
            <span>Real Gmail (mail.google.com)</span>
            <ExternalLink size={12} />
          </Link>
        </div>
      </header>

      {/* Main Gmail Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-neutral-200 p-4 shrink-0 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="bg-[#c2e7ff] text-[#001d35] font-semibold text-[13px] px-5 py-2.5 rounded-full flex items-center justify-between cursor-pointer">
              <div className="flex items-center space-x-3">
                <Mail size={16} />
                <span>Inbox</span>
              </div>
              <span className="text-[11px] font-bold">{emails.length}</span>
            </div>

            <div className="text-neutral-700 hover:bg-neutral-100 text-[13px] px-5 py-2.5 rounded-full flex items-center space-x-3 cursor-pointer transition-colors">
              <Star size={16} />
              <span>Starred</span>
            </div>

            <div className="text-neutral-700 hover:bg-neutral-100 text-[13px] px-5 py-2.5 rounded-full flex items-center space-x-3 cursor-pointer transition-colors">
              <Clock size={16} />
              <span>Snoozed</span>
            </div>

            <div className="text-neutral-700 hover:bg-neutral-100 text-[13px] px-5 py-2.5 rounded-full flex items-center space-x-3 cursor-pointer transition-colors">
              <Send size={16} />
              <span>Sent</span>
            </div>

            <div className="text-neutral-700 hover:bg-neutral-100 text-[13px] px-5 py-2.5 rounded-full flex items-center space-x-3 cursor-pointer transition-colors">
              <FileText size={16} />
              <span>Drafts</span>
            </div>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 leading-relaxed">
            <p className="font-semibold text-neutral-800 mb-1">Gmail Client Mode</p>
            This inbox captures incoming confirmation emails sent by the Mozart Studio registration system.
          </div>
        </aside>

        {/* Email List Column */}
        <div className="w-80 bg-white border-r border-neutral-200 overflow-y-auto shrink-0 divide-y divide-neutral-100">
          <div className="p-3 bg-neutral-50/70 border-b border-neutral-200 text-[11px] uppercase tracking-wider font-semibold text-neutral-500 flex items-center justify-between">
            <span>Messages ({filteredEmails.length})</span>
            <span className="font-normal lowercase">auto-refresh</span>
          </div>

          {filteredEmails.length === 0 ? (
            <div className="p-8 text-center text-neutral-400">
              <Mail size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-[12px]">Your inbox is empty.</p>
              <p className="text-[10px] text-neutral-400 mt-1">
                Register on Mozart to receive your verification email.
              </p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => setSelectedEmail(email)}
                className={`p-4 cursor-pointer transition-colors text-left ${
                  selectedEmail?.id === email.id
                    ? "bg-[#e8f0fe] border-l-4 border-blue-600"
                    : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-neutral-900 truncate">
                    Mozart Studio Paris
                  </span>
                  <span className="text-neutral-400 text-[10px] shrink-0">
                    {new Date(email.sentAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="text-[12px] font-medium text-neutral-800 line-clamp-1 mb-1">
                  {email.subject}
                </div>
                <div className="text-[11px] text-neutral-500 line-clamp-1 font-mono">
                  Code: {email.code} • To: {email.to}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Email Viewing Pane */}
        <main className="flex-1 bg-white overflow-y-auto p-8">
          {selectedEmail ? (
            <div className="max-w-3xl mx-auto">
              {/* Email Top Bar */}
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-6">
                <div>
                  <h2 className="text-xl font-medium text-neutral-900 mb-1">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center space-x-2 text-[12px] text-neutral-500">
                    <span className="font-semibold text-neutral-900">
                      Mozart Studio Paris &lt;concierge@mozart.com&gt;
                    </span>
                    <span>to</span>
                    <span className="font-mono text-neutral-800">{selectedEmail.to}</span>
                    <span>•</span>
                    <span>{new Date(selectedEmail.sentAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Quick Copy Verification Code Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyCode(selectedEmail.code)}
                    className="bg-black hover:bg-neutral-800 text-white text-[11px] tracking-wider uppercase font-semibold py-2 px-4 rounded-md flex items-center space-x-2 shadow-sm transition-colors"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : `Copy Code (${selectedEmail.code})`}</span>
                  </button>
                </div>
              </div>

              {/* Render HTML Body of Email */}
              <div
                className="border border-neutral-200 rounded-lg p-2 bg-neutral-50"
                dangerouslySetInnerHTML={{ __html: selectedEmail.htmlContent }}
              />

              {/* Action back to Mozart */}
              <div className="mt-8 pt-6 border-t border-neutral-200 flex items-center justify-between text-[12px]">
                <Link
                  href="/signup"
                  className="text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <ArrowLeft size={14} />
                  <span>Return to Mozart Signup to Enter Code</span>
                </Link>

                <span className="text-neutral-400 font-mono text-[11px]">
                  ID: {selectedEmail.id}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400">
              <Mail size={48} className="mb-3 opacity-30" />
              <p className="text-base font-medium text-neutral-700">Select an email to read</p>
              <p className="text-[12px] text-neutral-400 mt-1 max-w-sm">
                Incoming verification codes from the Mozart Studio will be displayed here in full Gmail layout.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
