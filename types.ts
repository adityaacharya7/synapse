
export interface QuestData {
  questName: string;
  mainObjective: string;
  dailyQuests: {
    id: string;
    title: string;
    xp: number;
    bonus: string | null;
  }[];
  bossBattle: {
    name: string;
    requirements: { label: string; progress: string }[];
    rewards: string[];
  };
  debuffs: {
    title: string;
    desc: string;
    fix: string;
  }[];
}

export interface QuestProgress {
  active: boolean;
  role: string;
  days: number;
  startDate: string; // ISO String
  lastDailyRefresh?: string; // ISO String of last refresh date
  level: string;
  xp: number;
  cumulativeXp?: number; // Total points earned across all activities
  userLevel: number; // The gamified level (1-10)
  completedDailies: string[]; // List of IDs
  questData: QuestData;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  targetRole: string;
  skills: string[];
  graduationYear: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  atsScore?: number;
  questProgress?: QuestProgress;
  atsBreakdown?: {
    keyword_relevance: number;
    formatting: number;
    content_strength: number;
    role_alignment: number;
    completeness: number;
  };
}

export interface Resource {
  title: string;
  link: string;
  type: string;
}

export interface RoadmapNode {
  id: string;
  label: string;
  order: number;
  mandatory: boolean;
  description?: string; // Optional field for UI richness
  resources?: Resource[];
}

export interface RoadmapSection {
  section_name: string;
  learning_stage: string;
  nodes: RoadmapNode[];
}

export interface RoadmapData {
  role: string;
  roadmap_style: string;
  sections: RoadmapSection[];
  dependencies: { from: string; to: string }[];
  learning_notes: {
    order_not_strict: boolean;
    beginner_friendly: boolean;
  };
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  type: 'Internship' | 'Co-op' | 'Full-time' | 'Remote';
  location: string;
  stipend: string;
  skills: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Stretch';
  eligibleYear: number[]; // Changed to array for multiple batches
  postedDate: string;
  deadline: string;
  isVerified: boolean;
  verificationSource?: string; // e.g. "Placement Cell"
}

export interface PrepPlan {
  dailyPlan: string;
  milestones: string[];
  riskAlerts: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface KeywordGap {
  keyword: string;
  frequency: string; // e.g. "High in JD"
  placement_suggestion: string; // e.g. "Skills Section"
}

export interface ATSAnalysis {
  ats_score: {
    total: number;
    projected_score: string;
    confidence: 'High' | 'Medium' | 'Low';
    breakdown: {
      keyword_relevance: number;
      formatting: number;
      content_strength: number;
      role_alignment: number;
      completeness: number;
    };
    summary: string;
    top_factors: string[]; // Top 3 factors lowering score
    ats_killers: string[]; // Top 2 damaging issues
  };
  keyword_analysis: {
    critical: KeywordGap[];
    important: KeywordGap[];
    nice_to_have: KeywordGap[];
  };
  bullet_improvements: {
    original: string;
    improved: string;
    status: 'Weak' | 'Average' | 'Strong';
    improvement_type: string;
    rewrite_mode: 'Conservative' | 'Aggressive';
    why_it_works: string[];
    issue_note?: string; // E.g. "Reduces score by X points..."
  }[];
  formatting_feedback: {
    issues: string[];
    suggestions: string[];
  };
  verdict: {
    status: 'Not ATS Ready' | 'Partially Ready' | 'Interview Ready';
    reasons: string[];
    time_to_fix: string;
  };
  recruiter_reality_check: string; // Blunt assessment
}

// ── Quiz Maker ──
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string; // Sub-topic for analytics
}

export interface QuizSession {
  id: string;
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  score: number;
  total: number;
  createdAt: string;
  timeTaken: number; // Total time in seconds
  xpGained: number; // XP earned in this session
  accuracy: number; // Score/Total * 100
  badges: string[]; // Badges earned in this session
  userAnswers: (number | null)[]; // To track which questions were missed for weak topic detection
}

// ── Performance Analyzer ──
export interface SubjectScore {
  subject: string;
  score?: number; // Legacy
  maxScore?: number; // Legacy
  ia1Score: number;
  ia1Max: number;
  ia2Score: number;
  ia2Max: number;
  attendance?: number;
  grade: string;
}

export interface StudyPlan {
  dailySchedule: string[];
  weeklyStrategy: string;
  timeAllocation: {
    weakSubjectsPercentage: number;
    moderateSubjectsPercentage: number;
    strongSubjectsPercentage: number;
  };
}

export interface SubjectAnalysis {
  subject: string;
  trend: 'Improvement' | 'Decline' | 'Stable';
  performanceLevel: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  needsUrgentAttention: boolean;
  focusPriority: 'High' | 'Medium' | 'Low';
}

export interface PerformanceReport {
  id: string;
  examName: string;
  subjects: SubjectScore[];
  overallPercent: number;
  strengths: string[];
  weaknesses: string[];
  subjectAnalyses?: SubjectAnalysis[];
  studyPlan?: StudyPlan;
  expectedSemesterScore?: number;
  motivationalFeedback?: string;
  improvementPlan: string[];
  createdAt: string;
}

// ── Notes Summarizer ──
export interface SavedNote {
  id: string;
  title: string;
  subject: string;
  rawText: string;
  summary: string;
  keyPoints: string[];
  importantTerms: string[];
  likelyQuestions: string[];
  createdAt: string;
}

// ── Transcript Generator ──
export interface TranscriptSection {
  heading: string;
  content: string;
  keyConcepts: string[];
}

export interface SavedTranscript {
  id: string;
  title: string;
  subject: string;
  tldr: string;
  sections: TranscriptSection[];
  actionItems: string[];
  createdAt: string;
}

// ── Interview Prep ──
export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedAnswer: string;
  tips: string[];
}

export interface InterviewSession {
  id: string;
  role: string;
  difficulty: string;
  questions: InterviewQuestion[];
  responses: { 
    questionId: string; 
    response: string; 
    feedback: string; 
    score: number;
    confidenceScore: number;
    improvement: string;
  }[];
  overallScore: number;
  createdAt: string;
}

// ── Flashcard SRS ──
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  explanation?: string;
  interval: number; // in days
  easeFactor: number; // default 2.5
  nextReview: string; // ISO string
  consecutiveCorrect: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  createdAt: string;
  lastStudied?: string;
}

