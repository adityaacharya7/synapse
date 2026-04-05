import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Layout, Briefcase, MessageSquare, Map, FileText, Settings, BarChart, LogOut, User as UserIcon, Sparkles, Brain, TrendingUp, BookOpen, AudioLines, Calculator, Timer, CalendarDays, PanelLeftClose, PanelLeft, Youtube, ChevronDown, ChevronRight, Sun, Moon } from 'lucide-react';
import { UserProfile } from './types';
import { auth, googleProvider, getUserProfile, saveUserProfile } from './src/services/firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { isAdmin } from './src/config/adminEmails';
import { AnimatePresence } from 'framer-motion';

// Pages
import LoadingScreen from './src/components/LoadingScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import InternshipPortal from './pages/InternshipPortal';
import AdvisorChat from './pages/AdvisorChat';
import PrepPlanner from './pages/PrepPlanner';
import Roadmap from './pages/Roadmap';
import ResumeBuilder from './pages/ResumeBuilder';
import AdminPanel from './pages/AdminPanel';
import ProfileSetup from './pages/ProfileSetup';
import QuizMaker from './pages/QuizMaker';
import PerformanceAnalyzer from './pages/PerformanceAnalyzer';
import NotesManager from './pages/NotesManager';
import TranscriptGenerator from './pages/TranscriptGenerator';
import VideoTranscriptGenerator from './pages/VideoTranscriptGenerator';
import GPACalculator from './pages/GPACalculator';
import PomodoroTimer from './pages/PomodoroTimer';
import Timetable from './pages/Timetable';
import InterviewPrep from './pages/InterviewPrep';
import Flashcards from './pages/Flashcards';
import AllTools from './pages/AllTools';
import About from './pages/About';
import Contact from './pages/Contact';
import Dock from './src/components/Dock';
import DashboardHeader from './src/components/DashboardHeader';
import DockOnboarding from './src/components/DockOnboarding';


// Contexts
const ThemeContext = createContext({ isDark: false, toggleTheme: () => { } });
const UserContext = createContext<{
  user: UserProfile | null,
  login: (u?: UserProfile) => void,
  logout: () => void,
  updateProfile: (u: UserProfile) => void
}>({
  user: null,
  login: () => { },
  logout: () => { },
  updateProfile: () => { }
});

export const useTheme = () => useContext(ThemeContext);
export const useUser = () => useContext(UserContext);

