import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Loader2, FileText, AlertTriangle, X, Users, UserPlus, FolderOpen, FolderX } from 'lucide-react';
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
  const [showStudentProjectsModal, setShowStudentProjectsModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [validationConfirmation, setValidationConfirmation] = useState(null);
  const [enrollmentConfirmation, setEnrollmentConfirmation] = useState(null);

  const token = localStorage.getItem('token');
  const facultyId = localStorage.getItem('userId');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 6000);
  };

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

  const handleAddStudentToCourse = () => {
    if (!selectedCourse || !addStudentUserId) return;
    
    // Find student name
    const student = allStudents.find(s => s.userID === addStudentUserId);
    const studentName = student ? `${student.fname || ''} ${student.lname || ''}`.trim() || student.username : addStudentUserId;
    
    setEnrollmentConfirmation({
      courseCode: selectedCourse.courseCode,
      courseName: selectedCourse.courseName,
      studentId: addStudentUserId,
      studentName
    });
  };

  const performAddStudentToCourse = async () => {
    if (!selectedCourse || !addStudentUserId) return;
    setAddingStudent(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/courses/${selectedCourse.courseCode}/add-student/${addStudentUserId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to add student to course');
      }
      showNotification('Student added to course successfully!', 'success');
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
      showNotification(err.message || 'Failed to add student to course', 'error');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleValidateProject = (projectId, projectTitle) => {
    setValidationConfirmation({
      action: 'validate',
      projectId,
      title: 'Validate Project',
      description: `Are you sure you want to validate "${projectTitle}"? This will mark the project as approved by faculty.`
    });
  };

  const performValidateProject = async (projectId) => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/portfolios/${projectId}/validate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to validate project (${res.status})`);
      }
      showNotification('Project validated successfully!', 'success');
      // Refresh project list
      if (selectedCourse) handleSelectCourse(selectedCourse);
    } catch (err) {
      showNotification(err.message || 'Failed to validate project', 'error');
    }
  };

  const handleUnvalidateProject = (projectId, projectTitle) => {
    setValidationConfirmation({
      action: 'unvalidate',
      projectId,
      title: 'Unvalidate Project',
      description: `Are you sure you want to unvalidate "${projectTitle}"? This will remove the faculty approval status.`
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
        setSuccess('Microcredential verified and witnessed successfully!');
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
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/portfolios/${projectId}/unvalidate`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Failed to unvalidate project (${res.status})`);
      }
      showNotification('Project unvalidated successfully!', 'success');
      // Refresh project list
      if (selectedCourse) handleSelectCourse(selectedCourse);
    } catch (err) {
      showNotification(err.message || 'Failed to unvalidate project', 'error');
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleStudentProjectsClick = (student) => {
    setSelectedEnrolledStudent(student);
    loadStudentProjects(student.userID);
    setShowStudentProjectsModal(true);
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
        <div className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <Users className="w-5 h-5" /> Enrolled Students
        </div>
        {enrolledStudents.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center py-4">
            <FolderX className="w-8 h-8 mb-2 text-gray-400" />
            No students enrolled yet
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto pr-2 -mr-2">
            <div className="space-y-2 pr-2">
              {enrolledStudents.map(s => (
                <button
                  key={s.userID}
                  onClick={() => handleStudentProjectsClick(s)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedEnrolledStudent?.userID === s.userID ? 'ring-2 ring-[#800000]' : ''
                  }`}
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {`${s.fname || ''} ${s.lname || ''}`.trim() || s.username}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {s.userEmail}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                      ID: {s.userID}
                    </span>
                    <div className="p-1.5 rounded-full bg-[#800000]/10 text-[#800000] hover:bg-[#800000]/20 transition-colors">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

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
                              handleUnvalidateProject(project.portfolioID, project.portfolioTitle);
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
                              handleValidateProject(project.portfolioID, project.portfolioTitle);
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
                      handleUnvalidateProject(selectedProject.portfolioID, selectedProject.portfolioTitle);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold"
                  >
                    <XCircle size={18} />
                    Unvalidate Project
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleValidateProject(selectedProject.portfolioID, selectedProject.portfolioTitle);
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

                {/* Witness/Validation Status Display */}
                {portfolioData.category === 'microcredentials' && (
                  portfolioData.witnessedByNames && portfolioData.witnessedByNames.length > 0 ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
                        <h4 className="text-lg font-semibold text-green-700 dark:text-green-400">Verified & Witnessed by Faculty</h4>
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        {portfolioData.witnessedByNames.split(',').map((name, idx) => (
                          <div key={idx} className="flex items-center gap-2 py-1">
                            <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                            <span>{name.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
                        <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">Pending Faculty Witness</h4>
                      </div>
                      <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">This microcredential is awaiting verification from faculty members.</p>
                    </div>
                  )
                )}

                {/* Validation/Witness Controls */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-[#800000] mb-3">
                    {portfolioData.category === 'microcredentials' ? 'Witness & Verify Microcredential' : 'Validation Controls'}
                  </h4>
                  <div className="flex gap-3">
                    {portfolioData.category === 'project' ? (
                      portfolioData.validatedByFaculty === true ? (
                        <button
                          onClick={() => {
                            handleUnvalidateProject(portfolioData.portfolioID, portfolioData.portfolioTitle);
                          }}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-semibold"
                        >
                          <XCircle size={18} />
                          Unvalidate Project
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            handleValidateProject(portfolioData.portfolioID, portfolioData.portfolioTitle);
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
                          Remove My Witness
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
                          Witness & Verify
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

      {/* Student Projects Modal */}
      {showStudentProjectsModal && selectedEnrolledStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#800000] to-[#600000] p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Student Projects</h3>
                  <p className="text-[#D4AF37] font-medium">
                    {`${selectedEnrolledStudent.fname || ''} ${selectedEnrolledStudent.lname || ''}`.trim() || selectedEnrolledStudent.username}
                  </p>
                  <p className="text-white/80 text-sm">{selectedEnrolledStudent.userEmail}</p>
                </div>
                <button
                  onClick={() => setShowStudentProjectsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {studentProjectsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-[#800000] animate-spin" />
                </div>
              ) : studentProjects.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 mb-2">No projects found</div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    This student hasn't submitted any projects for this course yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentProjects.map(project => (
                    <div
                      key={project.portfolioID}
                      className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-[#D4AF37] transition-all duration-200 hover:shadow-lg cursor-pointer"
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                          {project.portfolioTitle}
                        </h4>
                        {project.validatedByFaculty === true && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                            <CheckCircle size={10} /> Validated
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        {project.portfolioDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {project.portfolioID}
                        </span>
                        <div className="flex items-center gap-2">
                          {project.validatedByFaculty === true ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnvalidateProject(project.portfolioID, project.portfolioTitle);
                              }}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded text-xs hover:bg-red-200 transition-colors flex items-center gap-1"
                              title="Unvalidate Project"
                            >
                              <XCircle size={12} /> Unvalidate
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleValidateProject(project.portfolioID, project.portfolioTitle);
                              }}
                              className="px-3 py-1 bg-[#D4AF37] text-[#800000] rounded text-xs hover:bg-[#B8860B] transition-colors flex items-center gap-1 font-semibold"
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
          </div>
        </div>
      )}

      {/* Validation Confirmation Dialog */}
      {validationConfirmation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${
                validationConfirmation.action === 'validate' 
                  ? 'bg-green-100 dark:bg-green-900/20' 
                  : 'bg-amber-100 dark:bg-amber-900/20'
              }`}>
                {validationConfirmation.action === 'validate' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#D4AF37]" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {validationConfirmation.title}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {validationConfirmation.description}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setValidationConfirmation(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  // Close dialog immediately
                  setValidationConfirmation(null);
                  
                  if (validationConfirmation.action === 'validate') {
                    await performValidateProject(validationConfirmation.projectId);
                  } else {
                    await performUnvalidateProject(validationConfirmation.projectId);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-white ${
                  validationConfirmation.action === 'validate' 
                    ? 'bg-[#800000] hover:bg-[#600000]' 
                    : 'bg-[#D4AF37] hover:bg-[#B8860B]'
                }`}
              >
                {validationConfirmation.action === 'validate' ? 'Validate Project' : 'Unvalidate Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full shadow-2xl rounded-2xl px-5 py-4 border bg-white/95 backdrop-blur dark:bg-gray-800/95 ${
          notification.type === 'error'
            ? 'border-red-200 text-red-700 dark:border-red-500/40 dark:text-red-300'
            : 'border-[#800000]/40 text-[#800000] dark:border-[#D4AF37]/40 dark:text-[#D4AF37]'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-2 h-12 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-[#800000]'}`}></div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">
                {notification.type === 'error' ? 'Action Required' : 'Success'}
              </h4>
              <p className="text-sm leading-relaxed">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Enrollment Confirmation Dialog */}
      {enrollmentConfirmation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Confirm Enrollment
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Are you sure you want to enroll <span className="font-semibold">{enrollmentConfirmation.studentName}</span> in{" "}
              <span className="font-semibold">{enrollmentConfirmation.courseName}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEnrollmentConfirmation(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setEnrollmentConfirmation(null);
                  await performAddStudentToCourse();
                }}
                className="px-4 py-2 rounded-lg bg-[#800000] text-white hover:bg-[#600000] flex items-center gap-2"
              >
                <UserPlus size={18} /> Enroll Student
              </button>
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