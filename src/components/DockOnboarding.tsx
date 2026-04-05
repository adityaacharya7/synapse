import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MousePointer2, Layout, X } from 'lucide-react';

const DockOnboarding = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('synapse_dock_onboarding_seen');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('synapse_dock_onboarding_seen', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/20 bg-white/80 dark:bg-[#0b0c10]/80 p-8 shadow-2xl backdrop-blur-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-brand-500/20 blur-[60px]" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-sky-500/20 blur-[60px]" />

            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} className="text-text-muted" />
            </button>

            <div className="relative space-y-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 shadow-inner">
                <Sparkles size={32} className="animate-pulse" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-text-primary dark:text-white">
                  Meet Your New Dock
                </h2>
                <p className="text-text-secondary dark:text-zinc-400">
                  We've reimagined how you navigate Synapse. Fluid, responsive, and always ready.
                </p>
              </div>

              <div className="grid gap-4 text-left">
                <div className="flex items-start gap-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 transition-colors hover:bg-brand-500/5">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                    <MousePointer2 size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary dark:text-white">Hover to Reveal</h4>
                    <p className="text-sm text-text-secondary dark:text-zinc-500">Move your mouse to the bottom bar to unveil your essential toolset.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 transition-colors hover:bg-brand-500/5">
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Layout size={18} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary dark:text-white">Fluid Magnification</h4>
                    <p className="text-sm text-text-secondary dark:text-zinc-500">The dock expands dynamically as you explore, focusing on what matters.</p>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDismiss}
                className="w-full rounded-xl bg-brand-600 py-4 font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-700 hover:shadow-brand-500/40"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DockOnboarding;
