import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Brain, Loader2, Sparkles, ChevronRight, CheckCircle2, XCircle, Trophy, Clock, UploadCloud, X, File as FileIcon, RotateCcw, History, ArrowRight, Flame, Timer, AlertTriangle, ShieldCheck, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuiz } from '../src/services/geminiService';
import { saveQuizSession, getQuizHistory, updateUserQuestProgress, saveUserProfile } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { useLocation, useNavigate } from 'react-router-dom';
import { QuizQuestion, QuizSession, UserProfile } from '../types';

const QuizMaker: React.FC = () => {
  const { user } = useUser();
  const [phase, setPhase] = useState<'input' | 'loading' | 'taking' | 'results'>('input');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(10);
  const [noteText, setNoteText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [tempSelected, setTempSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  // Analytics & Gamification States
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [qStartTime, setQStartTime] = useState<number>(0);
  const [sessionTimes, setSessionTimes] = useState<number[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [xpGained, setXpGained] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [liveTime, setLiveTime] = useState(0);

  useEffect(() => {
    let interval: any;
    if (phase === 'taking' && !answered) {
      interval = setInterval(() => {
        setLiveTime(Math.round((Date.now() - qStartTime) / 1000));
      }, 1000);
    } else {
      setLiveTime(Math.round((Date.now() - qStartTime) / 1000));
    }
    return () => clearInterval(interval);
  }, [phase, qStartTime, answered]);
  // Cumulative Analytics
  const [cumulativeAccuracy, setCumulativeAccuracy] = useState(0);
  const [weakTopics, setWeakTopics] = useState<{ topic: string, count: number }[]>([]);

  const [history, setHistory] = useState<QuizSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const autoStarted = useRef(false);

  useEffect(() => {
    if (location.state?.autoStart && !autoStarted.current) {
      autoStarted.current = true;
      const stateTopic = location.state.topic || '';
      const stateDiff = location.state.difficulty || 'Mixed';
      const stateCount = location.state.count || 10;

      setTopic(stateTopic);
      setDifficulty(stateDiff);
      setCount(stateCount);

      const autoStartQuiz = async () => {
        if (!stateTopic.trim()) return;
        setPhase('loading');
        try {
          const qs = await generateQuiz(stateTopic, '', stateDiff, stateCount);
          setQuestions(qs);
          setCurrentQ(0);
          setScore(0);
          setAnswers(new Array(qs.length).fill(null));
          setSelected(null);
          setAnswered(false);
          setPhase('taking');
        } catch (err) {
          console.error(err);
          alert('Failed to generate quiz. Please try again.');
          setPhase('input');
        }
      };

      autoStartQuiz();

      // Clean up state so refresh doesn't auto-start again
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (auth.currentUser) {
      getQuizHistory(auth.currentUser.uid).then(setHistory).catch(() => { });
    }
  }, [phase, user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onloadend = () => setNoteText(reader.result as string);
      reader.readAsText(f);
    }
  };

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setPhase('loading');
    try {
      const qs = await generateQuiz(topic, noteText, difficulty, count);
      setQuestions(qs);
      setCurrentQ(0);
      setScore(0);
      setAnswers(new Array(qs.length).fill(null));
      setSelected(null);
      setTempSelected(null);
      setAnswered(false);
      setStreak(0);
      setMaxStreak(0);
      setSessionTimes([]);
      setXpGained(0);
      setEarnedBadges([]);
      setQStartTime(Date.now());
      setPhase('taking');
    } catch (err) {
      console.error(err);
      alert('Failed to generate quiz. Please try again.');
      setPhase('input');
    }
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    setTempSelected(idx);
  };

  const handleSubmit = () => {
    if (tempSelected === null || answered) return;

    const timeSpent = (Date.now() - qStartTime) / 1000;
    setSessionTimes(prev => [...prev, timeSpent]);

    const correctIdx = questions[currentQ].correct;
    const isRight = tempSelected === correctIdx;

    setSelected(tempSelected);
    setAnswered(true);
    setIsCorrect(isRight);

    const newAnswers = [...answers];
    newAnswers[currentQ] = tempSelected;
    setAnswers(newAnswers);

    if (isRight) {
      setScore(s => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
      setTempSelected(null);
      setAnswered(false);
      setIsCorrect(null);
      setQStartTime(Date.now());
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setPhase('results');

    // Calculate XP
    const diffMult = difficulty === 'Hard' ? 2 : difficulty === 'Medium' ? 1.5 : 1;
    let xp = Math.round(score * 10 * diffMult);

    // Bonuses
    const badges: string[] = [];
    if (score === questions.length && questions.length > 0) {
      xp += 100;
      badges.push('Perfect Score');
    }
    if (maxStreak >= 5) {
      xp += 50;
      badges.push('5 Streak');
    }
    const avgTime = sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length;
    if (avgTime < 10) {
      xp += 30;
      badges.push('Fast Responder');
    }

    setXpGained(xp);
    setEarnedBadges(badges);

    if (auth.currentUser) {
      const session: QuizSession = {
        id: `quiz_${Date.now()}`,
        topic,
        difficulty,
        questions,
        score,
        total: questions.length,
        createdAt: new Date().toISOString(),
        timeTaken: Math.round(sessionTimes.reduce((a, b) => a + b, 0)),
        xpGained: xp,
        accuracy: Math.round((score / questions.length) * 100),
        badges,
        userAnswers: answers
      };

      try {
        await saveQuizSession(auth.currentUser.uid, session);

        // Update user XP
        if (user?.questProgress) {
          const newProgress = { ...user.questProgress };
          newProgress.xp += xp;
          newProgress.cumulativeXp = (newProgress.cumulativeXp || 0) + xp;
          await updateUserQuestProgress(auth.currentUser.uid, newProgress);
        }
      } catch (e) { console.error(e); }
    }
  };

  // Cumulative Analytics Calculation
  useEffect(() => {
    if (history.length > 0) {
      let totalQ = 0;
      let totalCorrect = 0;
      const catStats: Record<string, { correct: number, total: number }> = {};

      history.forEach(session => {
        totalQ += session.total;
        totalCorrect += session.score;

        session.questions.forEach((q, idx) => {
          const category = q.category || 'General';
          if (!catStats[category]) catStats[category] = { correct: 0, total: 0 };
          catStats[category].total += 1;

          if (session.userAnswers && session.userAnswers[idx] === q.correct) {
            catStats[category].correct += 1;
          }
        });
      });

      setCumulativeAccuracy(Math.round((totalCorrect / totalQ) * 100) || 0);

      const weak = Object.entries(catStats)
        .map(([topic, stats]) => ({ topic, accuracy: (stats.correct / stats.total) * 100, count: stats.total }))
        .filter(t => t.accuracy < 60 && t.count >= 2)
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3)
        .map(t => ({ topic: t.topic, count: t.count }));

      setWeakTopics(weak);
    }
  }, [history]);

  const resetQuiz = () => {
    setPhase('input');
    setQuestions([]);
    setCurrentQ(0);
    setScore(0);
    setAnswers([]);
    setSelected(null);
    setAnswered(false);
  };

  const q = questions[currentQ];
  const progress = questions.length > 0 ? ((currentQ + (answered ? 1 : 0)) / questions.length) * 100 : 0;
  const scorePercent = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Quiz Maker <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Generate quizzes on any topic with AI-powered questions.</p>
        </div>
        <div className="flex items-center gap-3 md:pr-24">
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <History size={16} /> History
          </button>
        </div>
      </header>

      {showHistory && (
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Past Quizzes</h3>
          {history.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {history.map(h => (
                <div key={h.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                  <div>
                    <p className="font-bold dark:text-white">{h.topic}</p>
                    <p className="text-xs text-gray-400">{h.difficulty} • {new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-lg font-black ${h.score / h.total >= 0.7 ? 'text-green-500' : h.score / h.total >= 0.4 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {h.score}/{h.total}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 dark:text-gray-400 font-medium tracking-tight">No past quizzes found.</p>
              <p className="text-xs text-slate-400 mt-1">Take your first quiz to see it here!</p>
            </div>
          )}
        </div>
      )}

      {/* INPUT PHASE */}
      {phase === 'input' && (
        <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 sm:p-10 space-y-8 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Topic *</label>
              <input
                autoFocus
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Transformers in NLP, React Hooks, Data Structures..."
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-brand-600 outline-none text-lg font-bold dark:text-white transition-all"
                onKeyDown={e => e.key === 'Enter' && startQuiz()}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Mixed', 'Easy', 'Medium', 'Hard'].map(d => (
                    <button key={d} onClick={() => setDifficulty(d)}
                      className={`w-full py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all border-2 ${difficulty === d
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'border-transparent bg-gray-50 dark:bg-slate-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                        }`}
                    >{d}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Questions: {count}</label>
                <input type="range" min={5} max={15} value={count} onChange={e => setCount(+e.target.value)}
                  className="w-full accent-brand-600" />
              </div>
            </div>

            <button onClick={startQuiz} disabled={!topic.trim()}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]">
              <Sparkles size={22} /> Challenge Me
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 sm:p-10 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Optional: Paste Notes or Upload File</label>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Paste your study notes here so the AI bases questions on YOUR material..."
                className="w-full h-48 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none outline-none text-sm dark:text-white resize-none"
              />
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                <UploadCloud size={16} /> Upload Notes
              </button>
              <input ref={fileInputRef} type="file" className="hidden" accept=".txt,.pdf,.md" onChange={handleFileUpload} />
              {file && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-700 dark:text-brand-300 text-xs font-bold">
                  <FileIcon size={12} /> {file.name}
                  <button onClick={() => { setFile(null); setNoteText(''); }} className="ml-1 hover:text-red-500"><X size={12} /></button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LOADING PHASE */}
      {phase === 'loading' && (
        <div className="h-[500px] bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center border dark:border-slate-800 animate-in fade-in duration-500">
          <div className="w-24 h-24 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-black dark:text-white animate-pulse">Generating Quiz...</p>
          <p className="text-gray-400 mt-2 text-sm">Creating {count} {difficulty} questions about {topic}</p>
        </div>
      )}

      {/* TAKING PHASE */}
      {phase === 'taking' && q && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-brand-500" />
                <span className="text-sm font-black dark:text-white">
                  {liveTime}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-orange-500" />
                <span className="text-sm font-black dark:text-white">{streak} Streak</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="text-xs font-black text-gray-400">{currentQ + 1}/{questions.length}</span>
            </div>
          </div>

          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 sm:p-10 shadow-sm transition-all duration-500 ${isCorrect === true ? 'ring-4 ring-green-500/20' : isCorrect === false ? 'ring-4 ring-red-500/20' : ''
              }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-lg">{difficulty}</span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{q.category}</span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold dark:text-white mb-8 leading-relaxed">{q.question}</h2>

            <div className="grid gap-4">
              {q.options.map((opt, idx) => {
                const isSelected = tempSelected === idx;
                let style = 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-600 text-gray-700 dark:text-gray-200';

                if (answered) {
                  if (idx === q.correct) style = 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.2)]';
                  else if (idx === selected) style = 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300';
                  else style = 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-800 text-gray-400 opacity-50';
                } else if (isSelected) {
                  style = 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300';
                }

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={answered}
                    whileHover={!answered ? { scale: 1.01 } : {}}
                    whileTap={!answered ? { scale: 0.99 } : {}}
                    animate={answered && idx === selected && idx !== q.correct ? { x: [-2, 2, -2, 2, 0] } : {}}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left font-bold transition-all ${style}`}
                  >
                    <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-black flex-shrink-0 ${isSelected || (answered && idx === q.correct) ? 'bg-current text-white border-transparent' : 'bg-white dark:bg-slate-900 border-current'
                      }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {answered && idx === q.correct && <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />}
                    {answered && idx === selected && idx !== q.correct && <XCircle size={20} className="text-red-500 flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {!answered ? (
                <button
                  onClick={handleSubmit}
                  disabled={tempSelected === null}
                  className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-700 disabled:opacity-50 transition-all shadow-lg shadow-brand-500/20"
                >
                  Confirm Answer
                </button>
              ) : (
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-brand-50 dark:bg-brand-900/10 rounded-2xl border border-brand-100 dark:border-brand-900/30"
                  >
                    <p className="text-xs font-black text-brand-600 uppercase tracking-widest mb-2">Explanation</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{q.explanation}</p>
                  </motion.div>

                  <button onClick={nextQuestion}
                    className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
                    {currentQ < questions.length - 1 ? <>Next Question <ChevronRight size={18} /></> : <>See Results <Trophy size={18} /></>}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* RESULTS PHASE */}
      {phase === 'results' && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-10 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 dark:bg-brand-900/20 px-3 py-1 rounded-lg mb-1">XP Earned</span>
                <span className="text-2xl font-black text-brand-600">+{xpGained}</span>
              </div>
            </div>

            <div className="relative inline-block mb-6">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-4xl font-black border-8 ${scorePercent >= 70 ? 'border-green-500 text-green-600' : scorePercent >= 40 ? 'border-yellow-500 text-yellow-600' : 'border-red-500 text-red-600'}`}>
                <span>{scorePercent}%</span>
              </motion.div>
            </div>

            <h2 className="text-3xl font-black dark:text-white mb-2">
              {scorePercent >= 80 ? 'Excellent Mastery!' : scorePercent >= 60 ? 'Sharp Progress!' : scorePercent >= 40 ? 'Steady Gains' : 'Need More Reps'}
            </h2>
            <p className="text-gray-500 font-medium">You nailed <span className="font-black text-gray-900 dark:text-white">{score}/{questions.length}</span> questions on {topic}</p>

            {earnedBadges.length > 0 && (
              <div className="mt-8 pt-8 border-t dark:border-slate-800">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Badges Earned</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {earnedBadges.map(b => (
                    <motion.div
                      key={b}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-black shadow-lg shadow-brand-500/20"
                    >
                      {b === 'Perfect Score' && <ShieldCheck size={14} />}
                      {b === '5 Streak' && <Flame size={14} />}
                      {b === 'Fast Responder' && <Zap size={14} />}
                      {b}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Performance Radar (Cumulative) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target size={16} className="text-brand-600" /> Career Stats
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold dark:text-white">Cumulative Accuracy</span>
                    <span className="text-sm font-black text-brand-600">{cumulativeAccuracy}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${cumulativeAccuracy}%` }} className="h-full bg-brand-600 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-bold dark:text-white">Avg. Response Time</span>
                    <span className="text-sm font-black text-brand-600">
                      {sessionTimes.length > 0 ? (sessionTimes.reduce((a, b) => a + b, 0) / sessionTimes.length).toFixed(1) : 0}s
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Optimal: &lt; 15s</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-500" /> Focus Areas
              </h3>
              {weakTopics.length > 0 ? (
                <div className="space-y-3">
                  {weakTopics.map(wt => (
                    <div key={wt.topic} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                      <span className="text-xs font-bold text-red-700 dark:text-red-400">{wt.topic}</span>
                      <span className="text-[10px] font-black text-red-500 uppercase">Improve Accuracy</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-gray-400 mt-2 italic">Based on your shared history of failed attempts.</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-4">
                  <CheckCircle2 size={32} className="text-green-500 mb-2" />
                  <p className="text-xs font-bold dark:text-white">No major weak topics yet!</p>
                </div>
              )}
            </div>
          </div>

          {/* Question Review */}
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-black dark:text-white mb-4">Diagnostic Review</h3>
            {questions.map((q, i) => (
              <div key={q.id} className={`p-4 rounded-2xl border transition-all ${answers[i] === q.correct ? 'bg-green-50/50 dark:bg-green-900/5 border-green-100 dark:border-green-900/20' : 'bg-red-50/50 dark:bg-red-900/5 border-red-100 dark:border-red-900/20'}`}>
                <div className="flex items-start gap-3">
                  {answers[i] === q.correct ? <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" /> : <XCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />}
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="font-bold text-sm dark:text-white leading-tight">{q.question}</p>
                      <span className="text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-500 rounded">{q.category}</span>
                    </div>
                    <p className="text-xs text-gray-500">Your answer: <span className={answers[i] === q.correct ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{answers[i] !== null ? q.options[answers[i]!] : 'Skipped'}</span> | Correct: <span className="text-green-600 font-bold">{q.options[q.correct]}</span></p>
                    <p className="text-[10px] text-gray-400 mt-2 bg-white dark:bg-slate-900/50 p-2 rounded-lg italic">"{q.explanation}"</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={resetQuiz} className="px-8 py-4 bg-brand-600 text-white rounded-2xl font-black hover:bg-brand-700 transition-all flex items-center gap-2 shadow-xl shadow-brand-500/20">
              <RotateCcw size={18} /> Challenge Me Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMaker;
