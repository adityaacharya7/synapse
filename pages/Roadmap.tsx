import React, { useState, useEffect } from 'react';
import {
    Map,
    Loader2,
    RefreshCcw,
    Terminal,
    CheckCircle2,
    BookOpen,
    Info,
    Trophy,
    Target,
    ArrowRight
} from 'lucide-react';
import { generateDynamicRoadmap } from '../src/services/geminiService';
import { RoadmapData, RoadmapNode } from '../types';

const Roadmap: React.FC = () => {
    const [role, setRole] = useState('Frontend Developer');
    const [data, setData] = useState<RoadmapData | null>(null);
    const [loading, setLoading] = useState(false);
    const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
    const [progress, setProgress] = useState(0);
    const [totalMandatory, setTotalMandatory] = useState(0);

    const fetchRoadmap = async () => {
        if (!role.trim()) return;
        setLoading(true);
        try {
            const result = await generateDynamicRoadmap(role);
            setData(result);
            setCompletedNodes(new Set()); // Reset progress on new roadmap
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (data) {
            let total = 0;
            data.sections.forEach(sec => {
                total += sec.nodes.filter(n => n.mandatory).length;
            });
            setTotalMandatory(total);
            const mandatoryCompleted = Array.from(completedNodes).filter(id => {
                let isMandatory = false;
                data.sections.forEach(s => {
                    const node = s.nodes.find(n => n.id === id);
                    if (node && node.mandatory) isMandatory = true;
                });
                return isMandatory;
            }).length;
            
            setProgress(total === 0 ? 0 : Math.round((mandatoryCompleted / total) * 100));
        }
    }, [completedNodes, data]);

    const toggleNode = (id: string) => {
        const next = new Set(completedNodes);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCompletedNodes(next);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors font-sans">
            {/* Control Sidebar */}
            <aside className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900/50 backdrop-blur-xl z-50 overflow-y-auto p-6 space-y-8 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.1)]">
                <header>
                    <h1 className="text-2xl font-black dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-xl text-brand-600 dark:text-brand-400">
                            <Map size={24} />
                        </div>
                        <span className="font-logo text-3xl pb-1 bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Synapse</span>
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 ml-1">Career Map</p>
                </header>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Role</label>
                    <div className="relative group">
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all group-hover:border-slate-300 dark:group-hover:border-slate-700"
                            placeholder="e.g. Backend Engineer"
                            onKeyDown={(e) => e.key === 'Enter' && fetchRoadmap()}
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <Terminal size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={fetchRoadmap}
                    disabled={loading || !role.trim()}
                    className="group relative w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold hover:bg-brand-600 dark:hover:bg-brand-500 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative flex items-center gap-3">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />}
                        Generate Path
                    </span>
                </button>

                {data && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Progress Card */}
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-slate-800 relative overflow-hidden group shadow-2xl">
                            <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                                <Trophy size={100} className="text-white" />
                            </div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Your Journey</h3>
                            <div className="flex items-baseline gap-1 mb-4">
                                <span className="text-4xl font-black text-white tracking-tighter">{progress}</span>
                                <span className="text-lg font-bold text-slate-500">%</span>
                            </div>
                            <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                                <div 
                                    className="h-full bg-gradient-to-r from-brand-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-4 flex items-center justify-between">
                                <span>Mandatory Skills</span>
                                <span className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">{totalMandatory}</span>
                            </p>
                        </div>
                    </div>
                )}
            </aside>

            {/* Visualization Canvas */}
            <main className="flex-1 relative overflow-auto custom-scrollbar flex flex-col bg-slate-50 dark:bg-slate-950">
                {/* Premium Background Grid */}
                <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-60 z-0"></div>
                
                {/* Decorative Gradients */}
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
                <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

                {!data && !loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8 z-10">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-brand-500/20 blur-xl rounded-full scale-110 group-hover:scale-150 transition-transform duration-500" />
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center text-brand-500 dark:text-brand-400 shadow-2xl relative z-10 animate-bounce" style={{ animationDuration: '3s' }}>
                                <Map size={40} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Map Your Future</h2>
                            <p className="text-slate-500 text-sm leading-relaxed">Enter your desired role in the sidebar and Synapse will architect a highly detailed, industry-standard roadmap to get you there.</p>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-8 z-10">
                        <div className="relative">
                            <div className="w-24 h-24 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
                            <div className="absolute inset-0 border-4 border-transparent border-t-brand-500 border-r-purple-500 rounded-full animate-spin" />
                            <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-500 opacity-50" size={24} />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Architecting Roadmap</p>
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-ping" />
                                Analyzing Industry Standards
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 p-6 md:p-12 z-10">
                        <div className="max-w-5xl mx-auto pb-32">
                            {/* Roadmap Header */}
                            <div className="text-center mb-24 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-slate-200 dark:border-slate-800 shadow-xl shadow-brand-500/5 mb-6">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                                    </span>
                                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Live Interactive Curriculum</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {data.role}
                                </h1>
                                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Your personalized, step-by-step guide to mastering the skills required for this career path.</p>
                            </div>

                            <div className="space-y-4 md:space-y-0 relative">
                                {data.sections.map((section, sIndex) => (
                                    <div key={sIndex} className="relative z-10 mb-24 md:mb-32 animate-in slide-in-from-bottom-12 duration-1000 fill-mode-both" style={{ animationDelay: `${sIndex * 150}ms` }}>
                                        {/* Section Milestone Marker */}
                                        <div className="flex justify-center mb-12 md:mb-16 sticky top-8 z-30">
                                            <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl px-8 py-4 rounded-full font-black text-sm md:text-base shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] flex items-center gap-3 border border-slate-200 dark:border-slate-800 group cursor-default transition-transform hover:scale-105">
                                                <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                                                    <Target size={16} className="text-brand-600 dark:text-brand-400 group-hover:rotate-90 transition-transform duration-500" />
                                                </div>
                                                <span className="uppercase tracking-widest bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                                                    {section.section_name}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            {/* Beautiful Gradient Spine Line (Desktop only) */}
                                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1.5 md:-translate-x-[3px] hidden md:block rounded-full bg-slate-200 dark:bg-slate-800/50">
                                                {/* Animated fill effect could go here if we calculated height per section */}
                                            </div>

                                            <div className="space-y-8 md:space-y-16 px-4 md:px-0 relative">
                                                {section.nodes.sort((a, b) => a.order - b.order).map((node, nIndex) => {
                                                    const isCompleted = completedNodes.has(node.id);
                                                    const isLeft = nIndex % 2 === 0;

                                                    return (
                                                        <div key={node.id} className="group relative flex md:w-full md:justify-center items-center">
                                                            {/* Line connection branch (Desktop) */}
                                                            <div className={`hidden md:block absolute top-1/2 h-0.5 bg-slate-200 dark:bg-slate-800/80 z-0 transition-colors ${isCompleted ? 'bg-brand-500 dark:bg-brand-500/50' : ''} ${isLeft ? 'right-1/2 left-[15%] lg:left-[25%]' : 'left-1/2 right-[15%] lg:right-[25%]'}`} />

                                                            {/* Spine Dot Indicator (Desktop) */}
                                                            <div className={`hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 z-20 items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-brand-500 border-white dark:border-slate-950 shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-110' : 'bg-slate-100 dark:bg-slate-900 border-white dark:border-slate-950 group-hover:border-brand-200 dark:group-hover:border-slate-800'}`}>
                                                                {isCompleted ? <CheckCircle2 size={18} className="text-white" /> : <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>}
                                                            </div>

                                                            {/* Node Card - Automatically placed Left or Right on desktop */}
                                                            <div className={`w-full md:w-[45%] flex z-10 ${isLeft ? 'md:mr-auto md:justify-end md:pr-16 lg:pr-24' : 'md:ml-auto md:justify-start md:pl-16 lg:pl-24'}`}>
                                                                <div 
                                                                    onClick={() => toggleNode(node.id)}
                                                                    className={`
                                                                        w-full relative p-6 md:p-8 rounded-[2rem] border transition-all duration-500 cursor-pointer text-left backdrop-blur-xl group/card
                                                                        ${isCompleted 
                                                                            ? 'bg-brand-50/80 dark:bg-brand-900/20 border-brand-300/50 dark:border-brand-500/30 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)] shadow-xl' 
                                                                            : 'bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-brand-400/50 dark:hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1'
                                                                        }
                                                                    `}
                                                                >
                                                                    {/* Inner Glow effect on hover */}
                                                                    <div className={`absolute inset-0 rounded-[2rem] opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/50 to-transparent dark:from-white/5`}></div>

                                                                    <div className="flex justify-between items-start mb-5 relative z-10">
                                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all duration-500 ${isCompleted ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover/card:bg-brand-100 dark:group-hover/card:bg-slate-700/50 group-hover/card:text-brand-600 dark:group-hover/card:text-brand-400'}`}>
                                                                            {isCompleted ? <CheckCircle2 size={20} /> : node.order}
                                                                        </div>
                                                                        {node.mandatory ? (
                                                                            <span className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm transition-colors ${isCompleted ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20'}`}>
                                                                                Required
                                                                            </span>
                                                                        ) : (
                                                                            <span className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-full tracking-wider transition-colors ${isCompleted ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                                                                                Optional
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <h3 className={`text-xl md:text-2xl font-black mb-3 tracking-tight transition-colors duration-300 relative z-10 ${isCompleted ? 'text-brand-900 dark:text-brand-100' : 'text-slate-900 dark:text-white group-hover/card:text-brand-600 dark:group-hover/card:text-brand-400'}`}>
                                                                        {node.label}
                                                                    </h3>
                                                                    
                                                                    {node.description && (
                                                                        <p className={`text-sm md:text-base leading-relaxed relative z-10 transition-colors ${isCompleted ? 'text-brand-700/80 dark:text-brand-200/60' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                            {node.description}
                                                                        </p>
                                                                    )}

                                                                    {node.resources && node.resources.length > 0 ? (
                                                                        <div className={`mt-6 pt-5 border-t transition-all duration-500 relative z-10 ${isCompleted ? 'border-brand-200 dark:border-brand-800/50' : 'border-slate-100 dark:border-slate-800 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0'}`}>
                                                                            <div className="flex items-center gap-2 text-[11px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-4">
                                                                                <BookOpen size={16} /> Recommended Resources
                                                                            </div>
                                                                            <ul className="space-y-3">
                                                                                {node.resources.map((res, rIndex) => (
                                                                                    <li key={rIndex} className="flex flex-col">
                                                                                        <a 
                                                                                            href={res.link} 
                                                                                            target="_blank" 
                                                                                            rel="noopener noreferrer"
                                                                                            onClick={(e) => e.stopPropagation()}
                                                                                            className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 transition-colors flex items-center gap-2 group/link"
                                                                                        >
                                                                                            {res.title}
                                                                                            <ArrowRight size={12} className="text-brand-500 opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0 transition-all duration-300" />
                                                                                        </a>
                                                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{res.type}</span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`mt-6 pt-5 border-t flex items-center justify-between transition-all duration-500 relative z-10 ${isCompleted ? 'border-brand-200 dark:border-brand-800/50' : 'border-slate-100 dark:border-slate-800 opacity-0 group-hover/card:opacity-100 translate-y-2 group-hover/card:translate-y-0'}`}>
                                                                            <div className="flex items-center gap-2 text-[11px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:text-brand-700 transition-colors">
                                                                                <BookOpen size={16} /> Recommended Resources
                                                                            </div>
                                                                            <ArrowRight size={16} className={`text-brand-500 opacity-0 group-hover/card:opacity-100 -translate-x-4 group-hover/card:translate-x-0 transition-all duration-300 ${isCompleted ? 'opacity-100 translate-x-0' : ''}`} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Job Ready Marker */}
                                <div className="flex justify-center pt-16 pb-32 animate-in fade-in zoom-in duration-1000 delay-1000 fill-mode-both">
                                    <div className="px-10 py-5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-full font-black text-xl shadow-[0_0_50px_-10px_rgba(139,92,246,0.5)] flex items-center gap-4 hover:scale-105 transition-transform duration-500 cursor-default">
                                        <Trophy size={24} className="animate-bounce" style={{ animationDuration: '2s' }} />
                                        Job Ready!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Roadmap;
