import React, { useState, useEffect } from 'react';
import { useUser, useTheme } from '../../App';
import { Sun, Moon, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardHeader() {
  const { user, logout } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isDashboard = location.pathname === '/dashboard';
  const [isExpanded, setIsExpanded] = useState(isDashboard);

  useEffect(() => {
    setIsExpanded(isDashboard);
  }, [location.pathname, isDashboard]);

  return (
    <div className="fixed top-6 right-8 z-[100] flex items-center justify-end gap-3 pointer-events-auto transition-all duration-300">
      
      {/* Theme Toggle collapses entirely when not expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            onClick={toggleTheme}
            className="p-3 bg-surface/80 backdrop-blur-md rounded-2xl border border-border-subtle shadow-md text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:scale-105 transition-all duration-300 group"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            ) : (
              <Moon size={20} className="group-hover:-rotate-90 transition-transform duration-500" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* User Profile Card */}
      <motion.div 
        layout
        className="bg-surface/80 backdrop-blur-md border border-border-subtle shadow-md flex items-center px-1"
        style={{ borderRadius: isExpanded ? '1.5rem' : '2rem' }}
      >
        <motion.button 
          layout="position"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`overflow-hidden flex items-center justify-center text-brand-500 flex-shrink-0 transition-all hover:scale-105 active:scale-95 ${
            isExpanded ? 'my-1 rounded-xl w-10 h-10 ml-1' : 'my-1 rounded-[1.7rem] w-12 h-12 -mx-0.5'
          }`}
          title={isExpanded ? "Collapse Header" : "Expand Header"}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
             <div className="w-full h-full bg-brand-500/20 border border-brand-500/10 flex items-center justify-center">
              <UserIcon size={20} />
             </div>
          )}
        </motion.button>
        
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center overflow-hidden"
            >
              <div className="flex flex-col ml-3 whitespace-nowrap">
                <p className="text-sm font-black text-text-primary tracking-tight leading-none mb-1 pr-6">{user?.name || 'Guest'}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{user?.targetRole || 'Explorer'}</span>
                  {user?.targetRole && (
                    <span className="flex items-center gap-1 bg-brand-500/10 px-1.5 py-0.5 rounded-md self-start mt-0.5">
                      <Sparkles size={8} className="text-brand-400" />
                      <span className="text-[8px] font-black text-brand-400 tracking-wider">AI</span>
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2 ml-1 mr-3 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
