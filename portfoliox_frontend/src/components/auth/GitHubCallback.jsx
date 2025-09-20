import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleGitHubCallback = async () => {
      try {
        // Get parameters from URL
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const username = searchParams.get('username');
        const role = searchParams.get('role');
        const profilePic = searchParams.get('profilePic');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage('GitHub authentication failed. Please try again.');
          setTimeout(() => navigate('/auth/login'), 3000);
          return;
        }

        if (!token || !userId || !username || !role) {
          setStatus('error');
          setMessage('Invalid authentication response. Please try again.');
          setTimeout(() => navigate('/auth/login'), 3000);
          return;
        }

        // Store authentication data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);
        localStorage.setItem('role', role);
        
        if (profilePic) {
          localStorage.setItem('profilePic', profilePic);
        }

        setStatus('success');
        setMessage('Successfully authenticated with GitHub!');

        // Redirect based on role
        setTimeout(() => {
          if (role === 'ADMIN') {
            navigate('/admin/dashboard');
          } else if (role === 'FACULTY') {
            navigate('/faculty/dashboard');
          } else {
            navigate('/dashboard');
          }
        }, 2000);

      } catch (error) {
        console.error('GitHub callback error:', error);
        setStatus('error');
        setMessage('An error occurred during authentication. Please try again.');
        setTimeout(() => navigate('/auth/login'), 3000);
      }
    };

    handleGitHubCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-amber-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authenticating with GitHub...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we complete your authentication.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to login page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