const GlobalUIOverlays = ({ isInitialLoading }: { isInitialLoading?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide Dock and TopNav while loading or on auth/marketing pages
  if (isInitialLoading || ['/', '/login', '/profile-setup', '/about', '/contact'].includes(location.pathname)) return null;

  const dockItems = [
    { label: 'Dashboard', icon: <Layout size={20} className="text-sky-500 dark:text-sky-400" />, className: "hover:shadow-[0_0_15px_rgba(14,165,233,0.3)] dark:hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] hover:border-sky-500/30 transition-shadow transition-colors", onClick: () => navigate('/dashboard') },
    { label: 'Study Buddy', icon: <MessageSquare size={20} className="text-indigo-500 dark:text-indigo-400" />, className: "hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_15px_rgba(129,140,248,0.3)] hover:border-indigo-500/30 transition-shadow transition-colors", onClick: () => navigate('/advisor') },
    { label: 'Notes', icon: <BookOpen size={20} className="text-blue-500 dark:text-blue-400" />, className: "hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_15px_rgba(96,165,250,0.3)] hover:border-blue-500/30 transition-shadow transition-colors", onClick: () => navigate('/notes') },
    { label: 'Quiz Maker', icon: <Brain size={20} className="text-amber-500 dark:text-amber-400" />, className: "hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] dark:hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:border-amber-500/30 transition-shadow transition-colors", onClick: () => navigate('/quiz') },
    { label: 'Flashcards', icon: <Sparkles size={20} className="text-pink-500 dark:text-pink-400" />, className: "hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] dark:hover:shadow-[0_0_15px_rgba(244,114,182,0.3)] hover:border-pink-500/30 transition-shadow transition-colors", onClick: () => navigate('/flashcards') },
    { label: 'Timetable', icon: <CalendarDays size={20} className="text-brand-500 dark:text-brand-400" />, className: "hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] dark:hover:shadow-[0_0_15px_rgba(167,139,250,0.3)] hover:border-brand-500/30 transition-shadow transition-colors", onClick: () => navigate('/timetable') },
    { label: 'All Tools', icon: <Settings size={20} className="text-slate-500 dark:text-slate-400" />, className: "hover:shadow-[0_0_15px_rgba(100,116,139,0.3)] dark:hover:shadow-[0_0_15px_rgba(148,163,184,0.3)] hover:border-slate-500/30 transition-shadow transition-colors", onClick: () => navigate('/tools') },
  ];

  return (
    <>
      <DashboardHeader />
      <DockOnboarding />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[100] w-full md:w-[60%] h-12 md:h-8 group hover:h-40 flex justify-center pointer-events-auto">
        {/* Subtle iOS-like home indicator—pulsing for extra discoverability on desktop */}
        <div className="hidden md:block absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1.5 rounded-full border border-border-subtle bg-surface/80 backdrop-blur-md group-hover:opacity-0 transition-opacity duration-300 shadow-[0_0_10px_rgba(139,92,246,0.3)] animate-pulse"></div>

        {/* Native feel: Solid on mobile, elegant spring reveal on desktop hovers */}
        <div className="absolute bottom-4 md:-bottom-32 left-0 w-full md:group-hover:bottom-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] opacity-100 md:opacity-0 md:group-hover:opacity-100 flex justify-center pointer-events-auto">
          <Dock
            items={dockItems}
            panelHeight={64}
            baseItemSize={48}
            magnification={72}
            className="bg-white/70 dark:bg-[#0b0c10]/70 backdrop-blur-3xl shadow-2xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] border border-black/10 dark:border-white/10 rounded-3xl text-text-primary dark:text-white pointer-events-auto shadow-brand-500/10 md:group-hover:shadow-brand-500/20"
          />
        </div>
      </div>
    </>
  );
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin(user.email)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const MainContent = () => {
  const location = useLocation();
  const isMarketingPage = ['/', '/login', '/profile-setup', '/about', '/contact'].includes(location.pathname);

  return (
    <main
      className={`flex-1 w-full bg-bg-base text-text-primary overflow-auto scroll-smooth ${isMarketingPage ? 'pb-0' : 'pb-32'}`}
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/internships" element={<ProtectedRoute><InternshipPortal /></ProtectedRoute>} />
        <Route path="/advisor" element={<ProtectedRoute><AdvisorChat /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PrepPlanner /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><QuizMaker /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><PerformanceAnalyzer /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><NotesManager /></ProtectedRoute>} />
        <Route path="/transcript" element={<ProtectedRoute><TranscriptGenerator /></ProtectedRoute>} />
        <Route path="/video-transcript" element={<ProtectedRoute><VideoTranscriptGenerator /></ProtectedRoute>} />
        <Route path="/gpa" element={<ProtectedRoute><GPACalculator /></ProtectedRoute>} />
        <Route path="/timetable" element={<ProtectedRoute><Timetable /></ProtectedRoute>} />
        <Route path="/timer" element={<ProtectedRoute><PomodoroTimer /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
        <Route path="/tools" element={<ProtectedRoute><AllTools /></ProtectedRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
      </Routes>
    </main>
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme-preference');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme-preference', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Determine a minimum time to show the loading screen (e.g. 2.2s)
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 2200));

    // Failsafe: Hide loading screen after 5 seconds regardless of what happens
    const safetyTimeout = setTimeout(() => {
      setIsInitialLoading(false);
    }, 5000);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setUser(profile);
        } else {
          // New user - pre-fill from Google
          setUser({
            name: firebaseUser.displayName || 'Explorer',
            email: firebaseUser.email || '',
            targetRole: '',
            skills: [],
            graduationYear: '',
            currentLevel: 'Beginner',
            avatar: firebaseUser.photoURL || undefined
          });
        }
      } else {
        setUser(null);
      }

      // Hide loading screen after minimum display time AND Firebase check resolves
      minLoadTime.then(() => {
        setIsInitialLoading(false);
        clearTimeout(safetyTimeout);
      });
    }, (error) => {
      console.error("Auth error", error);
      setIsInitialLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const login = async (u?: UserProfile) => {
    // If a profile is passed (dev/mock), use it. Otherwise trigger Google Auth.
    if (u) {
      setUser(u);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login failed", e);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.clear();
  };

  const updateProfile = async (u: UserProfile) => {
    if (!auth.currentUser) return;
    await saveUserProfile(auth.currentUser.uid, u);
    setUser(u);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProfile }}>
      <ThemeContext.Provider value={{ isDark, toggleTheme }}>
        <AnimatePresence mode="wait">
          {isInitialLoading && <LoadingScreen key="loading-screen" />}
        </AnimatePresence>
        <Router>
          <div className="relative min-h-screen transition-colors bg-bg-base overflow-x-hidden flex flex-col">
            <GlobalUIOverlays isInitialLoading={isInitialLoading} />
            <MainContent key="main-app-content" />
          </div>
        </Router>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
};

export default App;
