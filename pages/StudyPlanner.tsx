import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  Sparkles, 
  Loader2, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Flame,
  ShieldCheck,
  Save
} from 'lucide-react';
import { generateStudySchedule } from '../src/services/geminiService';

interface Topic {
  title: string;
  duration: string;
  priority: 'High' | 'Medium' | 'Low';
}

interface DayPlan {
  dayNumber: number;
  date: string;
  topics: Topic[];
  isRestDay: boolean;
  note?: string;
}

interface StudyScheduleResult {
  days: DayPlan[];
  burnoutRisk: 'Low' | 'Medium' | 'High';
  advice: string;
}

const StudyPlanner: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { subject?: string; date?: string } || {};

  // Setup State
  const [subject, setSubject] = useState(state.subject || '');
  const [deadline, setDeadline] = useState(state.date || '');
  const [syllabus, setSyllabus] = useState('');
  const [dailyHours, setDailyHours] = useState(3);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(true);
  const [result, setResult] = useState<StudyScheduleResult | null>(null);
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>([]);

  // Load from LocalStorage if exists
  useEffect(() => {
    const saved = localStorage.getItem(`study_plan_${subject || 'current'}`);
    if (saved) {
      const data = JSON.parse(saved);
      setResult(data);
      setSetupMode(false);
      
      const savedProgress = localStorage.getItem(`study_progress_${subject || 'current'}`);
      if (savedProgress) setCompletedTopicIds(JSON.parse(savedProgress));
    }
  }, [subject]);

  const handleGenerate = async () => {
    if (!subject || !deadline || !syllabus) return;
    setLoading(true);
    try {
      const schedule = await generateStudySchedule(subject, deadline, syllabus, dailyHours);
      setResult(schedule);
      setSetupMode(false);
      setCompletedTopicIds([]); // Reset for new plan
      localStorage.setItem(`study_plan_${subject}`, JSON.stringify(schedule));
      localStorage.setItem(`study_progress_${subject}`, JSON.stringify([]));
    } catch (error) {
      console.error("Failed to generate study schedule", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopicCompletion = (dayNumber: number, topicIdx: number) => {
    const id = `d${dayNumber}_t${topicIdx}`;
    const next = completedTopicIds.includes(id) 
      ? completedTopicIds.filter(i => i !== id) 
      : [...completedTopicIds, id];
    
    setCompletedTopicIds(next);
    localStorage.setItem(`study_progress_${subject}`, JSON.stringify(next));
  };

  const resetPlanner = () => {
    setSetupMode(true);
    setResult(null);
  };

  // Progress Calculation
  const totalTopics = result?.days.reduce((acc, day) => acc + day.topics.length, 0) || 0;
  const completedTotal = completedTopicIds.length;
  const totalPercent = totalTopics > 0 ? Math.round((completedTotal / totalTopics) * 100) : 0;

  if (setupMode) {
    return (
      <div className="p-6 md:p-10 max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-500">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-brand-600 font-bold transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <header className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            Study <span className="text-brand-600 dark:text-brand-400">Architect</span> <Sparkles className="text-brand-500" />
          </h1>
        </header>

        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-brand-500/5 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-black uppercase tracking-widest text-gray-400 ml-1">Subject</label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. NLP"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-black uppercase tracking-widest text-gray-400 ml-1">Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="date"
                  value={deadline} 
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border-2 border-transparent focus:border-brand-500 outline-none font-bold text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-black uppercase tracking-widest text-gray-400 ml-1">Daily Study Capacity</label>
            <div className="flex items-center gap-6">
              <input 
                type="range" min="1" max="12" step="0.5"
                value={dailyHours}
                onChange={e => setDailyHours(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl border border-brand-200 dark:border-brand-800 font-black text-brand-600 dark:text-brand-400 min-w-[100px] text-center">
                {dailyHours} Hours
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-black uppercase tracking-widest text-gray-400 ml-1">Syllabus / Topics</label>
            <textarea 
              value={syllabus}
              onChange={e => setSyllabus(e.target.value)}
              placeholder="Paste your topics or syllabus here... (e.g. Chapter 1: Introduction, Chapter 2: Integration by Parts...)"
              className="w-full h-48 p-6 bg-gray-50 dark:bg-slate-950 rounded-[2rem] border-2 border-transparent focus:border-brand-500 outline-none font-medium text-gray-900 dark:text-white resize-none"
            />
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !subject || !deadline || !syllabus}
            className="w-full py-5 bg-brand-600 hover:bg-brand-700 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? <><Loader2 className="animate-spin" /> Architecting Plan...</> : <><ShieldCheck /> Build My Burnout-Proof Plan</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-[1200px] mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <button onClick={resetPlanner} className="flex items-center gap-2 text-gray-500 hover:text-brand-600 font-bold transition-colors">
          <ChevronLeft size={20} /> Edit Constraints
        </button>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
            result?.burnoutRisk === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            result?.burnoutRisk === 'Medium' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            Risk: {result?.burnoutRisk}
          </span>
          <button className="p-2 bg-surface border rounded-xl text-gray-400 hover:text-brand-600 transition-colors"><Save size={20} /></button>
        </div>
      </div>

      <header className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{subject} Masterplan</h1>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl text-sm font-bold text-gray-500">
                <Calendar size={16} className="text-brand-500" /> Exam Date: {new Date(deadline).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl text-sm font-bold text-gray-500">
                <Clock size={16} className="text-brand-500" /> {dailyHours}h / Day
              </div>
            </div>
          </div>

          {/* Global Progress Bar */}
          <div className="w-full md:w-80 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Progress</span>
              <span className="text-sm font-black text-brand-600">{totalPercent}%</span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(139,92,246,0.3)]" 
                style={{ width: `${totalPercent}%` }} 
              />
            </div>
            <p className="text-[10px] font-bold text-gray-400 mt-2 text-center uppercase tracking-tighter">{completedTotal} of {totalTopics} topics completed</p>
          </div>
        </div>
      </header>

      {result?.advice && (
        <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800/50 p-6 rounded-[2rem] flex gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm border border-brand-100 dark:border-brand-900 flex-shrink-0">
            <Sparkles size={24} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-brand-700 dark:text-brand-400 uppercase tracking-widest">AI Strategy Advice</p>
            <p className="text-sm font-bold leading-relaxed text-gray-800 dark:text-gray-200">{result.advice}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {result?.days.map((day) => {
          const dayCompletedCount = day.topics.filter((_, idx) => completedTopicIds.includes(`d${day.dayNumber}_t${idx}`)).length;
          const dayTotalCount = day.topics.length;
          const dayPercent = dayTotalCount > 0 ? Math.round((dayCompletedCount / dayTotalCount) * 100) : 0;
          
          return (
            <div key={day.dayNumber} className={`rounded-[2.5rem] border-2 p-8 space-y-6 transition-all relative overflow-hidden ${
              day.isRestDay ? 'bg-gray-50 dark:bg-slate-950 border-gray-200 dark:border-slate-800 opacity-80' : 
              'bg-white dark:bg-slate-900 border-transparent shadow-xl shadow-brand-500/5 hover:border-brand-500/20'
            }`}>
              {/* Daily Progress indicator */}
              {!day.isRestDay && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-brand-500/30 transition-all duration-700" 
                  style={{ width: `${dayPercent}%` }} 
                />
              )}

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{day.date}</p>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">
                    {day.isRestDay ? 'Rest & Recharge' : `Day ${day.dayNumber}`}
                  </h3>
                </div>
                {day.isRestDay ? (
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-xl flex items-center justify-center"><Flame size={20} /></div>
                ) : (
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                    dayPercent === 100 ? 'bg-green-500 text-white' : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                  }`}>
                    {dayPercent === 100 ? <CheckCircle2 size={16} /> : `${dayCompletedCount}/${dayTotalCount}`}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {day.topics.map((topic, i) => {
                  const isDone = completedTopicIds.includes(`d${day.dayNumber}_t${i}`);
                  return (
                    <div 
                      key={i} 
                      onClick={() => !day.isRestDay && toggleTopicCompletion(day.dayNumber, i)}
                      className={`flex items-center gap-3 group cursor-pointer p-2 -m-2 rounded-xl transition-all ${isDone ? 'opacity-50' : 'hover:bg-brand-50 dark:hover:bg-brand-950/30'}`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        isDone ? 'bg-brand-600 border-brand-600 text-white' : 'border-gray-200 dark:border-slate-700 group-hover:border-brand-400'
                      }`}>
                        {isDone && <CheckCircle2 size={12} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isDone ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>{topic.title}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase">{topic.duration} effort</p>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        topic.priority === 'High' ? 'bg-red-500' : topic.priority === 'Medium' ? 'bg-orange-500' : 'bg-gray-400'
                      }`} />
                    </div>
                  );
                })}
              </div>

              {day.note && (
                <p className="text-xs font-medium text-gray-500 italic mt-4 border-t dark:border-slate-800 pt-4 flex gap-2">
                  <ArrowRight size={14} className="text-brand-500" /> {day.note}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {result?.burnoutRisk === 'High' && (
        <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-[2.5rem] flex items-center gap-6">
          <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0 animate-pulse">
            <AlertCircle size={32} />
          </div>
          <div>
            <h4 className="text-lg font-black text-red-700 dark:text-red-400 mb-1">Burnout Warning Detected</h4>
            <p className="text-sm font-medium text-red-600 dark:text-red-500/80">Your syllabus is too large for the available hours. The AI has prioritized high-impact topics, but please consider reducing your daily workload or extending your deadline if possible.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanner;
