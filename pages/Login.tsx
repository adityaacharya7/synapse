
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../App';
import { Sparkles, User as UserIcon, ArrowRight, Zap, Brain, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    google: any;
  }
}

const Login: React.FC = () => {
  const { user, login } = useUser();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      if (user.targetRole) {
        navigate('/dashboard');
      } else {
        navigate('/profile-setup');
      }
    }
  }, [user, navigate]);

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const processUserAndRedirect = (userData: any) => {
    const existingRaw = localStorage.getItem('user');
    if (existingRaw) {
      const existing = JSON.parse(existingRaw);
      if (existing.email === userData.email) {
        const merged = { ...existing, ...userData };
        login(merged);
        if (merged.targetRole) {
          navigate('/dashboard');
          return;
        }
      }
    }
    login(userData);
    navigate('/profile-setup');
  };

  const handleCredentialResponse = (response: any) => {
    const payload = decodeJwt(response.credential);
    if (!payload) {
      const demoUser = {
        name: 'Demo Student',
        email: 'student@university.edu',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop',
        targetRole: '',
        skills: [],
        graduationYear: '2025',
        currentLevel: 'Beginner' as const
      };
      processUserAndRedirect(demoUser);
    } else {
      const googleUser = {
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        targetRole: '',
        skills: [],
        graduationYear: '2025',
        currentLevel: 'Beginner' as const
      };
      processUserAndRedirect(googleUser);
    }
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      // Ensure both google and accounts exist
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: '1065445353526-mrtre7f9o0p6p0v0p0p0p0p0p0p0p0.apps.googleusercontent.com',
            callback: handleCredentialResponse,
            auto_select: false,
            context: 'signin'
          });
          
          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline', 
              size: 'large', 
              width: '100%', 
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left'
            });
          }
        } catch (err) {
          console.warn('Google Sign-In initialization failed:', err);
        }
      }
    };

    // Polling with a safety limit
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.google && window.google.accounts) { 
        initializeGoogleSignIn(); 
        clearInterval(checkInterval); 
      } else if (attempts > 50) { // Timeout after 5 seconds
        clearInterval(checkInterval);
        console.warn('Google accounts script was not available in time.');
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  const features = [
    { icon: Zap, label: 'AI Quizzes', color: 'from-amber-500 to-orange-600' },
    { icon: Brain, label: 'Smart Notes', color: 'from-purple-500 to-violet-600' },
    { icon: Shield, label: 'Exam Prep', color: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <div className="min-h-screen flex bg-bg-base overflow-hidden relative transition-colors">

      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-brand-600/20 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[120px]"
        />
      </div>

      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative z-10 p-16">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-lg text-left"
        >
          <div className="flex items-center gap-4 mb-10">
            <img src="/logo.png" alt="Synapse" className="w-14 h-14 rounded-2xl shadow-2xl shadow-brand-500/30" />
            <span className="text-3xl font-black text-text-primary font-logo">Synapse</span>
          </div>

          <h2 className="text-5xl font-black text-text-primary leading-[1.1] mb-6 tracking-tight">
            Your AI-powered
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              study companion.
            </span>
          </h2>

          <p className="text-text-secondary text-lg leading-relaxed mb-12 font-medium">
            Join thousands of students using Synapse to study smarter, ace exams, and build their careers with AI.
          </p>

          {/* Feature pills */}
          <div className="flex flex-col gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.15 }}
                className="flex items-center gap-4 p-4 bg-surface/40 backdrop-blur-sm rounded-2xl border border-border-subtle hover:bg-surface/80 transition-all group shadow-sm"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <span className="text-text-primary font-bold text-sm">{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-surface/80 dark:bg-slate-900/80 backdrop-blur-2xl p-10 rounded-[2.5rem] border border-border-subtle dark:border-slate-800/80 shadow-2xl shadow-black/5 relative overflow-hidden">
            {/* Decorative corner glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-600/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />

            <div className="relative z-10 space-y-8">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
                <img src="/logo.png" alt="Synapse" className="w-12 h-12 rounded-2xl shadow-xl shadow-brand-500/20" />
                <span className="text-2xl font-black text-text-primary font-logo">Synapse</span>
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-text-primary tracking-tight">Welcome back</h1>
                <p className="text-text-secondary font-medium">Sign in to continue your learning journey</p>
              </div>

              {/* Auth buttons */}
              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => login()}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border border-border-muted rounded-2xl font-bold text-gray-800 shadow-md hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </motion.button>

                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-border-subtle" />
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">or</span>
                  <div className="h-px flex-1 bg-border-subtle" />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCredentialResponse({ credential: null })}
                  className="group w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-2xl font-bold shadow-xl shadow-brand-600/15 hover:shadow-brand-600/30 transition-all"
                >
                  <UserIcon size={18} />
                  Continue as Guest
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              {/* Note */}
              <div className="p-4 bg-surface rounded-2xl border border-border-subtle shadow-inner">
                <p className="text-[11px] text-text-secondary leading-relaxed text-center">
                  Use <span className="text-text-primary font-bold">Guest Access</span> to explore all features instantly — no account needed.
                </p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center gap-6 mt-8"
          >
            {[
              { icon: Shield, label: 'Secure' },
              { icon: Sparkles, label: 'AI Powered' },
              { icon: Zap, label: 'Instant' },
            ].map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-text-muted">
                <b.icon size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{b.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
