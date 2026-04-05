import React, { useEffect, useState } from 'react';
import { Brain, BookOpen, AudioLines, TrendingUp, ArrowRight, Sparkles, FileText, Clock, Target, Flame, Trophy, Zap, ChevronRight, CalendarDays, Plus, Trash2, Youtube } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../App';
import { auth } from '../src/services/firebase';
import { getQuizHistory, getPerformanceHistory, getNotes, getTranscripts } from '../src/services/firebase';
import { QuizSession, PerformanceReport, SavedNote, SavedTranscript } from '../types';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [quizzes, setQuizzes] = useState<QuizSession[]>([]);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [transcripts, setTranscripts] = useState<SavedTranscript[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyTip, setDailyTip] = useState('');

  // Study Streak
  const [studyStreak, setStudyStreak] = useState(0);
  const [activeDays, setActiveDays] = useState<string[]>([]);

  // Upcoming Exams
  const [exams, setExams] = useState<{ id: string; subject: string; date: string }[]>(() => {
    const saved = localStorage.getItem('upcoming_exams');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddExam, setShowAddExam] = useState(false);
  const [newExamSubject, setNewExamSubject] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!auth.currentUser) { setLoading(false); return; }
    const uid = auth.currentUser.uid;
    try {
      const [q, r, n, t] = await Promise.all([
        getQuizHistory(uid),
        getPerformanceHistory(uid),
        getNotes(uid),
        getTranscripts(uid)
      ]);
      setQuizzes(q);
      setReports(r);
      setNotes(n);
      setTranscripts(t);

      // Calculate study streak
      const allDates = [
        ...q.map(x => x.createdAt),
        ...r.map(x => x.createdAt),
        ...n.map(x => x.createdAt),
        ...t.map(x => x.createdAt)
      ].map(d => new Date(d).toDateString());
      const uniqueDays = [...new Set(allDates)];
      setActiveDays(uniqueDays);

      // Calculate streak
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        if (uniqueDays.includes(d.toDateString())) {
          streak++;
        } else if (i > 0) break;
      }
      setStudyStreak(streak);

      // Generate daily tip based on data
      generateDailyTip(q, r);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyTip = (q: QuizSession[], r: PerformanceReport[]) => {
    const tips = [
      "Try the Pomodoro technique: 25 min focused study, 5 min break. It boosts retention by up to 25%.",
      "Active recall beats re-reading. Use the Quiz Maker to test yourself on topics you studied today.",
      "Spaced repetition is key — revisit your notes from 3 days ago to lock them into long-term memory.",
      "Teaching someone else is the best way to learn. Try explaining your last topic out loud.",
      "Before starting a study session, write down 3 specific things you want to learn. It sharpens focus.",
      "Your brain consolidates memories during sleep. Review key notes right before bed for better retention.",
      "Interleave subjects instead of studying one for hours. Mixing topics improves problem-solving skills.",
      "Use the Feynman Technique: Explain a concept in simple terms. If you can't, you don't understand it yet.",
    ];

    if (q.length > 0) {
      const avgScore = q.reduce((a, s) => a + (s.score / s.total), 0) / q.length;
      if (avgScore < 0.6) {
        setDailyTip("Your recent quiz scores suggest some gaps. Focus on reviewing weak areas and re-taking quizzes for those topics.");
        return;
      }
    }
    if (r.length > 0 && r[0].weaknesses.length > 0) {
      setDailyTip(`Focus on ${r[0].weaknesses[0]} — your latest performance report flagged this as a weak area.`);
      return;
    }
    // Random tip
    setDailyTip(tips[Math.floor(Math.random() * tips.length)]);
  };

  const avgQuizScore = quizzes.length > 0
    ? Math.round((quizzes.reduce((a, q) => a + (q.score / q.total) * 100, 0) / quizzes.length))
    : null;

  const latestReport = reports.length > 0 ? reports[0] : null;

  // Build recent activity from all sources
  const recentActivity = [
    ...quizzes.map(q => ({ type: 'quiz' as const, title: `Quiz: ${q.topic}`, detail: `${q.score}/${q.total} correct`, date: q.createdAt, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' })),
    ...reports.map(r => ({ type: 'perf' as const, title: `Analysis: ${r.examName}`, detail: `${r.overallPercent}% overall`, date: r.createdAt, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' })),
    ...notes.map(n => ({ type: 'note' as const, title: `Notes: ${n.title}`, detail: n.subject, date: n.createdAt, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' })),
    ...transcripts.map(t => ({ type: 'trans' as const, title: `Transcript: ${t.title}`, detail: `${t.sections.length} sections`, date: t.createdAt, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  const iconMap = { quiz: Brain, perf: TrendingUp, note: BookOpen, trans: AudioLines };

  const quickLinks = [
    { label: 'Take a Quiz', desc: 'Test your knowledge on any topic', icon: Brain, path: '/quiz', gradient: 'from-purple-500 to-indigo-600' },
    { label: 'AI Flashcards', desc: 'Smart active recall with SRS', icon: Sparkles, path: '/flashcards', gradient: 'from-brand-500 to-indigo-600' },
    { label: 'Summarize Notes', desc: 'Get key points & exam questions', icon: BookOpen, path: '/notes', gradient: 'from-blue-500 to-cyan-600' },
    { label: 'Transcribe Lecture', desc: 'Structure any lecture content', icon: AudioLines, path: '/transcript', gradient: 'from-orange-500 to-red-500' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const addExam = () => {
    if (!newExamSubject.trim() || !newExamDate) return;
    const updated = [...exams, { id: `ex_${Date.now()}`, subject: newExamSubject, date: newExamDate }].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setExams(updated);
    localStorage.setItem('upcoming_exams', JSON.stringify(updated));
    setNewExamSubject('');
    setNewExamDate('');
    setShowAddExam(false);
  };

  const removeExam = (id: string) => {
    const updated = exams.filter(e => e.id !== id);
    setExams(updated);
    localStorage.setItem('upcoming_exams', JSON.stringify(updated));
  };

  const getDaysUntil = (dateStr: string) => {
    const diff = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Passed';
    if (diff === 0) return 'Today!';
    if (diff === 1) return 'Tomorrow';
    return `${diff} days`;
  };

  // 7-day streak grid
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: d, label: d.toLocaleDateString('en', { weekday: 'short' })[0], active: activeDays.includes(d.toDateString()) };
  });

  return (
    <div className="p-6 pb-32 md:p-10 md:pb-36 xl:px-12 w-full max-w-[1600px] mx-auto flex flex-col gap-6 animate-in fade-in duration-500 text-text-primary">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-text-primary tracking-tight">
            {greeting}, {user?.name.split(' ')[0] || 'Scholar'} 👋
          </h1>
          <p className="text-text-secondary font-medium mt-1">
            Here's your study dashboard. Let's make today count.
          </p>
        </div>
      </header>

      {/* Quick Access Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickLinks.map(item => (
          <Link key={item.path} to={item.path}
            className="group relative overflow-hidden rounded-3xl p-6 text-white shadow-lg shadow-brand-500/10 hover:shadow-xl hover:shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-95">
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`}></div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon size={24} />
              </div>
              <h3 className="font-black text-lg mb-1">{item.label}</h3>
              <p className="text-white/80 text-sm font-medium">{item.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-white/70 text-xs font-bold group-hover:text-white/90 group-hover:gap-2 transition-all">
                Open <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Streak + Exams row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Study Streak */}
            <TiltCard className="bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col hover:border-brand-500/20 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-text-primary flex items-center gap-2"><Flame size={18} className="text-orange-500" /> Study Streak</h3>
            <span className="text-2xl font-black text-orange-500">{studyStreak} 🔥</span>
          </div>
          <div className="flex justify-between gap-2">
            {last7.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  d.active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-surface-hover text-text-muted'
                }`}>
                  {d.active ? <Flame size={14} /> : <span className="text-xs">·</span>}
                </div>
                <span className="text-[9px] font-bold text-text-muted uppercase">{d.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-auto pt-3">Use any Synapse tool to keep your streak alive!</p>
        </TiltCard>

        {/* Upcoming Exams */}
        <TiltCard className="bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col hover:border-brand-500/20 transition-colors">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-text-primary flex items-center gap-2"><CalendarDays size={18} className="text-red-500" /> Upcoming Exams</h3>
            <button onClick={() => setShowAddExam(!showAddExam)} className="p-1.5 bg-surface-hover rounded-lg text-text-muted hover:text-brand-600 transition-colors"><Plus size={14} /></button>
          </div>
          {showAddExam && (
            <div className="flex gap-2 mb-3">
              <input value={newExamSubject} onChange={e => setNewExamSubject(e.target.value)} placeholder="Subject" className="flex-1 p-2 bg-text-primary/5 rounded-lg text-xs font-bold text-text-primary outline-none border border-border-subtle focus:border-brand-400" />
              <input type="date" value={newExamDate} onChange={e => setNewExamDate(e.target.value)} className="p-2 bg-text-primary/5 rounded-lg text-xs font-bold text-text-primary outline-none border border-border-subtle focus:border-brand-400" />
              <button onClick={addExam} className="px-3 py-1 bg-brand-600 text-white rounded-lg text-xs font-bold">Add</button>
            </div>
          )}
          {exams.length === 0 ? (
            <div className="text-center py-6 bg-text-primary/5 rounded-2xl border border-dashed border-border-subtle">
              <CalendarDays className="w-8 h-8 text-text-muted mx-auto mb-2" />
              <p className="text-sm font-bold text-text-secondary mb-1">No exams tracked yet</p>
              <p className="text-xs text-text-muted mb-4 px-4">Add your upcoming midterms and finals to get a personalized study plan.</p>
              <button onClick={() => setShowAddExam(true)} className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-3 py-1.5 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors inline-flex items-center gap-1">+ Add First Exam</button>
            </div>
          ) : (
            <div className="space-y-2 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
              {exams.map(ex => {
                const daysText = getDaysUntil(ex.date);
                const urgent = daysText === 'Today!' || daysText === 'Tomorrow';
                return (
                  <div key={ex.id} className="flex items-center justify-between p-2.5 bg-surface-hover rounded-xl group border border-transparent hover:border-border-subtle transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded ${urgent ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 'bg-text-primary/5 text-text-secondary'}`}>{daysText}</span>
                      <span className="text-sm font-bold text-text-primary">{ex.subject}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => navigate('/timetable', { state: { subject: ex.subject, date: ex.date } })}
                        className="p-1.5 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/40 rounded-lg transition-all flex items-center gap-1 group/btn"
                        title="Generate Time Table"
                      >
                        <Zap size={14} className="group-hover/btn:scale-110" />
                        <span className="text-[10px] font-black uppercase tracking-wider hidden group-hover/btn:inline-block">Plan</span>
                      </button>
                      <button onClick={() => removeExam(ex.id)} className="p-1 text-text-muted opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TiltCard>
          </div>

          {/* Study Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Quizzes Taken" value={quizzes.length} icon={<Brain size={18} />} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-900/20" loading={loading} progress={Math.min(quizzes.length * 10, 100)} fill="bg-purple-500" />
            <StatCard label="Avg Quiz Score" value={avgQuizScore !== null ? `${avgQuizScore}%` : '—'} icon={<Trophy size={18} />} color="text-yellow-600 dark:text-yellow-400" bg="bg-yellow-50 dark:bg-yellow-900/20" loading={loading} progress={avgQuizScore !== null ? avgQuizScore : 0} fill="bg-yellow-500" />
            <StatCard label="Notes Saved" value={notes.length} icon={<BookOpen size={18} />} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" loading={loading} progress={Math.min(notes.length * 5, 100)} fill="bg-blue-500" />
            <StatCard label="Transcripts" value={transcripts.length} icon={<AudioLines size={18} />} color="text-orange-600 dark:text-orange-400" bg="bg-orange-50 dark:bg-orange-900/20" loading={loading} progress={Math.min(transcripts.length * 5, 100)} fill="bg-orange-500" />
          </div>

          {/* Recent Activity */}
          <div className="bg-surface border border-border-subtle rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300">
            <h3 className="text-xl font-black text-text-primary mb-6 flex items-center gap-2">
              <Clock size={20} className="text-brand-600 dark:text-brand-400" /> Recent Activity
            </h3>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="h-14 bg-surface-hover rounded-2xl"></div>)}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-10">
                <Target size={40} className="text-text-muted mx-auto mb-3" />
                <p className="text-text-secondary font-bold">No activity yet</p>
                <p className="text-text-muted text-sm mt-1">Take a quiz, summarize notes, or analyze your scores to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map((item, i) => {
                  const Icon = iconMap[item.type];
                  return (
                    <div key={i} className="flex items-center gap-4 p-4 bg-surface-hover border border-transparent hover:border-border-subtle rounded-2xl transition-colors">
                      <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-text-primary truncate">{item.title}</p>
                        <p className="text-xs text-text-secondary">{item.detail}</p>
                      </div>
                      <span className="text-[10px] font-bold text-text-muted whitespace-nowrap">
                        {formatTimeAgo(item.date)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

            {/* Latest Performance */}
          {latestReport && (
            <TiltCard className="bg-surface border border-border-subtle rounded-3xl p-8 shadow-sm hover:shadow-xl hover:shadow-green-500/5 transition-all duration-300 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-500" /> Latest Performance
                </h3>
                <Link to="/performance" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                  View All <ChevronRight size={12} />
                </Link>
              </div>
              <div className="flex items-center gap-6 mb-6">
                <div className={`text-5xl font-black tracking-tighter ${latestReport.overallPercent >= 70 ? 'text-green-500' : latestReport.overallPercent >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {latestReport.overallPercent}%
                </div>
                <div>
                  <p className="font-bold text-lg text-text-primary">{latestReport.examName}</p>
                  <p className="text-xs text-text-muted font-bold tracking-wide uppercase mt-1">{latestReport.subjects.length} subjects • {new Date(latestReport.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">Strongest</p>
                  <p className="text-sm font-bold text-green-700 dark:text-green-300">{latestReport.strengths[0] || '—'}</p>
                </div>
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2">Focus Area</p>
                  <p className="text-sm font-bold text-red-700 dark:text-red-300">{latestReport.weaknesses[0] || '—'}</p>
                </div>
              </div>
            </TiltCard>
          )}
        </div>

        {/* Right Column (4 cols) flex space */}
        <div className="lg:col-span-4 flex flex-col gap-6">

          {/* Profile Snapshot - Rebuilt explicitly for the "fix the profile information" request */}
          <TiltCard className="bg-surface border border-border-subtle rounded-3xl p-6 text-text-primary shadow-sm hover:border-brand-500/30 transition-all duration-300">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Your Profile Snapshot</p>
            <div className="flex items-center gap-4 mb-4">
              {user?.avatar ? (
                 <img src={user.avatar} alt="Profile" className="w-14 h-14 rounded-2xl flex-shrink-0 object-cover shadow-sm bg-surface-hover border border-border-subtle" />
              ) : (
                 <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-600 flex items-center justify-center font-bold text-xl flex-shrink-0">
                    {user?.name?.charAt(0) || 'S'}
                 </div>
              )}
              <div>
                <h3 className="text-xl font-black mb-0.5 tracking-tight">{user?.name || 'Student'}</h3>
                <p className="text-text-secondary text-xs font-bold uppercase tracking-wider">
                  {user?.targetRole || 'Exploring'}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-text-secondary bg-surface-hover px-3 py-2 rounded-xl">
                <Clock size={14} className="text-brand-500" /> Class of {user?.graduationYear || '2025'}
              </div>
              <div className="flex flex-wrap gap-2">
                {(user?.skills || []).slice(0, 4).map(skill => (
                  <span key={skill} className="text-[10px] font-bold px-2.5 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg border border-brand-500/20">
                    {skill}
                  </span>
                ))}
                {(user?.skills || []).length > 4 && (
                  <span className="text-[10px] font-bold px-2 py-1 bg-surface-hover text-text-muted rounded-lg border border-border-subtle">
                    +{(user?.skills || []).length - 4} more
                  </span>
                )}
              </div>
              <div className="pt-4 mt-2 border-t border-border-subtle">
                <span className="px-3 py-1.5 bg-brand-600 text-white rounded-lg font-bold text-xs shadow-md shadow-brand-500/20 inline-block">Current Level: {user?.currentLevel}</span>
              </div>
            </div>
          </TiltCard>

          {/* AI Study Tip */}
          <TiltCard className="bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-500/20 p-6 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 flex-none">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles size={100} className="text-brand-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-brand-200 dark:bg-brand-500/20 rounded-lg text-brand-700 dark:text-brand-400 border border-brand-300 dark:border-brand-500/30">
                  <Zap size={18} />
                </div>
                <span className="text-xs font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">Daily Study Tip</span>
              </div>
              <p className="text-text-primary font-bold text-[15px] leading-relaxed">
                "{dailyTip}"
              </p>
              <div className="mt-6 pt-4 border-t border-brand-200 dark:border-brand-500/20">
                <Link to="/advisor" className="text-sm font-black text-brand-700 dark:text-brand-400 flex items-center gap-2 hover:gap-3 transition-all">
                  Ask AI Advisor <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </TiltCard>

          {/* Tools & Utilities */}
          <TiltCard className="bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex-1 flex flex-col">
            <h3 className="text-lg font-black text-text-primary mb-4">Quick Tools</h3>
            <div className="space-y-2 flex-1">
              <QuickToolLink label="Resume Builder" desc="ATS check & optimization" icon={<FileText size={16} />} path="/resume" />
              <QuickToolLink label="Skill Roadmap" desc="Personalized learning path" icon={<Target size={16} />} path="/roadmap" />
              <QuickToolLink label="AI Advisor" desc="Ask anything academic" icon={<Sparkles size={16} />} path="/advisor" />
              <QuickToolLink label="Video Transcript" desc="Transcribe YouTube via AI" icon={<Youtube size={16} />} path="/video-transcript" />
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
};

// ── Sub Components ──

const StatCard = ({ label, value, icon, color, bg, loading, progress, fill }: { label: string; value: string | number; icon: React.ReactNode; color: string; bg: string; loading: boolean, progress: number, fill: string }) => (
  <TiltCard className="bg-surface border border-border-subtle rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
    <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-2xl font-black text-text-primary">
      {loading ? <span className="inline-block w-8 h-6 bg-surface-hover rounded animate-pulse"></span> : value}
    </p>
    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-1 mb-3">{label}</p>
    {/* Micro Visualization */}
    {!loading && (
      <div className="w-full h-1 bg-surface-hover rounded-full overflow-hidden">
        <div className={`h-full ${fill} transition-all duration-1000 ease-out`} style={{ width: `${progress}%` }} />
      </div>
    )}
  </TiltCard>
);

const QuickToolLink = ({ label, desc, icon, path }: { label: string; desc: string; icon: React.ReactNode; path: string }) => (
  <Link to={path} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-hover transition-colors group">
    <div className="w-10 h-10 bg-surface border border-border-subtle rounded-xl flex items-center justify-center text-text-muted group-hover:text-brand-600 transition-colors">
      {icon}
    </div>
    <div className="flex-1">
      <p className="font-bold text-sm text-text-primary">{label}</p>
      <p className="text-[10px] text-text-secondary">{desc}</p>
    </div>
    <ChevronRight size={14} className="text-text-muted group-hover:text-brand-600 transition-colors" />
  </Link>
);

const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
};

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [style, setStyle] = useState({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'none',
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'all 0.5s ease',
    });
  };

  return (
    <div
      className={className}
      style={{ ...style, willChange: 'transform' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};

export default StudentDashboard;
