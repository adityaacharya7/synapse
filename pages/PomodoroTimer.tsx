import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Flame, Settings, ChevronDown } from 'lucide-react';

type TimerMode = 'focus' | 'short' | 'long';

const DEFAULT_TIMES: Record<TimerMode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60
};

const PomodoroTimer: React.FC = () => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_TIMES.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusMins, setTotalFocusMins] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [customTimes, setCustomTimes] = useState({ ...DEFAULT_TIMES });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load stats from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro_stats');
    if (saved) {
      const { sessions: s, totalMins } = JSON.parse(saved);
      setSessions(s);
      setTotalFocusMins(totalMins);
    }
  }, []);

  const saveStats = useCallback((s: number, m: number) => {
    localStorage.setItem('pomodoro_stats', JSON.stringify({ sessions: s, totalMins: m }));
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Timer complete
      if (mode === 'focus') {
        const newSessions = sessions + 1;
        const newMins = totalFocusMins + Math.round(customTimes.focus / 60);
        setSessions(newSessions);
        setTotalFocusMins(newMins);
        saveStats(newSessions, newMins);
      }
      // Play sound
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        setTimeout(() => { osc.stop(); ctx.close(); }, 500);
      } catch (e) {}

      // Auto switch
      if (mode === 'focus') {
        const nextMode = (sessions + 1) % 4 === 0 ? 'long' : 'short';
        switchMode(nextMode);
      } else {
        switchMode('focus');
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(customTimes[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customTimes[mode]);
  };

  const resetStats = () => {
    if (confirm('Reset all session stats?')) {
      setSessions(0);
      setTotalFocusMins(0);
      saveStats(0, 0);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = 1 - timeLeft / customTimes[mode];
  const circumference = 2 * Math.PI * 140;

  const modeConfig: Record<TimerMode, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
    focus: { label: 'Focus', color: 'text-brand-600', icon: <Brain size={20} />, bg: 'from-brand-600 to-purple-600' },
    short: { label: 'Short Break', color: 'text-green-500', icon: <Coffee size={20} />, bg: 'from-green-500 to-emerald-600' },
    long: { label: 'Long Break', color: 'text-blue-500', icon: <Coffee size={20} />, bg: 'from-blue-500 to-indigo-600' },
  };

  const currentConfig = modeConfig[mode];

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Focus Timer <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">Pomodoro</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Stay focused, take breaks, build momentum.</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-brand-600 transition-colors">
          <Settings size={20} />
        </button>
      </header>

      {showSettings && (
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Timer Settings (minutes)</h3>
          <div className="grid grid-cols-3 gap-4">
            {(['focus', 'short', 'long'] as TimerMode[]).map(m => (
              <div key={m} className="space-y-1">
                <label className="text-xs font-bold text-gray-500 capitalize">{m === 'short' ? 'Short Break' : m === 'long' ? 'Long Break' : 'Focus'}</label>
                <input type="number" min={1} max={120}
                  value={Math.round(customTimes[m] / 60)}
                  onChange={e => {
                    const newTimes = { ...customTimes, [m]: +e.target.value * 60 };
                    setCustomTimes(newTimes);
                    if (mode === m && !isRunning) setTimeLeft(newTimes[m]);
                  }}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 font-bold text-center dark:text-white" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Tabs */}
      <div className="flex justify-center gap-3">
        {(['focus', 'short', 'long'] as TimerMode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${mode === m
              ? `bg-gradient-to-r ${modeConfig[m].bg} text-white shadow-lg`
              : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}>
            {modeConfig[m].icon} {modeConfig[m].label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center">
        <div className="relative w-80 h-80">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="140" fill="none" strokeWidth="8" className="stroke-gray-100 dark:stroke-slate-800" />
            <circle cx="150" cy="150" r="140" fill="none" strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${mode === 'focus' ? 'stroke-brand-600' : mode === 'short' ? 'stroke-green-500' : 'stroke-blue-500'}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-sm font-bold uppercase tracking-widest mt-2 ${currentConfig.color}`}>{currentConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button onClick={resetTimer}
          className="p-4 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-500 hover:text-brand-600 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
          <RotateCcw size={24} />
        </button>
        <button onClick={toggleTimer}
          className={`px-12 py-4 rounded-2xl font-black text-xl text-white flex items-center gap-3 transition-all shadow-xl active:scale-95 bg-gradient-to-r ${currentConfig.bg} ${isRunning ? 'shadow-brand-500/20' : 'shadow-brand-500/30'}`}>
          {isRunning ? <><Pause size={24} /> Pause</> : <><Play size={24} /> {timeLeft === customTimes[mode] ? 'Start' : 'Resume'}</>}
        </button>
        <button onClick={resetStats}
          className="p-4 bg-gray-100 dark:bg-slate-800 rounded-2xl text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all" title="Reset stats">
          <Flame size={24} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sessions Completed</p>
          <p className="text-4xl font-black text-brand-600">{sessions}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Focus Time</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">{totalFocusMins}m</p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
