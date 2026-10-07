import React, { useState } from 'react';
import { MessageCircle, X, Send, HelpCircle, PhoneCall } from 'lucide-react';

interface WhatsAppButtonProps {
  customMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  customMessage = 'Hello Pathfinder Support, I need help regarding my course/account.',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState(customMessage);

  const rawPhone = '+918767168411';
  const cleanPhone = '918767168411';

  const handleOpenWhatsApp = (messageText: string) => {
    const encoded = encodeURIComponent(messageText);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Quick Chat Popup Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-emerald-950/40 overflow-hidden transform transition-all duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                    PF
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm leading-tight">Pathfinder Support</h4>
                  <p className="text-xs text-emerald-100 flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                    Online & Ready to Help
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close support chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-emerald-100/90 mt-2 font-medium">
              Direct counselor & technical helpline: +91 8767168411
            </p>
          </div>

          {/* Body */}
          <div className="p-4 bg-slate-950/90 space-y-3">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl rounded-tl-none text-xs text-slate-300 leading-relaxed">
              👋 Hi there! Need help with course access, meeting links, or student credentials? Send us a quick WhatsApp message!
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              <button
                onClick={() => handleOpenWhatsApp('Hello Pathfinder Support, I need help accessing my assigned course.')}
                className="w-full text-left text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Need help with course access</span>
              </button>
              <button
                onClick={() => handleOpenWhatsApp("Hello Pathfinder Support, I need assistance with today's live class link.")}
                className="w-full text-left text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 p-2 rounded-lg text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Live class meeting link issue</span>
              </button>
            </div>

            {/* Custom message textarea */}
            <div className="pt-1">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Your message:</label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Type your question..."
                />
              </div>
            </div>

            <button
              onClick={() => handleOpenWhatsApp(userQuery)}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.01]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start WhatsApp Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-full shadow-xl shadow-emerald-600/40 hover:shadow-emerald-600/60 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-emerald-500/40 cursor-pointer"
        aria-label="Open WhatsApp Support"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-6 h-6 fill-current text-white transition-transform group-hover:rotate-6" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline-block pr-1">
          WhatsApp Support
        </span>
      </button>
    </div>
  );
};
