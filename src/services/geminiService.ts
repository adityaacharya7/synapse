
import { GoogleGenAI, Type } from "@google/genai";
import { RoadmapData, PrepPlan, UserProfile, ATSAnalysis, ChatMessage, QuizQuestion, SubjectScore, InterviewQuestion, Flashcard } from "../../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDynamicRoadmap = async (
  role: string
): Promise<RoadmapData> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert curriculum architect. Generate a complete skill roadmap for the job role: "${role}", inspired by roadmap.sh.

    This roadmap must:
    - Match industry expectations
    - Be beginner-friendly but complete
    - Follow clear learning progression
    - Be structured as a visual roadmap / mind map
    
    OUTPUT FORMAT (STRICT — JSON ONLY):
    {
      "role": "${role}",
      "roadmap_style": "roadmap.sh",
      "sections": [
        {
          "section_name": "Internet",
          "learning_stage": "Early",
          "nodes": [
            {
              "id": "internet_basics",
              "label": "How the Internet Works",
              "order": 1,
              "mandatory": true,
              "description": "Short reasoning why this matters."
            }
          ]
        }
      ],
      "dependencies": [
        { "from": "node_id", "to": "node_id" }
      ],
      "learning_notes": {
        "order_not_strict": true,
        "beginner_friendly": true
      }
    }
    
    Ensure you include mandatory sections like Foundations, Core Languages, Frameworks, Tooling, Deployment, etc. appropriate for the role.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          roadmap_style: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section_name: { type: Type.STRING },
                learning_stage: { type: Type.STRING },
                nodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      order: { type: Type.NUMBER },
                      mandatory: { type: Type.BOOLEAN },
                      description: { type: Type.STRING }
                    },
                    required: ["id", "label", "order", "mandatory"]
                  }
                }
              },
              required: ["section_name", "learning_stage", "nodes"]
            }
          },
          dependencies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                from: { type: Type.STRING },
                to: { type: Type.STRING }
              },
              required: ["from", "to"]
            }
          },
          learning_notes: {
            type: Type.OBJECT,
            properties: {
              order_not_strict: { type: Type.BOOLEAN },
              beginner_friendly: { type: Type.BOOLEAN }
            },
            required: ["order_not_strict", "beginner_friendly"]
          }
        },
        required: ["role", "roadmap_style", "sections", "dependencies", "learning_notes"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const getCareerAdvice = async (history: { role: string; content: string }[], profile: UserProfile) => {
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are Synapse Study Buddy, an AI academic assistant. Help students understand concepts, solve problems, plan study schedules, prepare for exams, and improve their academic performance. Be encouraging, clear, and concise. Use examples when explaining complex topics.`,
    }
  });
  const lastMessage = history[history.length - 1].content;
  const result = await chat.sendMessage({ message: lastMessage });
  return result.text;
};

export const generatePrepPlan = async (examSubject: string, days: number, currentLevel: string): Promise<any> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a gamified exam preparation quest for a student preparing for exams in the subject/field: "${examSubject}" over ${days} days at ${currentLevel} proficiency level.
    
    The quest should be focused on:
    - Mastering key concepts and topics in ${examSubject}
    - Building study habits and revision strategies
    - Practicing past paper questions and problem-solving
    - Time management and exam technique
    
    OUTPUT JSON ONLY:
    {
      "questName": "The ${examSubject} Conquest",
      "mainObjective": "Brief exam mastery objective string",
      "dailyQuests": [
        { "id": "d1", "title": "Study/Revision Task 1", "xp": 20, "bonus": "optional bonus tip" },
        { "id": "d2", "title": "Practice Problem Task 2", "xp": 40, "bonus": null }
      ],
      "bossBattle": {
        "name": "Week 1 Challenge: [Topic/Chapter]",
        "requirements": [
          { "label": "Revision Milestone 1", "progress": "0/10" },
          { "label": "Practice Problems Solved", "progress": "0/5" }
        ],
        "rewards": ["Mastery Badge", "Topic Completion"]
      },
      "debuffs": [
        { "title": "Risk 1", "desc": "Study Risk Effect", "fix": "Mitigation Strategy" }
      ]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questName: { type: Type.STRING },
          mainObjective: { type: Type.STRING },
          dailyQuests: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                xp: { type: Type.NUMBER },
                bonus: { type: Type.STRING }
              },
              required: ["id", "title", "xp"]
            }
          },
          bossBattle: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              requirements: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, progress: { type: Type.STRING } }, required: ["label", "progress"] }
              },
              rewards: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "requirements", "rewards"]
          },
          debuffs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, desc: { type: Type.STRING }, fix: { type: Type.STRING } },
              required: ["title", "desc", "fix"]
            }
          }
        },
        required: ["questName", "mainObjective", "dailyQuests", "bossBattle", "debuffs"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateDailyQuests = async (examSubject: string, dayNumber: number, currentLevel: string): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 3 fresh, specific daily study quests for Day ${dayNumber} of an exam preparation campaign for the subject/field: "${examSubject}" (Proficiency: ${currentLevel}).
    
    Focus on:
    - Concept revision and note-taking
    - Practice problems, past paper questions, or flashcard drills
    - Active recall and spaced repetition techniques
    
    OUTPUT JSON ARRAY ONLY:
    [
      { "id": "d_${dayNumber}_1", "title": "Study Task 1", "xp": 30, "bonus": "optional study tip" },
      { "id": "d_${dayNumber}_2", "title": "Practice Task 2", "xp": 50, "bonus": null },
      { "id": "d_${dayNumber}_3", "title": "Revision Task 3", "xp": 20, "bonus": null }
    ]`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            xp: { type: Type.NUMBER },
            bonus: { type: Type.STRING }
          },
          required: ["id", "title", "xp"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const analyzeResumeATS = async (
  resumeData: any,
  targetRole: string,
  jobDescription: string = "NONE",
  experienceLevel: string = "Junior",
  industry: string = "Tech",
  fileData?: { data: string; mimeType: string }
): Promise<ATSAnalysis> => {

  const systemPrompt = `
    You are an expert ATS (Applicant Tracking System) analyst, professional resume writer, and technical recruiter.

    Analyze the provided resume strictly from an ATS + recruiter screening perspective.
    Be honest, decisive, and actionable. Avoid generic advice.

    INPUT CONTEXT:
    - TARGET_ROLE: ${targetRole}
    - JOB_DESCRIPTION: ${jobDescription}
    - EXPERIENCE_LEVEL: ${experienceLevel}
    - INDUSTRY: ${industry}

    Your output must strictly follow the JSON schema provided to populate the following sections:
    
    1. ATS SCORE: Current score, Projected score after fixes, Confidence level, and Top 3 factors lowering the score.
    2. METRICS BREAKDOWN: Keywords, Role Alignment, Impact, Formatting, Completeness. Identify the Top 2 "ATS Killers".
    3. HIGH-IMPACT FIXES: Rewrite weak bullets. Provide conservative vs aggressive options if needed (choose one best fit), explain WHY it works (quantification, keywords).
    4. KEYWORD GAP ANALYSIS: Classify into Critical (Must-have), Important, and Nice-to-have. Suggest where to add them.
    5. VERDICT: "Not ATS Ready", "Partially Ready", or "Interview Ready". Estimated time to fix.
    6. RECRUITER REALITY CHECK: A blunt 1-2 line assessment of performance.
  `;

  let requestContents;

  if (fileData) {
    // Multimodal Request (File + Text)
    requestContents = {
      parts: [
        {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data
          }
        },
        {
          text: systemPrompt
        }
      ]
    };
  } else {
    // Text-only Request
    requestContents = {
      parts: [
        {
          text: `${systemPrompt}\n\nRESUME_TEXT:\n${JSON.stringify(resumeData)}`
        }
      ]
    };
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: requestContents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ats_score: {
            type: Type.OBJECT,
            properties: {
              total: { type: Type.NUMBER },
              projected_score: { type: Type.STRING },
              confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              breakdown: {
                type: Type.OBJECT,
                properties: {
                  keyword_relevance: { type: Type.NUMBER },
                  formatting: { type: Type.NUMBER },
                  content_strength: { type: Type.NUMBER },
                  role_alignment: { type: Type.NUMBER },
                  completeness: { type: Type.NUMBER }
                },
                required: ["keyword_relevance", "formatting", "content_strength", "role_alignment", "completeness"]
              },
              summary: { type: Type.STRING },
              top_factors: { type: Type.ARRAY, items: { type: Type.STRING } },
              ats_killers: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["total", "projected_score", "confidence", "breakdown", "summary", "top_factors", "ats_killers"]
          },
          keyword_analysis: {
            type: Type.OBJECT,
            properties: {
              critical: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, frequency: { type: Type.STRING }, placement_suggestion: { type: Type.STRING } } }
              },
              important: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, frequency: { type: Type.STRING }, placement_suggestion: { type: Type.STRING } } }
              },
              nice_to_have: {
                type: Type.ARRAY,
                items: { type: Type.OBJECT, properties: { keyword: { type: Type.STRING }, frequency: { type: Type.STRING }, placement_suggestion: { type: Type.STRING } } }
              },
            },
            required: ["critical", "important", "nice_to_have"]
          },
          bullet_improvements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                original: { type: Type.STRING },
                improved: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["Weak", "Average", "Strong"] },
                improvement_type: { type: Type.STRING },
                rewrite_mode: { type: Type.STRING, enum: ["Conservative", "Aggressive"] },
                why_it_works: { type: Type.ARRAY, items: { type: Type.STRING } },
                issue_note: { type: Type.STRING }
              },
              required: ["original", "improved", "status", "why_it_works"]
            }
          },
          formatting_feedback: {
            type: Type.OBJECT,
            properties: {
              issues: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          verdict: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ["Not ATS Ready", "Partially Ready", "Interview Ready"] },
              reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
              time_to_fix: { type: Type.STRING }
            },
            required: ["status", "reasons", "time_to_fix"]
          },
          recruiter_reality_check: { type: Type.STRING }
        },
        required: ["ats_score", "keyword_analysis", "bullet_improvements", "verdict", "recruiter_reality_check"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const chatWithResume = async (
  chatHistory: ChatMessage[],
  resumeContext: any,
  currentMessage: string
): Promise<string> => {

  const contextString = typeof resumeContext === 'string'
    ? resumeContext
    : JSON.stringify(resumeContext);

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a Resume Copilot. The user has uploaded their resume and received an ATS analysis.
      
      RESUME CONTEXT:
      ${contextString.substring(0, 5000)}

      Your goal is to answer specific questions to help them improve it.
      - If they ask "rewrite this", provide a concrete, better version.
      - If they ask about formatting, give specific advice.
      - Keep answers concise and actionable.
      `,
    }
  });

  const result = await chat.sendMessage({ message: currentMessage });
  return result.text || "I couldn't process that request.";
};

// ── Quiz Maker ──
export const generateQuiz = async (
  topic: string,
  noteText: string = '',
  difficulty: string = 'Medium',
  count: number = 10
): Promise<QuizQuestion[]> => {
  const contextPart = noteText
    ? `\n\nThe student has provided the following notes as context — base your questions on this material:\n${noteText.substring(0, 8000)}`
    : '';

  const diffInstruction = difficulty === 'Mixed'
    ? 'with a balanced mix of Easy, Medium, and Hard difficulties'
    : `at ${difficulty} difficulty level`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert quiz generator. Generate exactly ${count} multiple-choice questions about "${topic}" ${diffInstruction}.${contextPart}

    Each question MUST have exactly 4 options. The "correct" field is the 0-based index of the correct option.
    The "explanation" field should explain WHY the correct answer is right in 1-2 sentences.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correct: { type: Type.NUMBER },
            explanation: { type: Type.STRING }
          },
          required: ["id", "question", "options", "correct", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

// ── Performance Analyzer ──
export const analyzeStudentPerformance = async (
  subjects: SubjectScore[],
  examName: string,
  targetRole: string = '',
  currentLevel: string = 'Beginner'
): Promise<{
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
  subjectAnalyses?: any[];
  studyPlan?: any;
  expectedSemesterScore?: number;
  motivationalFeedback?: string;
}> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert academic counselor analyzing student performance across two internal assessments (IA1 and IA2)${targetRole ? ` aiming for a career as a ${targetRole}` : ''} (level: ${currentLevel}).

    Context:
    Exam Context: ${examName}
    Subjects Data: ${JSON.stringify(subjects)}

    Provide a highly detailed JSON response:
    1. strengths: 3-5 specific strengths based on high-scoring or improving subjects.
    2. weaknesses: 3-5 specific weaknesses based on low-scoring or declining subjects.
    3. improvementPlan: 5-8 ACTIONABLE, SPECIFIC steps to improve weak areas.
    4. subjectAnalyses: Analyze each subject's trend between IA1 and IA2 (Improvement/Decline/Stable), assign a performance level (Excellent/Good/Average/Needs Improvement), flag if it needs urgent attention, and assign a focus priority (High/Medium/Low).
    5. studyPlan: Generate a personalized study plan with a daily schedule array, a weekly strategy string, and time allocation percentages based on weak/moderate/strong subjects.
    6. expectedSemesterScore: Predict a realistic % score out of 100 for the upcoming semester exam based on current trends.
    7. motivationalFeedback: A 2-3 sentence encouraging message.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          subjectAnalyses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                trend: { type: Type.STRING, enum: ['Improvement', 'Decline', 'Stable'] },
                performanceLevel: { type: Type.STRING, enum: ['Excellent', 'Good', 'Average', 'Needs Improvement'] },
                needsUrgentAttention: { type: Type.BOOLEAN },
                focusPriority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
              },
              required: ["subject", "trend", "performanceLevel", "needsUrgentAttention", "focusPriority"]
            }
          },
          studyPlan: {
            type: Type.OBJECT,
            properties: {
              dailySchedule: { type: Type.ARRAY, items: { type: Type.STRING } },
              weeklyStrategy: { type: Type.STRING },
              timeAllocation: {
                type: Type.OBJECT,
                properties: {
                  weakSubjectsPercentage: { type: Type.NUMBER },
                  moderateSubjectsPercentage: { type: Type.NUMBER },
                  strongSubjectsPercentage: { type: Type.NUMBER }
                },
                required: ["weakSubjectsPercentage", "moderateSubjectsPercentage", "strongSubjectsPercentage"]
              }
            },
            required: ["dailySchedule", "weeklyStrategy", "timeAllocation"]
          },
          expectedSemesterScore: { type: Type.NUMBER },
          motivationalFeedback: { type: Type.STRING }
        },
        required: ["strengths", "weaknesses", "improvementPlan", "subjectAnalyses", "studyPlan", "expectedSemesterScore", "motivationalFeedback"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

// ── Notes Summarizer ──
export const summarizeNotes = async (
  rawText: string,
  subject: string = 'General'
): Promise<{
  summary: string;
  keyPoints: string[];
  importantTerms: string[];
  likelyQuestions: string[];
}> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert study assistant. Analyze the following ${subject} notes and produce a comprehensive study guide.

    NOTES:
    ${rawText.substring(0, 15000)}

    Provide:
    1. summary: A clear, well-structured summary (3-5 paragraphs)
    2. keyPoints: 5-10 critical takeaways
    3. importantTerms: 5-15 key terms/definitions a student must know
    4. likelyQuestions: 5-8 questions likely to appear in an exam on this material`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          importantTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
          likelyQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "keyPoints", "importantTerms", "likelyQuestions"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

// ── Transcript Generator ──
export const generateTranscript = async (
  rawText: string,
  subject: string = 'General',
  fileData?: { data: string; mimeType: string }
): Promise<{
  tldr: string;
  sections: { heading: string; content: string; keyConcepts: string[] }[];
  actionItems: string[];
}> => {
  const systemPrompt = `You are an expert lecture organizer. Structure the following ${subject} lecture content into a clean, organized transcript.

  Provide:
  1. tldr: A 2-3 sentence summary of the entire lecture
  2. sections: Break the content into logical sections, each with a heading, the cleaned-up content, and key concepts highlighted
  3. actionItems: 3-5 action items the student should follow up on after this lecture`;

  let requestContents: any;
  if (fileData) {
    requestContents = {
      parts: [
        { inlineData: { mimeType: fileData.mimeType, data: fileData.data } },
        { text: systemPrompt }
      ]
    };
  } else {
    requestContents = `${systemPrompt}\n\nLECTURE TEXT:\n${rawText.substring(0, 15000)}`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: requestContents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tldr: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                content: { type: Type.STRING },
                keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["heading", "content", "keyConcepts"]
            }
          },
          actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["tldr", "sections", "actionItems"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
// ── Native Video Transcript Generator ──
export const generateNativeVideoTranscript = async (
  videoUrl: string,
  subject: string = 'General'
): Promise<{
  tldr: string;
  sections: { heading: string; content: string; keyConcepts: string[] }[];
  actionItems: string[];
}> => {
  const prompt = `You are an expert lecture organizer. Watch the provided YouTube video lecture about ${subject} and generate a structured transcript and study notes. Ensure you process the video's actual audio and visual content.

  Provide your response strictly in JSON matching the schema below:
  1. tldr: A 2-3 sentence summary of the entire video lecture
  2. sections: Break the content into logical sections, each with a heading, the detailed content (at least 2 paragraphs per section), and key concepts highlighted
  3. actionItems: 3-5 action items the student should follow up on after this lecture`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      role: "user",
      parts: [
        { fileData: { fileUri: videoUrl, mimeType: "video/mp4" } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tldr: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                content: { type: Type.STRING },
                keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["heading", "content", "keyConcepts"]
            }
          },
          actionItems: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["tldr", "sections", "actionItems"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};


// ── Image Parsers ──
export const parseTimetableImage = async (fileData: { data: string; mimeType: string }) => {
  const systemPrompt = `You are a highly capable AI assistant that excels at parsing structured data from images. 
Your task is to analyze the provided image of a class timetable or schedule and extract all class entries.

Organize the extracted data into a JSON object matching this TypeScript type:
type DaySchedule = {
  id: string; // generate a unique ID, e.g., cls_1234
  subject: string; // The name of the class or subject
  time: string; // Start time in 24-hour HH:mm format
  endTime: string; // End time in 24-hour HH:mm format
  location: string; // Room number or location
  color: string; // Leave empty, to be assigned by the app
}[];
Record<string, DaySchedule> // where keys are 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'

Make your best guess for missing information based on the context, but don't invent things.
Ensure the times are strictly formatted as HH:mm (e.g., "09:00", "14:30").`;

  const requestContents = {
    parts: [
      { inlineData: { mimeType: fileData.mimeType, data: fileData.data } },
      { text: systemPrompt }
    ]
  };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: requestContents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          Monday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, subject: { type: Type.STRING }, time: { type: Type.STRING }, endTime: { type: Type.STRING }, location: { type: Type.STRING }, color: { type: Type.STRING } } } },
          Tuesday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, subject: { type: Type.STRING }, time: { type: Type.STRING }, endTime: { type: Type.STRING }, location: { type: Type.STRING }, color: { type: Type.STRING } } } },
          Wednesday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, subject: { type: Type.STRING }, time: { type: Type.STRING }, endTime: { type: Type.STRING }, location: { type: Type.STRING }, color: { type: Type.STRING } } } },
          Thursday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, subject: { type: Type.STRING }, time: { type: Type.STRING }, endTime: { type: Type.STRING }, location: { type: Type.STRING }, color: { type: Type.STRING } } } },
          Friday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, subject: { type: Type.STRING }, time: { type: Type.STRING }, endTime: { type: Type.STRING }, location: { type: Type.STRING }, color: { type: Type.STRING } } } },
          Saturday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, subject: { type: Type.STRING }, time: { type: Type.STRING }, endTime: { type: Type.STRING }, location: { type: Type.STRING }, color: { type: Type.STRING } } } },
          Sunday: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, subject: { type: Type.STRING }, time: { type: Type.STRING }, endTime: { type: Type.STRING }, location: { type: Type.STRING }, color: { type: Type.STRING } } } },
        }
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateInterviewQuestions = async (
  role: string,
  difficulty: string,
  count: number
): Promise<InterviewQuestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an expert interviewer for ${role} positions. Generate ${count} interview questions for a ${difficulty} level candidate.

    OUTPUT FORMAT (STRICT — JSON ONLY):
    [
      {
        "id": "q1",
        "question": "Tell me about yourself.",
        "category": "Behavioral",
        "difficulty": "Easy",
        "expectedAnswer": "Brief overview of background, experience, and goals.",
        "tips": ["Keep it under 2 minutes", "Focus on relevant experience"]
      }
    ]

    Categories: Technical, Behavioral, Situational, Problem-solving, Company-specific.
    Ensure questions are realistic and cover key aspects of the role.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            category: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
            expectedAnswer: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["id", "question", "category", "difficulty", "expectedAnswer", "tips"]
        }
      }
    }
  });

  return JSON.parse(response.text || '[]');
};

