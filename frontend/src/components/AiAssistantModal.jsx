import React, { useState } from 'react';
import { Bot, Send, Sparkles, X, User, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function AiAssistantModal({ isOpen, onClose, onSelectProvider }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I'm your LocalFix AI Assistant powered by Gemini. Describe your home issue (e.g., 'My AC is running but not cooling' or 'I need a plumber tomorrow morning') and I'll recommend the best services and providers for you!"
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      // Call backend FastAPI endpoint for AI Assistant
      const res = await api.post('/ai/chat', { prompt: userText });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.data.response || res.data.recommendation || "Based on your input, here is what I recommend.",
          category: res.data.recommendedCategory,
          issue: res.data.possibleIssue
        }
      ]);
    } catch (err) {
      let responseText = "The AI service is currently unavailable or taking too long to respond. Based on your keywords, here is a general recommendation:";
      let category = "AC Repair";

      const textLower = userText.toLowerCase();
      if (textLower.includes("ac") || textLower.includes("cooling") || textLower.includes("air condition")) {
        responseText = "AI Service Unavailable (Offline Keyword Match): For cooling or AC issues, we recommend booking an AC Repair Specialist for diagnostics.";
        category = "AC Repair";
      } else if (textLower.includes("pipe") || textLower.includes("leak") || textLower.includes("plumber") || textLower.includes("water") || textLower.includes("drain")) {
        responseText = "AI Service Unavailable (Offline Keyword Match): For pipe leaks or drain issues, we recommend booking an experienced Plumber.";
        category = "Plumber";
      } else if (textLower.includes("light") || textLower.includes("wire") || textLower.includes("spark") || textLower.includes("switch") || textLower.includes("electric")) {
        responseText = "AI Service Unavailable (Offline Keyword Match): For electrical issues, we recommend booking a certified Electrician.";
        category = "Electrician";
      } else if (textLower.includes("clean") || textLower.includes("sofa") || textLower.includes("dust")) {
        responseText = "AI Service Unavailable (Offline Keyword Match): For home sanitation and cleaning, we recommend Home Cleaning.";
        category = "Home Cleaning";
      } else {
        responseText = `AI Service Unavailable: We could not reach Gemini AI for "${userText}". Please browse our top-rated local providers directly.`;
        category = "All Services";
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          category: category
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-sky-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[580px]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                LocalFix AI Smart Assistant
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </h3>
              <p className="text-xs text-sky-400 font-medium">Powered by Gemini AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>

                {msg.category && (
                  <div className="mt-3 pt-2 border-t border-slate-700/80 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-sky-400">
                      Recommended: {msg.category}
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        window.location.href = `/providers?service=${encodeURIComponent(msg.category)}`;
                      }}
                      className="text-[11px] font-bold text-white hover:text-sky-300 flex items-center gap-1 bg-sky-500/30 px-2 py-1 rounded-md border border-sky-500/40"
                    >
                      View Pros <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-400 text-xs">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" />
                <span>AI is analyzing your request...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your issue or service needed..."
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-sky-500/50 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-medium hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 transition-all shadow-md shadow-sky-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
