import React, { useState } from 'react';
import { Calculator, Plus, Trash2, RotateCcw, GraduationCap } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

const GRADE_POINTS: Record<string, number> = {
  'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0, 'P': 0
};

const GRADE_OPTIONS = ['O', 'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];

const GPACalculator: React.FC = () => {
  const [semesters, setSemesters] = useState<Course[][]>([
    [{ id: '1', name: '', credits: 3, grade: 'A' }]
  ]);
  const [activeSem, setActiveSem] = useState(0);

  const addCourse = () => {
    const updated = [...semesters];
    updated[activeSem] = [...updated[activeSem], { id: `${Date.now()}`, name: '', credits: 3, grade: 'A' }];
    setSemesters(updated);
  };

  const removeCourse = (idx: number) => {
    const updated = [...semesters];
    if (updated[activeSem].length <= 1) return;
    updated[activeSem] = updated[activeSem].filter((_, i) => i !== idx);
    setSemesters(updated);
  };

  const updateCourse = (idx: number, field: string, value: any) => {
    const updated = [...semesters];
    (updated[activeSem][idx] as any)[field] = value;
    setSemesters(updated);
  };

  const addSemester = () => {
    setSemesters([...semesters, [{ id: `${Date.now()}`, name: '', credits: 3, grade: 'A' }]]);
    setActiveSem(semesters.length);
  };

  const calcSGPA = (courses: Course[]) => {
    const totalCredits = courses.reduce((a, c) => a + c.credits, 0);
    if (totalCredits === 0) return 0;
    const totalPoints = courses.reduce((a, c) => a + c.credits * (GRADE_POINTS[c.grade] || 0), 0);
    return +(totalPoints / totalCredits).toFixed(2);
  };

  const calcCGPA = () => {
    let totalCredits = 0;
    let totalPoints = 0;
    semesters.forEach(sem => {
      sem.forEach(c => {
        totalCredits += c.credits;
        totalPoints += c.credits * (GRADE_POINTS[c.grade] || 0);
      });
    });
    if (totalCredits === 0) return 0;
    return +(totalPoints / totalCredits).toFixed(2);
  };

  const sgpa = calcSGPA(semesters[activeSem]);
  const cgpa = calcCGPA();
  const totalCredits = semesters.flat().reduce((a, c) => a + c.credits, 0);

  const getGPAColor = (gpa: number) => gpa >= 8.5 ? 'text-green-500' : gpa >= 7 ? 'text-blue-500' : gpa >= 5.5 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="p-6 md:p-10 xl:px-12 w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          GPA Calculator <span className="px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-black rounded-full uppercase tracking-widest">Tool</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Calculate your SGPA and CGPA across semesters.</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">SGPA (Sem {activeSem + 1})</p>
          <p className={`text-4xl font-black ${getGPAColor(sgpa)}`}>{sgpa}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">CGPA</p>
          <p className={`text-4xl font-black ${getGPAColor(cgpa)}`}>{cgpa}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Credits</p>
          <p className="text-4xl font-black text-gray-900 dark:text-white">{totalCredits}</p>
        </div>
      </div>

      {/* Semester Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {semesters.map((_, i) => (
          <button key={i} onClick={() => setActiveSem(i)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeSem === i
              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}>
            Semester {i + 1}
          </button>
        ))}
        <button onClick={addSemester}
          className="px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-dashed border-gray-200 dark:border-slate-700 text-gray-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center gap-1">
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Courses Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-8 shadow-sm space-y-4">
        <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <span className="col-span-5">Course Name</span>
          <span className="col-span-2 text-center">Credits</span>
          <span className="col-span-3 text-center">Grade</span>
          <span className="col-span-2 text-center">Points</span>
        </div>

        {semesters[activeSem].map((course, idx) => (
          <div key={course.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl group">
            <input
              className="col-span-5 bg-transparent border-none outline-none font-bold text-sm dark:text-white placeholder-gray-300"
              placeholder="e.g. Data Structures"
              value={course.name}
              onChange={e => updateCourse(idx, 'name', e.target.value)}
            />
            <input
              type="number"
              className="col-span-2 bg-white dark:bg-slate-900 rounded-lg p-2 text-center font-bold text-sm border dark:border-slate-700 dark:text-white"
              value={course.credits}
              min={1}
              max={10}
              onChange={e => updateCourse(idx, 'credits', +e.target.value)}
            />
            <select
              className="col-span-3 bg-white dark:bg-slate-900 rounded-lg p-2 text-center font-bold text-sm border dark:border-slate-700 dark:text-white"
              value={course.grade}
              onChange={e => updateCourse(idx, 'grade', e.target.value)}
            >
              {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <div className="col-span-2 flex items-center justify-between">
              <span className="font-black text-sm text-gray-900 dark:text-white text-center flex-1">
                {(course.credits * (GRADE_POINTS[course.grade] || 0))}
              </span>
              <button onClick={() => removeCourse(idx)} className="p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        <button onClick={addCourse}
          className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-400 hover:text-brand-600 hover:border-brand-200 transition-all flex items-center justify-center gap-2">
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Grade Scale Reference */}
      <div className="bg-gray-50 dark:bg-slate-900/50 border dark:border-slate-800 rounded-3xl p-6">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Grade Scale</p>
        <div className="flex flex-wrap gap-2">
          {GRADE_OPTIONS.map(g => (
            <span key={g} className="px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 border dark:border-slate-700">
              {g} = {GRADE_POINTS[g]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GPACalculator;
