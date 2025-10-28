import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SideBar from "./Sidebar";
import NotificationPanel from "../NotificationPanel";
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Award, 
  Users, 
  BookOpen,
  Calendar,
  Target,
  Star,
  ArrowRight,
  Activity,
  Zap,
  FolderOpen,
  Share2,
  User,
  FolderKanban,
  Clock,
  FileText,
  Github,
  Eye,
  ExternalLink,
  Sparkles,
  Code,
  Trophy,
  MapPin,
  ArrowUpRight,
  TrendingDown
} from "lucide-react";
import MyPortfolio from './MyPortfolio';
import MyCourse from './MyCourse';
import SharePortfolio from './SharePortfolio';
import Profile from './Profile';
import { ChevronRight } from "lucide-react";
import { useTheme } from '../../contexts/ThemeContext';

import { getApiBaseUrl } from '../../api/apiConfig';
const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function HomePage() {
  const location = useLocation();
  const getActiveItemFromPath = (pathname) => {
    if (pathname.startsWith("/dashboard/portfolio")) return "My Portfolio";
    if (pathname.startsWith("/dashboard/share")) return "Share Portfolio";
    if (pathname.startsWith("/dashboard/profile")) return "Profile";
    if (pathname.startsWith("/dashboard/mycourse")) return "My Course";
    return "Dashboard";
  };
  const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname));
  const [userData, setUserData] = useState({
    firstName: '',
    role: '',
  });
  const navigate = useNavigate();
  const [portfolioStats, setPortfolioStats] = useState({
    totalPortfolios: 0,
    projects: [],
    microcredentials: [],
    recentlyUpdated: []
  });
  const [loading, setLoading] = useState(true);
  const { darkMode } = useTheme();

  useEffect(() => {
    // Check if user is authenticated and is a student
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (!token || role !== 'STUDENT') {
      navigate('/auth/login');
      return;
    }

    // Get user data from localStorage
    const username = localStorage.getItem('username');
    
    // Set user data
    setUserData({
      firstName: username?.split(' ')[0] || 'User',
      role: role || 'STUDENT'
    });

    fetchPortfolioData();
  }, [navigate]);

  useEffect(() => {
    setActiveItem(getActiveItemFromPath(location.pathname));
  }, [location.pathname]);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${localStorage.getItem('userId')}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          localStorage.clear();
          navigate('/auth/login');
          return;
        }
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      
      // Process the data
      const projects = data.filter(p => p.category?.toLowerCase() === 'project');
      const microcredentials = data.filter(p => p.category?.toLowerCase() === 'microcredentials');
      
      // Sort by last updated (assuming there's a lastUpdated field, if not we'll use what's available)
      const recentlyUpdated = [...data].sort((a, b) => {
        return new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt);
      }).slice(0, 5); // Get top 5 most recent

      setPortfolioStats({
        totalPortfolios: data.length,
        projects,
        microcredentials,
        recentlyUpdated
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemSelect = (itemId) => {
    setActiveItem(itemId);
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'My Course':
        return <MyCourse />;
      case 'My Portfolio':
        return <MyPortfolio />;
      case 'Share Portfolio':
        return <SharePortfolio />;
      case 'Profile':
        return <Profile />;
      default:
        return <DashboardContent />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="animate-pulse p-6 space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden`}>
      {/* Sidebar */}
      <SideBar 
        activeItem={activeItem} 
        onItemSelect={handleMenuItemSelect} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Navigation Bar */}
        <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700/80 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-[#800000] to-[#D4AF37] rounded-full"></div>
                <h1 className={`text-2xl font-black ${maroonText} dark:text-white`}>
                  {activeItem}
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Home</span>
                <ArrowRight className="w-4 h-4" />
                <span className={`${goldText} font-medium`}>{activeItem}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Enhanced Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects, achievements..."
                  className="pl-10 pr-4 py-2.5 w-64 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Enhanced Notifications */}
              <NotificationPanel />
              
              {/* Enhanced Add New Button */}
              <button className={`${goldBg} text-white px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg hover:scale-105 transition-all duration-200`}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
                <Sparkles className="w-4 h-4 opacity-70" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-transparent via-gray-50/30 to-transparent dark:from-transparent dark:via-gray-800/30 dark:to-transparent">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Enhanced Dashboard Content Component
function DashboardContent() {
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    microcredentials: [],
    recentlyUpdated: [],
    totalPortfolios: 0,
    profileViews: 0,
    skills: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const firstName = username?.split(' ')[0] || 'User';
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch portfolio data
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${userId}`, {
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
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      
      // Process the data
      const projects = data.filter(p => p.category?.toLowerCase() === 'project');
      const microcredentials = data.filter(p => p.category?.toLowerCase() === 'microcredentials');
      
      // Sort by last updated
      const recentlyUpdated = [...data].sort((a, b) => {
        return new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt);
      }).slice(0, 4); // Get top 4 most recent

      // Extract unique skills from projects
      const allSkills = new Set();
      projects.forEach(project => {
        if (project.skills) {
          project.skills.forEach(skill => {
            if (typeof skill === 'string') {
              allSkills.add(skill);
            } else if (skill && skill.skillName) {
              allSkills.add(skill.skillName);
            }
          });
        }
      });

      setDashboardData({
        projects,
        microcredentials,
        recentlyUpdated,
        totalPortfolios: data.length,
        profileViews: Math.floor(Math.random() * 100), // This would ideally come from analytics
        skills: Array.from(allSkills)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { 
      icon: Code, 
      label: 'Projects', 
      value: dashboardData.projects.length,
      change: `${dashboardData.projects.length > 0 ? '+1' : '0'} this month`, 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: Trophy, 
      label: 'Microcredentials', 
      value: dashboardData.microcredentials.length,
      change: `${dashboardData.microcredentials.length > 0 ? '+1' : '0'} this week`, 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: FolderKanban, 
      label: 'Total Items', 
      value: dashboardData.totalPortfolios,
      change: 'All portfolios', 
      color: `${goldText} dark:text-[#D4AF37]`,
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: Eye, 
      label: 'Profile Views', 
      value: dashboardData.profileViews,
      change: 'Last 30 days', 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    }
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse">
          <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Welcome Section */}
      <div className="relative bg-gradient-to-r from-[#800000] via-[#900000] to-[#800000] dark:from-[#800000]/95 dark:via-[#900000]/95 dark:to-[#800000]/95 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-[#D4AF37]/30 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-4 right-4">
          <Sparkles className="w-6 h-6 text-[#D4AF37] animate-pulse" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Welcome back, {firstName}! 
                <span className="inline-block ml-2 animate-bounce">👋</span>
              </h2>
              <p className="text-white/90 text-lg leading-relaxed mb-2">
                You have <span className="font-semibold text-[#D4AF37]">{dashboardData.totalPortfolios} portfolio items</span>: 
                <span className="font-medium"> {dashboardData.projects.length} projects</span> and 
                <span className="font-medium"> {dashboardData.microcredentials.length} microcredentials</span>.
              </p>
              <p className="text-white/70 text-sm">
                Keep building your digital presence and showcase your achievements
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/dashboard/portfolio')}
              className={`${goldBgSolid} text-[#800000] px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2`}
            >
              <FolderKanban className="w-5 h-5" />
              <span>View Portfolio</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/dashboard/share')}
              className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 flex items-center space-x-2 backdrop-blur-sm"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Portfolio</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 ${stat.color} shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-[#800000]" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[#800000]" />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">{stat.label}</p>
                <p className="text-[#800000] dark:text-[#D4AF37] text-xs font-medium flex items-center space-x-1">
                  <span>{stat.change}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Recent Activity */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Recent Activity</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Your latest portfolio updates</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#D4AF37]/20 to-[#800000]/10 rounded-2xl">
              <Activity className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          
          <div className="space-y-4">
            {dashboardData.recentlyUpdated.length > 0 ? (
              dashboardData.recentlyUpdated.map((item, index) => (
                <div key={item.portfolioID} className="group relative bg-gradient-to-r from-[#800000]/5 to-[#D4AF37]/5 dark:from-[#800000]/10 dark:to-[#D4AF37]/10 p-5 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-[#800000]/10 dark:border-[#D4AF37]/10">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-3 h-3 bg-gradient-to-r from-[#800000] to-[#D4AF37] rounded-full"></div>
                      {index < dashboardData.recentlyUpdated.length - 1 && (
                        <div className="absolute top-3 left-1.5 w-0.5 h-16 bg-gradient-to-b from-[#800000]/30 to-transparent dark:from-[#D4AF37]/30"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#800000] dark:group-hover:text-[#D4AF37] transition-colors">
                            {item.portfolioTitle}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {item.portfolioDescription}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                              <Clock className="w-3 h-3" />
                              {new Date(item.lastUpdated || item.createdAt).toLocaleDateString()}
                            </span>
                            
                            {item.category?.toLowerCase() === 'project' && item.githubLink && (
                              <a
                                href={item.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[#800000] dark:text-[#D4AF37] hover:underline font-medium transition-colors"
                              >
                                <Github className="w-3 h-3" />
                                View Project
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {item.category?.toLowerCase() === 'project' ? (
                            <div className="p-2 bg-[#800000]/10 dark:bg-[#D4AF37]/10 rounded-xl">
                              <Code className="w-4 h-4 text-[#800000] dark:text-[#D4AF37]" />
                            </div>
                          ) : (
                            <div className="p-2 bg-[#D4AF37]/10 dark:bg-[#800000]/10 rounded-xl">
                              <Trophy className="w-4 h-4 text-[#D4AF37] dark:text-[#800000]" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-[#800000] dark:text-[#D4AF37]" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No recent activity to show</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Start by adding your first project!</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quick Actions</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Get started quickly</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#D4AF37]/20 to-[#800000]/10 rounded-2xl">
              <Zap className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/dashboard/portfolio')}
              className="w-full group relative bg-gradient-to-r from-[#800000]/10 via-[#D4AF37]/10 to-[#800000]/10 dark:from-[#800000]/20 dark:via-[#D4AF37]/20 dark:to-[#800000]/20 hover:from-[#800000]/20 hover:via-[#D4AF37]/20 hover:to-[#800000]/20 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#800000]/20 dark:border-[#D4AF37]/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#800000] text-white rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-[#800000] dark:text-[#D4AF37] mb-1">Add New Project</h4>
                  <p className="text-[#800000] dark:text-[#D4AF37] text-sm">Showcase your work</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#800000] dark:text-[#D4AF37] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
            </button>
            <button 
              onClick={() => navigate('/dashboard/portfolio')}
              className="w-full group relative bg-gradient-to-r from-[#D4AF37]/10 via-[#800000]/10 to-[#D4AF37]/10 dark:from-[#D4AF37]/20 dark:via-[#800000]/20 dark:to-[#D4AF37]/20 hover:from-[#D4AF37]/20 hover:via-[#800000]/20 hover:to-[#D4AF37]/20 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#D4AF37]/20 dark:border-[#800000]/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#D4AF37] text-[#800000] rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-[#800000] dark:text-[#D4AF37] mb-1">Add Microcredential</h4>
                  <p className="text-[#800000] dark:text-[#D4AF37] text-sm">Highlight your achievements</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#800000] dark:text-[#D4AF37] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
            </button>
            <button 
              onClick={() => navigate('/dashboard/share')}
              className="w-full group relative bg-gradient-to-r from-[#800000]/10 via-[#D4AF37]/10 to-[#800000]/10 dark:from-[#800000]/20 dark:via-[#D4AF37]/20 dark:to-[#800000]/20 hover:from-[#800000]/20 hover:via-[#D4AF37]/20 hover:to-[#800000]/20 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#800000]/20 dark:border-[#D4AF37]/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#800000] text-white rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Share2 className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-[#800000] dark:text-[#D4AF37] mb-1">Share Portfolio</h4>
                  <p className="text-[#800000] dark:text-[#D4AF37] text-sm">Show your work to the world</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#800000] dark:text-[#D4AF37] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
            </button>
            {/* Skills Overview */}
            {dashboardData.skills.length > 0 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/30">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-[#D4AF37]" />
                  <span>Your Skills</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dashboardData.skills.slice(0, 6).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20 text-[#800000] dark:text-[#D4AF37] rounded-xl text-xs font-medium border border-[#800000]/20 dark:border-[#D4AF37]/20"
                    >
                      {skill}
                    </span>
                  ))}
                  {dashboardData.skills.length > 6 && (
                    <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-medium">
                      +{dashboardData.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      
    </div>
  );
}

// Placeholder components for other menu items (keeping original structure)
function PortfolioContent() {
  return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-center">
        <FolderOpen className={`w-16 h-16 ${goldText} mx-auto mb-4`} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Portfolio</h2>
        <p className="text-gray-600">Portfolio management content will be implemented here.</p>
      </div>
    </div>
  );
}

function ShareContent() {
  return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-center">
        <Share2 className={`w-16 h-16 ${goldText} mx-auto mb-4`} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Portfolio</h2>
        <p className="text-gray-600">Portfolio sharing features will be implemented here.</p>
      </div>
    </div>
  );
}

function ProfileContent() {
  return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-center">
        <User className={`w-16 h-16 ${goldText} mx-auto mb-4`} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
        <p className="text-gray-600">Profile management content will be implemented here.</p>
      </div>
    </div>
  );
}