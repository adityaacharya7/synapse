import React from 'react';
import { motion, Variants } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 1, backgroundColor: "#020617" }, // Opaque immediately to hide the website underneath
    visible: {
      opacity: 1,
      backgroundColor: "var(--bg-base)",
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      filter: "blur(10px)",
      transition: {
        duration: 0.8,
        ease: "easeInOut",
      },
    },
  };

  const letterVariants: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 100, damping: 10 },
    },
  };

  const logoText = "Synapse".split("");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-bg-base"
    >
      {/* ── Dynamic Animated Background ── */}
      {/* Tech grid that subtly zooms into view */}
      <motion.div 
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1.15, opacity: 0.15 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at center, var(--color-brand-600) 2px, transparent 2px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* Cinematic Floating Auroras */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
        animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.5, 1], rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-brand-600/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [1.3, 0.8, 1.3], rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-1/4 translate-x-1/4 translate-y-1/4 w-[45vw] h-[45vw] bg-indigo-500/20 rounded-full blur-[130px] mix-blend-screen pointer-events-none"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.4, 0.8], y: [-50, 50, -50] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-fuchsia-500/15 rounded-full blur-[100px] mix-blend-screen pointer-events-none"
      />

      <div className="relative flex flex-col items-center">
        {/* Animated logo text */}
        <div className="flex">
          {logoText.map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-7xl md:text-[8rem] font-black font-logo drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-br from-white via-brand-200 to-brand-600 dark:from-white dark:via-brand-300 dark:to-brand-700"
              style={{ 
                display: "inline-block",
                padding: "0.4em 0.5em",   
                margin: "-0.4em -0.5em", 
                lineHeight: "1.2",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Brain/Sparkle Loading Icon underneath */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
          className="mt-16 flex items-center gap-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full"
          />
          <span className="text-sm font-bold text-text-muted tracking-widest uppercase">Initializing</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
