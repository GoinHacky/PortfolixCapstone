import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  User, 
  Mail, 
  Calendar, 
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  UserCheck,
  UserX,
  Key,
  AlertTriangle
} from 'lucide-react';
import { getApiBaseUrl } from '../../api/apiConfig';

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function AdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
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
    fetchFaculty();
  }, [token, navigate]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${getApiBaseUrl()}/api/users/faculty`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          navigate('/auth/login');
          return;
        }
        throw new Error('Failed to fetch faculty');
      }

      const data = await response.json();
      setFaculty(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, approve) => {
    setProcessingId(userId);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/approve/${userId}?approve=${approve}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update approval status');
      }

      fetchFaculty();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update approval status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResetPassword = async (faculty) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/users/faculty/${faculty.userID}/reset-password`, {
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

  const handleDeleteAccount = async (facultyToDelete) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/users/faculty/${facultyToDelete.userID}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      setShowDeleteConfirm(false);
      setFaculty(prev => prev.filter(f => f.userID !== facultyToDelete.userID));
      alert('Faculty account has been deleted successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete account');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const filteredFaculty = faculty.filter(f => 
    f.fname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.lname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Manage Faculty</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage faculty accounts</p>
        <div className="mt-2 text-lg font-semibold text-[#800000] dark:text-[#D4AF37]">Total Faculty: {faculty.length}</div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search faculty by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Faculty List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredFaculty.map((f) => (
          <div
            key={f.userID}
            className="glass-morphism bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {f.profilePic ? (
                  <img
                    src={f.profilePic.startsWith('http') ? f.profilePic : `${getApiBaseUrl()}${f.profilePic}`}
                    alt={f.fname + ' ' + f.lname}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#800000] bg-white"
                    onError={e => { e.target.onerror = null; e.target.src = ''; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#800000] flex items-center justify-center text-white font-semibold text-lg">
                    {f.fname?.[0]}{f.lname?.[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {f.fname} {f.lname}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{f.userEmail}</p>
                  <div className="mt-1">{getStatusBadge(f.status)}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {f.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleApproval(f.userID, true)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors shadow-md"
                      title="Approve"
                    >
                      <UserCheck className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleApproval(f.userID, false)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors shadow-md"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                ) : f.status === 'APPROVED' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedFaculty(f);
                        setShowResetConfirm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors shadow-md"
                      title="Reset Password"
                    >
                      <Key className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFaculty(f);
                        setShowDeleteConfirm(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors shadow-md"
                      title="Delete Account"
                    >
                      <UserX className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredFaculty.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No faculty found matching your search.
          </div>
        )}
      </div>

      {/* Reset Password Confirmation Modal */}
      {showResetConfirm && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Reset Password</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to reset the password for {selectedFaculty.fname} {selectedFaculty.lname}?
              A temporary password will be generated.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  setSelectedFaculty(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetPassword(selectedFaculty)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Delete Account</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete the account for {selectedFaculty.fname} {selectedFaculty.lname}?
                  This action cannot be undone and will permanently delete all associated data.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedFaculty(null);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteAccount(selectedFaculty)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Temporary Password</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please provide this temporary password to the faculty member. They will need to change it upon their next login.
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
