import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../api/axios";
import {
  Sparkles,
  Bot,
  User,
  X,
  Send,
  Loader2,
  AlertCircle,
  MessageSquare,
  Minimize2,
  RotateCcw,
} from "lucide-react";

const AIChatWidget = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm the Jobnique AI Assistant. Ask me about career advice, interview prep, or navigating the platform!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  if (!isAuthenticated) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", {
        message: text,
        history: newMessages.slice(-10),
      });
      setMessages([
        ...newMessages,
        { role: "assistant", content: res.data.reply },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message || "AI assistant is temporarily unavailable."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Chat reset! What else can I help you with today?",
      },
    ]);
    setError("");
  };

  return (
    <div className="fixed z-50 bottom-6 right-6 font-sans">
      
      {/* Floating Chat Box */}
      {open && (
        <div className="flex flex-col mb-4 w-[360px] sm:w-[400px] h-[520px] bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-2xl shadow-2xl shadow-indigo-950/50 overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-slate-950/60 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="relative p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  Jobnique Assistant
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Powered by AI
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Reset Conversation"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                title="Close Chat"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2.5 max-w-[88%] ${
                  m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    m.role === "user"
                      ? "bg-slate-800 border border-slate-700 text-indigo-300"
                      : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="w-3.5 h-3.5" />
                  ) : (
                    <Bot className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-none shadow-md shadow-indigo-500/10"
                      : "bg-slate-950/70 border border-slate-800 text-slate-200 rounded-tl-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Thinking State Indicator */}
            {loading && (
              <div className="flex gap-2.5 mr-auto max-w-[85%] items-center">
                <div className="w-7 h-7 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-none bg-slate-950/70 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-slate-950/80 border-t border-slate-800/80 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about jobs, resumes, tips..."
              className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-indigo-500/80 text-slate-100 placeholder-slate-500 rounded-xl outline-none transition-all text-xs sm:text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl text-white bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 active:scale-95 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed shrink-0"
              title="Send Message"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

        </div>
      )}

      {/* Floating Toggle Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`relative group flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-all duration-300 active:scale-95 ${
          open
            ? "bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700"
            : "bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-600 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
        }`}
        title="AI Career Assistant"
      >
        {open ? (
          <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-500 border-2 border-slate-950"></span>
            </span>
          </>
        )}
      </button>

    </div>
  );
};

export default AIChatWidget;