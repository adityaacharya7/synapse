import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Plus, Trash2, CheckCircle2, AlertCircle, Target, History, ChevronDown, ChevronUp, BellRing, CalendarDays, LineChart as LineChartIcon, Flame } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { analyzeStudentPerformance } from '../src/services/geminiService';
import { savePerformanceReport, getPerformanceHistory } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { SubjectScore, PerformanceReport } from '../types';

const PerformanceAnalyzer: React.FC = () => {
  const { user } = useUser();
  const [examName, setExamName] = useState('');
  const [subjects, setSubjects] = useState<SubjectScore[]>([
    { subject: '', ia1Score: 0, ia1Max: 40, ia2Score: 0, ia2Max: 40, attendance: 100, grade: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [history, setHistory] = useState<PerformanceReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(true);

  useEffect(() => {
    if (auth.currentUser) {
      getPerformanceHistory(auth.currentUser.uid).then(setHistory).catch(() => {});
    }
  }, [report]);

  const addSubject = () => {
    setSubjects([...subjects, { subject: '', ia1Score: 0, ia1Max: 40, ia2Score: 0, ia2Max: 40, attendance: 100, grade: '' }]);
  };

  const removeSubject = (idx: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== idx));
  };

  const updateSubject = (idx: number, field: keyof SubjectScore, value: any) => {
    const updated = [...subjects];
    (updated[idx] as any)[field] = value;
    
    // Auto grade based on combined score
    const totalScore = (updated[idx].ia1Score || 0) + (updated[idx].ia2Score || 0);
    const totalMax = (updated[idx].ia1Max || 0) + (updated[idx].ia2Max || 0);
    if (totalMax > 0) {
      const pct = (totalScore / totalMax) * 100;
      updated[idx].grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F';
    }
    
    setSubjects(updated);
  };

  const validSubjects = subjects.filter(s => s.subject.trim());

  const analyze = async () => {
    if (!examName.trim() || validSubjects.length === 0) {
      alert('Please enter an exam name and at least one format valid subject.');
      return;
    }
    setLoading(true);
    setReport(null);
    try {
      const result = await analyzeStudentPerformance(
        validSubjects, examName, user?.targetRole, user?.currentLevel
      );
      
      const totalScore = validSubjects.reduce((a, s) => a + (s.ia1Score || s.score || 0) + (s.ia2Score || 0), 0);
      const totalMax = validSubjects.reduce((a, s) => a + (s.ia1Max || s.maxScore || 100) + (s.ia2Max || 0), 0);
      const overallPercent = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

      const newReport: PerformanceReport = {
        id: `perf_${Date.now()}`,
        examName,
        subjects: validSubjects,
        overallPercent,
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        improvementPlan: result.improvementPlan || [],
        subjectAnalyses: result.subjectAnalyses || [],
        studyPlan: result.studyPlan,
        expectedSemesterScore: result.expectedSemesterScore,
        motivationalFeedback: result.motivationalFeedback,
        createdAt: new Date().toISOString()
      };
      setReport(newReport);

      if (auth.currentUser) {
        try { await savePerformanceReport(auth.currentUser.uid, newReport); } catch (e) { console.error(e); }
      }
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = report?.subjects.map(s => {
    const name = s.subject.length > 12 ? s.subject.slice(0, 12) + '...' : s.subject;
    if (s.score !== undefined && s.maxScore !== undefined) {
      return { name, score: Math.round((s.score / s.maxScore) * 100) };
    }
    return {
      name,
      ia1: s.ia1Max > 0 ? Math.round((s.ia1Score / s.ia1Max) * 100) : 0,
      ia2: s.ia2Max > 0 ? Math.round((s.ia2Score / s.ia2Max) * 100) : 0
    };
  }) || [];

  const getBarColor = (pct: number) => pct >= 80 ? '#22c55e' : pct >= 60 ? '#eab308' : pct >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            Performance Analyzer <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">AI</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Analyze IA drops and generate a personalized study plan.</p>
        </div>
        <div className="flex items-center gap-3 md:pr-24">
          <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <History size={16} /> Past Reports
          </button>
        </div>
      </header>
 
      {showHistory && (
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">History</h3>
          {history.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {history.map(h => (
                <div key={h.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                  <div>
                    <p className="font-bold dark:text-white">{h.examName}</p>
                    <p className="text-xs text-gray-400">{h.subjects.length} subjects • {new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`text-lg font-black ${h.overallPercent >= 70 ? 'text-green-500' : h.overallPercent >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {h.overallPercent}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-4 text-sm font-medium">No past reports found yet.</p>
          )}
        </div>
      )}
<<<<<<< HEAD

      <div className="grid xl:grid-cols-12 gap-8">
=======
 
      <div className="grid lg:grid-cols-12 gap-8">
>>>>>>> 040947332b67bd8351399d24b1e36b792692d987
        {/* LEFT: Input */}
        <div className="xl:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Context *</label>
              <select
                value={examName}
                onChange={e => setExamName(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-brand-600 outline-none font-bold dark:text-white transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select Semester</option>
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex justify-between">
                <span>Subjects & Internal Marks</span>
              </label>
              {subjects.map((s, idx) => (
                <div key={idx} className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <input
                      placeholder="Subject Name"
                      value={s.subject}
                      onChange={e => updateSubject(idx, 'subject', e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-900 border dark:border-slate-700 px-3 py-2 rounded-xl outline-none font-bold text-sm dark:text-white"
                    />
                    <button onClick={() => removeSubject(idx)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border dark:border-slate-700 flex flex-col items-center">
                      <span className="text-[10px] uppercase font-black text-gray-400 mb-1">IA 1</span>
                      <div className="flex items-center gap-1">
                        <select value={s.ia1Score} onChange={e => updateSubject(idx, 'ia1Score', +e.target.value)} className="bg-transparent text-center font-bold text-md dark:text-white outline-none cursor-pointer appearance-none">
                          {Array.from({ length: 41 }, (_, i) => (
                            <option key={i} value={i} className="dark:bg-slate-800">{i}</option>
                          ))}
                        </select>
                        <span className="text-gray-400 text-xs font-bold">/ 40</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-2 border dark:border-slate-700 flex flex-col items-center">
                      <span className="text-[10px] uppercase font-black text-gray-400 mb-1">IA 2</span>
                      <div className="flex items-center gap-1">
                        <select value={s.ia2Score} onChange={e => updateSubject(idx, 'ia2Score', +e.target.value)} className="bg-transparent text-center font-bold text-md dark:text-white outline-none cursor-pointer appearance-none">
                          {Array.from({ length: 41 }, (_, i) => (
                            <option key={i} value={i} className="dark:bg-slate-800">{i}</option>
                          ))}
                        </select>
                        <span className="text-gray-400 text-xs font-bold">/ 40</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      Attendance: 
                      <input type="number" value={s.attendance} onChange={e => updateSubject(idx, 'attendance', +e.target.value)} className="w-12 bg-white dark:bg-slate-900 border dark:border-slate-700 rounded p-1 text-center dark:text-white" /> %
                    </div>
                    {s.grade && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        s.grade === 'A+' || s.grade === 'A' ? 'bg-green-100 text-green-600' : s.grade === 'B' ? 'bg-blue-100 text-blue-600' : s.grade === 'C' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                      }`}>Avg Grade: {s.grade}</span>
                    )}
                  </div>
                </div>
              ))}
              <button onClick={addSubject}
                className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center gap-2">
                <Plus size={16} /> Add Another Subject
              </button>
            </div>

            <button onClick={analyze} disabled={loading || !examName.trim() || validSubjects.length === 0}
              className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-lg hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20 active:scale-[0.98]">
              {loading ? <Loader2 size={22} className="animate-spin" /> : <Sparkles size={22} />}
              {loading ? 'Analyzing Performance...' : 'Analyze My Performance'}
            </button>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="xl:col-span-7 space-y-6">
          {loading ? (
            <div className="h-[600px] bg-white dark:bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center border dark:border-slate-800">
              <div className="w-24 h-24 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-6"></div>
              <p className="text-xl font-black dark:text-white animate-pulse">Running Smart Diagnosis...</p>
              <p className="text-gray-400 mt-2 text-sm">Evaluating trends across all internal assessments.</p>
            </div>
          ) : !report ? (
            <div className="h-[600px] bg-gray-50 dark:bg-slate-900/50 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-10">
              <LineChartIcon size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-bold dark:text-white">Awaiting Data</h3>
              <p className="text-gray-500 max-w-sm mt-2">Enter your IA marks to uncover performance drops, get a custom study plan, and predict your semester score.</p>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
              
              {/* Highlight Dashboard Top */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-brand-50 dark:bg-brand-900/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 relative z-10">Overall aggregate</p>
                  <p className={`text-5xl font-black relative z-10 ${report.overallPercent >= 70 ? 'text-green-500' : report.overallPercent >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>{report.overallPercent}%</p>
                </div>
                
                {report.expectedSemesterScore !== undefined && (
                  <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl p-6 text-center shadow-lg shadow-brand-500/20 text-white relative">
                    <p className="text-[10px] font-black text-brand-200 uppercase tracking-widest mb-2">Predicted Sem Score</p>
                    <p className="text-5xl font-black">{report.expectedSemesterScore}%</p>
                    <Sparkles className="absolute top-4 right-4 text-brand-300 opacity-50" size={18} />
                  </div>
                )}
                
                {report.motivationalFeedback && (
                  <div className={`md:col-span-${report.expectedSemesterScore ? '1' : '2'} bg-slate-800 text-white border border-slate-700 rounded-3xl p-6 shadow-sm flex flex-col justify-center`}>
                    <p className="text-xs text-slate-300 italic">"{report.motivationalFeedback}"</p>
                  </div>
                )}
              </div>

              {/* Chart Comparison */}
              <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">IA Progression</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700 }} cursor={{fill: 'rgba(148, 163, 184, 0.1)'}} />
                      
                      {chartData[0]?.score !== undefined ? (
                         <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                           {chartData.map((entry, idx) => <Cell key={idx} fill={getBarColor(entry.score!)} />)}
                         </Bar>
                      ) : (
                        <>
                          <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                          <Bar dataKey="ia1" name="IA 1" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="ia2" name="IA 2" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subject Deep Dive (Smart Insights) */}
              {report.subjectAnalyses && report.subjectAnalyses.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Target size={16} /> Subject Diagnosis</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b dark:border-slate-800">
                          <th className="pb-3 text-xs font-black text-gray-400 uppercase">Subject</th>
                          <th className="pb-3 text-xs font-black text-gray-400 uppercase">Trend</th>
                          <th className="pb-3 text-xs font-black text-gray-400 uppercase">Prio</th>
                          <th className="pb-3 text-xs font-black text-gray-400 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.subjectAnalyses.map((sa, i) => (
                          <tr key={i} className={`border-b dark:border-slate-800/50 last:border-0 ${sa.needsUrgentAttention ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                            <td className="py-3 text-sm font-bold dark:text-white flex items-center gap-2">
                              {sa.needsUrgentAttention && <BellRing size={14} className="text-red-500 animate-pulse" />}
                              {sa.subject}
                            </td>
                            <td className="py-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${sa.trend === 'Improvement' ? 'text-green-600 bg-green-100' : sa.trend === 'Decline' ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'}`}>
                                {sa.trend}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`text-xs font-black ${sa.focusPriority === 'High' ? 'text-red-500' : sa.focusPriority === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                                {sa.focusPriority}
                              </span>
                            </td>
                            <td className="py-3 text-xs font-bold text-gray-500">
                              {sa.performanceLevel}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Study Plan Generator */}
              {report.studyPlan ? (
                <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-900/50 rounded-3xl p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-lg"><CalendarDays size={20} /></div>
                    <div>
                      <h3 className="text-lg font-black text-brand-900 dark:text-brand-100">Personalized Study Plan</h3>
                      <p className="text-xs font-bold text-brand-600/70 dark:text-brand-400/70 uppercase tracking-wider">Generated for Semester Exams</p>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Time Split Strategy</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-red-500">Weak Subjects ({report.studyPlan.timeAllocation.weakSubjectsPercentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${report.studyPlan.timeAllocation.weakSubjectsPercentage}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-yellow-500">Moderate ({report.studyPlan.timeAllocation.moderateSubjectsPercentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${report.studyPlan.timeAllocation.moderateSubjectsPercentage}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-green-500">Strong ({report.studyPlan.timeAllocation.strongSubjectsPercentage}%)</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: `${report.studyPlan.timeAllocation.strongSubjectsPercentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed border-l-4 border-brand-500">
                      <p className="italic">"{report.studyPlan.weeklyStrategy}"</p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recommended Daily Schedule</h4>
                    <div className="space-y-3">
                      {report.studyPlan.dailySchedule.map((slot, i) => (
                        <div key={i} className="flex gap-4 p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                          <div className="w-6 h-6 rounded-lg bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-black flex-shrink-0">
                            {i+1}
                          </div>
                          <p className="text-sm dark:text-white font-medium">{slot}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Fallback Improvement Plan for older reports */
                <div className="bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-900/30 rounded-3xl p-6">
                  <button onClick={() => setExpandedPlan(!expandedPlan)} className="w-full flex justify-between items-center">
                    <h3 className="text-xs font-black text-brand-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={14} /> AI Improvement Plan</h3>
                    {expandedPlan ? <ChevronUp size={16} className="text-brand-600" /> : <ChevronDown size={16} className="text-brand-600" />}
                  </button>
                  {expandedPlan && (
                    <ol className="mt-4 space-y-3">
                      {report.improvementPlan.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-brand-900 dark:text-brand-200 font-medium">
                          <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyzer;
