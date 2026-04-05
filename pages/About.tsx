import React, { useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Github, 
  Linkedin, 
  Mail, 
  Code2, 
  Palette, 
  BrainCircuit, 
  Sparkles, 
  FileSearch, 
  Layers, 
  Clock, 
  Target, 
  Map as MapIcon, 
  Youtube, 
  BarChart3,
  MessageSquare
} from 'lucide-react';
import Ballpit from '../src/components/Ballpit';
import VariableProximity from '../src/components/VariableProximity';
import { useTheme } from '../App';

const teamMembers = [
  {
    name: "Aditya Acharya",
    role: "Lead Developer & UI Designer",
    contribution: "Developed core website foundation, UI design, login authentication system, resume builder, and transcript module.",
    icon: <Code2 className="w-6 h-6" />,
    color: "from-blue-500 to-cyan-500"
  },
  {
    name: "Snehal Chavan",
    role: "Feature Developer",
    contribution: "Implemented the Interview Preparation feature.",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Anushka Nandakumar",
    role: "UI/UX & Feature Developer",
    contribution: "Built the Notes Summarizer and contributed to the landing page design.",
    icon: <Palette className="w-6 h-6" />,
    color: "from-orange-500 to-red-500"
  },
  {
    name: "Aryan Algawe",
    role: "Feature Developer",
    contribution: "Developed the Flashcards feature based on uploaded notes/content.",
    icon: <Sparkles className="w-6 h-6" />,
    color: "from-yellow-400 to-orange-500"
  },
  {
    name: "Aditya Vijaykumar",
    role: "AI Systems Engineer",
    contribution: "Created an AI-powered timetable generator tailored to user goals and deadlines.",
    icon: <Clock className="w-6 h-6" />,
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "Tanisha Balekar",
    role: "AI Developer",
    contribution: "Designed the AI Quiz Maker with adaptive difficulty based on uploaded content.",
    icon: <BrainCircuit className="w-6 h-6" />,
    color: "from-indigo-500 to-blue-500"
  },
  {
    name: "Mandar Awatade",
    role: "Roadmap Architect",
    contribution: "Built the Skill Roadmap feature to guide users through structured learning paths.",
    icon: <MapIcon className="w-6 h-6" />,
    color: "from-cyan-500 to-blue-600"
  },
  {
    name: "Chinamy Santosh",
    role: "Media Systems Developer",
    contribution: "Developed the YouTube video transcriber to generate notes from video links.",
    icon: <Youtube className="w-6 h-6" />,
    color: "from-red-600 to-rose-500"
  },
  {
    name: "Bharat Sirmal",
    role: "Feedback Systems Engineer",
    contribution: "Enhanced the Interview Preparation feature by integrating a feedback system.",
    icon: <Target className="w-6 h-6" />,
    color: "from-emerald-600 to-teal-500"
  },
  {
    name: "Arpit Bolade",
    role: "Analytics Lead",
    contribution: "Created a Performance Analyzer to evaluate student performance and suggest improvements.",
    icon: <BarChart3 className="w-6 h-6" />,
    color: "from-violet-600 to-purple-600"
  }
];

const About: React.FC = () => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.215, 0.61, 0.355, 1] 
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-bg-base overflow-x-hidden font-sans">
      
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <Ballpit
          count={50}
          gravity={0.2}
          friction={0.9}
          wallBounce={0.95}
          followCursor
          colors={isDark ? [0x8B5CF6, 0x06B6D4, 0x7C3AED] : [0xC084FC, 0x22D3EE, 0x818CF8]}
        />
        <div className="absolute inset-0 bg-bg-base/60 backdrop-blur-[2px] pointer-events-none" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        
        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface/40 backdrop-blur-md border border-border-subtle text-text-primary hover:border-brand-500/50 transition-all duration-300 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">Back to Home</span>
          </Link>
        </motion.div>

        {/* Header Section */}
        <div className="max-w-4xl mb-16" ref={containerRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 mb-6">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Our Mission</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-text-primary mb-6 tracking-tighter cursor-default">
              <VariableProximity
                label="Meet the Visionaries"
                fromFontVariationSettings="'wght' 400"
                toFontVariationSettings="'wght' 900"
                containerRef={containerRef}
                radius={100}
                falloff="gaussian"
                className="block leading-none"
              />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-violet-400">
                Behind Synapse
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary font-medium leading-relaxed max-w-2xl">
              Synapse was born from a collective dream to redefine academic success through the power of Artificial Intelligence. 
              Meet the talented individuals who turned this vision into reality.
            </p>
          </motion.div>
        </div>

        {/* Team Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-br opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-[2.5rem] -z-10 bg-brand-500/30" />
              
              <div className="h-full p-6 rounded-3xl bg-surface/40 backdrop-blur-xl border border-border-subtle hover:border-brand-500/30 transition-all duration-300 flex flex-col shadow-xl shadow-black/5">
                
                {/* Member Icon */}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${member.color} flex items-center justify-center text-white mb-4 shadow-lg shadow-brand-500/20 group-hover:rotate-6 transition-transform duration-300`}>
                  {member.icon}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-brand-500 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-sm font-bold text-brand-500/80 uppercase tracking-widest mb-4">
                    {member.role}
                  </p>
                  <p className="text-text-secondary text-sm leading-relaxed font-medium">
                    {member.contribution}
                  </p>
                </div>

                {/* Social Placeholder */}
                <div className="mt-6 flex items-center gap-3 border-t border-border-subtle pt-5">
                  {[Github, Linkedin, Mail].map((Icon, i) => (
                    <button 
                      key={i}
                      className="w-10 h-10 rounded-xl bg-bg-base/50 flex items-center justify-center text-text-muted hover:text-brand-500 hover:bg-brand-500/10 transition-all duration-300"
                    >
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Join Us CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 p-10 md:p-14 rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-indigo-700 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
              Ready to elevate your learning?
            </h2>
            <p className="text-lg text-white/80 mb-10 font-medium">
              Join thousands of students who are already studying smarter with Synapse AI.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-brand-600 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Get Started for Free
              <ArrowLeft className="rotate-180" size={20} />
            </Link>
          </div>
        </motion.div>

        {/* Footer Text */}
        <div className="mt-20 text-center">
          <p className="text-text-muted text-sm font-semibold tracking-widest uppercase">
            Developed with Passion at Pillai College of Engineering (PCE)
          </p>
        </div>

      </div>
    </div>
  );
};

export default About;
