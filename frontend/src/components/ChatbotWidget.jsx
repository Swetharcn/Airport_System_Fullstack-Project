import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react'
import api from '../api/axiosInstance'

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text: "👋 Hello! I'm your **Smart Airport Assistant**. Ask me about flights, check-in, lounges, transport, dining, or anything else about the airport!",
  time: new Date(),
}

/** Converts **bold** and \n to JSX */
const renderMarkdown = (text) => {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    const formatted = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j} className="font-semibold">{part}</strong> : part
    )
    return (
      <span key={i}>
        {formatted}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

export default function ChatbotWidget() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const endRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { id: Date.now(), role: 'user', text, time: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Pass last 20 messages as history so Gemini has conversation context
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-20)
        .map((m) => ({ role: m.role, text: m.text }))

      const { data } = await api.post('/chat', { message: text, history })
      setMessages((prev) => [
        ...prev,
        {
          id:   Date.now() + 1,
          role: 'assistant',
          text: data.reply,
          mode: data.mode,  // 'gemini' | 'rule-based' | 'flight-lookup'
          time: new Date(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id:    Date.now() + 1,
          role:  'assistant',
          text:  '⚠️ Sorry, I encountered an error. Please try again.',
          time:  new Date(),
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      {/* ── Chat Drawer ─────────────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] max-h-[560px] flex flex-col rounded-2xl shadow-2xl border border-slate-100 bg-white overflow-hidden animate-slide-up"
          role="dialog"
          aria-label="Airport Assistant Chat"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-900 to-indigo-900 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">AirAssist AI</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-white/60 text-xs">Online · Gemini NLP</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${
                  msg.role === 'user'
                    ? 'bg-indigo-600'
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  }
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed chat-message ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-sm'
                      : msg.error
                        ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-sm'
                        : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-tl-sm'
                  }`}>
                    {renderMarkdown(msg.text)}
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] text-slate-400">{formatTime(msg.time)}</span>
                    {msg.role === 'assistant' && msg.mode === 'groq' && (
                      <span className="text-[10px] text-purple-500 font-medium">⚡ Groq AI</span>
                    )}
                    {msg.role === 'assistant' && msg.mode === 'gemini' && (
                      <span className="text-[10px] text-indigo-400 font-medium">✨ Gemini AI</span>
                    )}
                    {msg.role === 'assistant' && msg.mode === 'flight-lookup' && (
                      <span className="text-[10px] text-emerald-500 font-medium">🔍 Live</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex gap-2.5 items-end">
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-slate-100 bg-white flex-shrink-0">
            {['Check-in', 'Lounges', 'Transport', 'Wi-Fi'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => { setInput(suggestion); setTimeout(sendMessage, 0) }}
                className="flex-shrink-0 px-3 py-1 rounded-full border border-indigo-200 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors whitespace-nowrap"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="px-4 py-3 border-t border-slate-100 bg-white flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              id="chatbot-input"
              type="text"
              className="form-input flex-1 text-sm py-2"
              placeholder="Ask anything about the airport..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={300}
              disabled={loading}
              aria-label="Chat message input"
            />
            <button
              id="chatbot-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="w-10 h-10 flex-shrink-0 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
              aria-label="Send message"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Toggle Button ──────────────────────────────────────────── */}
      <button
        id="chatbot-toggle-btn"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-glow-blue hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open
          ? <Minimize2 className="w-5 h-5" />
          : <MessageCircle className="w-6 h-6" />
        }
        {/* Notification pulse */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse-slow" />
        )}
      </button>
    </>
  )
}
