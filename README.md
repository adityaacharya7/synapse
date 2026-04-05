# Synapse — AI-Powered Study Platform

## 🎓 Academic Details
- **Course:** Natural Language Processing (NLP)
- **Class:** Semester VI (Third Year Engineering)
- **College:** Pillai College of Engineering — [Visit Official Website](https://www.pce.ac.in/)

## 📌 Overview
Synapse is an intelligent, AI-driven study platform designed to eliminate the struggles of modern learning. It leverages **Natural Language Processing** and the **Google Gemini AI** to seamlessly generate quizzes from raw notes, summarize complex study material, build personalized study plans, and provide an interactive AI study advisor — all within a single, cohesive web application.

## 🎯 Objective
Students often struggle with inefficient study habits — spending hours re-reading notes without retaining information, lacking structured revision plans, and having no immediate feedback on their understanding. Synapse solves this by applying NLP techniques to:
- **Automatically generate quizzes** from unstructured lecture notes to test comprehension.
- **Summarize lengthy content** into concise, high-yield study material.
- **Create adaptive study schedules** that prioritize weak areas.
- **Provide a conversational AI advisor** that understands academic context and offers tailored guidance.

## 🧠 Technologies Used
- **Language:** TypeScript, JavaScript
- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Three.js
- **Backend / Auth:** Firebase (Authentication, Firestore Database)
- **AI / NLP Integration:** Google Gemini API (`@google/genai`)
- **Data Visualization:** Recharts, Lucide React
- **Routing:** React Router DOM v7
- **Markdown Rendering:** react-markdown

## 📊 Dataset
- **Source:** User-provided input (lecture notes, study material, timetable images)
- **Description:** Synapse processes raw, unstructured text input from students (notes, paragraphs, topics) and uses the Gemini AI's NLP capabilities to perform quiz generation, summarization, and contextual Q&A. Timetable images are parsed using the Gemini Vision API.

## ⚙️ Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)
- A **Google Gemini API Key** — [Get one here](https://aistudio.google.com/app/apikey)

### Steps to Run the Project

**1. Clone the repository:**

```bash
git clone https://github.com/adityaacharya7/synapse.git
```

**2. Navigate into the project directory:**

```bash
cd synapse
```

**3. Install all dependencies:**

```bash
npm install
```

**4. Set up environment variables:**

Create a `.env.local` file in the root of the project:

```bash
# On Linux / macOS
touch .env.local

# On Windows (PowerShell)
New-Item .env.local
```

Add your API keys to the `.env.local` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** The `.env.local` file is listed in `.gitignore` and will **not** be committed. Never share your API keys publicly.

**5. Start the development server:**

```bash
npm run dev
```

**6. Open your browser** and navigate to [http://localhost:5173](http://localhost:5173).

---

## 🤝 Collaborative Workflow (Git Commands)

This section explains how team members can collaborate on this project using Git.

### Step 1 — Fork & Clone

1. **Fork** this repository by clicking the **Fork** button on the top-right of the GitHub repo page.

2. **Clone** your forked copy to your local machine:

```bash
git clone https://github.com/<your-username>/synapse.git
cd synapse
```

3. **Add the upstream remote** (the original repo) so you can stay in sync:

```bash
git remote add upstream https://github.com/adityaacharya7/synapse.git
```

4. **Verify remotes** are set up correctly:

```bash
git remote -v
```

Expected output:
```
origin    https://github.com/<your-username>/synapse.git (fetch)
origin    https://github.com/<your-username>/synapse.git (push)
upstream  https://github.com/adityaacharya7/synapse.git (fetch)
upstream  https://github.com/adityaacharya7/synapse.git (push)
```

### Step 2 — Create a Branch

Always create a new branch for your work. **Never commit directly to `main`.**

```bash
# Make sure you're on the main branch
git checkout main

# Pull the latest changes from the original repo
git pull upstream main

# Create and switch to a new feature branch
git checkout -b feature/your-feature-name
```

**Branch naming conventions:**

| Type | Example |
|---|---|
| New feature | `feature/quiz-timer` |
| Bug fix | `fix/login-redirect` |
| UI/UX improvement | `ui/sidebar-redesign` |
| Documentation | `docs/update-readme` |

### Step 3 — Make Your Changes

Make your code changes, then verify everything works:

```bash
# Install dependencies (if new packages were added)
npm install

# Start the dev server and test your changes
npm run dev
```

### Step 4 — Stage, Commit & Push

```bash
# Check which files have been changed
git status

# Stage all your changes
git add .

# Or stage specific files only
git add pages/MyNewPage.tsx src/services/myService.ts

# Commit with a descriptive message
git commit -m "feat: add quiz timer functionality"

# Push your branch to your fork
git push origin feature/your-feature-name
```

**Commit message guidelines:**

| Prefix | Usage |
|---|---|
| `feat:` | A new feature |
| `fix:` | A bug fix |
| `docs:` | Documentation changes |
| `style:` | Formatting, styling (no logic change) |
| `refactor:` | Code restructure (no feature change) |
| `chore:` | Maintenance tasks |

### Step 5 — Open a Pull Request

1. Go to your forked repo on GitHub.
2. Click **"Compare & pull request"**.
3. Fill in a clear title and description of your changes.
4. Submit the Pull Request for review!

### Keeping Your Fork Up to Date

Before starting new work, always sync your fork with the latest changes:

```bash
# Switch to your main branch
git checkout main

# Fetch and merge changes from the original repo
git pull upstream main

# Push the updated main to your fork
git push origin main
```

### Pulling a Teammate's Branch (for Review or Collaboration)

```bash
# Add your teammate's fork as a remote (one-time setup)
git remote add <teammate> https://github.com/<teammate-username>/synapse.git

# Fetch their branches
git fetch <teammate>

# Checkout their branch locally
git checkout -b review/<teammate>-feature <teammate>/feature/their-feature-name
```

## ▶️ Usage
Start the development server:

```bash
npm run dev
```

Open your browser and navigate to the localhost link provided by Vite (typically [http://localhost:5173](http://localhost:5173)).

### Key Features to Explore
| Feature | Description |
|---|---|
| 📝 AI Quiz Maker | Generate quizzes from your notes using NLP |
| 📒 Notes Summarizer | Extract key concepts and summaries from study material |
| 📅 Exam Prep Planner | AI-generated adaptive study schedules |
| 📊 Performance Analyzer | Track scores and get AI-powered improvement plans |
| 🎙️ Transcript Generator | Convert lecture content into structured transcripts |
| 💬 AI Study Advisor | Chat with an AI buddy that understands your academic context |
| 📄 Resume Builder | Build ATS-friendly resumes with AI scoring |
| 🗺️ Career Roadmap | Personalized learning roadmaps based on your goals |
| 💼 Internship Portal | Discover relevant internships matched to your profile |
| 🎤 Interview Prep | Practice mock interviews with AI-generated questions |
| 🎓 Student Dashboard | GPA Calculator, Timetable Builder, Pomodoro Timer, Study Streaks |

## 📈 Results
- AI-generated quizzes accurately test comprehension of user-provided content.
- Note summarization reduces study material volume while preserving key concepts.
- Adaptive study plans dynamically adjust based on student performance analytics.
- The conversational AI advisor provides contextually relevant academic guidance.

## 🎥 Demo Video
[(https://youtu.be/FMVCy7P6BeE)]

## 👥 Team Members
- Aditya Acharya
- Snehal Chavan
- Anushka Nandakumar
- Aryan Algawe
- Aditya Vijaykumar
- Tanisha Balekar
- Mandar Awatade
- Chinamy Santosh
- Bharat Sirmal
- Arpit Bolade

## 📌 GitHub Contributions
- **Aditya Acharya** – Project architecture, UI development, login authentication, resume builder, transcript module  
- **Snehal Chavan** – Interview Preparation feature  
- **Anushka Nandakumar** – Notes Summarizer, landing page design  
- **Aryan Algawe** – Flashcards feature based on uploaded content  
- **Aditya Vijaykumar** – AI timetable generator based on user goals and deadlines  
- **Tanisha Balekar** – AI Quiz Maker with adaptive difficulty  
- **Mandar Awatade** – Skill Roadmap feature for structured learning paths  
- **Chinamy Santosh** – YouTube video transcriber for note generation  
- **Bharat Sirmal** – Feedback system for Interview Preparation feature  
- **Arpit Bolade** – Performance Analyzer with improvement suggestions  

## 📚 References
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
