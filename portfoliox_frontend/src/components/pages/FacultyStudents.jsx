import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Folder, GraduationCap, X, ChevronDown, ChevronRight, FileText, RefreshCw, UserMinus, AlertTriangle, UserPlus, Lock, Unlock, CheckCircle } from 'lucide-react';
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
  const [portfolioStats, setPortfolioStats] = useState({}); // Store just portfolio counts for all students
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
  const [witnessConfirmation, setWitnessConfirmation] = useState(null);
  const [witnessAction, setWitnessAction] = useState(null); // 'add' or 'remove'

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
      setStudents(data);
      
      // Fetch portfolio stats for all students (lightweight)
      await fetchAllStudentPortfolioStats(data);
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

  const fetchAllStudentPortfolioStats = async (studentsList) => {
    try {
      const statsMap = {};
      
      // For deployed systems without stats endpoint, fetch minimal data or use cached data
      // Option 1: Fetch only first few portfolios to get counts (faster than all)
      // Option 2: Use a batch approach with delays to avoid overwhelming the server
      
      for (let i = 0; i < studentsList.length; i++) {
        const student = studentsList[i];
        try {
          // For deployed systems, we'll use a lightweight approach
          // Just set default values initially and update as needed
          statsMap[student.userID] = { 
            total: 0, 
            projects: 0, 
            microcredentials: 0, 
            lastUpdate: null,
            loading: true // Mark as loading
          };
          
          // Set the stats immediately to show the table
          setPortfolioStats(prev => ({...prev, [student.userID]: statsMap[student.userID]}));
          
          // Then fetch actual data with a small delay to prevent server overload
          setTimeout(async () => {
            try {
              const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${student.userID}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                const portfolios = await response.json();
                const projects = portfolios.filter(p => p.category?.toLowerCase() === 'project');
                const microcredentials = portfolios.filter(p => p.category?.toLowerCase() === 'microcredentials');
                const actualStats = {
                  total: portfolios.length,
                  projects: projects.length,
                  microcredentials: microcredentials.length,
                  lastUpdate: portfolios.length > 0 ? Math.max(...portfolios.map(p => new Date(p.lastUpdated || p.createdAt))) : null,
                  loading: false
                };
                
                // Update the stats for this student
                setPortfolioStats(prev => ({...prev, [student.userID]: actualStats}));
              } else {
                // Set error state
                setPortfolioStats(prev => ({
                  ...prev, 
                  [student.userID]: { 
                    total: 0, 
                    projects: 0, 
                    microcredentials: 0, 
                    lastUpdate: null, 
                    loading: false,
                    error: true
                  }
                }));
              }
            } catch (error) {
              console.error(`Error fetching portfolio stats for student ${student.userID}:`, error);
              setPortfolioStats(prev => ({
                ...prev, 
                [student.userID]: { 
                  total: 0, 
                  projects: 0, 
                  microcredentials: 0, 
                  lastUpdate: null, 
                  loading: false,
                  error: true
                }
              }));
            }
          }, i * 100); // Stagger requests by 100ms to prevent server overload
          
        } catch (error) {
          console.error(`Error setting up portfolio stats for student ${student.userID}:`, error);
          statsMap[student.userID] = { total: 0, projects: 0, microcredentials: 0, lastUpdate: null, loading: false, error: true };
        }
      }
    } catch (error) {
      console.error('Error setting up student portfolio stats:', error);
    }
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
      setStudentPortfolios(data);
      // Update selected student
      const student = students.find(s => s.userID === studentId);
      setSelectedStudent(student);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch portfolios');
    }
  };

  const handleStudentClick = (studentId) => {
    // Always fetch fresh data when clicking view to ensure we have the latest
    fetchStudentPortfolios(studentId);
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
        await fetchCourseEnrollments();
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

  const handleWitnessMicrocredential = (portfolioId, portfolioTitle) => {
    setWitnessAction('add');
    setWitnessConfirmation({
      portfolioId,
      title: 'Witness Microcredential',
      description: `Are you sure you want to witness "${portfolioTitle}"? This will verify the authenticity of this microcredential.`
    });
  };

  const handleUnwitnessMicrocredential = (portfolioId, portfolioTitle) => {
    setWitnessAction('remove');
    setWitnessConfirmation({
      portfolioId,
      title: 'Remove Witness Confirmation',
      description: `Are you sure you want to remove your witness from "${portfolioTitle}"? This will affect the verification status of this microcredential.`
    });
  };

  const performUnwitnessMicrocredential = async (portfolioId) => {
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
        setViewPortfolio(prev => ({
          ...prev,
          witnessedByIds: data.witnessedByIds,
          witnessedByNames: data.witnessedByNames
        }));
        setStudentPortfolios(prev => prev.map(p => 
          p.portfolioID === portfolioId ? {
            ...p,
            witnessedByIds: data.witnessedByIds,
            witnessedByNames: data.witnessedByNames
          } : p
        ));
        await refreshPortfolioData();
        showNotification('Witness successfully removed!', 'success');
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Failed to remove witness', 'error');
      }
    } catch (error) {
      console.error('Error removing witness:', error);
      showNotification('Failed to remove witness. Please try again.', 'error');
    }
  };

  const performWitnessMicrocredential = async (portfolioId) => {
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
        setViewPortfolio(prev => ({
          ...prev,
          witnessedByIds: data.witnessedByIds,
          witnessedByNames: data.witnessedByNames
        }));
        setStudentPortfolios(prev => prev.map(p => 
          p.portfolioID === portfolioId ? {
            ...p,
            witnessedByIds: data.witnessedByIds,
            witnessedByNames: data.witnessedByNames
          } : p
        ));
        await refreshPortfolioData();
        showNotification('Successfully witnessed microcredential!', 'success');
      } else {
        const errorText = await response.text();
        showNotification(errorText || 'Failed to witness microcredential', 'error');
      }
    } catch (error) {
      console.error('Error witnessing microcredential:', error);
      showNotification('Failed to witness microcredential. Please try again.', 'error');
    }
  };

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

    if (Array.isArray(courseEnrollments[selectedCourse]) && courseEnrollments[selectedCourse].includes(studentToRemove.userID)) {
      showNotification(
        `Student ${studentToRemove.fname} ${studentToRemove.lname} is already enrolled in ${selectedCourse}.`,
        'error'
      );
      return;
    }

    try {
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

  // Group portfolios by category - only calculate when there's data
  const groupedPortfolios = React.useMemo(() => {
    if (!studentPortfolios || studentPortfolios.length === 0) {
      return { projects: [], microcredentials: [] };
    }
    
    return studentPortfolios.reduce((acc, portfolio) => {
      const category = (portfolio.category || '').toLowerCase();

      if (!acc.projects) acc.projects = [];
      if (!acc.microcredentials) acc.microcredentials = [];

      if (category === 'project') {
        acc.projects.push(portfolio);
      } else if (category === 'microcredentials') {
        acc.microcredentials.push(portfolio);
      }

      return acc;
    }, { projects: [], microcredentials: [] });
  }, [studentPortfolios]);

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
                // Get portfolio stats for this student using lightweight stats
                const stats = portfolioStats[student.userID] || { total: 0, projects: 0, microcredentials: 0, lastUpdate: null, loading: false };
                
                // Show loading state or actual data
                const portfolioDisplay = stats.loading ? (
                  <span className="text-gray-400 text-xs">Loading...</span>
                ) : stats.error ? (
                  <span className="text-red-400 text-xs">Error</span>
                ) : (
                  `${stats.total} (${stats.projects}/${stats.microcredentials})`
                );
                
                // Status logic (green if active in last 7 days based on lastLogin, red otherwise)
                let statusColor = 'bg-red-500'; // Default red for offline
                if (!stats.loading && !stats.error && student.lastLogin) {
                  const days = (Date.now() - new Date(student.lastLogin)) / (1000 * 60 * 60 * 24);
                  if (days <= 7) statusColor = 'bg-green-500'; // Online/active
                  else statusColor = 'bg-red-500'; // Offline/inactive
                }
                
                return (
                  <tr key={student.userID} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 dark:text-white">{student.fname} {student.lname}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{student.username}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{student.programMajor || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{portfolioDisplay}</td>
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
                                            className="px-3 py-1 bg-[#D4AF37] text-white rounded hover:bg-[#B8860B] text-sm font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Add to Course"
                                            disabled={getAvailableCoursesForStudent(student.userID).length === 0}
                                          >
                                            <UserPlus className="w-3 h-3" />
                                            Add
                                          </button>
                                          <button
                                            onClick={() => handleRemoveStudent(student)}
                                            className="px-3 py-1 bg-[#D4AF37] text-white rounded hover:bg-[#B8860B] text-sm font-semibold flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Student Profile Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          portfolios={studentPortfolios}
          groupedPortfolios={groupedPortfolios}
          onClose={() => {
            setSelectedStudent(null);
            setStudentPortfolios([]);
          }}
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
                <span className="ml-2 text-gray-800 dark:text-gray-200 text-sm">{viewPortfolio.skills.map(skill => skill.skillName || skill).join(', ')}</span>
              </div>
            )}
            {viewPortfolio.category === 'microcredentials' && (
              <>
                {viewPortfolio.witnessedByNames && viewPortfolio.witnessedByNames.length > 0 ? (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-green-700 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide text-xs">Verified & Witnessed By Faculty</span>
                    </div>
                    <div className="text-gray-800 dark:text-gray-300 text-sm">
                      {viewPortfolio.witnessedByNames.split(',').map((name, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1">
                          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          <span>{name.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                      <span className="font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide text-xs">Pending Faculty Witness</span>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">This microcredential needs faculty verification.</p>
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  {viewPortfolio.witnessedByIds && viewPortfolio.witnessedByIds.split(',').includes(localStorage.getItem('userId')) ? (
                    <button
                      onClick={() => handleUnwitnessMicrocredential(viewPortfolio.portfolioID, viewPortfolio.portfolioTitle)}
                      className="flex-1 px-4 py-2 bg-[#D4AF37] text-white rounded-md hover:bg-[#B8860B] flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Remove My Witness
                    </button>
                  ) : (
                    <button
                      onClick={() => handleWitnessMicrocredential(viewPortfolio.portfolioID, viewPortfolio.portfolioTitle)}
                      className="flex-1 px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000] flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Witness & Verify
                    </button>
                  )}
                </div>
              </>
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

      {/* Witness Confirmation Dialog */}
      {witnessConfirmation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[110] px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${witnessAction === 'add' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
                {witnessAction === 'add' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-[#D4AF37]" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{witnessConfirmation.title}</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{witnessConfirmation.description}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setWitnessConfirmation(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (witnessAction === 'add') {
                    await performWitnessMicrocredential(witnessConfirmation.portfolioId);
                  } else {
                    await performUnwitnessMicrocredential(witnessConfirmation.portfolioId);
                  }
                  setWitnessConfirmation(null);
                }}
                className={`px-4 py-2 rounded-lg text-white ${
                  witnessAction === 'add' 
                    ? 'bg-[#800000] hover:bg-[#600000]' 
                    : 'bg-[#D4AF37] hover:bg-[#B8860B]'
                }`}
              >
                {witnessAction === 'add' ? 'Witness Microcredential' : 'Remove Witness'}
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

function StudentProfileModal({ student, portfolios, groupedPortfolios, onClose, onViewPortfolio, token, setStudentPortfolios }) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full z-10"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[90vh] p-8">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
            <img
              src={student.profilePic ? (student.profilePic.startsWith('http') ? student.profilePic : `${getApiBaseUrl()}${student.profilePic}`) : 'https://ui-avatars.com/api/?name=' + encodeURIComponent(student.fname + ' ' + student.lname)}
              alt={student.fname + ' ' + student.lname}
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-700"
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
                    <div className="text-xs text-gray-500 dark:text-gray-400">Portfolio Items</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
                  </div>
                </div>
              </div>
            </div>
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
                <div className="text-center text-gray-500 dark:text-gray-400">No projects found.</div>
              ) : (
                groupedPortfolios.projects.map((project) => (
                  <div 
                    key={project.portfolioID} 
                    onClick={() => onViewPortfolio(project)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-lg hover:border-[#800000] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-[#800000]" />
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{project.portfolioTitle}</h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Completed: {project.issueDate ? new Date(project.issueDate).toLocaleDateString() : '—'} • Course: {project.courseCode || '—'}</div>
                      </div>
                      {/* Skill tags */}
                      <div className="flex flex-wrap gap-2">
                        {project.skills && project.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">{skill.skillName || skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-2">{project.portfolioDescription}</div>
                    <div className="flex gap-2 flex-wrap">
                      {project.githubLink && <a href={project.githubLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white">GitHub</a>}
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
                <div className="text-center text-gray-500 dark:text-gray-400">No micro-credentials found.</div>
              ) : (
                groupedPortfolios.microcredentials.map((cred) => (
                  <div 
                    key={cred.portfolioID} 
                    onClick={() => onViewPortfolio(cred)}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col gap-2 shadow-sm hover:shadow-lg hover:border-[#800000] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{cred.certTitle || cred.portfolioTitle}</h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Issued: {cred.issueDate ? new Date(cred.issueDate).toLocaleDateString() : '—'}</div>
                      </div>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300 mb-2">{cred.portfolioDescription}</div>
                    {cred.witnessedByNames && cred.witnessedByNames.length > 0 ? (
                      <div className="mt-2 flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                        <Lock className="w-3 h-3" />
                        <span>Verified by {cred.witnessedByNames.split(',').length} faculty</span>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-400">
                        <Unlock className="w-3 h-3" />
                        <span>Pending witness</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'Activity Timeline' && (
            <div className="space-y-6">
              {recentActivity.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400">No recent activity.</div>
              ) : (
                recentActivity.map((item, idx) => (
                  <div key={item.portfolioID || idx} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#800000]" />
                      <span className="font-semibold text-gray-900 dark:text-white">{item.portfolioTitle}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{formatActivityDate(item)}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">{item.portfolioDescription}</div>
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
                  return <div className="text-gray-400 dark:text-gray-500 italic">No programming languages found.</div>;
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
      </div>
    </div>
  );
}
