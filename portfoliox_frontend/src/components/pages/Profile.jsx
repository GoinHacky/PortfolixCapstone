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
  Camera
} from 'lucide-react';

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchUserData();
    fetchSettings();
  }, [token, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/user/${userId}`, {
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
      setFormData(prev => ({
        ...prev,
        displayName: `${userData.fname || ''} ${userData.lname || ''}`.trim(),
        email: userData.userEmail || ''
      }));
      
      if (userData.profilePic) {
        const profilePicPath = userData.profilePic.startsWith('/uploads/') 
          ? userData.profilePic 
          : `/uploads/${userData.profilePic.replace(/^.*[\\\/]/, '')}`;
        const fullProfilePicUrl = `http://localhost:8080${profilePicPath}`;
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
      const response = await fetch(`http://localhost:8080/api/settings/${userId}`, {
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

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // 1MB limit
        showNotification('File size should be less than 1MB', 'error');
        return;
      }
      
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
              setPreviewUrl(URL.createObjectURL(compressedFile));
            },
            'image/jpeg',
            0.5
          );
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error compressing image:', error);
        showNotification('Error processing image', 'error');
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

      const response = await fetch(`http://localhost:8080/api/auth/user/${userId}`, {
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
        const fullProfilePicUrl = `http://localhost:8080${data.profilePic}`;
        localStorage.setItem('profilePic', fullProfilePicUrl);
        setPreviewUrl(fullProfilePicUrl);
        window.dispatchEvent(new Event('storage'));
      }

      setFormData(prev => ({
        ...prev,
        displayName: `${data.fname || ''} ${data.lname || ''}`.trim(),
        email: data.userEmail || ''
      }));

      showNotification('Account updated successfully');
      setLoading(false);
      setIsEditing(false);
      setProfilePic(null); // Clear file input
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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('currentPassword', passwordData.currentPassword);
      formData.append('newPassword', passwordData.newPassword);

      const response = await fetch(`http://localhost:8080/api/auth/user/${userId}`, {
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
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete account');
      }

      localStorage.clear();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error:', error);
      showNotification('Failed to delete account', 'error');
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
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
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={() => setPreviewUrl(null)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label 
                    htmlFor="profile-pic-input"
                    className="absolute bottom-0 right-0 p-2 bg-[#800000] text-white rounded-full cursor-pointer hover:bg-[#600000] transition-colors shadow-lg"
                  >
                    <Camera size={16} />
                    <input
                      id="profile-pic-input"
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleProfilePicChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {isEditing && (
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload new picture</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">JPG or PNG (max. 1MB)</p>
                  <label className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors">
                    <Upload size={16} className="mr-2" />
                    Choose File
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      onChange={handleProfilePicChange}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
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
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
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
                    onClick={() => setShowPasswordChange(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {userRole !== 'ADMIN' && (
            <div className="glass-morphism bg-red-50 dark:bg-red-900/10 rounded-2xl shadow-xl p-6 border border-red-100 dark:border-red-800">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4">Danger Zone</h2>
              <p className="text-red-600 dark:text-red-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
              ) : (
                <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-600 dark:text-red-400 w-6 h-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-red-800 dark:text-red-400 font-medium">Are you absolutely sure?</h3>
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Yes, Delete My Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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