import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Folder, GraduationCap, X, ChevronDown, ChevronRight, FileText, RefreshCw, UserMinus, AlertTriangle, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { getApiBaseUrl } from '../../api/apiConfig';

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function FacultyStudents() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPortfolios, setStudentPortfolios] = useState([]);
  const [allStudentPortfolios, setAllStudentPortfolios] = useState({}); // Store portfolios for all students
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({
    projects: true,
    microcredentials: true
  });
  const [viewPortfolio, setViewPortfolio] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [modalAction, setModalAction] = useState('remove'); // 'remove' or 'add'
  const [facultyCourses, setFacultyCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courseEnrollments, setCourseEnrollments] = useState({});
  const [notification, setNotification] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchStudents();
    fetchFacultyCourses();
  }, [token, navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/users/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          localStorage.clear();
          navigate('/auth/login');
          return;
        }
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log('Fetched students:', data);
      setStudents(data);
      
      // Fetch portfolios for all students
      await fetchAllStudentPortfolios(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyCourses = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`${getApiBaseUrl()}/api/courses/faculty/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const courses = await response.json();
        setFacultyCourses(courses);
        await fetchCourseEnrollments(courses);
      }
    } catch (error) {
      console.error('Error fetching faculty courses:', error);
    }
  };

  const fetchCourseEnrollments = async (coursesList = []) => {
    const targetCourses = coursesList.length ? coursesList : facultyCourses;
    if (!targetCourses || targetCourses.length === 0) {
      setCourseEnrollments({});
      return;
    }

    const enrollmentMap = {};
    for (const course of targetCourses) {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/courses/${course.courseCode}/students`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          enrollmentMap[course.courseCode] = data.map((student) => student.userID);
        } else {
          enrollmentMap[course.courseCode] = [];
        }
      } catch (err) {
        console.error(`Error fetching enrollments for ${course.courseCode}:`, err);
        enrollmentMap[course.courseCode] = [];
      }
    }
    setCourseEnrollments(enrollmentMap);
  };

  const fetchAllStudentPortfolios = async (studentsList) => {
    try {
      const portfoliosMap = {};
      
      // Fetch portfolios for each student
      for (const student of studentsList) {
        try {
          const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${student.userID}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const portfolios = await response.json();
            portfoliosMap[student.userID] = portfolios;
          } else {
            portfoliosMap[student.userID] = [];
          }
        } catch (error) {
          console.error(`Error fetching portfolios for student ${student.userID}:`, error);
          portfoliosMap[student.userID] = [];
        }
      }
      
      setAllStudentPortfolios(portfoliosMap);
    } catch (error) {
      console.error('Error fetching all student portfolios:', error);
    }
  };

  const fetchStudentPortfolios = async (studentId) => {
    try {
      console.log('Fetching portfolios for student:', studentId);
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          localStorage.clear();
          navigate('/auth/login');
          return;
        }
        throw new Error('Failed to fetch portfolios');
      }

      const data = await response.json();
      console.log('Fetched portfolios:', data);
      setStudentPortfolios(data);
      // Update selected student
      const student = students.find(s => s.userID === studentId);
      console.log('Setting selected student:', student);
      setSelectedStudent(student);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch portfolios');
    }
  };

  const handleStudentClick = (studentId) => {
    console.log('Student clicked:', studentId);
    // Use pre-fetched data if available, otherwise fetch
    if (allStudentPortfolios[studentId]) {
      setStudentPortfolios(allStudentPortfolios[studentId]);
      const student = students.find(s => s.userID === studentId);
      setSelectedStudent(student);
    } else {
      fetchStudentPortfolios(studentId);
    }
  };

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  const refreshPortfolioData = async () => {
    if (students.length > 0) {
      await fetchAllStudentPortfolios(students);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRemoveStudent = (student) => {
    setStudentToRemove(student);
    setModalAction('remove');
    setShowRemoveModal(true);
    setSelectedCourse(getStudentEnrolledCourse(student.userID) || '');
  };

  const performRemoveStudent = async () => {
    if (!selectedCourse || !studentToRemove) return;

    try {
      console.log('Removing student:', studentToRemove.userID, 'from course:', selectedCourse);
      const response = await fetch(`${getApiBaseUrl()}/api/courses/${selectedCourse}/remove-student/${studentToRemove.userID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh the data
        await refreshPortfolioData();
        await fetchCourseEnrollments();
        setShowRemoveModal(false);
        setStudentToRemove(null);
        setSelectedCourse('');
        showNotification(`Student ${studentToRemove.fname} ${studentToRemove.lname} has been removed from ${selectedCourse}.`, 'success');
        return;
      } else if (response.status === 404) {
        // Treat as already removed and sync UI state
        const updatedEnrollments = { ...courseEnrollments };
        if (Array.isArray(updatedEnrollments[selectedCourse])) {
          updatedEnrollments[selectedCourse] = updatedEnrollments[selectedCourse].filter((id) => id !== studentToRemove.userID);
        }
        setCourseEnrollments(updatedEnrollments);
        await refreshPortfolioData();
        setShowRemoveModal(false);
        setStudentToRemove(null);
        setSelectedCourse('');
        showNotification(`Student ${studentToRemove.fname} ${studentToRemove.lname} is already removed from ${selectedCourse}.`, 'success');
        return;
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/auth/login');
        return;
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Unknown error';
        } catch (e) {
          // If response is not JSON, try to get text
          try {
            const errorText = await response.text();
            errorMessage = errorText || 'Unknown error';
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        showNotification(`Failed to remove student: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('Error removing student:', error);
      showNotification('Failed to remove student. Please try again.', 'error');
    }
  };

  const cancelRemoveStudent = () => {
    setShowRemoveModal(false);
    setStudentToRemove(null);
    setSelectedCourse('');
  };

  // Check if a student is enrolled in any of the faculty's courses
  const isStudentEnrolledInFacultyCourse = (studentId) => {
    return Object.values(courseEnrollments).some((studentIds = []) =>
      Array.isArray(studentIds) && studentIds.includes(studentId)
    );
  };

  // Get the course code that a student is enrolled in (if any)
  const getStudentEnrolledCourse = (studentId) => {
    for (const [courseCode, studentIds] of Object.entries(courseEnrollments)) {
      if (Array.isArray(studentIds) && studentIds.includes(studentId)) {
        return courseCode;
      }
    }
    return null;
  };

  const getAvailableCoursesForStudent = (studentId) =>
    facultyCourses.filter((course) => {
      const enrolledStudents = courseEnrollments[course.courseCode] || [];
      return !enrolledStudents.includes(studentId);
    });

  const openConfirmationDialog = () => {
    if (!studentToRemove || !selectedCourse) {
      showNotification('Please select a course first.', 'error');
      return;
    }

    const actionCopy = modalAction === 'add' ? 'add' : 'remove';
    const title = actionCopy === 'add' ? 'Confirm Add Student' : 'Confirm Remove Student';
    const description = actionCopy === 'add'
      ? `Are you sure you want to add ${studentToRemove.fname} ${studentToRemove.lname} to ${selectedCourse}?`
      : `Are you sure you want to remove ${studentToRemove.fname} ${studentToRemove.lname} from ${selectedCourse}?`;

    setConfirmationDialog({
      action: actionCopy,
      title,
      description
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmationDialog) return;
    const action = confirmationDialog.action;
    setConfirmationDialog(null);

    if (action === 'add') {
      await performAddStudent();
    } else {
      await performRemoveStudent();
    }
  };

  const handleAddStudent = (student) => {
    const availableCourses = getAvailableCoursesForStudent(student.userID);
    if (availableCourses.length === 0) {
      showNotification(`Student ${student.fname} ${student.lname} is already enrolled in all of your courses.`, 'error');
      return;
    }

    setStudentToRemove(student);
    setModalAction('add');
    setShowRemoveModal(true);
    setSelectedCourse(availableCourses[0]?.courseCode || '');
  };

  const performAddStudent = async () => {
    if (!selectedCourse || !studentToRemove) return;

    try {
      // Pre-check if student is already enrolled in the selected course
      const enrollmentCheck = await fetch(`${getApiBaseUrl()}/api/courses/student/${studentToRemove.userID}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (enrollmentCheck.ok) {
        const enrolledCourses = await enrollmentCheck.json();
        const alreadyEnrolled = Array.isArray(enrolledCourses)
          && enrolledCourses.some((course) => course.courseCode === selectedCourse);

        if (alreadyEnrolled) {
          showNotification(
            `Student ${studentToRemove.fname} ${studentToRemove.lname} is already enrolled in ${selectedCourse}.`,
            'error'
          );
          return;
        }
      } else if (enrollmentCheck.status === 401) {
        localStorage.clear();
        navigate('/auth/login');
        return;
      }

      console.log('Adding student:', studentToRemove.userID, 'to course:', selectedCourse);
      const response = await fetch(`${getApiBaseUrl()}/api/courses/${selectedCourse}/add-student/${studentToRemove.userID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await refreshPortfolioData();
        await fetchCourseEnrollments();
        setShowRemoveModal(false);
        setStudentToRemove(null);
        setSelectedCourse('');
        showNotification(`Student ${studentToRemove.fname} ${studentToRemove.lname} has been added to ${selectedCourse}.`, 'success');
        return;
      } else if (response.status === 401) {
        localStorage.clear();
        navigate('/auth/login');
        return;
      } else {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || 'Unknown error';
        } catch (e) {
          try {
            const errorText = await response.text();
            errorMessage = errorText || 'Unknown error';
          } catch (textError) {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        showNotification(`Failed to add student: ${errorMessage}`, 'error');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      showNotification('Failed to add student. Please try again.', 'error');
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    `${student.fname} ${student.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group portfolios by category
  const groupedPortfolios = studentPortfolios.reduce((acc, portfolio) => {
    console.log('Processing portfolio:', portfolio);
    const category = (portfolio.category || '').toLowerCase();
    console.log('Portfolio category:', category);

    if (!acc.projects) acc.projects = [];
    if (!acc.microcredentials) acc.microcredentials = [];

    if (category === 'project') {
      acc.projects.push(portfolio);
    } else if (category === 'microcredentials') {
      acc.microcredentials.push(portfolio);
    }

    return acc;
  }, { projects: [], microcredentials: [] });

  console.log('Grouped portfolios:', groupedPortfolios);

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Student Table (Full Width) */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Student List</h1>
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#800000] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={refreshPortfolioData}
            disabled={loading}
            className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white dark:bg-gray-900 shadow border border-gray-200 dark:border-gray-700">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading students and portfolios...</span>
            </div>
          )}
          {!loading && (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Username</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Program/Major</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Portfolio Items</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredStudents.map((student) => {
                // Calculate portfolio stats for this student using pre-fetched data
                const portfolios = allStudentPortfolios[student.userID] || [];
                const projects = portfolios.filter(p => p.category?.toLowerCase() === 'project');
                const microcredentials = portfolios.filter(p => p.category?.toLowerCase() === 'microcredentials');
                // Status logic (green if updated in last 7 days, yellow if 7-30, red otherwise)
                let statusColor = 'bg-red-500';
                let lastUpdate = '';
                if (portfolios.length > 0) {
                  const last = portfolios.reduce((a, b) => new Date(a.lastUpdated || a.createdAt) > new Date(b.lastUpdated || b.createdAt) ? a : b);
                  lastUpdate = new Date(last.lastUpdated || last.createdAt).toLocaleDateString();
                  const days = (Date.now() - new Date(last.lastUpdated || last.createdAt)) / (1000 * 60 * 60 * 24);
                  if (days <= 7) statusColor = 'bg-green-500';
                  else if (days <= 30) statusColor = 'bg-yellow-400';
                }
                return (
                  <tr key={student.userID} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">{student.fname} {student.lname}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{student.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{student.programMajor || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{projects.length + microcredentials.length} ({projects.length}/{microcredentials.length})</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block w-4 h-4 rounded-full ${statusColor}`}></span>
                    </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleStudentClick(student.userID)}
                                        className="px-3 py-1 bg-[#800000] text-white rounded hover:bg-[#600000] text-sm font-semibold"
                                      >
                                        View
                                      </button>
                                      {facultyCourses.length > 0 && (
                                        <>
                                          <button
                                            onClick={() => handleAddStudent(student)}
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Add to Course"
                                            disabled={getAvailableCoursesForStudent(student.userID).length === 0}
                                          >
                                            <UserPlus className="w-3 h-3" />
                                            Add
                                          </button>
                                          <button
                                            onClick={() => handleRemoveStudent(student)}
                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Remove from Course"
                                            disabled={!isStudentEnrolledInFacultyCourse(student.userID)}
                                          >
                                            <UserMinus className="w-3 h-3" />
                                            Remove
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No students found</td>
                </tr>
              )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected Student's Profile & Portfolio Tabs (Full Width) */}
      {selectedStudent && (
        <StudentProfileTabs
          student={selectedStudent}
          portfolios={studentPortfolios}
          groupedPortfolios={groupedPortfolios}
          onClose={() => setSelectedStudent(null)}
          onViewPortfolio={setViewPortfolio}
          token={token}
          setStudentPortfolios={setStudentPortfolios}
        />
      )}

      {/* Portfolio Details Modal */}
      {viewPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md shadow-lg relative max-h-[80vh] overflow-y-auto hide-scrollbar">
            <button
              onClick={() => setViewPortfolio(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-[#800000] mb-2">{viewPortfolio.portfolioTitle}</h2>
            <div className="mb-4">
              <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Category:</span>
              <span className="ml-2 text-sm text-gray-500 capitalize">{viewPortfolio.category}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-[#800000] uppercase tracking-wide text-xs">Description:</span>
              <div className="mt-1 text-gray-700 dark:text-gray-200 break-words text-left">
                {viewPortfolio.portfolioDescription?.split('\n').map((line, index) => (
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
            {viewPortfolio.githubLink && (
              <div className="mb-2">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">GitHub:</span>
                <a href={viewPortfolio.githubLink} className="ml-2 text-blue-700 hover:underline break-all text-sm" target="_blank" rel="noopener noreferrer">{viewPortfolio.githubLink}</a>
              </div>
            )}
            {viewPortfolio.certTitle && (
              <div className="mb-2">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Certificate:</span>
                <span className="ml-2 text-gray-800 text-sm">{viewPortfolio.certTitle}</span>
              </div>
            )}
            {viewPortfolio.issueDate && (
              <div className="mb-2">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Issue Date:</span>
                <span className="ml-2 text-gray-800 text-sm">{new Date(viewPortfolio.issueDate).toLocaleDateString()}</span>
              </div>
            )}
            {viewPortfolio.certFile &&
              (viewPortfolio.certFile.endsWith('.jpg') || viewPortfolio.certFile.endsWith('.jpeg') || viewPortfolio.certFile.endsWith('.png')) && (
                <div className="mb-4">
                  <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Certificate Image:</span>
                  <div className="mt-2">
                    <img
                      src={`${getApiBaseUrl()}/${viewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`}
                      alt="Certificate"
                      className="max-w-full max-h-64 rounded border border-gray-200 dark:border-gray-700 shadow cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setPreviewImage(`${getApiBaseUrl()}/${viewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`)}
                    />
                  </div>
                </div>
            )}
            {viewPortfolio.skills && viewPortfolio.skills.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Skills:</span>
                <span className="ml-2 text-gray-800 text-sm">{viewPortfolio.skills.map(skill => skill.skillName || skill).join(', ')}</span>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewPortfolio(null)}
                className="px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 z-10"
            >
              <X size={32} />
            </button>
            <img
              src={previewImage}
              alt="Certificate Preview"
              className="max-w-full max-h-[80vh] rounded shadow-lg border-4 border-white"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}

                  {/* Add/Remove Student from Course Modal */}
                  {showRemoveModal && studentToRemove && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-full ${
                            modalAction === 'remove' 
                              ? 'bg-red-100 dark:bg-red-900/20' 
                              : 'bg-green-100 dark:bg-green-900/20'
                          }`}>
                            {modalAction === 'remove' ? (
                              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            ) : (
                              <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {modalAction === 'remove' ? 'Remove Student from Course' : 'Add Student to Course'}
                          </h2>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-gray-600 dark:text-gray-300 mb-2">
                            {modalAction === 'remove' ? (
                              <>
                                Are you sure you want to remove <strong>{studentToRemove.fname} {studentToRemove.lname}</strong> from a course?
                              </>
                            ) : (
                              <>
                                Add <strong>{studentToRemove.fname} {studentToRemove.lname}</strong> to one of your courses?
                              </>
                            )}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {modalAction === 'remove' ? (
                              'This action will remove the student from the selected course and may affect their portfolio items associated with that course.'
                            ) : (
                              'This will associate the student\'s portfolio with the selected course.'
                            )}
                          </p>
                        </div>

                        <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {modalAction === 'remove' ? 'Select Course to Remove From:' : 'Select Course to Add To:'}
                          </label>
                          <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                              modalAction === 'remove' 
                                ? 'focus:ring-red-500' 
                                : 'focus:ring-green-500'
                            }`}
                          >
                            <option value="">Select a course...</option>
                            {facultyCourses.map((course) => (
                              <option key={course.id} value={course.courseCode}
                                disabled={modalAction === 'add' && (courseEnrollments[course.courseCode] || []).includes(studentToRemove?.userID)}
                              >
                                {course.courseCode} - {course.courseName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-3 justify-end">
                          <button
                            onClick={cancelRemoveStudent}
                            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={openConfirmationDialog}
                            disabled={!selectedCourse}
                            className="px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 bg-[#800000] hover:bg-[#5e0000]"
                          >
                            {modalAction === 'remove' ? (
                              <>
                                <UserMinus className="w-4 h-4" />
                                Remove Student
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4" />
                                Add Student
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

      {/* Confirmation Dialog */}
      {confirmationDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{confirmationDialog.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{confirmationDialog.description}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmationDialog(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-lg text-white bg-[#800000] hover:bg-[#5e0000]"
              >
                {confirmationDialog.action === 'add' ? 'Confirm Add' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-[120] max-w-sm w-full shadow-2xl rounded-2xl px-5 py-4 border bg-white/95 backdrop-blur dark:bg-gray-800/95 ${
          notification.type === 'error'
            ? 'border-red-200 text-red-700 dark:border-red-500/40 dark:text-red-300'
            : 'border-[#800000]/40 text-[#800000] dark:border-[#D4AF37]/40 dark:text-[#D4AF37]'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-1 w-2 h-12 rounded-full ${notification.type === 'error' ? 'bg-red-500' : 'bg-[#800000]'}`}></div>
            <div className="flex-1">
              <h4 className="font-semibold mb-1">{notification.type === 'error' ? 'Action Required' : 'Success'}</h4>
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
    </div>
  );
}

function StudentProfileTabs({ student, portfolios, groupedPortfolios, onClose, onViewPortfolio, token, setStudentPortfolios }) {
  const [activeTab, setActiveTab] = React.useState('Projects');

  // Calculate summary data
  const totalItems = portfolios.length;
  const lastUpdate = portfolios.length > 0 ?
    new Date(Math.max(...portfolios.map(p => new Date(p.lastUpdated || p.createdAt)))).toLocaleDateString() : '-';
  const completion = portfolios.length > 0 ? Math.round((portfolios.filter(p => p.category).length / 12) * 100) : 0; // Example logic

  // Activity timeline (recently updated portfolios)
  const getActivityTimestamp = (item) => {
    if (!item) return 0;
    const raw = item.lastUpdated || item.updatedAt || item.createdAt;
    if (!raw) return 0;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const formatActivityDate = (item) => {
    if (!item) return '—';
    const raw = item.lastUpdated || item.updatedAt || item.createdAt;
    if (!raw) return '—';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
  };

  const recentActivity = [...portfolios]
    .sort((a, b) => getActivityTimestamp(b) - getActivityTimestamp(a))
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 mb-8 p-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
        <img
          src={student.profilePic ? (student.profilePic.startsWith('http') ? student.profilePic : `${getApiBaseUrl()}${student.profilePic}`) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.fname + ' ' + student.lname)}
          alt={student.fname + ' ' + student.lname}
          className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 shadow-lg bg-white"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{student.fname} {student.lname}</h1>
              <div className="text-lg text-gray-600 dark:text-gray-300 font-medium mb-1">{student.programMajor || '—'}{student.studentNumber ? ` • ${student.studentNumber}` : ''}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{student.userEmail}</div>
            </div>
            <div className="flex gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-6 py-3 text-center">
                <div className="text-xs text-gray-500">Portfolio Items</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full self-start"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {['Micro-credentials', 'Projects', 'Activity Timeline', 'Skills Summary'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-lg font-semibold border-b-4 transition-all ${activeTab === tab ? 'border-[#800000] text-[#800000] dark:text-[#D4AF37]' : 'border-transparent text-gray-700 dark:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'Projects' && (
        <div className="space-y-6">
          {groupedPortfolios.projects.length === 0 ? (
            <div className="text-center text-gray-500">No projects found.</div>
          ) : (
            groupedPortfolios.projects.map((project) => (
              <div key={project.portfolioID} className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-[#800000]" />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{project.portfolioTitle}</h2>
                    <div className="text-sm text-gray-500">Completed: {project.issueDate ? new Date(project.issueDate).toLocaleDateString() : '—'} • Course: {project.courseCode || '—'}</div>
                  </div>
                  {/* Skill tags */}
                  <div className="flex flex-wrap gap-2">
                    {project.skills && project.skills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold" style={{background: '#e0e7ff', color: '#3730a3'}}>{skill.skillName || skill}</span>
                    ))}
                  </div>
                </div>
                <div className="text-gray-700 dark:text-gray-300 mb-2">{project.portfolioDescription}</div>
                <div className="flex gap-2 flex-wrap">
                  {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-200 rounded-lg text-sm font-semibold hover:bg-gray-300">GitHub</a>}
                  {/* Add more buttons as needed */}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {activeTab === 'Micro-credentials' && (
        <div className="space-y-6">
          {groupedPortfolios.microcredentials.length === 0 ? (
            <div className="text-center text-gray-500">No micro-credentials found.</div>
          ) : (
            groupedPortfolios.microcredentials.map((cred) => (
              <div key={cred.portfolioID} className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col gap-2 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{cred.certTitle || cred.portfolioTitle}</h2>
                    <div className="text-sm text-gray-500">Issued: {cred.issueDate ? new Date(cred.issueDate).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
                <div className="text-gray-700 dark:text-gray-300 mb-2">{cred.portfolioDescription}</div>
                {/* Add more info/buttons as needed */}
              </div>
            ))
          )}
        </div>
      )}
      {activeTab === 'Activity Timeline' && (
        <div className="space-y-6">
          {recentActivity.length === 0 ? (
            <div className="text-center text-gray-500">No recent activity.</div>
          ) : (
            recentActivity.map((item, idx) => (
              <div key={item.portfolioID || idx} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#800000]" />
                  <span className="font-semibold text-gray-900 dark:text-white">{item.portfolioTitle}</span>
                  <span className="text-xs text-gray-500">{formatActivityDate(item)}</span>
                </div>
                <div className="text-gray-600 text-sm">{item.portfolioDescription}</div>
              </div>
            ))
          )}
        </div>
      )}
      {activeTab === 'Skills Summary' && (
        <div className="py-8 text-center">
          {(() => {
            const langCounts = {};
            portfolios.forEach(p => {
              if (p.skills) {
                p.skills.forEach(skill => {
                  const lang = typeof skill === 'string' ? skill : (skill && skill.skillName ? skill.skillName : null);
                  if (lang) langCounts[lang] = (langCounts[lang] || 0) + 1;
                });
              }
            });
            const total = Object.values(langCounts).reduce((a, b) => a + b, 0);
            const chartData = Object.entries(langCounts).map(([lang, count]) => ({
              lang,
              count,
              percent: total ? Math.round((count / total) * 100) : 0
            })).sort((a, b) => b.count - a.count);
            if (chartData.length === 0) {
              return <div className="text-gray-400 italic">No programming languages found.</div>;
            }
            return (
              <div className="max-w-xl mx-auto">
                <div className="mb-6 text-lg font-semibold text-[#800000] dark:text-[#D4AF37]">Programming Language Skills Distribution</div>
                <ResponsiveContainer width="100%" height={50 * chartData.length}>
                  <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 10, right: 40, left: 40, bottom: 10 }}
                    barCategoryGap={20}
                  >
                    <XAxis type="number" hide domain={[0, Math.max(...chartData.map(d => d.count), 1)]} />
                    <YAxis type="category" dataKey="lang" tick={{ fontWeight: 'bold', fontSize: 18 }} width={100} />
                    <Bar dataKey="count" fill="#FFD700" radius={20} barSize={30}>
                      <LabelList dataKey="percent" position="insideRight" formatter={v => `${v}%`} style={{ fill: '#333', fontWeight: 'bold', fontSize: 16 }} />
                      <LabelList dataKey="count" position="right" formatter={v => v} style={{ fill: '#800000', fontWeight: 'bold', fontSize: 28 }} />
                    </Bar>
                    <Tooltip formatter={(value, name, props) => [`${value} projects`, 'Count']} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