export const analyzeInterviewResponse = async (
  question: string,
  response: string,
  expectedAnswer: string
): Promise<{ feedback: string; score: number; confidenceScore: number; improvement: string }> => {
  const prompt = `Analyze this interview response for a professional role.

Question: ${question}
Candidate Response: ${response}
Expected Answer: ${expectedAnswer}

Provide:
1. feedback: Detailed, constructive feedback on the content and delivery.
2. score: A score out of 10 based on accuracy and professionalism.
3. confidenceScore: A score out of 10 representing how confident and decisive the response sounds.
4. improvement: A "Better Way to Say This" version that is more professional, concise, and impactful.

Output JSON: { "feedback": "...", "score": 7, "confidenceScore": 8, "improvement": "..." }`;

  const aiResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING },
          score: { type: Type.NUMBER },
          confidenceScore: { type: Type.NUMBER },
          improvement: { type: Type.STRING }
        },
        required: ["feedback", "score", "confidenceScore", "improvement"]
      }
    }
  });

  return JSON.parse(aiResponse.text || '{"feedback": "Unable to analyze", "score": 5, "confidenceScore": 5, "improvement": "Try to be more specific."}');
};

export const generateOverallInterviewFeedback = async (
  role: string,
  difficulty: string,
  responses: { questionId: string; response: string; feedback: string; score: number; confidenceScore: number; improvement: string }[]
): Promise<{ summary: string; strengths: string[]; weaknesses: string[]; recommendation: string }> => {
  const prompt = `You are a senior recruiter analyzing a candidate's full mock interview performance.
  
  ROLE: ${role}
  DIFFICULTY: ${difficulty}
  INTERVIEW DATA: ${JSON.stringify(responses)}

  Provide:
  1. summary: A professional summary of the overall performance (3-4 sentences).
  2. strengths: Top 3 strengths demonstrated.
  3. weaknesses: Top 3 areas for improvement.
  4. recommendation: A "Hire/No Hire/Maybe" verdict with a brief explanation.

  Output JSON: { "summary": "...", "strengths": ["..."], "weaknesses": ["..."], "recommendation": "..." }`;

  const aiResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          recommendation: { type: Type.STRING }
        },
        required: ["summary", "strengths", "weaknesses", "recommendation"]
      }
    }
  });

  return JSON.parse(aiResponse.text || '{"summary": "Unable to provide overall feedback.", "strengths": [], "weaknesses": [], "recommendation": "Check individual responses."}');
};

