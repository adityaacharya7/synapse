import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Paperclip, Mic, Clock, MessageSquare, X, Plus, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getCareerAdvice } from '../src/services/geminiService';
import { ChatMessage } from '../types';
import { useUser } from '../App';

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

const QUICK_PROMPTS = [
  { label: 'Explain a concept', icon: '💡', prompt: 'Can you explain a concept to me? I want to understand ' },
  { label: 'Help me study', icon: '📚', prompt: 'Help me create a study plan for ' },
  { label: 'Quiz me', icon: '🧠', prompt: 'Quiz me on ' },
  { label: 'Solve a problem', icon: '🔢', prompt: 'Help me solve this problem: ' },
  { label: 'Summarize notes', icon: '📝', prompt: 'Summarize these notes for me: ' },
  { label: 'Exam strategies', icon: '🎯', prompt: 'What are the best strategies for preparing for my ' },
];

const formatTime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const AdvisorChat: React.FC = () => {
  const { user } = useUser();
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chat_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed : [];
    }
    return [];
  });

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    const saved = localStorage.getItem('chat_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed[0].id : null;
    }
    return null;
  });

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const createNewSession = (firstMessage?: ChatMessage) => {
    const id = Date.now().toString();
    const greeting: ChatMessage = {
      role: 'assistant',
      content: `Hi ${user?.name.split(' ')[0] || 'there'}! I'm your Study Buddy. I can help with homework, explain concepts, suggest study strategies, or prep you for exams. What do you need help with?`,
      timestamp: new Date().toISOString(),
    };
    const newSession: ChatSession = {
      id,
      title: firstMessage ? firstMessage.content.slice(0, 40) + (firstMessage.content.length > 40 ? '...' : '') : 'New Chat',
      messages: firstMessage ? [greeting, firstMessage] : [greeting],
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
    return id;
  };

  const updateSessionMessages = (sessionId: string, updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const updated = updater(s.messages);
      return {
        ...s,
        messages: updated,
        title: s.title === 'New Chat' && updated.length > 1
          ? (updated.find(m => m.role === 'user')?.content.slice(0, 40) || s.title)
          : s.title,
      };
    }));
  };

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput || input;
    if (!text.trim() || loading || !user) return;

    const userMessage: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };

    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = createNewSession(userMessage);
      setInput('');
      setLoading(true);
      // Need to wait a tick for state to settle
      try {
        const sessionMessages = [
          { role: 'assistant' as const, content: `Hi ${user?.name.split(' ')[0] || 'there'}! I'm your Study Buddy.`, timestamp: new Date().toISOString() },
          userMessage,
        ];
        const response = await getCareerAdvice(sessionMessages, user);
        updateSessionMessages(targetSessionId, prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that.", timestamp: new Date().toISOString() }]);
      } catch (err) {
        console.error(err);
        updateSessionMessages(targetSessionId, prev => [...prev, { role: 'assistant', content: "Something went wrong. Please check your connection.", timestamp: new Date().toISOString() }]);
      } finally {
        setLoading(false);
      }
      return;
    }

    updateSessionMessages(targetSessionId, prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const allMessages = [...messages, userMessage];
      const response = await getCareerAdvice(allMessages, user);
      updateSessionMessages(targetSessionId, prev => [...prev, { role: 'assistant', content: response || "I'm sorry, I couldn't process that.", timestamp: new Date().toISOString() }]);
    } catch (err) {
      console.error(err);
      updateSessionMessages(targetSessionId, prev => [...prev, { role: 'assistant', content: "Something went wrong. Please check your connection.", timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    if (!activeSessionId) return;
    if (confirm('Delete this conversation?')) {
      setSessions(prev => prev.filter(s => s.id !== activeSessionId));
      const remaining = sessions.filter(s => s.id !== activeSessionId);
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const isEmptyState = messages.length <= 1;

  return (
    <div className="h-screen flex bg-bg-base transition-colors duration-300 overflow-hidden text-text-primary">
      {/* ── History Sidebar ── */}
      <div
        className="h-full flex-shrink-0 border-r border-border-subtle flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-surface/50"
        style={{
          width: sidebarOpen ? '300px' : '0px',
          minWidth: sidebarOpen ? '300px' : '0px',
          opacity: sidebarOpen ? 1 : 0,
        }}
      >
        <div className="p-5 border-b border-border-subtle flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">History</h2>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-3">
          <button
            onClick={() => { createNewSession(); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-brand-600 dark:text-brand-400 border border-dashed border-brand-500/30 hover:bg-brand-500/10 hover:border-brand-500/50 transition-all"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 space-y-1">
          {sessions.map(session => (
            <button
              key={session.id}
              onClick={() => { setActiveSessionId(session.id); setSidebarOpen(false); }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all group ${
                session.id === activeSessionId
                  ? 'bg-brand-600/15 text-brand-700 dark:text-brand-300 font-semibold'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <p className="truncate">{session.title}</p>
              <p className="text-[10px] text-text-muted mt-1">{formatDate(session.createdAt)} · {session.messages.length} msgs</p>
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-center text-text-muted text-xs mt-8 px-4">No conversations yet. Start a new chat!</p>
          )}
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 bg-surface/80 backdrop-blur-xl shadow-sm border-b border-border-subtle">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
              title="Chat history"
            >
              <MessageSquare size={20} />
            </button>
            <div className="w-11 h-11 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/25 ai-avatar-ring">
              <Bot size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-bold text-lg text-text-primary">Study Buddy</h1>
                <div className="flex items-center gap-1 border-l border-border-subtle pl-3 ml-1">
                  <button
                    onClick={() => { createNewSession(); }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-500/10 transition-all"
                    title="New chat"
                  >
                    <Plus size={16} />
                  </button>
                  <button
                    onClick={clearChat}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-[0.15em]">Ready to help you learn</span>
              </div>
            </div>
          </div>
          {/* Right side left empty to clear global DashboardHeader */}
          <div></div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar chat-bg-pattern dark:chat-bg-pattern-dark">
          <div className="w-full max-w-[1600px] mx-auto px-6 xl:px-24 py-8">
            {/* Messages list */}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 ${
                    msg.role === 'user'
                      ? 'bg-surface border border-border-subtle text-text-muted'
                      : 'bg-brand-600 text-white shadow-md shadow-brand-500/30 ai-avatar-ring'
                  }`}>
                    {msg.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
                  </div>
                  {/* Bubble + timestamp */}
                  <div className="flex flex-col">
                    <div className={`px-5 py-4 rounded-3xl text-[15px] leading-relaxed overflow-hidden ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-sm shadow-sm'
                        : 'chat-ai-bubble bg-surface border border-border-subtle text-text-primary rounded-tl-sm shadow-sm'
                    }`}>
                      <div className={`prose prose-sm max-w-none ${
                        msg.role === 'user'
                          ? 'prose-p:text-white prose-headings:text-white prose-strong:text-white prose-li:text-white prose-code:text-brand-200'
                          : 'dark:prose-invert prose-p:text-text-primary prose-headings:text-text-primary prose-strong:text-brand-600 dark:prose-strong:text-brand-300 prose-code:text-brand-600 dark:prose-code:text-brand-300 prose-li:text-text-secondary'
                      }`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                    {msg.timestamp && (
                      <div className={`flex items-center gap-1 mt-1.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <Clock size={10} className="text-text-muted" />
                        <span className="text-[10px] text-text-muted">{formatTime(msg.timestamp)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start mb-6">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/30 ai-avatar-ring">
                    <Sparkles size={18} />
                  </div>
                  <div className="chat-ai-bubble bg-surface border border-border-subtle px-5 py-4 rounded-3xl rounded-tl-sm shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <div className="typing-dot" style={{ animationDelay: '0ms' }}></div>
                      <div className="typing-dot" style={{ animationDelay: '150ms' }}></div>
                      <div className="typing-dot" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty state — quick prompts */}
            {isEmptyState && !loading && (
              <div className="flex flex-col items-center justify-center mt-8">
                <div className="w-20 h-20 rounded-3xl bg-brand-600/15 flex items-center justify-center mb-6 ai-avatar-ring">
                  <Sparkles size={36} className="text-brand-600 dark:text-brand-400" />
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-2">What can I help you with?</h2>
                <p className="text-text-secondary text-sm mb-8 text-center max-w-md">
                  Ask me anything — from explaining complex concepts to creating study plans, quizzing you, or helping with homework.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickPrompt(qp.prompt)}
                      className="group flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border-subtle bg-surface hover:bg-brand-500/5 hover:border-brand-500/30 text-left transition-all duration-200 shadow-sm"
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{qp.icon}</span>
                      <span className="text-sm text-text-secondary group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors font-medium">{qp.label}</span>
                      <ChevronRight size={14} className="ml-auto text-text-muted group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-border-subtle bg-surface/90 backdrop-blur-md pb-4 md:pb-6">
          <div className="w-full max-w-[1600px] mx-auto px-6 xl:px-24 pt-4 pb-2">
            <div className="flex items-center gap-3 bg-bg-base border border-border-subtle rounded-2xl px-4 py-1 focus-within:border-brand-500/40 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all shadow-sm">
              <button
                className="p-2 text-text-muted hover:text-brand-600 transition-colors flex-shrink-0"
                title="Attach file"
              >
                <Paperclip size={18} />
              </button>
              <input
                ref={inputRef}
                type="text"
                className="flex-1 py-3.5 bg-transparent outline-none text-text-primary text-[15px] placeholder:text-text-muted"
                placeholder="Ask about any subject, concept, or study strategy..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                className="p-2 text-text-muted hover:text-brand-600 transition-colors flex-shrink-0"
                title="Voice input"
              >
                <Mic size={18} />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50 disabled:bg-brand-600 active:scale-95 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-center text-[10px] text-text-muted mt-3 uppercase font-black tracking-[0.2em]">
              Powered by Gemini 2.5 Flash
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorChat;