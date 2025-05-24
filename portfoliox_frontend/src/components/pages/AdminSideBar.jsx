import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard,
  Users,
  ClipboardCheck,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GraduationCap
} from "lucide-react";

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";

export default function AdminSideBar({ activeItem = 'Dashboard', onItemSelect }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [profilePic, setProfilePic] = useState(localStorage.getItem('profilePic'));
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e?.key === 'profilePic' || !e) {
        const newProfilePic = localStorage.getItem('profilePic');
        if (newProfilePic) {
          setProfilePic(newProfilePic);
        } else {
          setProfilePic(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const menuItems = [
    { 
      id: 'Dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      description: 'Overview & Analytics',
      path: '/admin/dashboard'
    },
    { 
      id: 'Requests', 
      icon: ClipboardCheck, 
      label: 'Requests',
      description: 'Pending Approvals',
      path: '/admin/dashboard/requests'
    },
    { 
      id: 'Faculty', 
      icon: Users, 
      label: 'Faculty',
      description: 'Manage Faculty',
      path: '/admin/dashboard/faculty'
    },
    { 
      id: 'Students', 
      icon: GraduationCap, 
      label: 'Students',
      description: 'Manage Students',
      path: '/admin/dashboard/students'
    },
    { 
      id: 'Profile', 
      icon: User, 
      label: 'Profile',
      description: 'Account Settings',
      path: '/admin/dashboard/profile'
    }
  ];

  const handleItemClick = (item) => {
    if (onItemSelect) {
      onItemSelect(item.id);
    }
    navigate(item.path);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/auth/login');
  };

  return (
    <div className={`relative h-screen ${maroon} transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-20' : 'w-72'
    } flex flex-col shadow-2xl`}>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#800000] via-[#600000] to-[#800000] opacity-90"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${goldBgSolid} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Sparkles className={`w-6 h-6 ${maroonText}`} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight">
                    PortfolioX
                  </h1>
                  <p className="text-white/60 text-xs font-medium">
                    Admin Console
                  </p>
                </div>
              </div>
            )}
            
            {isCollapsed && (
              <div className={`w-8 h-8 ${goldBgSolid} rounded-lg flex items-center justify-center mx-auto`}>
                <Sparkles className={`w-5 h-5 ${maroonText}`} />
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shadow-lg">
                {profilePic ? (
                  <img 
                    src={profilePic}
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      localStorage.removeItem('profilePic');
                      setProfilePic(null);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-white font-bold text-lg">
                    {localStorage.getItem('username')?.substring(0, 2)?.toUpperCase() || 'A'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {localStorage.getItem('username') || 'Admin'}
                </p>
                <p className="text-white/60 text-xs truncate">
                  Administrator
                </p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                  <span className="text-green-300 text-xs font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 py-6">
          <nav className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full group relative flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `${goldBgSolid} text-white shadow-lg shadow-[#D4AF37]/30 transform scale-105`
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                  )}
                  
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#800000]' : ''} transition-colors`} />
                  
                  {!isCollapsed && (
                    <div className="ml-4 flex-1 text-left">
                      <div className={`font-semibold text-sm ${isActive ? 'text-[#800000]' : ''}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs opacity-70 ${isActive ? 'text-[#800000]/70' : 'text-white/60'}`}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  
                  {/* Hover Effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-white/80 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors group"
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="ml-4 font-medium text-sm">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}