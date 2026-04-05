import React, { useState, useEffect, useRef } from 'react';
import { AudioLines, Loader2, Sparkles, Trash2, UploadCloud, X, File as FileIcon, ChevronDown, ChevronRight, Download, Copy, CheckCircle2, Clock, Zap, BookOpen } from 'lucide-react';
import { generateTranscript } from '../src/services/geminiService';
import { saveTranscriptDoc, getTranscripts, deleteTranscript } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { SavedTranscript } from '../types';

const TranscriptGenerator: React.FC = () => {
  const { user } = useUser();
  const [rawText, setRawText] = useState('');
  const [subject, setSubject] = useState('General');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SavedTranscript | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const [transcripts, setTranscripts] = useState<SavedTranscript[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTranscripts();
  }, []);

  const loadTranscripts = async () => {
    if (auth.currentUser) {
      const t = await getTranscripts(auth.currentUser.uid);
      setTranscripts(t);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.\w+$/, ''));

      const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm'];
      if (audioTypes.includes(f.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setFileBase64(result.split(',')[1]);
        };
        reader.readAsDataURL(f);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setRawText(reader.result as string);
        reader.readAsText(f);
      }
    }
  };

  const handleGenerate = async () => {
    if (!rawText.trim() && !fileBase64) {
      alert('Please provide lecture content or upload an audio file.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const fileData = fileBase64 && file ? { data: fileBase64, mimeType: file.type } : undefined;
      const res = await generateTranscript(rawText, subject, fileData);

      const transcript: SavedTranscript = {
        id: `trans_${Date.now()}`,
        title: title || `${subject} Lecture`,
        subject,
        tldr: res.tldr,
        sections: res.sections,
        actionItems: res.actionItems,
        createdAt: new Date().toISOString()
      };
      setResult(transcript);
      setExpandedSections(new Set(res.sections.map((_, i) => i)));

      if (auth.currentUser) {
        await saveTranscriptDoc(auth.currentUser.uid, transcript);
        await loadTranscripts();
      }
    } catch (err) {
      console.error(err);
      alert('Transcript generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser || !confirm('Delete this transcript?')) return;
    await deleteTranscript(auth.currentUser.uid, id);
    if (result?.id === id) setResult(null);
    await loadTranscripts();
  };

  const openTranscript = (t: SavedTranscript) => {
    setResult(t);
    setExpandedSections(new Set(t.sections.map((_, i) => i)));
    setShowLibrary(false);
  };

  const toggleSection = (idx: number) => {
    const next = new Set(expandedSections);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedSections(next);
  };

  const exportAsText = () => {
    if (!result) return;
    let text = `# ${result.title}\n\n## TL;DR\n${result.tldr}\n\n`;
    result.sections.forEach(s => {
      text += `## ${s.heading}\n${s.content}\nKey Concepts: ${s.keyConcepts.join(', ')}\n\n`;
    });
    text += `## Action Items\n${result.actionItems.map((a, i) => `${i + 1}. ${a}`).join('\n')}`;

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.title.replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!result) return;
    let text = `TL;DR: ${result.tldr}\n\n`;
    result.sections.forEach(s => {
      text += `${s.heading}\n${s.content}\n\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Transcript Generator <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Upload audio or paste lecture text to get a structured, organized transcript.</p>
        </div>
        <div className="flex items-center gap-3 md:pr-24">
          <button onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <BookOpen size={16} /> Library ({transcripts.length})
          </button>
        </div>
      </header>

      {showLibrary && (
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Saved Transcripts</h3>
          {transcripts.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">No transcripts saved yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {transcripts.map(t => (
                <div key={t.id} onClick={() => openTranscript(t)}
                  className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-colors group">
                  <div>
                    <p className="font-bold dark:text-white">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.subject} • {t.sections.length} sections • {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                    className="p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-8">
        {/* LEFT: Input */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="Lecture 12 - ML"
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. CS, Physics"
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-sm dark:text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lecture Content</label>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste raw lecture text, meeting notes, or any unstructured content here..."
                className="w-full h-52 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm dark:text-white resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <UploadCloud size={16} /> Upload Audio/Text
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.md,audio/*" onChange={handleFileUpload} />
              {file && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-700 dark:text-brand-300 text-xs font-bold">
                  <FileIcon size={12} /> {file.name}
                  <button onClick={() => { setFile(null); setFileBase64(null); }} className="ml-1 hover:text-red-500"><X size={12} /></button>
                </div>
              )}
            </div>

            <button onClick={handleGenerate} disabled={loading || (!rawText.trim() && !fileBase64)}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]">
              {loading ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
              {loading ? 'Generating Transcript...' : 'Generate Transcript'}
            </button>
          </div>
        </div>

        {/* RIGHT: Result */}
        <div className="lg:col-span-7">
          {loading ? (
            <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center border dark:border-slate-800">
              <div className="w-24 h-24 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
              <p className="text-xl font-black dark:text-white animate-pulse">Structuring Lecture...</p>
              <p className="text-gray-400 mt-2 text-sm">Organizing content into clean sections</p>
            </div>
          ) : !result ? (
            <div className="h-[500px] bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10">
              <AudioLines size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold dark:text-white">Ready to Transcribe</h3>
              <p className="text-gray-500 max-w-sm mt-2">Paste lecture text or upload audio to get a clean, organized transcript with key concepts.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              {/* TL;DR */}
              <div className="bg-gradient-to-r from-brand-600 to-purple-600 text-white p-6 rounded-3xl shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-2">TL;DR</p>
                    <h2 className="text-xl font-bold">{result.title}</h2>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={copyToClipboard} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors" title="Copy">
                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                    <button onClick={exportAsText} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors" title="Export">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-white/90 leading-relaxed">{result.tldr}</p>
              </div>

              {/* Sections */}
              <div className="space-y-3">
                {result.sections.map((section, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <button onClick={() => toggleSection(idx)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 flex items-center justify-center text-xs font-black">{idx + 1}</span>
                        <h3 className="font-bold dark:text-white">{section.heading}</h3>
                      </div>
                      {expandedSections.has(idx) ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    </button>
                    {expandedSections.has(idx) && (
                      <div className="px-5 pb-5 animate-in fade-in duration-200">
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{section.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {section.keyConcepts.map((kc, ki) => (
                            <span key={ki} className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold border border-purple-100 dark:border-purple-900/30">
                              {kc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Action Items */}
              <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-3xl p-6">
                <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={14} /> Action Items</h3>
                <ol className="space-y-2">
                  {result.actionItems.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-orange-800 dark:text-orange-300 font-medium">
                      <span className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0">{i + 1}</span>
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranscriptGenerator;
