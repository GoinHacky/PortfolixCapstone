import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
    return <div className="p-8">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
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

      const res = await fetch('${getApiBaseUrl()}/api/portfolios', {
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
      const response = await fetch('${getApiBaseUrl()}/api/ai/enhance-description', {
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      {createdOk && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">{createdOk}</div>
      )}

      {!selectedCourse && (
        <>
          {courses.length === 0 ? (
            <div className="text-gray-500">You are not enrolled in any course yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id || course.courseCode}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-md transition`}
                  onClick={() => { setSelectedCourse(course); }}
                >
                  <div className="font-bold text-lg text-[#800000]">{course.courseCode}</div>
                  <div className="text-gray-700 dark:text-gray-300">{course.courseName}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedCourse && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Selected Course</div>
              <div className="text-xl font-semibold text-[#800000]">{selectedCourse.courseCode} · <span className="text-gray-800 dark:text-gray-200">{selectedCourse.courseName}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelectedCourse(null)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Back</button>
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000]">Create Project</button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Projects in this Course</h2>
              {projectsLoading && <span className="text-sm text-gray-500">Loading...</span>}
            </div>
            {courseProjects.length === 0 && !projectsLoading ? (
              <div className="text-gray-500">No projects yet for this course. Click "Create Project" to add one.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseProjects.map((p) => (
                  <div key={p.portfolioID} className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                    <div className="p-4">
                      <div className="font-medium text-gray-800 dark:text-white">{p.portfolioTitle}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 break-words whitespace-pre-line">{p.portfolioDescription}</p>
                      {p.githubLink && (
                        <a href={p.githubLink} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-block mt-2">View on GitHub</a>
                      )}
                      {p.skills && p.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.skills.map((skill, idx) => (
                            <span key={idx} className="bg-[#D4AF37] text-[#800000] px-2 py-0.5 rounded-full text-xs font-semibold">{skill.skillName || skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <div className="text-lg font-semibold text-gray-800 dark:text-white">Add New Project</div>
            </div>
            {createError && <div className="mb-3 p-2 rounded bg-red-100 text-red-700 text-sm">{createError}</div>}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <button type="button" onClick={enhanceWithAI} className="text-xs text-[#800000] dark:text-[#D4AF37] hover:underline" disabled={aiLoading}>
                    {aiLoading ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select disabled value={'project'} className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="project">Project</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub Link</label>
                <input
                  type="url"
                  value={form.githubLink}
                  onChange={(e) => setForm({ ...form, githubLink: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Code (preselected)</label>
                <select disabled className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>{selectedCourse.courseCode}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Programming Languages</label>
                <div className="flex flex-wrap gap-2">
                  {programmingLanguages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => {
                        setSkills(prev => prev.includes(lang) ? prev.filter(s => s !== lang) : [...prev, lang]);
                      }}
                      className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                        skills.includes(lang)
                          ? 'bg-[#800000] text-white shadow'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-[#D4AF37] hover:text-[#800000]'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleCreateProject} disabled={creating || !form.title || !form.description} className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] disabled:opacity-50">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

