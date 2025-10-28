import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { getApiBaseUrl } from '../api/apiConfig';

export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const [authInfo, setAuthInfo] = useState({ token: null, userId: null });

  // Fetch notifications
  const fetchNotifications = async () => {
    const token = authInfo.token || localStorage.getItem('token');
    const userId = authInfo.userId || localStorage.getItem('userId');
    if (!token || !userId) return;
    if (!authInfo.token || !authInfo.userId) {
      setAuthInfo({ token, userId });
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        // Token expired or invalid, clear storage and redirect
        localStorage.clear();
        window.location.href = '/auth/login';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.warn('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/auth/login';
        return;
      }

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/auth/login';
        return;
      }

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/auth/login';
        return;
      }

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Fetch on mount and when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isOpen, authInfo.token, authInfo.userId]);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'FACULTY_REQUEST':
        return '📋';
      case 'FACULTY_APPROVED':
      case 'FACULTY_REJECTED':
        return '✅';
      case 'PROJECT_SUBMISSION':
        return '📁';
      case 'COURSE_ENROLLMENT':
        return '📚';
      case 'GRADE_POSTED':
        return '📊';
      case 'PORTFOLIO_VIEWED':
        return '👁️';
      case 'SYSTEM_MESSAGE':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'FACULTY_REQUEST':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'FACULTY_APPROVED':
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'FACULTY_REJECTED':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'PROJECT_SUBMISSION':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'COURSE_ENROLLMENT':
        return 'border-l-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'GRADE_POSTED':
        return 'border-l-indigo-500 bg-indigo-50 dark:bg-indigo-900/20';
      case 'PORTFOLIO_VIEWED':
        return 'border-l-pink-500 bg-pink-50 dark:bg-pink-900/20';
      default:
        return 'border-l-[#800000] bg-gray-50 dark:bg-gray-800';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 dark:text-gray-400 hover:text-[#800000] dark:hover:text-[#D4AF37] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white text-xs flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999] max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread</p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                <Bell className="w-12 h-12 mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`p-4 border-l-4 ${getNotificationColor(notification.type)} hover:bg-opacity-75 transition-colors ${
                      !notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.notificationId)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.notificationId)}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && unreadCount > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <button
                onClick={markAllAsRead}
                className="w-full py-2 px-3 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors text-sm font-semibold flex items-center justify-center gap-2"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
