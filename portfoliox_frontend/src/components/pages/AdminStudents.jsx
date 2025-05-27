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
  AlertTriangle
} from 'lucide-react';

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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

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
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load students');
      setLoading(false);
    }
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Student Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search students by name, email, or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Students: {students.length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredStudents.map((student) => (
          <div key={student.userID} className="glass-morphism bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => handleStudentClick(student.userID)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#800000] flex items-center justify-center text-white font-semibold text-lg">
                    {student.fname?.[0]}{student.lname?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {student.fname} {student.lname}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        {student.userEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        @{student.username}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(student);
                      setShowResetConfirm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors shadow-md"
                    title="Reset Password"
                  >
                    <Key className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStudent(student);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors shadow-md"
                    title="Delete Account"
                  >
                    <UserX className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/dashboard/students/${student.userID}`);
                    }}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors shadow-md"
                    title="View Portfolios"
                  >
                    <FolderOpen className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {expandedStudent === student.userID && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                <h4 className="font-medium text-gray-700 dark:text-white mb-3">Portfolio Items</h4>
                {portfolios[student.userID]?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolios[student.userID].map((portfolio) => (
                      <div key={portfolio.portfolioID} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-gray-800 dark:text-white">{portfolio.portfolioTitle}</h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{portfolio.category}</p>
                          </div>
                          <a
                            href={`http://localhost:8080/api/portfolios/public/${portfolio.publicToken}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-md"
                            title="View portfolio"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {portfolio.portfolioDescription}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No portfolio items found.</p>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <User size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No students found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? `No students match your search "${searchTerm}"`
                : 'There are no students registered yet.'}
            </p>
          </div>
        )}
      </div>

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
    </div>
  );
}
