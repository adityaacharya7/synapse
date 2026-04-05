
import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  Banknote,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  FileText,
  Map as MapIcon,
  ExternalLink,
  Bookmark,
  Briefcase,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Internship } from '../types';
import { useUser } from '../App';

import { fetchJobs, Job } from '../src/services/jobService';

// Extended to include external links for the MVP
interface ExtendedInternship extends Internship {
  applyLink: string;
}

type FilterType = 'All' | 'Recommended' | 'Saved' | 'Applied';

const InternshipPortal: React.FC = () => {
  const { user } = useUser();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [opportunities, setOpportunities] = useState<ExtendedInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setLoading(true);
    fetchJobs(user).then(jobs => {
      // Map generic JobService jobs to the rich ExtendedInternship format
      const mapped: ExtendedInternship[] = jobs.map(j => ({
        id: j.id,
        company: j.company,
        role: j.title,
        type: j.title.toLowerCase().includes('intern') ? 'Internship' : 'Full-time',
        location: j.location,
        stipend: 'Competitive', // Defaults since API might not have it
        skills: j.tags.slice(0, 4), // Limit to 4 tags
        difficulty: 'Medium', // Default for MVP
        eligibleYear: [2024, 2025, 2026],
        postedDate: new Date(j.date).toLocaleDateString(),
        deadline: 'Open',
        isVerified: true,
        applyLink: j.url
      }));
      setOpportunities(mapped);
      setLoading(false);
    });
  }, [user]);

  // Local state for tracking interactions (simulating backend)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  // Application Flow State
  const [selectedOpportunity, setSelectedOpportunity] = useState<ExtendedInternship | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // --- Logic: Analysis & Readiness ---

  const getMatchAnalysis = (opportunity: ExtendedInternship) => {
    if (!user) return { score: 0, missing: [], matches: [], status: 'Unknown', readiness: 'Unknown', color: 'gray' };

    const userSkillsLower = user.skills.map(s => s.toLowerCase());
    const requiredSkills = opportunity.skills;

    const matches = requiredSkills.filter(s => userSkillsLower.includes(s.toLowerCase()));
    const missing = requiredSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()));

    // Weighted Calculation
    let rawScore = (matches.length / requiredSkills.length) * 70;
    const yearMatch = opportunity.eligibleYear.includes(parseInt(user.graduationYear));
    if (yearMatch) rawScore += 30;

    const score = Math.round(rawScore);

    // AI Readiness State
    let readiness = 'Stretch';
    let color = 'text-red-500';
    let status = 'High Effort Needed';

    if (score >= 80) {
      readiness = 'Ready to Apply';
      color = 'text-green-600';
      status = 'Top Candidate';
    } else if (score >= 50) {
      readiness = 'Prepare (1-2 Weeks)';
      color = 'text-yellow-600';
      status = 'Good Potential';
    }

    return { score, missing, matches, status, readiness, color, yearMatch };
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(item => {
      const matchesSearch = item.role.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase());

      const analysis = getMatchAnalysis(item);

      if (filterType === 'Recommended') return matchesSearch && analysis.score >= 60;
      if (filterType === 'Saved') return matchesSearch && savedIds.has(item.id);
      if (filterType === 'Applied') return matchesSearch && appliedIds.has(item.id);

      return matchesSearch;
    }).sort((a, b) => {
      // Prioritize saved/applied in general view, else score
      if (savedIds.has(b.id) && !savedIds.has(a.id)) return 1;
      return getMatchAnalysis(b).score - getMatchAnalysis(a).score;
    });
  }, [search, filterType, user, savedIds, appliedIds, opportunities]);


  // --- Handlers ---

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSaved = new Set(savedIds);
    if (newSaved.has(id)) newSaved.delete(id);
    else newSaved.add(id);
    setSavedIds(newSaved);
  };

  const initiateApply = (opp: ExtendedInternship) => {
    setSelectedOpportunity(opp);
  };

  const confirmExternalApply = () => {
    if (!selectedOpportunity) return;

    setIsApplying(true);

    // Simulate logging and redirect
    setTimeout(() => {
      window.open(selectedOpportunity.applyLink, '_blank');
      const newApplied = new Set(appliedIds);
      newApplied.add(selectedOpportunity.id);
      setAppliedIds(newApplied);
      setIsApplying(false);
      setSelectedOpportunity(null);
    }, 1500);
  };

  return (
    <div className="p-8 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 pb-24">

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b dark:border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-100 dark:border-brand-900/30">
            <Zap size={12} /> Live Opportunity Radar
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Career Opportunities</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl">
            AI-curated roles matched to your <span className="text-brand-600 dark:text-brand-400 font-bold">Skill Profile</span>.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search roles or companies..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 outline-none text-sm font-bold dark:text-white shadow-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Smart Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'All', label: 'All Roles', icon: <Briefcase size={14} /> },
          { id: 'Recommended', label: 'For You', icon: <Sparkles size={14} className="text-purple-500" /> },
          { id: 'Saved', label: 'Saved', icon: <Bookmark size={14} className="text-orange-500" /> },
          { id: 'Applied', label: 'Applied', icon: <CheckCircle2 size={14} className="text-green-500" /> }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setFilterType(filter.id as FilterType)}
            className={`
               flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap
               ${filterType === filter.id
                ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/20'
                : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-800 hover:border-brand-300'
              }
             `}
          >
            {filter.icon} {filter.label}
          </button>
        ))}
      </div>

      {/* Opportunities List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-100 dark:bg-slate-800 rounded-[2rem] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <React.Fragment>
            {filteredOpportunities.slice(0, visibleCount).map((item) => {
              const analysis = getMatchAnalysis(item);
              const isSaved = savedIds.has(item.id);
              const isApplied = appliedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={`
                group relative bg-white dark:bg-slate-900 p-8 rounded-[2rem] border transition-all duration-300
                ${analysis.score >= 80
                      ? 'border-green-100 dark:border-green-900/30 hover:border-green-300'
                      : 'border-gray-100 dark:border-slate-800 hover:border-brand-300'
                    }
                hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none
              `}
                >
                  {/* Top Meta Bar */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      {item.isVerified && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <ShieldCheck size={12} /> Verified
                        </span>
                      )}
                      {isApplied && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Applied
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => toggleSave(item.id, e)}
                      className={`p-3 rounded-xl transition-all ${isSaved ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 hover:bg-orange-50 hover:text-orange-500'}`}
                    >
                      <Bookmark size={18} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left: Role Info */}
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl font-black text-gray-700 dark:text-gray-300 border dark:border-slate-700">
                          {item.company[0]}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-tight group-hover:text-brand-600 transition-colors">{item.role}</h3>
                          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">{item.company}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Badge icon={<MapPin size={12} />} text={item.location} />
                        <Badge icon={<Banknote size={12} />} text={item.stipend} />
                        <Badge icon={<Clock size={12} />} text={`Due: ${item.deadline}`} />
                      </div>

                      {/* Action Bridge (The "Killer Feature") */}
                      <div className="p-5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Readiness Analysis</p>
                          <span className={`text-xs font-black ${analysis.color} uppercase tracking-wider`}>{analysis.readiness}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {/* Matching Skills */}
                          {analysis.matches.map(s => (
                            <span key={s} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-lg flex items-center gap-1.5 opacity-70">
                              <CheckCircle2 size={12} className="text-green-500" /> {s}
                            </span>
                          ))}

                          {/* Missing Skills with Actions */}
                          {analysis.missing.map(s => (
                            <Link
                              to="/roadmap"
                              key={s}
                              className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-red-100 transition-colors group/skill"
                            >
                              <AlertTriangle size={12} /> {s}
                              <span className="ml-1 px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded text-[9px] font-black uppercase tracking-wider shadow-sm group-hover/skill:text-brand-600">
                                Bridge Gap
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score & Primary Action */}
                    <div className="flex flex-row lg:flex-col justify-between items-center lg:items-end gap-6 lg:min-w-[240px] border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">

                      <div className="text-center lg:text-right">
                        <div className="flex items-end justify-center lg:justify-end gap-2">
                          <span className="text-4xl font-black dark:text-white">{analysis.score}%</span>
                          <span className="text-xs font-bold text-gray-400 mb-2">Match</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Based on {user?.skills.length} skills & batch</p>
                      </div>

                      <div className="w-full lg:w-auto flex flex-col gap-3">
                        {isApplied ? (
                          <div className="w-full px-8 py-4 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                            <CheckCircle2 size={18} /> Applied
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => initiateApply(item)}
                              className={`
                                    w-full px-8 py-4 rounded-xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95
                                    ${analysis.score >= 50
                                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                                  : 'bg-white dark:bg-slate-800 text-brand-600 border border-brand-200 dark:border-slate-700 hover:bg-brand-50'
                                }
                                `}
                            >
                              Apply Now <ExternalLink size={18} />
                            </button>

                            {analysis.score < 80 && (
                              <Link
                                to="/advisor"
                                className="text-center text-[10px] font-black text-gray-400 hover:text-brand-600 uppercase tracking-widest flex items-center justify-center gap-1 transition-colors"
                              >
                                <Sparkles size={12} /> Ask AI how to prepare
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {visibleCount < filteredOpportunities.length && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="px-8 py-4 bg-white dark:bg-slate-900 border dark:border-slate-800 text-gray-900 dark:text-white font-bold rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
                >
                  Load More Opportunities <ChevronRight size={16} />
                </button>
              </div>
            )}
          </React.Fragment>
        )}

        {!loading && filteredOpportunities.length === 0 && (
          <div className="text-center py-24 bg-gray-50 dark:bg-slate-900 rounded-[3rem] border-2 border-dashed dark:border-slate-800">
            <div className="w-20 h-20 bg-gray-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-6">
              <Filter size={32} />
            </div>
            <h3 className="text-xl font-black dark:text-white">No matches found</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">Try clearing filters or bridging skill gaps in your Roadmap.</p>
            <button onClick={() => setFilterType('All')} className="mt-6 px-6 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl font-bold text-sm shadow-sm hover:text-brand-600">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* External Apply Confirmation Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">

            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 rounded-3xl flex items-center justify-center mx-auto text-brand-600 dark:text-brand-400 mb-2">
                <ExternalLink size={32} />
              </div>
              <h3 className="text-2xl font-black dark:text-white">External Application</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                You are about to visit the official career page for <span className="font-bold text-gray-900 dark:text-white">{selectedOpportunity.company}</span>.
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex gap-2 items-start">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <p>We will automatically mark this role as <b>"Applied"</b> in your tracker so you can follow up later.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmExternalApply}
                disabled={isApplying}
                className="flex-1 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                {isApplying ? <Loader2 size={20} className="animate-spin" /> : 'Go to Application'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

const Badge: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400 border dark:border-slate-700 whitespace-nowrap">
    {icon} {text}
  </div>
);

export default InternshipPortal;
