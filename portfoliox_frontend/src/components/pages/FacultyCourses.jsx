import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Loader2, FileText } from 'lucide-react';
import { ConfirmDialog } from '../Notification';

import { getApiBaseUrl } from '../../api/apiConfig';
const maroon = "#800000";
const gold = "#D4AF37";

export default function FacultyCourses() {
  const [courses, setCourses] = useState([]);
  const [newCourse, setNewCourse] = useState({ courseCode: '', courseName: '' });
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [projects, setProjects] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [studentNames, setStudentNames] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [portfolioData, setPortfolioData] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null, confirmText: 'Yes, Continue' });
  const [addStudentUserId, setAddStudentUserId] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentOptions, setShowStudentOptions] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [selectedEnrolledStudent, setSelectedEnrolledStudent] = useState(null);
  const [studentProjects, setStudentProjects] = useState([]);
  const [studentProjectsLoading, setStudentProjectsLoading] = useState(false);

  const token = localStorage.getItem('token');
  const facultyId = localStorage.getItem('userId');

  useEffect(() => {
    fetchCourses();
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/users/students`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return; // silently ignore
      const data = await res.json();
      setAllStudents(Array.isArray(data) ? data : []);
    } catch (e) {
      // ignore
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/courses/faculty/${facultyId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCourse),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create course');
      }
      setNewCourse({ courseCode: '', courseName: '' });
      setSuccess('Course created successfully!');
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchStudentName = async (userId) => {
    if (studentNames[userId]) return studentNames[userId];
    
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        // Handle the Optional<UserEntity> response - it might be null if user not found
        if (userData && userData.userID) {
          const name = userData.fname && userData.lname 
            ? `${userData.fname} ${userData.lname}` 
            : userData.username || 'Unknown Student';
          setStudentNames(prev => ({ ...prev, [userId]: name }));
          return name;
        }
      }
    } catch (err) {
      console.error('Error fetching student name:', err);
    }
    return 'Unknown Student';
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setProjects([]);
    setProjectLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/courses/${course.courseCode}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data); // overall projects list (optional)

      // fetch enrolled students for this course
      try {
        const sres = await fetch(`${getApiBaseUrl()}/api/courses/${course.courseCode}/students`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (sres.ok) {
          const sdata = await sres.json();
          setEnrolledStudents(Array.isArray(sdata) ? sdata : []);
        } else {
          setEnrolledStudents([]);
        }
      } catch (e) {
        setEnrolledStudents([]);
      }
      
      // Fetch student names for all projects
      const userIds = [...new Set(data.map(project => project.userID))];
      for (const userId of userIds) {
        await fetchStudentName(userId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProjectLoading(false);
    }
  };

  const loadStudentProjects = async (studentId) => {
    if (!selectedCourse) return;
    setStudentProjectsLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/courses/${selectedCourse.courseCode}/students/${studentId}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch student projects');
      const data = await res.json();
      setStudentProjects(data);
    } catch (e) {
      setStudentProjects([]);
    } finally {
      setStudentProjectsLoading(false);
    }
  };

  const handleAddStudentToCourse = async () => {
    if (!selectedCourse || !addStudentUserId) return;
    setAddingStudent(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/courses/${selectedCourse.courseCode}/add-student/${addStudentUserId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to add student to course');
      }
      setSuccess('Student added to course');
      setAddStudentUserId('');
      // refresh enrolled list
      if (selectedCourse) {
        try {
          const sres = await fetch(`${getApiBaseUrl()}/api/courses/${selectedCourse.courseCode}/students`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (sres.ok) {
            setEnrolledStudents(await sres.json());
          }
        } catch {}
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingStudent(false);
    }
  };

  const handleValidateProject = async (projectId) => {
    setConfirmDialog({
      open: true,
      title: 'Validate Project',
      message: 'Are you sure you want to validate this project? This action will mark the project as approved by faculty.',
      confirmText: 'Yes, Validate',
      onConfirm: () => {
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: null, confirmText: 'Yes, Continue' });
        performValidateProject(projectId);
      }
    });
  };

  const performValidateProject = async (projectId) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/portfolios/${projectId}/validate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Validate error response:', errorText);
        throw new Error(errorText || `Failed to validate project (${res.status})`);
      }
      setSuccess('Project validated!');
      // Refresh project list
      if (selectedCourse) handleSelectCourse(selectedCourse);
    } catch (err) {
      console.error('Validate error:', err);
      setError(err.message);
    }
  };

  const handleUnvalidateProject = async (projectId) => {
    setConfirmDialog({
      open: true,
      title: 'Unvalidate Project',
      message: 'Are you sure you want to unvalidate this project? This action will remove the faculty approval status.',
      confirmText: 'Yes, Unvalidate',
      onConfirm: () => {
        setConfirmDialog({ open: false, title: '', message: '', onConfirm: null, confirmText: 'Yes, Continue' });
        performUnvalidateProject(projectId);
      }
    });
  };

  const handleWitnessMicrocredential = async (portfolioId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/${portfolioId}/witness`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolioData(prev => ({
          ...prev,
          witnessedByIds: data.witnessedByIds,
          witnessedByNames: data.witnessedByNames
        }));
        setSuccess('Microcredential witnessed successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to witness microcredential');
      }
    } catch (error) {
      console.error('Error witnessing microcredential:', error);
      setError('Failed to witness microcredential. Please try again.');
    }
  };

  const handleUnwitnessMicrocredential = async (portfolioId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/${portfolioId}/unwitness`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPortfolioData(prev => ({
          ...prev,
          witnessedByIds: data.witnessedByIds,
          witnessedByNames: data.witnessedByNames
        }));
        setSuccess('Witness removed successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorText = await response.text();
        setError(errorText || 'Failed to remove witness');
      }
    } catch (error) {
      console.error('Error removing witness:', error);
      setError('Failed to remove witness. Please try again.');
    }
  };

  const performUnvalidateProject = async (projectId) => {
    console.log('Attempting to unvalidate project ID:', projectId);
    console.log('Selected project data:', selectedProject);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/portfolios/${projectId}/unvalidate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Unvalidate error response:', errorText);
        throw new Error(errorText || `Failed to unvalidate project (${res.status})`);
      }
      setSuccess('Project unvalidated!');
      // Refresh project list
      if (selectedCourse) handleSelectCourse(selectedCourse);
    } catch (err) {
      console.error('Unvalidate error:', err);
      setError(err.message);
    }
  };

  const handleProjectClick = (project) => {
    console.log('Project clicked:', project);
    console.log('Project validatedByFaculty:', project.validatedByFaculty);
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleViewFullPortfolio = async (projectId) => {
    setPortfolioLoading(true);
    setError(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/portfolios/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      const data = await res.json();
      setPortfolioData(data);
      setShowPortfolioModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setPortfolioLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">My Courses</h1>
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow p-6 max-w-xl">
        <h2 className="text-lg font-semibold mb-2 text-[#800000]">Create New Course</h2>
        <form onSubmit={handleCreateCourse} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Course Code (e.g. CSIR 112)"
              value={newCourse.courseCode}
              onChange={e => setNewCourse(c => ({ ...c, courseCode: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Course Name"
              value={newCourse.courseName}
              onChange={e => setNewCourse(c => ({ ...c, courseName: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
              required
            />
            <button type="submit" className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] flex items-center gap-1">
              <Plus size={16} /> Add
            </button>
          </div>
          {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-[#800000] animate-spin" />
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No courses found. Create one above.</div>
        ) : (
          courses.map(course => (
            <div key={course.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-all ${selectedCourse && selectedCourse.id === course.id ? 'ring-2 ring-[#800000]' : ''}`}
              onClick={() => handleSelectCourse(course)}
            >
              <div className="font-bold text-lg text-[#800000]">{course.courseCode}</div>
              <div className="text-gray-700 dark:text-gray-300 mb-2">{course.courseName}</div>
              <div className="text-xs text-gray-500">Created by you</div>
            </div>
          ))
        )}
      </div>
      {selectedCourse && (
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#800000]">Projects for {selectedCourse.courseCode} - {selectedCourse.courseName}</h2>
            <button onClick={() => setSelectedCourse(null)} className="text-gray-500 hover:text-[#800000]">Close</button>
          </div>
      {/* Enroll Students to Course */}
      <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="font-semibold text-gray-800 dark:text-white mb-2">Enroll Student</div>
        <div className="flex gap-2 items-start relative">
          <div className="flex-1">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setShowStudentOptions(true);
              }}
              onFocus={() => setShowStudentOptions(true)}
              placeholder="Search student by name or email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {showStudentOptions && studentSearch && (
              <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
                {allStudents
                  .filter(s => {
                    const q = studentSearch.toLowerCase();
                    const name = `${s.fname || ''} ${s.lname || ''}`.toLowerCase();
                    return name.includes(q) || (s.userEmail || '').toLowerCase().includes(q) || (s.username || '').toLowerCase().includes(q);
                  })
                  .slice(0, 10)
                  .map(s => (
                    <button
                      key={s.userID}
                      type="button"
                      onClick={() => {
                        setAddStudentUserId(String(s.userID));
                        setStudentSearch(`${s.fname || ''} ${s.lname || ''}`.trim() || s.username || s.userEmail || String(s.userID));
                        setShowStudentOptions(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-100">{`${s.fname || ''} ${s.lname || ''}`.trim() || s.username}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{s.userEmail} • ID: {s.userID}</div>
                    </button>
                  ))}
                {allStudents.filter(s => {
                  const q = studentSearch.toLowerCase();
                  const name = `${s.fname || ''} ${s.lname || ''}`.toLowerCase();
                  return name.includes(q) || (s.userEmail || '').toLowerCase().includes(q) || (s.username || '').toLowerCase().includes(q);
                }).length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No students found</div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleAddStudentToCourse}
            disabled={addingStudent || !addStudentUserId}
            className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] disabled:opacity-50"
          >
            {addingStudent ? 'Adding...' : 'Add Student'}
          </button>
        </div>
        <div className="text-sm mt-2 text-gray-500 dark:text-gray-400">Students can only select courses they are enrolled in. Use this tool to enroll them.</div>
      </div>

      {/* Enrolled Students */}
      <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="font-semibold text-gray-800 dark:text-white mb-3">Enrolled Students</div>
        {enrolledStudents.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">No students enrolled yet.</div>
        ) : (
          <div className="space-y-2">
            {enrolledStudents.map(s => (
              <button
                key={s.userID}
                onClick={() => { setSelectedEnrolledStudent(s); loadStudentProjects(s.userID); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedEnrolledStudent?.userID === s.userID ? 'ring-2 ring-[#800000]' : ''}`}
              >
                <div className="text-left">
                  <div className="font-medium text-gray-800 dark:text-gray-100">{`${s.fname || ''} ${s.lname || ''}`.trim() || s.username}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{s.userEmail} • ID: {s.userID}</div>
                </div>
                <div className="text-xs text-[#800000]">View Projects</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Student's Projects for this Course */}
      {selectedEnrolledStudent && (
        <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-800 dark:text-white">{`${selectedEnrolledStudent.fname || ''} ${selectedEnrolledStudent.lname || ''}`.trim() || selectedEnrolledStudent.username}'s Projects</div>
            <button onClick={() => { setSelectedEnrolledStudent(null); setStudentProjects([]); }} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Close</button>
          </div>
          {studentProjectsLoading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
          ) : studentProjects.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">No projects in this course for this student.</div>
          ) : (
            <div className="space-y-2">
              {studentProjects.map(p => (
                <div key={p.portfolioID} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <div className="font-medium text-gray-800 dark:text-gray-100">{p.portfolioTitle}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{p.portfolioDescription}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
          {projectLoading ? (
            <div className="flex justify-center items-center py-8"><Loader2 className="w-8 h-8 text-[#800000] animate-spin" /></div>
          ) : projects.length === 0 ? (
            <div className="text-center text-gray-500">No projects found for this course.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div 
                  key={project.portfolioID} 
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:border-[#800000] transition-all duration-200"
                  onClick={() => handleProjectClick(project)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-8 h-8 text-[#800000]" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg hover:text-[#800000] transition-colors">
                        {project.portfolioTitle}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Student: {studentNames[project.userID] || 'Loading...'}
                    </span>
                    <div className="flex items-center gap-2">
                      {project.validatedByFaculty === true ? (
                        <>
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <CheckCircle size={12} /> Validated
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnvalidateProject(project.portfolioID);
                            }}
                            className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors"
                            title="Unvalidate Project"
                          >
                            <XCircle size={12} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleValidateProject(project.portfolioID);
                          }}
                          className="px-2 py-1 bg-[#D4AF37] text-[#800000] rounded text-xs hover:bg-[#B8860B] transition-colors flex items-center gap-1"
                          title="Validate Project"
                        >
                          <CheckCircle size={12} /> Validate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Project Details Modal */}
      {showProjectModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#800000]" />
                  <h3 className="text-2xl font-bold text-[#800000]">Project Details</h3>
                </div>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="text-gray-500 hover:text-[#800000] text-3xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Title</label>
                    <p className="text-lg text-gray-900 dark:text-white font-medium">{selectedProject.portfolioTitle}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <div className="text-gray-900 dark:text-white leading-relaxed text-left">
                      {selectedProject.portfolioDescription?.split('\n').map((line, index) => (
                        <div key={index} className="mb-1">
                          {line.trim() && (
                            <div className="flex items-start">
                              <span className="text-[#D4AF37] mr-2 mt-1">•</span>
                              <span>{line.trim()}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Student Information</label>
                    <p className="text-gray-900 dark:text-white">
                      {studentNames[selectedProject.userID] || 'Loading...'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Course Information</label>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedCourse?.courseCode}</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedCourse?.courseName}</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Validation Status</label>
                    <div className="flex items-center gap-2">
                      {selectedProject.validatedByFaculty ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">
                          <CheckCircle size={18} /> Validated by Faculty
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-semibold">
                          <XCircle size={18} /> Pending Validation
                        </span>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => handleViewFullPortfolio(selectedProject.portfolioID)}
                  disabled={portfolioLoading}
                  className="flex-1 px-6 py-3 bg-[#800000] text-white rounded-lg hover:bg-[#600000] flex items-center justify-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {portfolioLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <FileText size={18} />
                  )}
                  {portfolioLoading ? 'Loading...' : 'View Full Portfolio'}
                </button>
                {selectedProject.validatedByFaculty === true ? (
                  <button
                    onClick={() => {
                      handleUnvalidateProject(selectedProject.portfolioID);
                      setShowProjectModal(false);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold"
                  >
                    <XCircle size={18} />
                    Unvalidate Project
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleValidateProject(selectedProject.portfolioID);
                      setShowProjectModal(false);
                    }}
                    className="px-6 py-3 bg-[#D4AF37] text-[#800000] rounded-lg hover:bg-[#B8860B] flex items-center gap-2 font-semibold"
                  >
                    <CheckCircle size={18} />
                    Validate Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Modal */}
      {showPortfolioModal && portfolioData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#800000]" />
                  <h3 className="text-2xl font-bold text-[#800000]">Portfolio Details</h3>
                </div>
                <button
                  onClick={() => setShowPortfolioModal(false)}
                  className="text-gray-500 hover:text-[#800000] text-3xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Portfolio Header */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                  <h2 className="text-3xl font-bold text-[#800000] mb-2">{portfolioData.portfolioTitle}</h2>
                  <div className="text-lg text-gray-700 dark:text-gray-300 mb-4 text-left">
                    {portfolioData.portfolioDescription?.split('\n').map((line, index) => (
                      <div key={index} className="mb-1">
                        {line.trim() && (
                          <div className="flex items-start">
                            <span className="text-[#D4AF37] mr-2 mt-1">•</span>
                            <span>{line.trim()}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span><strong>Student:</strong> {studentNames[portfolioData.userID] || 'Loading...'}</span>
                    <span><strong>Course:</strong> {portfolioData.courseCode}</span>
                    <span><strong>Category:</strong> {portfolioData.category}</span>
                    <span><strong>Status:</strong> 
                      {portfolioData.validatedByFaculty ? (
                        <span className="text-green-600 ml-1">✓ Validated</span>
                      ) : (
                        <span className="text-yellow-600 ml-1">⏳ Pending</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Portfolio Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Skills Section */}
                  {portfolioData.skills && portfolioData.skills.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-[#800000] mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {portfolioData.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-[#800000] text-white rounded-full text-sm">
                            {skill.skillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Projects Section */}
                  {portfolioData.projects && portfolioData.projects.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-[#800000] mb-3">Projects</h4>
                      <div className="space-y-3">
                        {portfolioData.projects.map((project, index) => (
                          <div key={index} className="border-l-4 border-[#800000] pl-3">
                            <h5 className="font-semibold text-gray-900 dark:text-white">{project.projectTitle}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{project.projectDescription}</p>
                            {project.projectLink && (
                              <a href={project.projectLink} target="_blank" rel="noopener noreferrer" 
                                 className="text-[#800000] hover:underline text-sm">
                                View Project →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications Section */}
                  {portfolioData.certifications && portfolioData.certifications.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-[#800000] mb-3">Certifications</h4>
                      <div className="space-y-3">
                        {portfolioData.certifications.map((cert, index) => (
                          <div key={index} className="border-l-4 border-[#D4AF37] pl-3">
                            <h5 className="font-semibold text-gray-900 dark:text-white">{cert.certificationName}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuingOrganization}</p>
                            <p className="text-xs text-gray-500">{cert.issueDate}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links Section */}
                  {portfolioData.links && portfolioData.links.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-[#800000] mb-3">Links</h4>
                      <div className="space-y-2">
                        {portfolioData.links.map((link, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <a href={link.url} target="_blank" rel="noopener noreferrer" 
                               className="text-[#800000] hover:underline flex items-center gap-1">
                              {link.linkType} →
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Supporting Documents */}
                {portfolioData.supportingDocuments && portfolioData.supportingDocuments.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-[#800000] mb-3">Supporting Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {portfolioData.supportingDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          <FileText className="w-5 h-5 text-[#800000]" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{doc.documentName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{doc.documentType}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Witness Info Display */}
                {portfolioData.witnessedByNames && portfolioData.witnessedByNames.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">Witnessed By</h4>
                    <p className="text-gray-700 dark:text-gray-300">{portfolioData.witnessedByNames}</p>
                  </div>
                )}

                {/* Validation/Witness Controls */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-[#800000] mb-3">
                    {portfolioData.category === 'microcredentials' ? 'Witness Controls' : 'Validation Controls'}
                  </h4>
                  <div className="flex gap-3">
                    {portfolioData.category === 'project' ? (
                      portfolioData.validatedByFaculty === true ? (
                        <button
                          onClick={() => {
                            handleUnvalidateProject(portfolioData.portfolioID);
                            setShowPortfolioModal(false);
                          }}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold"
                        >
                          <XCircle size={18} />
                          Unvalidate Project
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleValidateProject(portfolioData.portfolioID);
                            setShowPortfolioModal(false);
                          }}
                          className="px-6 py-3 bg-[#D4AF37] text-[#800000] rounded-lg hover:bg-[#B8860B] flex items-center gap-2 font-semibold"
                        >
                          <CheckCircle size={18} />
                          Validate Project
                        </button>
                      )
                    ) : portfolioData.category === 'microcredentials' ? (
                      portfolioData.witnessedByIds && portfolioData.witnessedByIds.split(',').includes(localStorage.getItem('userId')) ? (
                        <button
                          onClick={() => {
                            handleUnwitnessMicrocredential(portfolioData.portfolioID);
                            setShowPortfolioModal(false);
                          }}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold"
                        >
                          <XCircle size={18} />
                          Remove Witness
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleWitnessMicrocredential(portfolioData.portfolioID);
                            setShowPortfolioModal(false);
                          }}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-semibold"
                        >
                          <CheckCircle size={18} />
                          Witness Microcredential
                        </button>
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ open: false, title: '', message: '', onConfirm: null, confirmText: 'Yes, Continue' })}
      />
    </div>
  );
} 