import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface ToolCardProps {
  path: string;
  icon: LucideIcon;
  label: string;
  description: string;
  color: string;
  isFeatured?: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ path, icon: Icon, label, description, color, isFeatured }) => {
  return (
    <Link to={path} className={isFeatured ? "col-span-1 md:col-span-2" : "col-span-1"}>
      <motion.div
        whileHover={{ 
          y: -6,
          scale: 1.01,
          boxShadow: isFeatured 
            ? "0 20px 40px -15px rgba(139, 92, 246, 0.3)" 
            : "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
        }}
        whileTap={{ scale: 0.98 }}
        className={`relative h-full p-6 rounded-[1.5rem] border transition-all duration-300 group overflow-hidden ${
          isFeatured 
            ? "bg-gradient-to-br from-brand-600/10 to-indigo-600/10 border-brand-500/30 dark:border-brand-500/20 shadow-lg shadow-brand-500/5 hover:border-brand-500/50" 
            : "bg-surface border-border-subtle hover:border-brand-400/40"
        }`}
      >
        {/* Glow / Neon Effect */}
        <div className={`absolute -inset-2 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none ${
          isFeatured ? "bg-brand-500/10" : "bg-sky-500/5"
        }`} />

        <div className="relative z-10 flex flex-col h-full gap-4">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl border transition-colors duration-300 ${
              isFeatured 
                ? "bg-brand-500/20 border-brand-500/30 group-hover:bg-brand-500/30" 
                : "bg-bg-base border-border-subtle group-hover:border-brand-400/30 group-hover:bg-brand-500/5"
            }`}>
              <Icon size={isFeatured ? 28 : 22} className={`${color} transition-transform duration-300 group-hover:scale-110`} />
            </div>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-brand-500"
            >
              Open <ArrowRight size={12} />
            </motion.div>
          </div>

          <div>
            <h3 className={`font-black tracking-tight transition-colors duration-300 ${
              isFeatured 
                ? "text-xl md:text-2xl text-text-primary dark:text-white mb-1" 
                : "text-base text-text-primary dark:text-gray-100 group-hover:text-brand-500"
            }`}>
              {label}
            </h3>
            <p className={`text-sm leading-relaxed ${
              isFeatured 
                ? "text-text-secondary dark:text-zinc-400 font-medium max-w-[80%]" 
                : "text-text-muted dark:text-zinc-500 font-normal"
            }`}>
              {description}
            </p>
          </div>
          
          {isFeatured && (
            <div className="mt-auto pt-4 flex items-center gap-2">
               <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 text-[10px] font-bold uppercase tracking-widest border border-brand-500/20">
                 Featured AI Tool
               </span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
};

export default ToolCard;
