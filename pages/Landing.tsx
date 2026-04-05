import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  XCircle,
  ArrowRight,
  BookOpen,
  Target,
  Sparkles,
  Shield,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import Ballpit from '../src/components/Ballpit';
import { motion } from 'framer-motion';
import VariableProximity from '../src/components/VariableProximity';
import TextType from '../src/components/TextType';
import StaggeredMenu from '../src/components/StaggeredMenu';
import { useTheme } from '../App';

const Landing: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-bg-base transition-colors min-h-screen">

      {/* Separate Logo Container */}
      <div className="absolute top-0 inset-x-0 z-[60] pointer-events-none">
        <div className="container mx-auto px-6 h-28 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-6">
            <Link to="/" className="group flex items-center gap-3">
              <div className="p-2 bg-surface/40 backdrop-blur-md rounded-xl border border-border-subtle shadow-sm group-hover:scale-110 transition-transform duration-300">
                <img src="/logo.png" className="w-8 h-8 drop-shadow-md" alt="Synapse" />
              </div>
              <span className="text-2xl font-bold text-text-primary font-logo drop-shadow-sm group-hover:text-brand-400 transition-colors duration-300">
                Synapse
              </span>
            </Link>

            <div className="h-8 w-px bg-border-subtle opacity-20 mx-1 hidden sm:block" />

            {/* Theme Toggle Button - Moved to left to avoid menu interference */}
            <button
              onClick={toggleTheme}
              className="p-3 bg-surface/40 backdrop-blur-md border border-border-subtle rounded-xl text-text-primary hover:text-brand-500 hover:border-brand-500/30 transition-all duration-300 shadow-sm"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Staggered Navigation Menu exactly matching React Bits props */}
      <StaggeredMenu
        isFixed={true}
        accentColor="#c629ff"
        menuButtonColor="#9ca3af"
        openMenuButtonColor="#000000"
        displayItemNumbering={true}
        className="z-[70]"
        items={[
          { label: 'ABOUT', link: '#/about', ariaLabel: 'About us' },
          { label: 'Contact', link: '#/contact', ariaLabel: 'Contact us' },
          { label: 'Log In', link: '#/login', ariaLabel: 'Log in to your account' }
        ]}
        socialItems={[]}
        displaySocials={false}
      />


      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Ballpit background */}
        <div className="absolute inset-0">
          <Ballpit
            count={70}
            gravity={0.3}
            friction={0.85}
            wallBounce={0.9}
            followCursor
            colors={[0x8B5CF6, 0x06B6D4, 0xF0ABFC, 0x7C3AED, 0x22D3EE]}
          />
        </div>

        {/* Semantic gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base/70 via-bg-base/40 to-bg-base/80 pointer-events-none z-[1]" />

        {/* Ambient glow blobs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-[1]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none z-[1]"
        />

        {/* Hero content */}
        <div className="container mx-auto px-6 text-center relative z-10 py-32">

          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-lg"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="text-sm font-bold text-text-primary tracking-wide">AI-Powered Study Platform</span>
          </motion.div>

          {/* Main heading — interactive variable font proximity */}
          <div className="text-[min(10vw,6rem)] md:text-[min(8vw,7rem)] lg:text-9xl text-text-primary mb-8 leading-[1.05] tracking-tight cursor-default max-w-full" ref={containerRef}>
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <VariableProximity
                label="Study Smarter"
                fromFontVariationSettings="'wght' 400"
                toFontVariationSettings="'wght' 900"
                containerRef={containerRef}
                radius={110}
                falloff="gaussian"
                className="block"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mt-2"
            >
              <VariableProximity
                label="with AI Power"
                fromFontVariationSettings="'wght' 400"
                toFontVariationSettings="'wght' 900"
                containerRef={containerRef}
                radius={110}
                falloff="gaussian"
                className="inline-block bg-gradient-to-r from-purple-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent pb-3"
                style={{ backgroundSize: '200% auto', animation: 'gradientShift 4s ease-in-out infinite' }}
              />
            </motion.div>
          </div>

          <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>

          {/* Subtitle with TextType animation */}
          <div className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-14 leading-relaxed font-medium min-h-[4rem]">
            <TextType
              speed={20}
              delay={1200}
              segments={[
                "Synapse generates quizzes, summarizes notes, analyzes performance, and crafts ",
                { text: "personalized study plans", className: "text-text-primary font-bold" },
                " — all powered by AI"
              ]}
              showCursor={true}
            />
          </div>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.2, type: "spring", bounce: 0.4 }}
          >
            <Link
              to="/login"
              className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              {/* Glow ring */}
              <span className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-500" />
              <span className="absolute inset-0 bg-gradient-to-r from-brand-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-3">
                Get Started
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </Link>
          </motion.div>

        </div>

        {/* Bottom gradient fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-base to-transparent pointer-events-none z-[2]" />
      </section>


      {/* PROBLEM + SOLUTION */}
      <section className="py-32 relative overflow-hidden bg-gradient-to-br from-bg-base via-surface to-bg-base/50 border-y border-border-subtle">

        {/* Glowing AI Feature Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[50rem] h-[50rem] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[30%] -right-[20%] w-[60rem] h-[60rem] bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-[150px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              y: [0, -50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-[20%] w-[40rem] h-[30rem] bg-brand-400/10 dark:bg-brand-500/10 rounded-full blur-[100px]"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">

          <div className="relative grid lg:grid-cols-[1fr_minmax(0,1fr)] gap-16 lg:gap-32 items-center">

            {/* Vertical Divider */}
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              whileInView={{ height: '100%', opacity: 1 }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="hidden lg:block absolute left-1/2 top-0 w-px bg-gradient-to-b from-transparent via-border-subtle to-transparent -translate-x-1/2"
            />

            {/* PROBLEMS */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.15 } },
                hidden: {}
              }}
              className="space-y-12 pr-0 lg:pr-8"
            >

              <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 backdrop-blur-md border border-border-subtle mb-8 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-bold uppercase tracking-widest text-text-secondary">
                    The Problem
                  </span>
                </div>

                {/* Animated gradient heading */}
                <h2 className="text-5xl lg:text-6xl font-black mb-6 leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text-primary via-indigo-500 to-text-primary" style={{ backgroundSize: '200% auto', animation: 'gradientMove 8s linear infinite' }}>
                  The Study Struggle
                </h2>

                <style>{`
                  @keyframes gradientMove {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}</style>

                <p className="text-text-secondary text-xl leading-relaxed max-w-lg font-medium">
                  Most students cram before exams and struggle to organize
                  study material effectively. Synapse fixes that.
                </p>
              </motion.div>

              <div className="space-y-5">
                {[
                  "Piles of unorganized lecture notes",
                  "No idea what's important for exams",
                  "Can't track academic performance over time",
                  "No personalized study plan or schedule"
                ].map((text, i) => (
                  <motion.div
                    key={i}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.95 },
                      visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, type: "spring", bounce: 0.4 } }
                    }}
                    whileHover={{ scale: 1.03, y: -4, x: 8 }}
                    className="group flex items-center gap-4 py-3 px-5 bg-surface/80 backdrop-blur-xl rounded-xl border border-border-subtle shadow-sm hover:shadow-xl hover:shadow-red-500/5 hover:border-red-200 transition-all duration-300 cursor-default"
                  >
                    <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-bg-base rounded-lg border border-border-subtle shadow-md group-hover:bg-red-50 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <XCircle className="text-red-500 w-5 h-5" />
                    </div>
                    <p className="font-semibold text-text-primary text-base">
                      {text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>


            {/* SOLUTION (Floating Storytelling Section) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.25, delayChildren: 0.2 } },
                hidden: {}
              }}
              className="relative pl-0 lg:pl-8"
            >
              {/* Strengthened decorative background glow */}
              <motion.div
                animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-16 bg-gradient-to-tr from-brand-500 via-indigo-500 to-cyan-400 opacity-40 dark:opacity-50 blur-[100px] rounded-[4rem] pointer-events-none"
              ></motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 60, rotateX: 10 }, visible: { opacity: 1, y: 0, rotateX: 0, transition: { duration: 1, type: "spring", bounce: 0.3 } } }}
                style={{ perspective: 1000 }}
                className="relative bg-surface/60 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] border border-border-subtle shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]"
              >

                <div className="flex items-center gap-5 mb-12">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="p-4 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-2xl shadow-xl shadow-brand-500/40"
                  >
                    <Shield className="text-white w-8 h-8" />
                  </motion.div>
                  <div>
                    <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
                      Synapse Solution
                    </h3>
                  </div>
                </div>

                <div className="space-y-6">
                  {[
                    {
                      title: "AI QUIZ MAKER",
                      desc: "Generate quizzes instantly from your notes with advanced AI analysis.",
                      icon: <Sparkles className="w-6 h-6" />,
                      bgClasses: "bg-gradient-to-br from-brand-50/80 to-white dark:from-brand-900/30 dark:to-slate-900/80",
                      iconBg: "bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-500/30",
                      titleClass: "text-brand-800 dark:text-brand-300",
                      hoverColor: "hover:border-brand-300 dark:hover:border-brand-500/50"
                    },
                    {
                      title: "NOTES SUMMARIZER",
                      desc: "Extract key concepts, definitions, and high-yield summaries.",
                      icon: <BookOpen className="w-6 h-6" />,
                      bgClasses: "bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/30 dark:to-slate-900/80",
                      iconBg: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30",
                      titleClass: "text-emerald-800 dark:text-emerald-300",
                      hoverColor: "hover:border-emerald-300 dark:hover:border-emerald-500/50"
                    },
                    {
                      title: "EXAM PREP PLANNER",
                      desc: "AI intelligently generates personalized, adaptive study schedules.",
                      icon: <Target className="w-6 h-6" />,
                      bgClasses: "bg-gradient-to-br from-purple-50/80 to-white dark:from-purple-900/30 dark:to-slate-900/80",
                      iconBg: "bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30",
                      titleClass: "text-purple-800 dark:text-purple-300",
                      hoverColor: "hover:border-purple-300 dark:hover:border-purple-500/50"
                    }
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      variants={{
                        hidden: { opacity: 0, y: 30, scale: 0.95 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, type: "spring", bounce: 0.5 } }
                      }}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className={`group relative overflow-hidden flex items-start gap-5 p-6 rounded-2xl border border-white/50 dark:border-slate-700/50 shadow-md hover:shadow-2xl transition-all duration-300 cursor-default ${feature.bgClasses} ${feature.hoverColor}`}
                    >
                      <div className={`shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl border shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 relative ${feature.iconBg}`}>
                        {feature.icon}

                        {/* Apple-style Animated Checkmark */}
                        <motion.div
                          className="absolute -bottom-2 -right-2 bg-green-500 rounded-full w-7 h-7 flex items-center justify-center border-[3px] border-white dark:border-slate-900 shadow-lg"
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: [0, 1.2, 1], opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.3 + 1, duration: 0.5, type: "spring", stiffness: 200, damping: 12 }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <motion.path
                              d="M20 6L9 17l-5-5"
                              initial={{ pathLength: 0 }}
                              whileInView={{ pathLength: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.4, delay: i * 0.3 + 1.2, ease: "easeOut" }}
                            />
                          </svg>
                        </motion.div>
                      </div>

                      <div className="relative z-10 pt-1">
                        <p className={`font-black ${feature.titleClass} mb-2 tracking-wide text-sm`}>
                          {feature.title}
                        </p>
                        <p className="text-text-secondary text-sm md:text-base leading-relaxed font-medium">
                          {feature.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* DETAILED FOOTER */}
      <footer className="relative pt-16 pb-8 overflow-hidden bg-surface/30 border-t border-border-subtle">
        {/* Decorative background glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-3">
                <div className="p-2 bg-bg-base/80 backdrop-blur-md rounded-xl border border-border-subtle shadow-sm">
                  <img src="/logo.png" className="w-6 h-6" alt="Synapse" />
                </div>
                <span className="text-xl font-bold text-text-primary font-logo">Synapse</span>
              </Link>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xs transition-opacity hover:opacity-100 opacity-80">
                Elevating academic potential through intelligent AI assistance. Study smarter, retain more, and achieve your goals.
              </p>
              <div className="flex gap-4">
                {['Twitter', 'GitHub', 'LinkedIn'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-xl bg-bg-base border border-border-subtle flex items-center justify-center text-text-muted hover:text-brand-500 hover:border-brand-500/30 hover:scale-110 transition-all duration-300">
                    <span className="sr-only">{social}</span>
                    <div className="w-5 h-5 bg-current mask-icon" style={{ maskImage: `url(/icons/${social.toLowerCase()}.svg)` }} />
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary mb-8">Product</h4>
              <ul className="space-y-4">
                {['AI Quiz Maker', 'Notes Summarizer', 'Performance Tracker', 'Exam Planner', 'Advisor Chat'].map((item) => (
                  <li key={item}>
                    <Link to="/login" className="text-text-secondary hover:text-brand-400 text-sm font-medium transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary mb-8">Resources</h4>
              <ul className="space-y-4">
                {['Documentation', 'Study Tips', 'API Tokens', 'Community', 'Status'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-text-secondary hover:text-brand-400 text-sm font-medium transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* PCE Credit Section */}
            <div className="lg:pl-8 border-l-0 lg:border-l border-border-subtle">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-text-primary mb-8">Development</h4>
              <div className="p-6 rounded-2xl bg-bg-base border border-border-subtle space-y-4">
                <p className="text-xs text-text-secondary font-medium leading-relaxed">
                  Developed as part of academic learning and exploration at:
                </p>
                <a
                  href="https://www.pce.ac.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <p className="text-sm font-black text-text-primary group-hover:text-brand-500 transition-colors">
                    Pillai College of Engineering (PCE)
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-brand-500 uppercase tracking-widest group-hover:gap-3 transition-all">
                    Visit Website <ArrowRight size={12} />
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-text-muted text-xs font-medium">
              © 2026 Synapse AI. All rights reserved. Built with ❤️ for students globally.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-text-muted hover:text-text-primary text-[10px] font-black uppercase tracking-widest transition-colors">Privacy Policy</a>
              <a href="#" className="text-text-muted hover:text-text-primary text-[10px] font-black uppercase tracking-widest transition-colors">Terms of Service</a>
              <a href="#" className="text-text-muted hover:text-text-primary text-[10px] font-black uppercase tracking-widest transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

