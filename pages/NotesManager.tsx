import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Loader2, Sparkles, Search, Trash2, UploadCloud, X, File as FileIcon, Tag, ChevronRight, Plus, FileText, BookMarked, HelpCircle, List } from 'lucide-react';
import { summarizeNotes } from '../src/services/geminiService';
import { saveNote, getNotes, deleteNote } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { SavedNote } from '../types';
import ReactMarkdown from 'react-markdown';

const NotesManager: React.FC = () => {
  const { user } = useUser();
  const [rawText, setRawText] = useState('');
  const [subject, setSubject] = useState('General');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ summary: string; keyPoints: string[]; importantTerms: string[]; likelyQuestions: string[] } | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'keyPoints' | 'terms' | 'questions'>('summary');

  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    if (auth.currentUser) {
      const n = await getNotes(auth.currentUser.uid);
      setNotes(n);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.\w+$/, ''));
      const reader = new FileReader();
      reader.onloadend = () => setRawText(reader.result as string);
      reader.readAsText(f);
    }
  };

  const handleSummarize = async () => {
    if (!rawText.trim()) {
      alert('Please provide notes to summarize.');
      return;
    }
    setLoading(true);
    setResult(null);
    setSelectedNote(null);
    try {
      const res = await summarizeNotes(rawText, subject);
      setResult(res);

      // Auto-save
      if (auth.currentUser) {
        const note: SavedNote = {
          id: `note_${Date.now()}`,
          title: title || `${subject} Notes`,
          subject,
          rawText: rawText.substring(0, 5000),
          summary: res.summary,
          keyPoints: res.keyPoints,
          importantTerms: res.importantTerms,
          likelyQuestions: res.likelyQuestions,
          createdAt: new Date().toISOString()
        };
        await saveNote(auth.currentUser.uid, note);
        await loadNotes();
      }
    } catch (err) {
      console.error(err);
      alert('Summarization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!auth.currentUser || !confirm('Delete this note?')) return;
    await deleteNote(auth.currentUser.uid, noteId);
    if (selectedNote?.id === noteId) setSelectedNote(null);
    await loadNotes();
  };

  const openNote = (note: SavedNote) => {
    setSelectedNote(note);
    setResult({
      summary: note.summary,
      keyPoints: note.keyPoints,
      importantTerms: note.importantTerms,
      likelyQuestions: note.likelyQuestions
    });
    setActiveTab('summary');
    setShowLibrary(false);
  };

  const filteredNotes = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayResult = result;

  const tabs = [
    { key: 'summary' as const, label: 'Summary', icon: <FileText size={14} /> },
    { key: 'keyPoints' as const, label: 'Key Points', icon: <List size={14} /> },
    { key: 'terms' as const, label: 'Terms', icon: <BookMarked size={14} /> },
    { key: 'questions' as const, label: 'Questions', icon: <HelpCircle size={14} /> },
  ];

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Notes Summarizer <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Paste or upload notes to get AI-powered summaries, key points, and exam questions.</p>
        </div>
        <div className="flex items-center gap-3 md:pr-24">
          <button onClick={() => setShowLibrary(!showLibrary)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <BookOpen size={16} /> Library ({notes.length})
          </button>
        </div>
      </header>

      {/* Library Panel */}
      {showLibrary && (
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none outline-none text-sm font-bold dark:text-white"
              />
            </div>
          </div>
          {filteredNotes.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">No notes saved yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-72 overflow-y-auto">
              {filteredNotes.map(note => (
                <div key={note.id} onClick={() => openNote(note)}
                  className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group relative">
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                    className="absolute top-3 right-3 p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                  <p className="font-bold text-sm dark:text-white truncate pr-6">{note.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-brand-600 uppercase bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">{note.subject}</span>
                    <span className="text-[10px] text-gray-400">{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* LEFT: Input */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="My Lecture Notes"
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="e.g. CS, Math, Physics"
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm dark:text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notes Content *</label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Paste your lecture notes, textbook content, or any study material here..."
              className="w-full h-64 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm dark:text-white resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
              <UploadCloud size={16} /> Upload File
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.md,.csv" onChange={handleFileUpload} />
            {file && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-700 dark:text-brand-300 text-xs font-bold">
                <FileIcon size={12} /> {file.name}
                <button onClick={() => { setFile(null); }} className="ml-1 hover:text-red-500"><X size={12} /></button>
              </div>
            )}
          </div>

          <button onClick={handleSummarize} disabled={loading || !rawText.trim()}
            className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]">
            {loading ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
            {loading ? 'Summarizing...' : 'Summarize Notes'}
          </button>
        </div>

        {/* RIGHT: Results */}
        <div>
          {loading ? (
            <div className="h-full min-h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center border dark:border-slate-800">
              <div className="w-24 h-24 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
              <p className="text-xl font-black dark:text-white animate-pulse">Processing Notes...</p>
              <p className="text-gray-400 mt-2 text-sm">Extracting key information</p>
            </div>
          ) : !displayResult ? (
            <div className="h-full min-h-[500px] bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10">
              <BookOpen size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold dark:text-white">Paste Your Notes</h3>
              <p className="text-gray-500 max-w-sm mt-2">Get AI-powered summaries, key terminology, and predicted exam questions.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-right-8 duration-700">
              {selectedNote && (
                <div className="px-8 pt-6">
                  <p className="text-xs font-black text-brand-600 uppercase tracking-widest">{selectedNote.subject}</p>
                  <h2 className="text-xl font-black dark:text-white">{selectedNote.title}</h2>
                </div>
              )}

              {/* Tabs */}
              <div className="flex border-b dark:border-slate-800 px-4 mt-4">
                {tabs.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                      activeTab === tab.key
                        ? 'border-brand-600 text-brand-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-8 max-h-[500px] overflow-y-auto">
                {activeTab === 'summary' && (
                  <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown>{displayResult.summary}</ReactMarkdown>
                  </div>
                )}
                {activeTab === 'keyPoints' && (
                  <ul className="space-y-3">
                    {displayResult.keyPoints.map((pt, i) => (
                      <li key={i} className="flex gap-3 p-3 bg-brand-50 dark:bg-brand-900/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300">
                        <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                )}
                {activeTab === 'terms' && (
                  <div className="flex flex-wrap gap-2">
                    {displayResult.importantTerms.map((term, i) => (
                      <span key={i} className="px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 border dark:border-slate-700">
                        {term}
                      </span>
                    ))}
                  </div>
                )}
                {activeTab === 'questions' && (
                  <ol className="space-y-3">
                    {displayResult.likelyQuestions.map((q, i) => (
                      <li key={i} className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/30 text-sm font-medium text-orange-800 dark:text-orange-300 flex gap-3">
                        <span className="text-orange-400 font-black">Q{i + 1}.</span>
                        {q}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesManager;
