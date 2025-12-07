import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Key, 
  Bell, 
  Shield, 
  Globe, 
  Save,
  Edit2,
  X,
  Trash2,
  AlertTriangle,
  Upload,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';
import { getApiBaseUrl } from '../../api/apiConfig';

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function Profile() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(localStorage.getItem('profilePic'));
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [profilePicError, setProfilePicError] = useState(false);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const userRole = localStorage.getItem('role');

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    notificationPreference: 'all',
    privacyLevel: 'public',
    language: 'en',
    theme: 'light'
  });

  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showDeletePasswordConfirm, setShowDeletePasswordConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deletePasswordError, setDeletePasswordError] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchUserData();
    fetchSettings();
  }, [token, navigate]);

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/user/${userId}`, {
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
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      
      // Check if this is a first-time login for a student
      const isFirstLogin = userData.firstLogin === true;
      const isStudent = userRole === 'STUDENT';
      const hasCompletedFirstLogin = localStorage.getItem('firstLoginCompleted') === 'true';
      
      setFormData(prev => ({
        ...prev,
        displayName: `${userData.fname || ''} ${userData.lname || ''}`.trim(),
        email: userData.userEmail || ''
      }));
      
      // If it's a student's first login and they haven't completed setup, automatically enable editing mode
      if (isFirstLogin && isStudent && !hasCompletedFirstLogin) {
        setIsEditing(true);
        setIsFirstTimeUser(true);
        showNotification('Welcome! Please complete your profile setup.', 'success');
      }
      
      if (userData.profilePic) {
        const profilePicPath = userData.profilePic.startsWith('/uploads/') 
          ? userData.profilePic 
          : `/uploads/${userData.profilePic.replace(/^.*[\\\/]/, '')}`;
        const fullProfilePicUrl = `${getApiBaseUrl()}${profilePicPath}`;
        console.log('Setting profile picture URL:', fullProfilePicUrl);
        localStorage.setItem('profilePic', fullProfilePicUrl);
        setPreviewUrl(fullProfilePicUrl);
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Failed to load user data', 'error');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/settings/${userId}`, {
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
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data || []);
      
      if (data && Array.isArray(data)) {
        const settingsMap = {};
        data.forEach(setting => {
          if (setting && setting.settingKey) {
            settingsMap[setting.settingKey] = setting.settingValue;
          }
        });

        setFormData(prev => ({
          ...prev,
          notificationPreference: settingsMap.notificationPreference || 'all',
          privacyLevel: settingsMap.privacyLevel || 'public',
          language: settingsMap.language || 'en',
          theme: settingsMap.theme || 'light'
        }));
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Failed to load settings', 'error');
      setSettings([]);
      setFormData(prev => ({
        ...prev,
        notificationPreference: 'all',
        privacyLevel: 'public',
        language: 'en',
        theme: 'light'
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        showNotification('File size should be less than 1MB', 'error');
        return;
      }
      
      setUploadingProfilePic(true);
      try {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = () => {
          img.src = reader.result;
        };
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with 0.5 quality
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
              });
              setProfilePic(compressedFile);
              // Create a preview URL for immediate display
              const previewUrl = URL.createObjectURL(compressedFile);
              setPreviewUrl(previewUrl);
              console.log('Profile picture preview set:', previewUrl);
            },
            'image/jpeg',
            0.5
          );
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error compressing image:', error);
        showNotification('Error processing image', 'error');
      } finally {
        setUploadingProfilePic(false);
      }
    }
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      const nameParts = formData.displayName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      formDataToSend.append('fname', firstName);
      formDataToSend.append('lname', lastName);
      if (formData.email) {
        formDataToSend.append('email', formData.email);
      }
      
      if (profilePic) {
        formDataToSend.append('profilePic', profilePic);
      }

      const response = await fetch(`${getApiBaseUrl()}/api/auth/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || 'Failed to update account';
        } catch {
          errorMessage = errorText || 'Failed to update account';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.profilePic) {
        const fullProfilePicUrl = `${getApiBaseUrl()}${data.profilePic}`;
        console.log('Profile picture updated successfully:', fullProfilePicUrl);
        localStorage.setItem('profilePic', fullProfilePicUrl);
        setPreviewUrl(fullProfilePicUrl);
        setProfilePic(null); // Clear the file object
        // Dispatch storage event to update other components
        window.dispatchEvent(new Event('storage'));
        showNotification('Profile picture updated successfully');
      }

      setFormData(prev => ({
        ...prev,
        displayName: `${data.fname || ''} ${data.lname || ''}`.trim(),
        email: data.userEmail || ''
      }));

      // Update localStorage with new name
      if (data.fname) {
        localStorage.setItem('fname', data.fname);
      }
      if (data.lname) {
        localStorage.setItem('lname', data.lname);
      }
      
      // Dispatch storage event to update sidebar
      window.dispatchEvent(new Event('storage'));

      showNotification('Account updated successfully');
      setLoading(false);
      setIsEditing(false);
      setProfilePic(null); // Clear file input
      
      // If this was a first-time login, mark it as completed
      if (userRole === 'STUDENT') {
        // Update the firstLogin flag in localStorage to prevent auto-editing on next visit
        localStorage.setItem('firstLoginCompleted', 'true');
        setIsFirstTimeUser(false);
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Failed to update account', 'error');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification('Password must be at least 6 characters long', 'error');
      return;
    }

    setShowPasswordConfirm(true);
  };

  const confirmPasswordChange = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('currentPassword', passwordData.currentPassword);
      formData.append('newPassword', passwordData.newPassword);

      const response = await fetch(`${getApiBaseUrl()}/api/auth/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      showNotification('Password updated successfully');
      setShowPasswordChange(false);
      setShowPasswordConfirm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordVisibility({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      });
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      showNotification('Please enter your password to confirm account deletion', 'error');
      return;
    }

    setLoading(true);
    try {
      // First verify the password by attempting to login
      const loginResponse = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: deletePassword
        })
      });

      if (!loginResponse.ok) {
        const loginError = await loginResponse.json();
        if (loginResponse.status === 401) {
          throw new Error('INVALID_PASSWORD');
        } else {
          throw new Error('LOGIN_FAILED');
        }
      }

      // If password is correct, proceed with deletion
      const response = await fetch(`${getApiBaseUrl()}/api/auth/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      localStorage.clear();
      showNotification('Account deleted successfully');
      navigate('/auth/login');
    } catch (error) {
      console.error('Error:', error);
      if (error.message === 'INVALID_PASSWORD') {
        showNotification('❌ Wrong password! Please enter your correct password to delete your account.', 'error');
        setDeletePassword(''); // Clear the password field
        setDeletePasswordError(true); // Set error state
        setTimeout(() => setDeletePasswordError(false), 3000); // Clear error state after 3 seconds
      } else if (error.message === 'LOGIN_FAILED') {
        showNotification('❌ Authentication failed. Please try again.', 'error');
        setDeletePassword(''); // Clear the password field
        setDeletePasswordError(true); // Set error state
        setTimeout(() => setDeletePasswordError(false), 3000); // Clear error state after 3 seconds
      } else {
        showNotification('❌ Failed to delete account. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-transparent via-gray-50/40 to-transparent dark:from-transparent dark:via-gray-900/30 dark:to-transparent min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent">Profile Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors ${
              isEditing 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600' 
                : 'bg-[#800000] text-white hover:bg-[#600000]'
            }`}
          >
            {isEditing ? (
              <>
                <X size={18} />
                Cancel
              </>
            ) : (
              <>
                <Edit2 size={18} />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Welcome Banner for First-Time Users */}
        {isFirstTimeUser && (
          <div className="mb-6 bg-gradient-to-r from-[#800000] to-[#600000] rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-l from-[#D4AF37]/20 to-transparent rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#D4AF37]/20 rounded-full">
                  <User className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <h2 className="text-xl font-bold">Welcome to PortfolioX! 🎉</h2>
              </div>
              <p className="text-white/90 mb-4">
                We've pre-filled your profile with the information from your signup. Please review and complete your profile setup to get started.
              </p>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse"></div>
                <span>Profile editing is enabled for you to complete your setup</span>
              </div>
            </div>
          </div>
        )}

        {notification && (
          <div className={`mb-4 p-4 rounded-lg shadow-md ${
            notification.type === 'error' 
              ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
              : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
          }`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleAccountUpdate} className="space-y-8">
          <div className="glass-morphism bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Profile Picture</h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-lg">
                  {previewUrl && !profilePicError ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Failed to load profile picture:', previewUrl);
                        setProfilePicError(true);
                        setPreviewUrl(null);
                        localStorage.removeItem('profilePic');
                        // Set a fallback avatar
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=800000&color=D4AF37&size=200`;
                      }}
                      onLoad={() => {
                        console.log('Profile picture loaded successfully:', previewUrl);
                        setProfilePicError(false);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label 
                    htmlFor="profile-pic-input"
                    className={`absolute bottom-0 right-0 p-2 rounded-full shadow-lg transition-colors ${
                      uploadingProfilePic 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-[#800000] text-white cursor-pointer hover:bg-[#600000]'
                    }`}
                  >
                    {uploadingProfilePic ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera size={16} />
                    )}
                    <input
                      id="profile-pic-input"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleProfilePicChange}
                      disabled={uploadingProfilePic}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload new picture</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">JPG or PNG (max. 1MB)</p>
                  <label className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                    uploadingProfilePic 
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer'
                  }`}>
                    {uploadingProfilePic ? (
                      <>
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="mr-2" />
                        Choose File
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleProfilePicChange}
                      disabled={uploadingProfilePic}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="glass-morphism bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                  {isFirstTimeUser && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#800000] dark:text-[#D4AF37]">
                      Pre-filled
                    </span>
                  )}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                  {isFirstTimeUser && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37]/20 text-[#800000] dark:text-[#D4AF37]">
                      Pre-filled
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="pl-10 w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morphism bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Security</h2>
            {!showPasswordChange ? (
              <button
                type="button"
                onClick={() => setShowPasswordChange(true)}
                className="px-4 py-2 text-[#800000] dark:text-[#D4AF37] border border-[#800000] dark:border-[#D4AF37] rounded-lg hover:bg-[#800000] dark:hover:bg-[#D4AF37] hover:text-white transition-colors"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisibility.currentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('currentPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {passwordVisibility.currentPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisibility.newPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('newPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {passwordVisibility.newPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisibility.confirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full p-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {passwordVisibility.confirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    className="px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setPasswordVisibility({
                        currentPassword: false,
                        newPassword: false,
                        confirmPassword: false
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password Change Confirmation Dialog */}
          {showPasswordConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Password Change</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Are you sure you want to change your password?</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-300">
                      <p className="font-medium mb-1">Important Security Notice:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>You will be logged out of all other devices</li>
                        <li>Make sure you remember your new password</li>
                        <li>This action cannot be undone</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={confirmPasswordChange}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <Key size={16} />
                        Yes, Change Password
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowPasswordConfirm(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Confirmation Modal */}
          {showDeletePasswordConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Account</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800 dark:text-red-300">
                      <p className="font-medium mb-1">Warning: This will permanently delete your account</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>All your portfolios and projects will be deleted</li>
                        <li>Your profile and settings will be removed</li>
                        <li>This action cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter your password to confirm deletion:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeletePasswordError(false); // Clear error when user starts typing
                      }}
                      placeholder="Enter your password"
                      className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent ${
                        deletePasswordError 
                          ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-red-300 dark:border-red-600 focus:ring-red-500'
                      }`}
                      disabled={loading}
                      autoFocus
                    />
                    <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 w-5 h-5" />
                  </div>
                  {deletePasswordError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Wrong password! Please try again.
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || !deletePassword.trim()}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Deleting Account...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Delete My Account
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeletePasswordConfirm(false);
                      setDeletePassword('');
                      setDeletePasswordError(false);
                    }}
                    disabled={loading}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {userRole !== 'ADMIN' && (
            <div className="glass-morphism bg-red-50 dark:bg-red-900/10 rounded-2xl shadow-xl p-6 border border-red-100 dark:border-red-800">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4">Danger Zone</h2>
              <p className="text-red-600 dark:text-red-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button
                type="button"
                onClick={() => setShowDeletePasswordConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                <Save size={18} />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}