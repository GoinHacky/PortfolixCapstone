import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { getApiBaseUrl } from '../../api/apiConfig';

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function AdminRequest() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchRequests();
  }, [token, navigate]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/users/faculty/pending`, {
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
        throw new Error('Failed to fetch faculty requests');
      }

      const data = await response.json();
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load faculty requests');
      setLoading(false);
    }
  };

  const handleApproval = async (userId, approve) => {
    setProcessingId(userId);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/approve/${userId}?approve=${approve}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      // Remove the processed request from the list
      setRequests(prev => prev.filter(req => req.userID !== userId));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update request status');
    } finally {
      setProcessingId(null);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Faculty Requests</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Pending Requests: {requests.length}
          </div>
        </div>
      </div>

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request.userID} className="glass-morphism bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#800000] flex items-center justify-center text-white font-semibold text-xl">
                    {request.fname?.[0]}{request.lname?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white">
                      {request.fname} {request.lname}
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">@{request.username}</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        <Clock size={12} className="mr-1" />
                        Pending Approval
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                    {request.userEmail}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar size={14} className="text-gray-400 dark:text-gray-500" />
                    Requested on {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproval(request.userID, true)}
                    disabled={processingId === request.userID}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(request.userID, false)}
                    disabled={processingId === request.userID}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <AlertTriangle size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending requests</h3>
          <p className="text-gray-500 dark:text-gray-400">
            There are no faculty registration requests waiting for approval.
          </p>
        </div>
      )}
    </div>
  );
}
