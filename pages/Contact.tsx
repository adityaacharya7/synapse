import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Linkedin,
  MapPin,
  Send,
  MessageSquare,
  Sparkles,
  Phone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Ballpit from '../src/components/Ballpit';
import VariableProximity from '../src/components/VariableProximity';
import { useTheme } from '../App';

const Contact: React.FC = () => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    }, 1500);
  };

  const contactMethods = [
    {
      icon: <Mail className="w-6 h-6" />,
      label: "Email",
      value: "contact@synapse.ai",
      link: "mailto:contact@synapse.ai",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Linkedin className="w-6 h-6" />,
      label: "LinkedIn",
      value: "Synapse AI Platform",
      link: "https://linkedin.com",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Location",
      value: "Pillai College of Engineering, New Panvel",
      link: "https://www.pce.ac.in/",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden font-sans">
      
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface/40 backdrop-blur-md border border-border-subtle text-text-primary hover:border-brand-500/50 transition-all duration-300 group shadow-lg shadow-black/5"
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
              <MessageSquare size={14} className="animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Get In Touch</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-text-primary mb-6 tracking-tighter cursor-default">
              <VariableProximity
                label="Let's Start a"
                fromFontVariationSettings="'wght' 400"
                toFontVariationSettings="'wght' 900"
                containerRef={containerRef}
                radius={100}
                falloff="gaussian"
                className="block leading-none"
              />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-violet-400">
                Conversation
              </span>
            </h1>

            <p className="text-lg md:text-xl text-text-secondary font-medium leading-relaxed max-w-2xl">
              Have questions about Synapse? We're here to help you revolutionize your study experience.
              Send us a message and our team will get back to you shortly.
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-500/20 to-indigo-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative p-8 md:p-10 rounded-[2rem] bg-surface/40 backdrop-blur-3xl border border-border-subtle shadow-2xl shadow-black/10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Your Name</label>
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-5 py-4 rounded-xl bg-bg-base/50 border border-border-subtle focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium text-text-primary placeholder:text-text-muted/50"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Email Address</label>
                      <input
                        required
                        type="email"
                        placeholder="john@example.com"
                        className="w-full px-5 py-4 rounded-xl bg-bg-base/50 border border-border-subtle focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium text-text-primary placeholder:text-text-muted/50"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Subject</label>
                    <input
                      required
                      type="text"
                      placeholder="How can we help?"
                      className="w-full px-5 py-4 rounded-xl bg-bg-base/50 border border-border-subtle focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium text-text-primary placeholder:text-text-muted/50"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Message</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us more about your inquiry..."
                      className="w-full px-5 py-4 rounded-xl bg-bg-base/50 border border-border-subtle focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-medium text-text-primary placeholder:text-text-muted/50 resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    disabled={status === 'submitting'}
                    type="submit"
                    className="w-full py-5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-black text-lg shadow-xl shadow-brand-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                  >
                    <AnimatePresence mode="wait">
                      {status === 'idle' && (
                        <motion.div
                          key="idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3"
                        >
                          Send Message
                          <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </motion.div>
                      )}
                      
                      {status === 'submitting' && (
                        <motion.div
                          key="submitting"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"
                        />
                      )}

                      {status === 'success' && (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle2 size={24} />
                          Sent Successfully
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="lg:col-span-2 space-y-6">
            {contactMethods.map((method, index) => (
              <motion.a
                key={index}
                href={method.link}
                target={method.label === "Location" ? "_blank" : undefined}
                rel={method.label === "Location" ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                whileHover={{ x: 10, scale: 1.02 }}
                className="block p-6 rounded-3xl bg-surface/40 backdrop-blur-xl border border-border-subtle hover:border-brand-500/30 transition-all duration-300 shadow-xl shadow-black/5 group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform duration-300 flex-shrink-0`}>
                    {method.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-brand-500 uppercase tracking-widest mb-1">{method.label}</h4>
                    <p className="text-lg font-bold text-text-primary break-words">{method.value}</p>
                  </div>
                </div>
              </motion.a>
            ))}

            {/* Extra Decorative Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="p-8 rounded-[2rem] bg-gradient-to-br from-brand-600 to-indigo-700 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <Sparkles size={32} className="mb-4 text-brand-200 opacity-80" />
                <h4 className="text-xl font-black mb-2 leading-tight">Fast Response Guaranteed</h4>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                  Our dedicated support team typically responds within 24 hours to help with your academic needs.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-20 text-center">
          <p className="text-text-muted text-sm font-semibold tracking-widest uppercase">
            Built for Students by Students | Pills College of Engineering
          </p>
        </div>

      </div>
    </div>
  );
};

export default Contact;
