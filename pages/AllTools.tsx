import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Brain, BookOpen, Sparkles, AudioLines, Youtube,
  Timer, TrendingUp, Calculator, CalendarDays, Settings, Map, FileText,
  Search, ArrowUpRight, X, Clock
} from 'lucide-react';

const allTools = [
  { path: '/advisor', icon: MessageSquare, label: 'Study Buddy', group: 'Learn', color: 'text-purple-400', description: 'AI-powered tutor for personalized learning and guidance.', tags: ['AI', 'Chat'], badge: 'POPULAR' },
  { path: '/quiz', icon: Brain, label: 'Quiz Maker', group: 'Learn', color: 'text-pink-400', description: 'Generate quizzes from your study notes instantly with AI.', tags: ['AI', 'Quiz'], badge: 'NEW' },
  { path: '/notes', icon: BookOpen, label: 'Notes', group: 'Learn', color: 'text-blue-400', description: 'Organize and manage your digital study materials efficiently.', tags: ['Study', 'Notes'] },
  { path: '/flashcards', icon: Sparkles, label: 'Flashcards', group: 'Learn', color: 'text-amber-400', description: 'Master any subject with AI-generated spaced repetition.', tags: ['AI', 'Flashcards'] },
  { path: '/transcript', icon: AudioLines, label: 'Transcripts', group: 'Media', color: 'text-pink-400', description: 'Convert audio recordings into readable, searchable text.', tags: ['Media', 'Audio'] },
  { path: '/video-transcript', icon: Youtube, label: 'Video Transcript', group: 'Media', color: 'text-red-500', description: 'Extract and summarize key insights from YouTube videos.', tags: ['AI', 'Video'], badge: 'NEW' },
  { path: '/timer', icon: Timer, label: 'Focus Timer', group: 'Track', color: 'text-teal-400', description: 'Boost productivity with customizable Pomodoro sessions.', tags: ['Tools', 'Focus'] },
  { path: '/performance', icon: TrendingUp, label: 'Performance', group: 'Track', color: 'text-amber-400', description: 'Track your academic progress and gain actionable insights.', tags: ['Analytics', 'Insights'], badge: 'POPULAR' },
  { path: '/gpa', icon: Calculator, label: 'GPA Calculator', group: 'Track', color: 'text-blue-400', description: 'Calculate and forecast your academic standing easily.', tags: ['Tools', 'Grades'] },
  { path: '/timetable', icon: CalendarDays, label: 'Timetable', group: 'Track', color: 'text-blue-400', description: 'Manage your weekly class schedule and important deadlines.', tags: ['Tools', 'Schedule'] },
  { path: '/planner', icon: Settings, label: 'Exam Prep', group: 'Build', color: 'text-gray-400', description: 'Strategic AI-driven preparation for your upcoming exams.', tags: ['AI', 'Study'] },
  { path: '/roadmap', icon: Map, label: 'Skill Roadmap', group: 'Build', color: 'text-green-400', description: 'Personalized learning path to master any new technology.', tags: ['Career', 'Path'] },
  { path: '/resume', icon: FileText, label: 'Resume Builder', group: 'Build', color: 'text-purple-400', description: 'Craft professional resumes with intelligent AI assistance.', tags: ['Career', 'Resume'] },
  { path: '/interview', icon: MessageSquare, label: 'Interview Prep', group: 'Build', color: 'text-purple-400', description: 'Practice coding and behavioral interviews in a simulation.', tags: ['Career', 'Interview'] },
];

const FILTER_TABS = ['All', 'AI Tools', 'Study', 'Career', 'Media', 'Track'];

const mockRecentlyUsed = [
  { path: '/advisor', label: 'Study Buddy', icon: MessageSquare, color: 'text-purple-400' },
  { path: '/quiz', label: 'Quiz Maker', icon: Brain, color: 'text-pink-400' },
  { path: '/flashcards', label: 'Flashcards', icon: Sparkles, color: 'text-amber-400' },
];