// ── Flashcard Generator ──
export const generateFlashcards = async (
  topic: string,
  noteText: string = '',
  count: number = 10
): Promise<Flashcard[]> => {
  const contextPart = noteText
    ? `\n\nUse these notes to create the flashcards:\n${noteText.substring(0, 8000)}`
    : '';

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate exactly ${count} high-quality study flashcards about "${topic}". ${contextPart}
    
    Each flashcard should follow active recall principles:
    - "front": A clear, concise question or term.
    - "back": A direct, accurate answer.
    - "explanation": (Optional) Additional context or memory tip.
    
    Return the cards as a JSON array of objects.
    
    Example:
    [
      { "front": "What is Mitochondria?", "back": "The powerhouse of the cell.", "explanation": "It generates most of the cell's supply of adenosine triphosphate (ATP)." }
    ]`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            front: { type: Type.STRING },
            back: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["front", "back"]
        }
      }
    }
  });

  const rawCards = JSON.parse(response.text || '[]');
  return rawCards.map((card: any, index: number) => ({
    id: `card_${Date.now()}_${index}`,
    front: card.front,
    back: card.back,
    explanation: card.explanation || '',
    interval: 0,
    easeFactor: 2.5,
    nextReview: new Date().toISOString(),
    consecutiveCorrect: 0
  }));
};

