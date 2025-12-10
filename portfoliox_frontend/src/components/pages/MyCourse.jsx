import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  FolderGit2,
  Github,
  Sparkles,
  PlusCircle
} from 'lucide-react';
import { getApiBaseUrl } from '../../api/apiConfig';

export default function MyCourse() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createdOk, setCreatedOk] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', githubLink: '' });
  const [skills, setSkills] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [courseProjects, setCourseProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const programmingLanguages = [
    'C++', 'Java', 'JavaScript', 'Go', 'Python', 'PHP', 'R', 'Ruby', 'SQL', 'Swift',
    'Assembly language', 'CSS', 'Kotlin', 'MATLAB', 'Objective-C', 'Delphi', 'Perl',
    'Rust', 'Visual Basic', 'COBOL', 'Dart', 'Elixir', 'Erlang', 'Fortran'
  ];
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${getApiBaseUrl()}/api/courses/student/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.status === 403) {
          localStorage.clear();
          setError('Session expired. Redirecting to login...');
          // Give the user brief feedback then redirect
          setTimeout(() => { window.location.href = '/auth/login'; }, 800);
          return;
        }
        if (!res.ok) throw new Error('Failed to fetch enrolled courses');
        const data = await res.json();
        setCourses(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // When a course is selected, fetch student's projects for that course
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId) return;
    if (!selectedCourse) return;
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        // Fetch all portfolios for the student and filter on client
        const res = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 403) {
            localStorage.clear();
            setError('Session expired. Redirecting to login...');
            setTimeout(() => { window.location.href = '/auth/login'; }, 800);
            return;
          }
          throw new Error('Failed to fetch portfolios');
        }
        const all = await res.json();
        const filtered = (all || []).filter(p => (p.category || '').toLowerCase() === 'project' && (p.courseCode || '') === selectedCourse.courseCode);
        setCourseProjects(filtered);
      } catch (e) {
        setCreateError(e.message);
      } finally {
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [selectedCourse]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-[#800000] dark:text-[#D4AF37]" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md space-y-3">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl mx-auto flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Please try refreshing the page or contact support</p>
        </div>
      </div>
    );
  }

  const handleCreateProject = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token || !userId || !selectedCourse) return;
    setCreating(true);
    setCreateError(null);
    setCreatedOk(null);
    try {
      const body = new FormData();
      body.append('portfolioTitle', form.title);
      body.append('portfolioDescription', form.description);
      body.append('category', 'project');
      body.append('userID', userId);
      if (form.githubLink) body.append('githubLink', form.githubLink);
      body.append('courseCode', selectedCourse.courseCode);
      body.append('skills', JSON.stringify(skills));

      const res = await fetch(`${getApiBaseUrl()}/api/portfolios`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || 'Failed to create project');
      }
      setCreatedOk('Project created!');
      setShowCreate(false);
      setForm({ title: '', description: '', githubLink: '' });
      setSkills([]);
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const enhanceWithAI = async () => {
    const token = localStorage.getItem('token');
    setAiLoading(true);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/ai/enhance-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: 'project',
          githubLink: form.githubLink
        }),
      });
      if (!response.ok) throw new Error('Failed to get AI suggestions');
      const data = await response.json();
      setForm(prev => ({ ...prev, description: data.enhancedDescription }));
    } catch (e) {
      setCreateError('AI enhancement failed.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-transparent via-gray-50/40 to-transparent dark:from-transparent dark:via-gray-900/30 dark:to-transparent min-h-screen">
      {/* Enhanced Header */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-[#800000] via-[#600000] to-[#800000] rounded-3xl p-8 shadow-2xl border border-[#D4AF37]/20 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">My Courses</h1>
            <p className="text-[#D4AF37] text-sm font-medium">Manage your enrolled courses and projects</p>
          </div>
        </div>
      </div>
      
      {createdOk && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 font-medium shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>{createdOk}</span>
        </div>
      )}

      {!selectedCourse && (
        <>
          {courses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-[#800000] dark:text-[#D4AF37] dark:text-[#D4AF37]" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">You are not enrolled in any course yet.</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Contact your faculty to enroll in a course</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id || course.courseCode}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-[#800000] dark:hover:border-[#D4AF37]`}
                  onClick={() => { setSelectedCourse(course); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 bg-gradient-to-r from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="w-6 h-6 text-[#800000] dark:text-[#D4AF37] dark:text-[#D4AF37]" />
                    </div>
                    <span className="text-xs font-semibold text-[#800000] dark:text-[#D4AF37] dark:text-[#D4AF37] bg-[#800000]/10 dark:bg-[#D4AF37]/10 px-3 py-1 rounded-full">{course.courseCode}</span>
                  </div>
                  <div className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#800000] dark:text-[#D4AF37] dark:group-hover:text-[#D4AF37] transition-colors">{course.courseName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">Click to view projects →</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedCourse && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#800000]/5 to-[#D4AF37]/5 dark:from-[#800000]/10 dark:to-[#D4AF37]/10 rounded-2xl p-6 border border-[#800000]/10 dark:border-[#D4AF37]/10">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Selected Course</div>
                <div className="text-3xl font-black text-[#800000] dark:text-[#D4AF37] dark:text-[#D4AF37] mb-1">{selectedCourse.courseCode}</div>
                <div className="text-lg text-gray-700 dark:text-gray-300 font-semibold">{selectedCourse.courseName}</div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedCourse(null)} 
                  className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  ← Back
                </button>
                <button 
                  onClick={() => setShowCreate(true)} 
                  className="px-6 py-2.5 bg-gradient-to-r from-[#800000] to-[#600000] text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  + Create Project
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Projects in this Course</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Showcase your work and achievements</p>
              </div>
              {projectsLoading && (
                <div className="flex items-center gap-2 text-[#800000] dark:text-[#D4AF37]">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Loading...</span>
                </div>
              )}
            </div>
            {courseProjects.length === 0 && !projectsLoading ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <FolderGit2 className="w-10 h-10 text-[#800000] dark:text-[#D4AF37] dark:text-[#D4AF37]" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">No projects yet for this course</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Click "Create Project" to showcase your first project</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseProjects.map((p) => (
                  <div key={p.portfolioID} className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-600 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-[#800000] dark:hover:border-[#D4AF37]">
                    <div className="mb-4">
                      <div className="inline-block p-2 bg-gradient-to-r from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                        <FolderGit2 className="w-5 h-5 text-[#800000] dark:text-[#D4AF37] dark:text-[#D4AF37]" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-[#800000] dark:text-[#D4AF37] dark:group-hover:text-[#D4AF37] transition-colors line-clamp-2">{p.portfolioTitle}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 break-words whitespace-pre-line">{p.portfolioDescription}</p>
                    
                    {p.skills && p.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {p.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#800000] dark:text-[#D4AF37] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">{skill.skillName || skill}</span>
                        ))}
                        {p.skills.length > 3 && (
                          <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-semibold">+{p.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    {p.githubLink && (
                      <a 
                        href={p.githubLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#800000] dark:text-[#D4AF37] dark:text-[#D4AF37] hover:underline transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        View on GitHub
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Add New Project</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Create and showcase your project for {selectedCourse.courseCode}</p>
            </div>
            {createError && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-medium">
                <span className="inline-flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {createError}
                </span>
              </div>
            )}
            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Title</label>
                <input
                  type="text"
                  placeholder="e.g., E-Commerce Platform"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                  <button 
                    type="button" 
                    onClick={enhanceWithAI} 
                    className="text-xs font-medium text-[#800000] dark:text-[#D4AF37] dark:text-[#D4AF37] hover:underline flex items-center gap-1 transition-colors" 
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    {aiLoading ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Describe your project, what you built, and what you learned..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select disabled value={'project'} className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed opacity-75">
                    <option value="project">Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Course Code</label>
                  <select disabled className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white cursor-not-allowed opacity-75">
                    <option>{selectedCourse.courseCode}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">GitHub Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={form.githubLink}
                  onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Programming Languages</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600">
                  {programmingLanguages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSkills(prev => prev.includes(lang) ? prev.filter(s => s !== lang) : [...prev, lang]);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        skills.includes(lang)
                          ? 'bg-gradient-to-r from-[#800000] to-[#600000] text-white shadow-md scale-105'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-[#800000] dark:hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                {skills.length > 0 && (
                  <div className="mt-3 p-3 bg-[#800000]/5 dark:bg-[#800000]/10 rounded-xl border border-[#800000]/20 dark:border-[#D4AF37]/20">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Selected ({skills.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => (
                        <span key={skill} className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#800000] dark:text-[#D4AF37] px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setShowCreate(false)} 
                className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateProject} 
                disabled={creating || !form.title || !form.description} 
                className="px-6 py-2.5 bg-gradient-to-r from-[#800000] to-[#600000] text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center gap-2">
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  {creating ? 'Creating...' : 'Create Project'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

