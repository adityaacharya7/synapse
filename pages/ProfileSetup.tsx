import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../App';
import { ArrowRight, Sparkles, GraduationCap, Target, Rocket, Briefcase, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProfileSetup: React.FC = () => {
  const { user, updateProfile } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState({
    targetRole: '',
    graduationYear: '2025',
    currentLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    skills: [] as string[]
  });

  const next = () => setStep(step + 1);

  const finish = () => {
    if (user) {
      updateProfile({ ...user, ...details });
      navigate('/dashboard');
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 40, scale: 0.98 },
    center: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -40, scale: 0.98 },
  };

  const steps = [
    { icon: Target, label: 'Focus', desc: 'Career path' },
    { icon: GraduationCap, label: 'Details', desc: 'Your info' },
    { icon: Rocket, label: 'Launch', desc: 'Ready!' },
  ];

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors">

      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="max-w-xl w-full relative z-10">

        {/* Progress stepper */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-12 px-4"
        >
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2 relative"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-500 border-2 ${
                  step > i + 1
                    ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20'
                    : step === i + 1
                    ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-surface border-border-subtle text-text-muted'
                }`}>
                  {step > i + 1 ? <Check size={20} /> : <s.icon size={20} />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  step >= i + 1 ? 'text-text-primary' : 'text-text-muted'
                }`}>
                  {s.label}
                </span>
              </motion.div>
              {i < 2 && (
                <div className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-700 ${
                  step > i + 1 ? 'bg-green-500' : 'bg-border-subtle'
                }`} />
              )}
            </React.Fragment>
          ))}
        </motion.div>

        {/* Main card */}
        <div className="bg-surface/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-border-subtle dark:border-slate-800/80 shadow-2xl shadow-black/5 relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-600/15 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl opacity-50" />

          <div className="p-10 sm:p-12 relative z-10">
            <AnimatePresence mode="wait">

              {/* Step 1: Career Focus */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl font-black text-text-primary tracking-tight"
                    >
                      What's your dream role?
                    </motion.h2>
                    <p className="text-text-secondary font-medium">Synapse will tailor everything to your career path.</p>
                  </div>

                  <div className="relative group">
                    <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-500 transition-colors" size={22} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. Frontend Engineer"
                      className="w-full pl-14 pr-6 py-5 bg-bg-base/80 rounded-2xl border-2 border-border-subtle focus:border-brand-500 outline-none text-lg font-bold text-text-primary placeholder-text-muted/40 transition-all shadow-inner"
                      value={details.targetRole}
                      onChange={(e) => setDetails({...details, targetRole: e.target.value})}
                      onKeyDown={(e) => e.key === 'Enter' && details.targetRole && next()}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {['SDE-1', 'Data Scientist', 'UI/UX Designer', 'Mobile Dev', 'Product Manager'].map((preset, i) => (
                      <motion.button
                        key={preset}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDetails({...details, targetRole: preset})}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                          details.targetRole === preset
                            ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'bg-surface/50 border-border-subtle text-text-secondary hover:text-text-primary hover:border-brand-500/50'
                        }`}
                      >
                        {preset}
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!details.targetRole}
                    onClick={next}
                    className="w-full py-5 bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-2xl font-black text-lg disabled:opacity-40 disabled:from-border-subtle disabled:to-border-subtle transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20"
                  >
                    Continue <ArrowRight size={20} />
                  </motion.button>
                </motion.div>
              )}

              {/* Step 2: Calibration */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-3xl font-black text-text-primary tracking-tight"
                    >
                      Calibration
                    </motion.h2>
                    <p className="text-text-secondary font-medium">We tailor AI responses based on your background.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Graduation Year</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['2025', '2026', '2027'].map(year => (
                          <motion.button
                            key={year}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setDetails({...details, graduationYear: year})}
                            className={`py-4 rounded-2xl font-black text-lg transition-all border-2 ${
                              details.graduationYear === year
                                ? 'border-brand-500 bg-brand-600/10 text-brand-500 dark:text-brand-400 shadow-lg shadow-brand-500/10'
                                : 'border-border-subtle bg-surface/50 text-text-muted hover:border-brand-500/30 hover:text-text-primary'
                            }`}
                          >
                            {year}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1">Experience Level</label>
                      <div className="space-y-3">
                        {([
                          { level: 'Beginner' as const, desc: 'Fundamental knowledge only', emoji: '🌱' },
                          { level: 'Intermediate' as const, desc: 'Built some real projects', emoji: '🚀' },
                          { level: 'Advanced' as const, desc: 'Ready for interview revision', emoji: '⚡' },
                        ]).map(({ level, desc, emoji }) => (
                          <motion.button
                            key={level}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setDetails({...details, currentLevel: level})}
                            className={`w-full p-5 rounded-2xl text-left transition-all border-2 flex items-center gap-4 group ${
                              details.currentLevel === level
                                ? 'border-brand-500 bg-brand-600/10 shadow-lg shadow-brand-500/10'
                                : 'border-border-subtle bg-surface/30 hover:border-brand-500/30'
                            }`}
                          >
                            <span className="text-2xl">{emoji}</span>
                            <div className="flex-1">
                              <p className={`font-black ${details.currentLevel === level ? 'text-brand-600 dark:text-brand-400' : 'text-text-primary opacity-80'}`}>{level}</p>
                              <p className="text-[11px] font-medium text-text-muted">{desc}</p>
                            </div>
                            <ChevronRight size={18} className={`transition-all ${details.currentLevel === level ? 'text-brand-500 dark:text-brand-400 translate-x-1' : 'text-text-muted opacity-30'}`} />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={next}
                    className="w-full py-5 bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-500/20"
                  >
                    Almost there <ArrowRight size={20} />
                  </motion.button>
                </motion.div>
              )}

              {/* Step 3: Launch */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                  className="space-y-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="relative inline-block"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-brand-600 to-violet-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/30">
                      <Sparkles size={44} />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-brand-500 rounded-[2rem] blur-xl"
                    />
                  </motion.div>

                  <div className="space-y-2">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl font-black text-text-primary tracking-tight"
                    >
                      You're all set!
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-text-secondary font-medium"
                    >
                      Your AI dashboard is ready and waiting.
                    </motion.p>
                  </div>

                  {/* Summary card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-6 bg-surface/60 rounded-2xl border border-border-subtle text-left space-y-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-brand-600 overflow-hidden border-2 border-border-subtle flex-shrink-0">
                        {user?.avatar ? (
                          <img src={user.avatar} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white"><Sparkles size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-text-primary">{user?.name}</p>
                        <p className="text-xs text-text-muted font-bold">Class of {details.graduationYear} · {details.currentLevel}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                      <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Target Role</p>
                        <p className="text-lg font-black text-brand-600 dark:text-brand-400">{details.targetRole}</p>
                      </div>
                      <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Ready</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={finish}
                    className="w-full py-5 bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-brand-500/30 hover:shadow-brand-500/50 transition-all flex items-center justify-center gap-3"
                  >
                    <Rocket size={22} /> Launch Dashboard
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-[10px] font-black text-text-muted uppercase tracking-[0.3em]"
        >
          Synapse Engine v2.0
        </motion.p>
      </div>
    </div>
  );
};

export default ProfileSetup;