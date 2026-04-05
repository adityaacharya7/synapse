import React, { useState, useEffect } from 'react';
import { Target, Loader2, Shield, Lock, CheckCircle2, BookOpen, Skull, Flame, AlertTriangle, ArrowRight, Save } from 'lucide-react';
import { generatePrepPlan, generateDailyQuests } from '../src/services/geminiService';
import { getUserProfile, updateUserQuestProgress, auth } from '../src/services/firebase';
import { useUser } from '../App';
import { QuestProgress } from '../types';

const PrepPlanner: React.FC = () => {
  const { user } = useUser();
  // State
  const [setupMode, setSetupMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Inputs
  const [days, setDays] = useState(30);
  const [level, setLevel] = useState('Intermediate');
  const [examSubject, setExamSubject] = useState(user?.targetRole || '');

  // Gamification State
  const [xp, setXp] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [completedDailies, setCompletedDailies] = useState<string[]>([]);

  // Meta State (for persistence)
  const [questMeta, setQuestMeta] = useState<{
    startDate: string;
    lastDailyRefresh?: string;
  }>({ startDate: new Date().toISOString() });

  // Dynamic Data
  const [questData, setQuestData] = useState<any>(null);

  // Load Progress on Mount
  useEffect(() => {
    const loadProgress = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setInitializing(false);
        return;
      }

      try {
        const profile = await getUserProfile(userId);
        if (profile?.questProgress && profile.questProgress.active) {
          let qp = profile.questProgress;

          // Check if we need to refresh daily quests
          const today = new Date().toDateString();
          const lastRefresh = qp.lastDailyRefresh ? new Date(qp.lastDailyRefresh).toDateString() : new Date(qp.startDate).toDateString();
          const isNewDay = today !== lastRefresh;

          let currentQuestData = qp.questData;
          let currentCompleted = qp.completedDailies;

          if (isNewDay) {
            // Calculate Day Number
            const start = new Date(qp.startDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - start.getTime());
            const dayNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Day 1, Day 2...

            try {
              console.log(`New day detected (Day ${dayNumber})! Refreshing quests...`);
              const newDailies = await generateDailyQuests(qp.role, dayNumber, qp.level);
              if (newDailies && newDailies.length > 0) {
                currentQuestData = {
                  ...currentQuestData,
                  dailyQuests: newDailies
                };
                currentCompleted = []; // Reset for new day

                qp = {
                  ...qp,
                  questData: currentQuestData,
                  completedDailies: currentCompleted,
                  lastDailyRefresh: new Date().toISOString()
                };

                await updateUserQuestProgress(userId, qp);
              }
            } catch (e) {
              console.error("Failed to refresh daily quests", e);
            }
          }

          setQuestData(currentQuestData);
          setXp(qp.xp);
          setUserLevel(qp.userLevel);
          setCompletedDailies(currentCompleted);
          setDays(qp.days);
          setLevel(qp.level);
          setExamSubject(qp.role || '');
          setQuestMeta({
            startDate: qp.startDate,
            lastDailyRefresh: qp.lastDailyRefresh
          });
          setSetupMode(false);
        }
      } catch (err) {
        console.error("Failed to load quest progress", err);
      } finally {
        setInitializing(false);
      }
    };
    loadProgress();
  }, [user]);

  const saveProgress = async (newData: Partial<QuestProgress>) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const currentProgress: QuestProgress = {
      active: true,
      role: examSubject || user?.targetRole || 'General',
      days,
      startDate: questMeta.startDate,
      lastDailyRefresh: questMeta.lastDailyRefresh,
      level,
      xp: newData.xp ?? xp,
      userLevel: newData.userLevel ?? userLevel,
      completedDailies: newData.completedDailies ?? completedDailies,
      questData: newData.questData ?? questData
    };

    try {
      await updateUserQuestProgress(userId, currentProgress);
      // Update local meta if relevant (e.g. if we just refreshed, though this function is usually for XP)
      if (newData.lastDailyRefresh) {
        setQuestMeta(prev => ({ ...prev, lastDailyRefresh: newData.lastDailyRefresh }));
      }
    } catch (err) {
      console.error("Failed to save progress", err);
    }
  };

  const mainQuestStages = [
    { id: 1, name: 'Concept Foundations', status: 'active' },
    { id: 2, name: 'Deep Revision', status: 'locked' },
    { id: 3, name: 'Practice & Past Papers', status: 'locked' },
    { id: 4, name: 'Mock Exams', status: 'locked' },
  ];

  const handleGenerateQuest = async () => {
    if (!examSubject.trim()) return;
    setLoading(true);
    try {
      const data = await generatePrepPlan(examSubject, days, level);
      setQuestData(data);
      setSetupMode(false);

      const newXp = 120;
      const newLevel = level === 'Beginner' ? 1 : level === 'Intermediate' ? 5 : 10;
      const startDate = new Date().toISOString();

      setXp(newXp);
      setUserLevel(newLevel);
      setQuestMeta({ startDate });

      const userId = auth.currentUser?.uid;
      if (userId) {
        const initialProgress: QuestProgress = {
          active: true,
          role: examSubject,
          days,
          startDate,
          lastDailyRefresh: startDate, // Set initial refresh to now
          level,
          xp: newXp,
          userLevel: newLevel,
          completedDailies: [],
          questData: data
        };
        await updateUserQuestProgress(userId, initialProgress);
        setQuestMeta({ startDate, lastDailyRefresh: startDate });
      }

    } catch (error) {
      console.error("Failed to generate quest", error);
      // Fallback logic kept simple for brevity, same as before
      const fallbackData = {
        questName: `The ${examSubject} Conquest`,
        mainObjective: "Master the Exam",
        dailyQuests: [{ id: 'd1', title: 'Emergency Fallback Study Task', xp: 10, bonus: null }],
        bossBattle: { name: "System Offline Challenge", requirements: [], rewards: [] },
        debuffs: []
      };
      setQuestData(fallbackData);
      setSetupMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDaily = (id: string, rewardResult: number) => {
    if (completedDailies.includes(id)) return;

    const newCompleted = [...completedDailies, id];
    setCompletedDailies(newCompleted);

    let newXp = xp + rewardResult;
    let newUserLevel = userLevel;

    if (newXp >= 1000) {
      newXp = 0;
      newUserLevel += 1;
    }

    setXp(newXp);
    setUserLevel(newUserLevel);

    saveProgress({
      xp: newXp,
      userLevel: newUserLevel,
      completedDailies: newCompleted
    });
  };

  if (initializing) {
    return (
      <div className="h-[50vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={40} />
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-950 rounded-[2.5rem] p-10 shadow-2xl border dark:border-slate-800 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-brand-600 rounded-2xl mx-auto flex items-center justify-center text-white mb-6 shadow-lg shadow-brand-500/30">
              <BookOpen size={32} />
            </div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-3">Exam Prep Quest</h1>
            <p className="text-gray-500 text-lg">Define your subject & timeline to generate a personalized study campaign.</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 ml-1">Exam Subject / Field</label>
              <input
                type="text"
                value={examSubject}
                onChange={(e) => setExamSubject(e.target.value)}
                placeholder="e.g. Data Structures, Organic Chemistry, Calculus..."
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-normal"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 ml-1">Timeline</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none font-bold text-gray-900 dark:text-white"
                >
                  <option value={15}>15 Days (Speedrun)</option>
                  <option value={30}>30 Days (Intensive)</option>
                  <option value={60}>60 Days (Balanced)</option>
                  <option value={90}>90 Days (Campaign)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2 ml-1">Starting Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border-2 border-transparent focus:border-brand-500 outline-none font-bold text-gray-900 dark:text-white"
                >
                  <option value="Beginner">Level 1 (Beginner)</option>
                  <option value="Intermediate">Level 5 (Intermediate)</option>
                  <option value="Advanced">Level 10 (Expert)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateQuest}
              disabled={loading || !examSubject.trim()}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-bold text-xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Generating Study Plan...
                </>
              ) : (
                <>
                  Begin Study Quest <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quest UI (Rendered after Setup)
  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-500 text-gray-900 dark:text-white">

      {/* 1. Quest Header */}
      <header className="bg-white dark:bg-slate-950 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 to-indigo-500"></div>
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full text-xs font-black uppercase tracking-widest">
              <Target size={14} /> Current Quest
            </div>
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-2">{questData?.questName || 'Exam Quest'}</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">{days}-Day Campaign • {level} Mode</p>
              </div>
            </div>
          </div>

          {/* Stats Block */}
          <div className="w-full md:w-80 bg-gray-50 dark:bg-slate-900 rounded-2xl p-4 border dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-black text-gray-500 uppercase tracking-wider">Level {userLevel}</span>
              <span className="text-sm font-bold text-brand-600">{xp} / 1000 XP</span>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full transition-all duration-500" style={{ width: `${(xp / 1000) * 100}%` }}></div>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs text-brand-500 font-bold flex items-center gap-1"><Save size={12} /> Auto-Saved</span>
              <span className="text-xs font-bold text-gray-400">⏳ {days} Days Remaining</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Quest Card */}
      <section className="bg-slate-900 text-white rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Target size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <Shield className="text-brand-400" /> Main Objective: {questData?.mainObjective || 'Exam Mastery'}
          </h2>

          {/* Stages Stepper */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {mainQuestStages.map((stage, i) => (
              <div key={stage.id} className={`p-4 rounded-xl border-2 transition-all ${stage.status === 'completed' ? 'border-green-500 bg-green-500/10' :
                  stage.status === 'active' ? 'border-brand-500 bg-brand-500/10 scale-105 shadow-lg shadow-brand-500/20' :
                    'border-slate-700 bg-slate-800 opacity-60'
                }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-black uppercase tracking-wider opacity-70">Stage 0{i + 1}</span>
                  {stage.status === 'completed' && <CheckCircle2 size={16} className="text-green-500" />}
                  {stage.status === 'active' && <Loader2 size={16} className="text-brand-400 animate-spin" />}
                  {stage.status === 'locked' && <Lock size={16} />}
                </div>
                <div className="font-bold text-lg leading-tight">{stage.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Daily Quests & Boss */}
        <div className="lg:col-span-2 space-y-8">

          {/* Daily Quests */}
          <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 dark:text-white">
              <Flame className="text-orange-500" /> Daily Quests
            </h3>
            <div className="space-y-4">
              {questData?.dailyQuests?.map((quest: any) => {
                const isDone = completedDailies.includes(quest.id);
                return (
                  <div key={quest.id}
                    onClick={() => handleCompleteDaily(quest.id, quest.xp)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group flex items-center justify-between ${isDone ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-600'
                      }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isDone ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 group-hover:bg-brand-100 dark:group-hover:bg-gray-700'
                        }`}>
                        {isDone ? <CheckCircle2 size={18} /> : <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-600" />}
                      </div>
                      <div>
                        <h4 className={`font-bold ${isDone ? 'text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>{quest.title}</h4>
                        {quest.bonus && !isDone && <p className="text-xs text-brand-600 dark:text-brand-400 font-bold mt-1">Bonus: {quest.bonus}</p>}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${isDone ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      +{quest.xp} XP
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boss Battle */}
          {questData?.bossBattle && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-10 text-red-600">
                <Skull size={100} />
              </div>
              <h3 className="text-xl font-black text-red-700 dark:text-red-400 mb-6 flex items-center gap-2">
                <BookOpen className="text-red-600" /> {questData.bossBattle.name}
              </h3>
              <div className="bg-white dark:bg-slate-950/50 rounded-2xl p-6 border border-red-100 dark:border-red-900/30 backdrop-blur-sm">
                <div className="space-y-3">
                  {questData.bossBattle.requirements?.map((req: any, i: number) => (
                    <BossRequirement key={i} label={req.label} progress={req.progress} />
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-red-100 dark:border-red-900/30 flex justify-between items-center text-red-600 dark:text-red-400">
                  <span className="text-xs font-black uppercase tracking-widest">Rewards</span>
                  <div className="flex gap-2">
                    {questData.bossBattle.rewards?.map((reward: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-xs font-bold">{reward}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Col: Debuffs */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-black dark:text-white mb-6 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" /> Active Debuffs
            </h3>
            <div className="space-y-4">
              {questData?.debuffs?.map((debuff: any, i: number) => (
                <DebuffItem
                  key={i}
                  title={debuff.title}
                  desc={debuff.desc}
                  fix={debuff.fix}
                />
              ))}
              {(!questData?.debuffs || questData.debuffs.length === 0) && (
                <p className="text-gray-500 text-sm">No active debuffs. You are in peak condition!</p>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

const BossRequirement = ({ label, progress }: { label: string, progress: string }) => (
  <div className="flex justify-between items-center text-sm font-bold text-gray-700 dark:text-gray-300">
    <span>{label}</span>
    <span className="font-mono bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-red-700 dark:text-red-400">{progress}</span>
  </div>
);

const DebuffItem = ({ title, desc, fix }: { title: string, desc: string, fix: string }) => (
  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
    <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">{title}</h4>
    <p className="text-xs font-black uppercase tracking-wider text-red-500 mb-3">{desc}</p>
    <p className="text-xs text-amber-600 dark:text-amber-500/80 italic">{fix}</p>
  </div>
);

export default PrepPlanner;