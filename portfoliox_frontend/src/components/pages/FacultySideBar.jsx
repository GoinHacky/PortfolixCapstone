import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { getApiBaseUrl } from '../../api/apiConfig';
import PortfolioLogo from '../../assets/images/Portfolio.svg';
import { 
  Home, 
  Users,
  User,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  BookOpen
} from "lucide-react";

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function FacultySideBar({ activeItem = 'Dashboard', onItemSelect }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const storedProfilePic = localStorage.getItem('profilePic');
  const [profilePic, setProfilePic] = useState(storedProfilePic);
  const [facultyName, setFacultyName] = useState('');
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e?.key === 'profilePic' || !e) {
        const newProfilePic = localStorage.getItem('profilePic');
        if (newProfilePic) {
          try {
            new URL(newProfilePic);
            setProfilePic(newProfilePic);
          } catch (error) {
            console.error('Invalid profile picture URL:', newProfilePic);
            localStorage.removeItem('profilePic');
            setProfilePic(null);
          }
        } else {
          setProfilePic(null);
        }
      }
      
      // Also listen for name changes
      if (e?.key === 'fname' || e?.key === 'lname' || !e) {
        fetchFacultyName();
      }
    };

    // Fetch faculty name from API
    const fetchFacultyName = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (token && userId) {
        try {
          const response = await fetch(`${getApiBaseUrl()}/api/auth/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            const fullName = `${userData.fname || ''} ${userData.lname || ''}`.trim();
            setFacultyName(fullName || userData.username || 'Faculty');
          }
        } catch (error) {
          console.error('Error fetching faculty data:', error);
          // Fallback to localStorage if API fails
          const storedFname = localStorage.getItem('fname');
          const storedLname = localStorage.getItem('lname');
          if (storedFname && storedLname) {
            setFacultyName(`${storedFname} ${storedLname}`);
          } else {
            setFacultyName(localStorage.getItem('username') || 'Faculty');
          }
        }
      } else {
        // Fallback to localStorage if no token/userId
        const storedFname = localStorage.getItem('fname');
        const storedLname = localStorage.getItem('lname');
        if (storedFname && storedLname) {
          setFacultyName(`${storedFname} ${storedLname}`);
        } else {
          setFacultyName(localStorage.getItem('username') || 'Faculty');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();
    fetchFacultyName();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const menuItems = [
    { 
      id: 'Dashboard', 
      icon: Home, 
      label: 'Dashboard',
      description: 'Overview & Analytics',
    },
    { 
      id: 'Students', 
      icon: Users, 
      label: 'Students',
      description: 'Manage Students',
    },
    { 
      id: 'Courses',
      icon: BookOpen,
      label: 'Courses',
      description: 'Manage Courses',
    },
    { 
      id: 'Profile', 
      icon: User, 
      label: 'Profile',
      description: 'Account Settings',
    }
  ];

  const handleItemClick = (item) => {
    if (onItemSelect) {
      onItemSelect(item.id);
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/auth/login');
  };

  return (
    <div className={`relative h-screen ${maroon} dark:bg-gray-800 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-72'
    } flex flex-col shadow-2xl z-50 border-r border-[#D4AF37]/20`}>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#800000] via-[#600000] to-[#800000] dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"></div>
      
      {/* Animated Background Decorations */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <button 
                onClick={() => handleItemClick({ id: 'Dashboard' })}
                className="group flex items-center space-x-3 hover:scale-105 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] overflow-hidden group-hover:rotate-12 transition-transform duration-300">
                  <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-8 h-8 object-contain" />
                </div>
                <div className="flex flex-col items-start">
                  <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-[#D4AF37] to-white bg-clip-text text-transparent" style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: '-0.03em' }}>
                    PortfolioX
                  </h1>
                  <span className="text-xs font-bold text-[#D4AF37] mt-0.5" style={{fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif'}}>Faculty Dashboard</span>
                </div>
              </button>
            )}
            
            {isCollapsed && (
              <button 
                onClick={() => handleItemClick({ id: 'Dashboard' })}
                className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl flex items-center justify-center mx-auto hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-lg"
              >
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </button>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-300 text-white/80 hover:text-white hover:scale-110 bg-white/10"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center space-x-3 group">
              <div className="relative w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shadow-xl ring-2 ring-[#D4AF37]/50 group-hover:ring-4 group-hover:ring-[#D4AF37]/70 transition-all duration-300">
                {profilePic ? (
                  <img 
                    src={profilePic}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Failed to load profile picture:', e.target.src);
                      e.target.onerror = null;
                      localStorage.removeItem('profilePic');
                      setProfilePic(null);
                      // Set a fallback avatar
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(localStorage.getItem('username') || 'Faculty')}&background=800000&color=D4AF37&size=56`;
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-white font-black text-xl shadow-inner">
                    {localStorage.getItem('username')?.substring(0, 2)?.toUpperCase() || 'F'}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-[#800000] animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-base truncate group-hover:text-[#D4AF37] transition-colors">
                  {facultyName || 'Faculty'}
                </p>
                <p className="text-white/70 text-xs truncate capitalize font-medium">
                  Faculty
                </p>
                <div className="flex items-center mt-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-300 text-xs font-bold">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full group relative flex items-center px-4 py-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white shadow-xl shadow-[#D4AF37]/50 transform scale-105 ring-2 ring-white/20'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105'
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-white via-[#D4AF37] to-white rounded-r-full shadow-lg"></div>
                  )}
                  
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-white/5'} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#D4AF37]'} transition-colors`} />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="ml-4 flex-1 text-left">
                      <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-white'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/10 space-y-1.5 bg-white/5 backdrop-blur-sm">
          <button 
            onClick={toggleDarkMode}
            className="w-full group flex items-center px-3 py-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-[#D4AF37]/20 group-hover:scale-110 transition-all duration-300">
              {darkMode ? (
                <Sun className="w-4 h-4 text-[#D4AF37]" />
              ) : (
                <Moon className="w-4 h-4 text-[#D4AF37]" />
              )}
            </div>
            {!isCollapsed && (
              <span className="ml-3 font-bold text-sm">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
          <button 
            onClick={handleSignOut}
            className="w-full group flex items-center px-3 py-2.5 text-white/80 hover:text-white hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-105 border border-transparent hover:border-red-400/30"
          >
            <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-red-500/20 group-hover:scale-110 transition-all duration-300">
              <LogOut className="w-4 h-4 text-red-400" />
            </div>
            {!isCollapsed && (
              <span className="ml-3 font-bold text-sm">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}