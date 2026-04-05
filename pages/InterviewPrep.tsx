import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Sparkles, ChevronRight, CheckCircle2, XCircle, Trophy, Clock, RotateCcw, History, ArrowRight, MessageSquare, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateInterviewQuestions, analyzeInterviewResponse, generateOverallInterviewFeedback } from '../src/services/geminiService';
import { saveInterviewSession, getInterviewHistory } from '../src/services/firebase';
import { auth } from '../src/services/firebase';
import { useUser } from '../App';
import { InterviewQuestion, InterviewSession } from '../types';

const InterviewPrep: React.FC = () => {
  const { user } = useUser();
  const [phase, setPhase] = useState<'input' | 'loading' | 'taking' | 'results'>('input');
  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);

  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [response, setResponse] = useState('');
  const [responses, setResponses] = useState<{
    questionId: string;
    response: string;
    feedback: string;
    score: number;
    confidenceScore: number;
    improvement: string;
  }[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [history, setHistory] = useState<InterviewSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [overallFeedback, setOverallFeedback] = useState<{ summary: string; strengths: string[]; weaknesses: string[]; recommendation: string } | null>(null);
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      getInterviewHistory(auth.currentUser.uid).then(setHistory).catch(() => { });
    }
  }, [phase]);

  const [currentFeedback, setCurrentFeedback] = useState<{ feedback: string; score: number; confidenceScore: number; improvement: string } | null>(null);

  const startInterview = async () => {
    if (!role.trim()) return;
    setPhase('loading');
    try {
      const qs = await generateInterviewQuestions(role, difficulty, count);
      setQuestions(qs);
      setCurrentQ(0);
      setResponses([]);
      setResponse('');
      setCurrentFeedback(null);
      setPhase('taking');
    } catch (err) {
      console.error(err);
      alert('Failed to generate interview questions. Please try again.');
      setPhase('input');
    }
  };

  const submitResponse = async () => {
    if (!response.trim() || analyzing) return;
    setAnalyzing(true);
    try {
      const analysis = await analyzeInterviewResponse(questions[currentQ].question, response, questions[currentQ].expectedAnswer);
      const newResponse = {
        questionId: questions[currentQ].id,
        response,
        feedback: analysis.feedback,
        score: analysis.score,
        confidenceScore: analysis.confidenceScore,
        improvement: analysis.improvement
      };
      setResponses([...responses, newResponse]);
      setCurrentFeedback(analysis);
      setAnalyzing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to analyze response. Please try again.');
      setAnalyzing(false);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentFeedback(null);
      setResponse('');
      setCurrentQ(currentQ + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setFinishing(true);
    setPhase('results');
    const overallScore = responses.reduce((sum, r) => sum + r.score, 0) / (responses.length || 1);

    try {
      const feedback = await generateOverallInterviewFeedback(role, difficulty, responses);
      setOverallFeedback(feedback);
    } catch (err) {
      console.error(err);
    } finally {
      setFinishing(false);
    }

    if (auth.currentUser) {
      const session: InterviewSession = {
        id: `interview_${Date.now()}`,
        role,
        difficulty,
        questions,
        responses,
        overallScore: Math.round(overallScore),
        createdAt: new Date().toISOString()
      };
      try { await saveInterviewSession(auth.currentUser.uid, session); } catch (e) { console.error(e); }
    }
  };

  const reset = () => {
    setPhase('input');
    setQuestions([]);
    setCurrentQ(0);
    setResponse('');
    setResponses([]);
    setCurrentFeedback(null);
    setOverallFeedback(null);
  };

  if (phase === 'input') {
    return (
      <div className="w-full max-w-[1600px] mx-auto p-8 xl:px-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Interview Prep</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">Practice with AI-generated interview questions tailored to your target role.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[1rem] p-10 shadow-2xl border dark:border-slate-800">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Target Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Senior Frontend Engineer"
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-500 rounded-2xl dark:text-white font-bold transition-all outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Difficulty</label>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl dark:text-white font-bold outline-none appearance-none">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">Questions</label>
                  <select value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl dark:text-white font-bold outline-none appearance-none">
                    <option value={3}>3</option>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                  </select>
                </div>
              </div>
              <button onClick={startInterview} disabled={!role.trim()} className="w-full py-5 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black text-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl flex items-center justify-center gap-3">
                <Sparkles className="w-5 h-5" /> Start Interview Practice
              </button>
            </div>
            <div className="relative h-full flex flex-col justify-center p-8 bg-brand-50/30 dark:bg-slate-800/50 rounded-[2rem] border-2 border-white dark:border-slate-800 shadow-xl">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Pro Interview Tips</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Use the **STAR method** for behavioral questions.</p>
                </li>
                <li className="flex gap-4">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Be specific with your technical contributions.</p>
                </li>
              </ul>
            </div>
          </div>
          {history.length > 0 && (
            <div className="mt-12 pt-10 border-t dark:border-slate-800">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Recent Sessions</h3>
              <div className="grid gap-4">
                {history.slice(0, 3).map((session) => (
                  <div key={session.id} className="p-6 bg-gray-50 dark:bg-slate-800/50 rounded-2xl flex justify-between items-center border border-transparent hover:border-brand-200 transition-all">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{session.role}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-black">{session.difficulty} • {new Date(session.createdAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-2xl font-black text-brand-600">{session.overallScore}/10</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center w-full max-w-[1600px] mx-auto p-8 xl:px-12 text-center">
        <Loader2 className="w-12 h-12 text-brand-600 animate-spin mb-6" />
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3">Generating Interview Questions</h2>
        <p className="text-gray-500 dark:text-gray-400">Preparing personalized questions for {role}...</p>
      </div>
    );
  }

  if (phase === 'taking') {
    const currentQuestion = questions[currentQ];
    return (
      <div className="min-h-screen bg-[#0b111e] -mt-20 pt-32 pb-20 px-8 lg:px-12 xl:px-24">
        <div className="w-full max-w-[1600px] mx-auto">
          <div className="bg-[#1a2233] rounded-[2rem] p-12 shadow-2xl border border-slate-800/50">
            <div className="mb-8 flex justify-between items-center">
              <span className="text-sm font-semibold text-[#8b949e]">Question {currentQ + 1} of {questions.length}</span>
              <span className="px-5 py-1.5 bg-[#6333c4] text-white rounded-full text-xs font-black shadow-lg">{currentQuestion.category}</span>
            </div>

            <h2 className="text-[2.25rem] font-bold text-white leading-tight mb-10 tracking-tight">
              {currentQuestion.question}
            </h2>

            {!currentFeedback && (
              <div className="mb-10 p-8 bg-[#111827] border border-blue-500/5 rounded-2xl">
                <h3 className="text-lg font-bold text-white mb-4">Tips:</h3>
                <ul className="space-y-3">
                  {currentQuestion.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 items-start text-[1rem] text-[#8b949e]">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#4489ff] shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-8">
              <div className="relative group">
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  disabled={analyzing || !!currentFeedback}
                  placeholder="Type your response here..."
                  className="relative w-full h-56 px-10 py-8 bg-[#242c3d] border-2 border-transparent focus:border-blue-400/20 rounded-[1.5rem] text-white font-medium text-lg transition-all outline-none resize-none disabled:opacity-70 shadow-inner"
                />
              </div>

              {!currentFeedback && (
                <button
                  onClick={submitResponse}
                  disabled={!response.trim() || analyzing}
                  className="w-full group relative py-6 bg-[#8b949e] hover:bg-[#a1a8b1] disabled:opacity-50 text-[#1a2233] rounded-2xl font-bold text-xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.99]"
                >
                  {analyzing ? (
                    <><Loader2 className="w-6 h-6 animate-spin" /> Analyzing Live Response...</>
                  ) : (
                    <><ArrowRight className="w-6 h-6" /> Submit Response</>
                  )}
                </button>
              )}

              {currentFeedback && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-brand-50/50 dark:bg-brand-900/10 border-2 border-brand-100 dark:border-brand-900/30 p-8 rounded-[2rem] space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-brand-600" />
                      <h3 className="text-sm font-black text-brand-900 dark:text-white uppercase tracking-widest">Live Feedback</h3>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-gray-400">Score</p>
                        <p className="text-xl font-black text-brand-600">{currentFeedback.score}/10</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase text-gray-400">Confidence</p>
                        <p className="text-xl font-black text-violet-600">{currentFeedback.confidenceScore}/10</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900/50 p-6 rounded-2xl border">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">{currentFeedback.feedback}</p>
                  </div>
                  <div className="pt-4">
                    <p className="text-xs font-black text-brand-600 uppercase mb-3 flex items-center gap-2">
                      <Sparkles size={14} /> Optimized Pro Response
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 bg-white/5 p-4 rounded-xl">"{currentFeedback.improvement}"</p>
                  </div>
                  <button onClick={nextQuestion} className="w-full py-5 bg-white text-brand-600 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:bg-brand-50 transition-all shadow-lg mt-8">
                    <span>{currentQ < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}</span>
                    <ChevronRight size={20} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results') {
    const overallScore = responses.length > 0 ? responses.reduce((s, r) => s + r.score, 0) / responses.length : 0;
    return (
      <div className="w-full max-w-[1600px] mx-auto p-8 xl:px-12 text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
        <h1 className="text-6xl font-black mb-6">Evaluation Report</h1>
        <div className="flex justify-center gap-12 mb-12">
          <div>
            <p className="text-sm text-gray-400 uppercase font-black">Final Score</p>
            <p className="text-7xl font-black text-brand-600">{Math.round(overallScore)}/10</p>
          </div>
          <div className="w-px h-16 bg-gray-200" />
          <div>
            <p className="text-sm text-gray-400 uppercase font-black">Confidence</p>
            <p className="text-7xl font-black text-violet-600">{Math.round(responses.reduce((s, r) => s + r.confidenceScore, 0) / responses.length)}/10</p>
          </div>
        </div>

        {overallFeedback && (
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border-2 text-left mb-12">
            <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><Sparkles className="text-brand-600" /> Executive Summary</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">{overallFeedback.summary}</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-black text-green-600 uppercase mb-4">Key Strengths</p>
                <ul className="space-y-3">
                  {overallFeedback.strengths.map((s, i) => <li key={i} className="flex gap-3 text-sm font-medium"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {s}</li>)}
                </ul>
              </div>
              <div>
                <p className="text-xs font-black text-brand-600 uppercase mb-4">Growth Areas</p>
                <ul className="space-y-3">
                  {overallFeedback.weaknesses.map((w, i) => <li key={i} className="flex gap-3 text-sm font-medium"><TrendingUp className="w-4 h-4 text-brand-500 shrink-0" /> {w}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest text-left">Detailed Response Analytics</h3>
          {responses.map((resp, idx) => {
            const question = questions.find(q => q.id === resp.questionId);
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[1rem] border text-left">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black text-brand-600 uppercase mb-1">Response {idx + 1} • {question?.category}</p>
                    <h4 className="text-xl font-black">{question?.question}</h4>
                  </div>
                  <div className="text-2xl font-black text-brand-600">{resp.score}/10</div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-6">"{resp.response}"</p>
                <div className="p-6 bg-brand-50/30 rounded-2xl border">
                  <p className="text-xs font-black text-brand-600 uppercase mb-3">Model Answer Improvement</p>
                  <p className="text-sm font-bold">"{resp.improvement}"</p>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={reset} className="mt-12 w-full py-6 bg-black text-white rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all">Practice Mastery</button>
      </div>
    );
  }

  return null;
};

export default InterviewPrep;