import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  Mail, 
  Calendar, 
  FolderOpen, 
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserX,
  Key,
  AlertTriangle,
  Eye,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [portfolios, setPortfolios] = useState({});
  const [allStudentPortfolios, setAllStudentPortfolios] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [viewPortfolio, setViewPortfolio] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchStudents();
  }, [token, navigate]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/users/students', {
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
      await fetchAllStudentPortfolios(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load students');
      setLoading(false);
    }
  };

  const fetchAllStudentPortfolios = async (studentsList) => {
    const portfoliosMap = {};
    for (const student of studentsList) {
      try {
        const response = await fetch(`http://localhost:8080/api/portfolios/student/${student.userID}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          portfoliosMap[student.userID] = await response.json();
        } else {
          portfoliosMap[student.userID] = [];
        }
      } catch (error) {
        console.error(`Error fetching portfolios for student ${student.userID}:`, error);
        portfoliosMap[student.userID] = [];
      }
    }
    setAllStudentPortfolios(portfoliosMap);
  };

  const fetchStudentPortfolios = async (studentId) => {
    if (portfolios[studentId]) return; // Already fetched

    try {
      const response = await fetch(`http://localhost:8080/api/portfolios/student/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolios');
      }

      const data = await response.json();
      setPortfolios(prev => ({
        ...prev,
        [studentId]: data
      }));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStudentClick = async (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(studentId);
      await fetchStudentPortfolios(studentId);
    }
  };

  const handleViewStudent = async (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
    await fetchStudentPortfolios(student.userID);
  };

  const handleResetPassword = async (student) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/students/${student.userID}/reset-password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      const data = await response.json();
      setTempPassword(data.temporaryPassword);
      setShowResetConfirm(false);
      alert('Password has been reset successfully. The temporary password will be shown only once.');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reset password');
    }
  };

  const handleDeleteAccount = async (student) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/students/${student.userID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setShowDeleteConfirm(false);
      setStudents(students.filter(s => s.userID !== student.userID));
      alert('Student account has been deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete account');
    }
  };

  const filteredStudents = students.filter(student => {
    const searchString = searchTerm.toLowerCase();
    return (
      student.fname?.toLowerCase().includes(searchString) ||
      student.lname?.toLowerCase().includes(searchString) ||
      student.userEmail?.toLowerCase().includes(searchString) ||
      student.username?.toLowerCase().includes(searchString)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 dark:bg-red-900/20 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Student Table (Full Width) */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Student List</h1>
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search students by name, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#800000] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Last Update</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredStudents.map((student) => {
                // Calculate portfolio stats using pre-fetched data
                const studentPortfolios = allStudentPortfolios[student.userID] || [];
                const projects = studentPortfolios.filter(p => p.category?.toLowerCase() === 'project');
                const microcredentials = studentPortfolios.filter(p => p.category?.toLowerCase() === 'microcredentials');
                // Status logic (green if updated in last 7 days, yellow if 7-30, red otherwise)
                let statusColor = 'bg-red-500';
                let lastUpdate = '';
                if (studentPortfolios.length > 0) {
                  const last = studentPortfolios.reduce((a, b) => new Date(a.lastUpdated || a.createdAt) > new Date(b.lastUpdated || b.createdAt) ? a : b);
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
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">{lastUpdate || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-block w-4 h-4 rounded-full ${statusColor}`}></span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap flex gap-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="px-3 py-1 bg-[#800000] text-white rounded hover:bg-[#600000] text-sm font-semibold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => { setSelectedStudent(student); setShowResetConfirm(true); }}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => { setSelectedStudent(student); setShowDeleteConfirm(true); }}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">No students found</td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>


      {/* Student Portfolio Modal */}
      {showStudentModal && selectedStudent && allStudentPortfolios[selectedStudent.userID] && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {selectedStudent.fname} {selectedStudent.lname}'s Portfolios
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedStudent.userEmail}</p>
              </div>
              <button
                onClick={() => {
                  setShowStudentModal(false);
                  setSelectedStudent(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Projects Section */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
                    <span className="font-medium text-gray-800 dark:text-white">Projects</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                      {allStudentPortfolios[selectedStudent.userID].filter(p => p.category?.toLowerCase() === 'project').length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {allStudentPortfolios[selectedStudent.userID].filter(p => p.category?.toLowerCase() === 'project').length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No projects found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allStudentPortfolios[selectedStudent.userID].filter(p => p.category?.toLowerCase() === 'project').map((portfolio) => (
                        <div
                          key={portfolio.portfolioID}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800 dark:text-white">{portfolio.portfolioTitle}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 break-words whitespace-pre-line">{portfolio.portfolioDescription}</p>
                            </div>
                            <button
                              onClick={() => setViewPortfolio(portfolio)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors ml-2"
                              title="View Portfolio"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          {portfolio.githubLink && (
                            <a
                              href={portfolio.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              View on GitHub
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Microcredentials Section */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
                    <span className="font-medium text-gray-800 dark:text-white">Microcredentials</span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                      {allStudentPortfolios[selectedStudent.userID].filter(p => p.category?.toLowerCase() === 'microcredentials').length}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  {allStudentPortfolios[selectedStudent.userID].filter(p => p.category?.toLowerCase() === 'microcredentials').length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No microcredentials found
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allStudentPortfolios[selectedStudent.userID].filter(p => p.category?.toLowerCase() === 'microcredentials').map((portfolio) => (
                        <div
                          key={portfolio.portfolioID}
                          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-800 dark:text-white">{portfolio.portfolioTitle}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 break-words whitespace-pre-line">{portfolio.portfolioDescription}</p>
                            </div>
                            <button
                              onClick={() => setViewPortfolio(portfolio)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors ml-2"
                              title="View Portfolio"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="mt-2 space-y-1">
                            {portfolio.certTitle && (
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Certificate: {portfolio.certTitle}
                              </p>
                            )}
                            {portfolio.issueDate && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Issued: {new Date(portfolio.issueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Skills Summary */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden p-6">
                <div className="mb-4 text-lg font-semibold text-[#800000] dark:text-[#D4AF37] text-center">Skills Summary</div>
                {(() => {
                  const langCounts = {};
                  allStudentPortfolios[selectedStudent.userID].forEach(p => {
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
                    return <div className="text-gray-400 italic text-center">No programming languages found.</div>;
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
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Confirmation Modal */}
      {showResetConfirm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Reset Password</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to reset the password for {selectedStudent.fname} {selectedStudent.lname}?
              A temporary password will be generated.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPassword(selectedStudent)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Delete Account</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete the account for {selectedStudent.fname} {selectedStudent.lname}?
                  This action cannot be undone and will permanently delete all associated data.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedStudent(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAccount(selectedStudent)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Password Modal */}
      {tempPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Temporary Password</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide this temporary password to the student. They will need to change it upon their next login.
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
              <code className="text-lg font-mono text-[#800000] dark:text-[#D4AF37]">{tempPassword}</code>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setTempPassword(null)}
                className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
                      src={`http://localhost:8080/${viewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`}
                      alt="Certificate"
                      className="max-w-full max-h-64 rounded border border-gray-200 dark:border-gray-700 shadow cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setPreviewImage(`http://localhost:8080/${viewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`)}
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

      {/* Certificate Preview Modal */}
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
    </div>
  );
}
