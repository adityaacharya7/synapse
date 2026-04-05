import React, { useState, useEffect } from 'react';
import { Youtube, Loader2, Sparkles, Trash2, BookOpen, ChevronDown, ChevronRight, Download, Copy, CheckCircle2, Zap } from 'lucide-react';
import { generateTranscript, generateNativeVideoTranscript } from '../src/services/geminiService';
import { saveTranscriptDoc, getTranscripts, deleteTranscript } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { SavedTranscript } from '../types';

const VideoTranscriptGenerator: React.FC = () => {
  const { user } = useUser();
  const [videoUrl, setVideoUrl] = useState('');
  const [subject, setSubject] = useState('General');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [result, setResult] = useState<SavedTranscript | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const [transcripts, setTranscripts] = useState<SavedTranscript[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
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

  const extractYouTubeTranscript = async (url: string): Promise<string> => {
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?]+)/);
    const videoId = match ? match[1] : null;
    if (!videoId) throw new Error("Could not parse a valid YouTube Video ID from the link.");

    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Failed to fetch video page via proxy.");
    const data = await response.json();
    const html = data.contents;

    if (!html || !html.includes('ytInitialPlayerResponse')) {
      throw new Error("Could not extract player metadata from YouTube page.");
    }

    try {
      const jsonStart = html.split('ytInitialPlayerResponse = ')[1];
      const jsonStr = jsonStart.split(';</script>')[0];
      const playerResponse = JSON.parse(jsonStr);

      const captions = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (!captions || captions.length === 0) {
        throw new Error("No captions/subtitles found for this video.");
      }

      // Prefer English, fallback to first available
      const trackUrl = captions.find((t: any) => t.languageCode.startsWith('en'))?.baseUrl || captions[0].baseUrl;
      
      const transcriptProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(trackUrl)}`;
      const transcriptRes = await fetch(transcriptProxy);
      const transcriptData = await transcriptRes.json();
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(transcriptData.contents, "text/xml");
      const textNodes = xmlDoc.getElementsByTagName("text");
      
      let transcript = '';
      for (let i = 0; i < textNodes.length; i++) {
        // Decode HTML entities within the text
        const decodedText = textNodes[i].textContent?.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"') || "";
        transcript += decodedText + ' ';
      }
      
      if (!transcript.trim()) throw new Error("Transcript extracted was empty.");
      return transcript.trim();
    } catch (e: any) {
      console.error("Transcript parsing error:", e);
      throw new Error(e.message || "Failed to parse transcript structure.");
    }
  };

  const handleGenerate = async () => {
    if (!videoUrl.trim()) {
      alert('Please provide a valid YouTube URL.');
      return;
    }
    
    setLoading(true);
    setResult(null);
    try {
      let aiRes;
      try {
        setLoadingStatus('Extracting Video Captions...');
        const rawTranscriptText = await extractYouTubeTranscript(videoUrl);
        setLoadingStatus('Analyzing Transcript Content...');
        aiRes = await generateTranscript(rawTranscriptText, subject);
      } catch (err: any) {
        console.log("Caption extraction failed, falling back to Native AI Video processing:", err.message);
        setLoadingStatus('Native AI Video Processing (This may take a minute so sit back!)...');
        aiRes = await generateNativeVideoTranscript(videoUrl, subject);
      }

      const transcript: SavedTranscript = {
        id: `vtrans_${Date.now()}`,
        title: title || `${subject} Video Lecture`,
        subject,
        tldr: aiRes.tldr,
        sections: aiRes.sections,
        actionItems: aiRes.actionItems,
        createdAt: new Date().toISOString()
      };
      
      setResult(transcript);
      setExpandedSections(new Set(aiRes.sections.map((_, i) => i)));

      if (auth.currentUser) {
        await saveTranscriptDoc(auth.currentUser.uid, transcript);
        await loadTranscripts();
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Video transcript generation failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingStatus('');
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
            Video Lecture Transcript <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Paste a YouTube video link to get a structured, organized transcript.</p>
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
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. CS50 Lecture 1"
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
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">YouTube Video Link</label>
              <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none outline-none font-bold text-sm dark:text-white" />
            </div>

            <button onClick={handleGenerate} disabled={loading || (!videoUrl.trim())}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]">
              {loading ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
              {loading ? 'Generating...' : 'Generate Transcript'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-7">
          {loading ? (
            <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center border dark:border-slate-800">
              <div className="w-24 h-24 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
              <p className="text-xl font-black dark:text-white animate-pulse">{loadingStatus || 'Processing Video...'}</p>
              <p className="text-gray-400 mt-2 text-sm">Organizing content into clean sections</p>
            </div>
          ) : !result ? (
            <div className="h-[500px] bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10">
              <Youtube size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold dark:text-white">Ready to Transcribe</h3>
              <p className="text-gray-500 max-w-sm mt-2">Paste a YouTube video link to get a clean, organized transcript with key concepts.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
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

export default VideoTranscriptGenerator;