export default function AllTools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');

  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return allTools.filter(t => {
      const matchesSearch = !query ||
        t.label.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query)) ||
        t.group.toLowerCase().includes(query);

      const matchesTab = selectedTab === 'All' ||
        (selectedTab === 'AI Tools' && t.tags.includes('AI')) ||
        (selectedTab === 'Study' && (t.group === 'Learn' || t.tags.includes('Study'))) ||
        (selectedTab === 'Career' && t.group === 'Build') ||
        (selectedTab === 'Media' && t.group === 'Media') ||
        (selectedTab === 'Track' && t.group === 'Track');

      return matchesSearch && matchesTab;
    });
  }, [searchQuery, selectedTab]);

  const groups = Array.from(new Set(allTools.map(t => t.group)));

  return (
    <div className="p-8 pt-6 pb-32 max-w-[1600px] mx-auto min-h-screen">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mr-0 md:mr-24">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-black text-text-primary tracking-tight lg:text-3xl">Command Center</h1>
            <p className="text-text-secondary text-sm font-medium opacity-70">
              Your academic power-suite at a glance.
            </p>
          </div>
          
          <div className="relative w-full md:w-72 lg:w-80 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-brand-500 transition-colors">
              <Search size={16} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-surface border border-border-subtle rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/20 transition-all text-sm font-medium"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-text-muted hover:text-text-primary transition-colors p-1"
                >
                  <X size={14} strokeWidth={3} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Filter Pills & Recently Used */}
      <div className="space-y-6 mb-12">
        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
          {FILTER_TABS.map((tab) => {
            const isActive = selectedTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap border ${
                  isActive 
                    ? 'bg-brand-500/5 text-brand-500 border-brand-500/30' 
                    : 'bg-surface text-text-muted border-transparent hover:bg-surface-hover hover:text-text-secondary hover:border-border-subtle/50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Recently Used - Compact Chips */}
        {!searchQuery && selectedTab === 'All' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-text-muted/60">
              <Clock size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Recently Visited</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {mockRecentlyUsed.map((tool) => {
                const colorBase = tool.color.split('-')[1];
                return (
                  <Link
                    key={tool.path}
                    to={tool.path}
                    className="flex items-center gap-2.5 px-3 py-1.5 bg-surface/50 border border-border-subtle rounded-xl hover:bg-surface hover:border-brand-500/20 hover:shadow-sm transition-all group shrink-0"
                  >
                    <div className={`p-1.5 rounded-lg bg-${colorBase}-500/10 transition-colors`}>
                      <tool.icon size={14} className={`${tool.color}`} />
                    </div>
                    <span className="text-[13px] font-bold text-text-secondary group-hover:text-text-primary transition-colors pr-1">{tool.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-16">
        {groups.map(group => {
          const toolsInGroup = filteredTools.filter(t => t.group === group);
          if (toolsInGroup.length === 0) return null;

          return (
            <div key={group} className="space-y-4">
              {/* Section Header - Closer to grid */}
              <div className="flex items-center gap-3 py-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-muted whitespace-nowrap">
                    {group}
                  </h2>
                  <div className="bg-surface border border-border-subtle px-1.5 py-0.5 rounded-md text-[10px] font-black text-text-primary shadow-sm min-w-[20px] flex items-center justify-center">
                    {toolsInGroup.length}
                  </div>
                </div>
                <div className="h-[1px] w-full bg-gradient-to-r from-border-subtle/40 to-transparent" />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                {toolsInGroup.map((tool) => {
                  // Explicitly map text colors to background colors to ensure Tailwind JIT picks them up
                  const colorMap: Record<string, string> = {
                    'text-purple-400': 'bg-purple-500',
                    'text-pink-400': 'bg-pink-500',
                    'text-blue-400': 'bg-blue-500',
                    'text-amber-400': 'bg-amber-500',
                    'text-teal-400': 'bg-teal-500',
                    'text-red-500': 'bg-red-500',
                    'text-green-400': 'bg-green-500',
                    'text-gray-400': 'bg-gray-500',
                  };
                  const accentColor = colorMap[tool.color] || 'bg-brand-500';
                  const colorBase = tool.color.split('-')[1];
                  
                  return (
                    <Link
                      key={tool.path}
                      to={tool.path}
                      className="block h-full group"
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="p-5 h-full bg-surface border border-border-subtle rounded-3xl flex flex-col gap-4 shadow-sm hover:shadow-xl hover:border-brand-500/10 transition-all cursor-pointer relative overflow-hidden"
                      >
                        {/* Hover Top Accent */}
                        <div className={`absolute top-0 left-0 right-0 h-[3px] transition-all duration-500 transform scale-x-0 group-hover:scale-x-100 origin-center z-20 ${accentColor}`} />

                        <div className="flex items-start justify-between relative">
                          <div className={`p-3 rounded-2xl w-14 h-14 flex items-center justify-center border border-border-subtle/50 group-hover:border-transparent transition-all duration-500 relative overflow-hidden bg-${colorBase}-500/10`}>
                            <tool.icon size={24} className={`${tool.color} transition-transform duration-500 group-hover:scale-110 z-10`} />
                            <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-${colorBase}-500`} />
                          </div>
                          
                          {tool.badge && (
                            <span className={`absolute top-0 right-0 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase ring-1 ring-inset ${
                              tool.badge === 'POPULAR' 
                                ? 'bg-amber-500/5 text-amber-500 ring-amber-500/20' 
                                : 'bg-emerald-500/5 text-emerald-500 ring-emerald-500/20'
                            }`}>
                              {tool.badge}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 lg:mt-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-text-primary group-hover:text-brand-500 transition-colors text-[16px] tracking-tight">
                              {tool.label}
                            </h3>
                            <ArrowUpRight size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                          </div>
                          <p className="text-[13px] text-text-secondary line-clamp-2 leading-snug min-h-[38px] opacity-80">
                            {tool.description}
                          </p>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border-subtle/30">
                          {tool.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-lg bg-bg-base/60 border border-border-subtle text-[10px] text-text-muted font-bold group-hover:text-text-secondary transition-colors">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface border border-border-subtle mb-4 text-text-muted">
            <Search size={32} strokeWidth={1.5} />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No tools found</h3>
          <p className="text-text-secondary">Try searching for something else or browse categories.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTab('All'); }}
            className="mt-6 px-5 py-2 bg-brand-500 text-white rounded-lg font-bold hover:bg-brand-600 transition-colors"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>

  );
}


