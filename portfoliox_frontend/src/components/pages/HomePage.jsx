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
  TrendingDown,
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const getActiveItemFromPath = (pathname) => {
    if (pathname.startsWith("/dashboard/portfolio")) return "Portfolio";
    if (pathname.startsWith("/dashboard/courses")) return "Courses";
    if (pathname.startsWith("/dashboard/share")) return "Share";
    if (pathname.startsWith("/dashboard/profile")) return "Profile";
    return "Dashboard";
  };
  const [activeItem, setActiveItem] = useState(getActiveItemFromPath(location.pathname));
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { darkMode } = useTheme();

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!token) {
      if (!token || role !== 'STUDENT') {
        navigate('/auth/login');
        return;
      }
    }

    // Get user data from localStorage
    const username = localStorage.getItem('username');
    
    // Set user data
    setUserData({
      firstName: username?.split(' ')[0] || 'User',
      role: role || 'STUDENT'
    });

    fetchPortfolioData();
  }, [navigate, token]);

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
      
      // Process and categorize data
      const projects = data.filter(item => item.category === 'project') || [];
      const microcredentials = data.filter(item => item.category === 'microcredentials') || [];
      
      // Sort by last updated for recently updated
      const recentlyUpdated = [...data]
        .sort((a, b) => new Date(b.updatedAt || b.lastUpdated || b.createdAt || 0) - 
                    new Date(a.updatedAt || a.lastUpdated || a.createdAt || 0))
        .slice(0, 5);
      
      // Store data for other components that might need it
      localStorage.setItem('portfolioData', JSON.stringify({
        projects,
        microcredentials,
        recentlyUpdated,
        totalPortfolios: data.length
      }));

      setPortfolioStats({
        totalPortfolios: data.length,
        projects: projects,
        microcredentials: microcredentials,
        recentlyUpdated: recentlyUpdated
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
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <div className={`fixed lg:relative lg:flex lg:flex-shrink-0 z-50 lg:z-auto transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <SideBar 
          activeItem={activeItem} 
          onItemSelect={(item) => {
            handleMenuItemSelect(item);
            setMobileMenuOpen(false);
          }} 
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Enhanced Top Navigation Bar */}
        <header className="relative z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700/80 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-2 h-8 bg-gradient-to-b from-[#800000] to-[#D4AF37] rounded-full"></div>
                <h1 className={`text-xl sm:text-2xl font-black ${maroonText} dark:text-white`}>
                  {activeItem}
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Home</span>
                <ArrowRight className="w-4 h-4" />
                <span className={`${goldText} font-medium`}>{activeItem}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Icon */}
              <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              
              {/* Enhanced Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search projects, achievements..."
                  className="pl-10 pr-4 py-2.5 w-48 lg:w-64 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
                />
              </div>
              
              {/* Enhanced Notifications */}
              <NotificationPanel />
              
              {/* Enhanced Add New Button */}
              <button className={`${goldBg} text-white px-3 sm:px-6 py-2.5 rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg hover:scale-105 transition-all duration-200`}>
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
  const [portfolioStats, setPortfolioStats] = useState({
    total: 0,
    projects: 0,
    microcredentials: 0,
    loading: true,
    error: null
  });
  const [loading, setLoading] = useState(true);
  const [detailedLoading, setDetailedLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const firstName = username?.split(' ')[0] || 'User';
  const { darkMode } = useTheme();

  useEffect(() => {
    fetchPortfolioStats();
  }, []);

  // Fetch lightweight stats first
  const fetchPortfolioStats = async () => {
    try {
      setPortfolioStats(prev => ({ ...prev, loading: true, error: null }));
      
      // Fetch just the count stats (lightweight)
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${userId}/stats`, {
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
        // If stats endpoint doesn't exist, fall back to full fetch
        await fetchFullDashboardData();
        return;
      }

      const stats = await response.json();
      setPortfolioStats({
        total: stats.total || 0,
        projects: stats.projects || 0,
        microcredentials: stats.microcredentials || 0,
        loading: false,
        error: null
      });
      
      setLoading(false);
      
      // Then fetch detailed data in background
      fetchDetailedData();
    } catch (error) {
      console.error('Error fetching portfolio stats:', error);
      // Fall back to full fetch
      await fetchFullDashboardData();
    }
  };

  // Fetch detailed data in background
  const fetchDetailedData = async () => {
    try {
      setDetailedLoading(true);
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch portfolio data');
      }

      const data = await response.json();
      
      // Process and categorize data
      const projects = data.filter(item => item.category === 'project') || [];
      const microcredentials = data.filter(item => item.category === 'microcredentials') || [];
      
      // Sort by last updated for recently updated
      const recentlyUpdated = [...data]
        .sort((a, b) => new Date(b.updatedAt || b.lastUpdated || b.createdAt || 0) - 
                    new Date(a.updatedAt || a.lastUpdated || a.createdAt || 0))
        .slice(0, 5);
      
      setDashboardData({
        projects,
        microcredentials,
        recentlyUpdated,
        totalPortfolios: data.length,
        profileViews: Math.floor(Math.random() * 100), // This would ideally come from analytics
        skills: [] // Will be processed by useMemo
      });
    } catch (error) {
      console.error('Error fetching detailed data:', error);
    } finally {
      setDetailedLoading(false);
    }
  };

  // Fallback to full fetch (original method)
  const fetchFullDashboardData = async () => {
    try {
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
      
      // Process and categorize data
      const projects = data.filter(item => item.category === 'project') || [];
      const microcredentials = data.filter(item => item.category === 'microcredentials') || [];
      
      // Sort by last updated for recently updated
      const recentlyUpdated = [...data]
        .sort((a, b) => new Date(b.updatedAt || b.lastUpdated || b.createdAt || 0) - 
                    new Date(a.updatedAt || a.lastUpdated || a.createdAt || 0))
        .slice(0, 5);
      
      setDashboardData({
        projects,
        microcredentials,
        recentlyUpdated,
        totalPortfolios: data.length,
        profileViews: Math.floor(Math.random() * 100),
        skills: []
      });
      
      setPortfolioStats({
        total: data.length,
        projects: projects.length,
        microcredentials: microcredentials.length,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setPortfolioStats(prev => ({ ...prev, loading: false, error: 'Failed to load data' }));
    } finally {
      setLoading(false);
    }
  };

  // Optimized data processing using useMemo
  const processedDashboardData = React.useMemo(() => {
    if (!dashboardData.projects || dashboardData.projects.length === 0) {
      return {
        skills: [],
        skillCounts: {}
      };
    }

    // Extract unique skills from projects
    const allSkills = new Set();
    const skillCounts = {};
    
    dashboardData.projects.forEach(project => {
      if (project.skills) {
        project.skills.forEach(skill => {
          const skillName = typeof skill === 'string' ? skill : (skill && skill.skillName ? skill.skillName : null);
          if (skillName) {
            allSkills.add(skillName);
            skillCounts[skillName] = (skillCounts[skillName] || 0) + 1;
          }
        });
      }
    });

    return {
      skills: Array.from(allSkills),
      skillCounts
    };
  }, [dashboardData.projects]);

  // Update dashboardData with processed skills
  React.useEffect(() => {
    if (dashboardData.projects && dashboardData.projects.length > 0) {
      const { skills } = processedDashboardData;
      setDashboardData(prev => ({ ...prev, skills }));
    }
  }, [processedDashboardData.skills]);

  const getActivityDate = (item) => {
    if (!item) return null;
    const raw = item.updatedAt || item.lastUpdated || item.createdAt || item.issueDate;
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getActivityTimestamp = (item) => {
    const date = getActivityDate(item);
    return date ? date.getTime() : 0;
  };

  const formatActivityDate = (item) => {
    const date = getActivityDate(item);
    return date ? date.toLocaleDateString() : '—';
  };

  const stats = [
    { 
      icon: Code, 
      label: 'Projects', 
      value: portfolioStats.loading ? '...' : portfolioStats.projects,
      change: portfolioStats.loading ? 'Loading...' : `${portfolioStats.projects > 0 ? '+1' : '0'} this month`, 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: Trophy, 
      label: 'Microcredentials', 
      value: portfolioStats.loading ? '...' : portfolioStats.microcredentials,
      change: portfolioStats.loading ? 'Loading...' : `${portfolioStats.microcredentials > 0 ? '+1' : '0'} this week`, 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: FolderKanban, 
      label: 'Total Items', 
      value: portfolioStats.loading ? '...' : portfolioStats.total,
      change: portfolioStats.loading ? 'Loading...' : 'All portfolios', 
      color: `${goldText} dark:text-[#D4AF37]`,
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: Zap, 
      label: 'Skills', 
      value: dashboardData.skills.length || 0,
      change: 'Unique skills', 
      color: 'text-[#D4AF37] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#D4AF37]/20 to-[#800000]/10 dark:from-[#D4AF37]/30 dark:to-[#800000]/20',
      trend: 'up',
      isSkills: true
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Enhanced Welcome Section - Compact */}
      <div className="relative bg-gradient-to-r from-[#800000] via-[#900000] to-[#800000] dark:from-[#800000]/95 dark:via-[#900000]/95 dark:to-[#800000]/95 rounded-2xl p-4 sm:p-6 text-white overflow-hidden shadow-xl border border-[#D4AF37]/20">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-[#D4AF37]/30 via-[#D4AF37]/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-r from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute top-6 right-6 animate-bounce">
          <Sparkles className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <div className="absolute bottom-6 left-6 opacity-20">
          <Star className="w-12 h-12 text-[#D4AF37] animate-spin" style={{animationDuration: '20s'}} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-5xl font-black bg-gradient-to-r from-white via-[#D4AF37] to-white bg-clip-text text-transparent">
                  Welcome back, {firstName}!
                </h2>
                <span className="text-4xl animate-bounce">👋</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4 border border-white/20">
                <p className="text-white text-lg leading-relaxed">
                  You have <span className="font-black text-[#D4AF37] text-2xl">{portfolioStats.loading ? '...' : portfolioStats.total}</span> <span className="font-semibold">portfolio items</span>
                </p>
                <div className="flex items-center gap-6 mt-3 text-white/90">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-medium">{portfolioStats.loading ? '...' : portfolioStats.projects} Projects</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-medium">{portfolioStats.loading ? '...' : portfolioStats.microcredentials} Microcredentials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#D4AF37]" />
                    <span className="font-medium">{dashboardData.skills.length || 0} Skills</span>
                  </div>
                </div>
              </div>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-[#D4AF37]" />
                Keep building your digital presence and showcase your achievements
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/dashboard/portfolio')}
              className="group bg-gradient-to-r from-[#D4AF37] via-[#B8860B] to-[#D4AF37] text-[#800000] px-8 py-4 rounded-2xl font-black hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center space-x-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <FolderKanban className="w-6 h-6 relative z-10" />
              <span className="relative z-10">View Portfolio</span>
              <ArrowUpRight className="w-5 h-5 relative z-10 group-hover:rotate-45 transition-transform duration-300" />
            </button>
            <button 
              onClick={() => navigate('/dashboard/share')}
              className="group border-2 border-white/40 text-white px-8 py-4 rounded-2xl font-black hover:bg-white/20 hover:border-white/60 transition-all duration-300 hover:scale-110 flex items-center space-x-3 backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[#D4AF37]/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <Share2 className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Share Portfolio</span>
              <ExternalLink className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`group ${stat.bgColor} rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/50 hover:shadow-2xl hover:scale-110 transition-all duration-300 backdrop-blur-sm cursor-pointer ${stat.isSkills ? 'ring-2 ring-[#D4AF37]/50 animate-pulse' : ''}`} style={{animationDuration: stat.isSkills ? '3s' : 'none'}}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-2xl ${stat.isSkills ? 'bg-gradient-to-br from-[#D4AF37] to-[#B8860B] shadow-xl' : 'bg-white/80 dark:bg-gray-800/80'} ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${stat.isSkills ? 'text-white animate-pulse' : ''}`} />
                </div>
                <div className="flex items-center space-x-1">
                  {stat.trend === 'up' ? (
                    <TrendingUp className={`w-4 h-4 ${stat.isSkills ? 'text-[#D4AF37]' : 'text-[#800000]'}`} />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-[#800000]" />
                  )}
                </div>
              </div>
              <div>
                <h3 className={`text-4xl font-black mb-1 group-hover:scale-110 transition-transform duration-300 ${stat.isSkills ? 'text-[#D4AF37] dark:text-[#D4AF37]' : 'text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent'}`}>
                  {stat.value}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">{stat.label}</p>
                <p className={`text-xs font-medium flex items-center space-x-1 ${stat.isSkills ? 'text-[#D4AF37] dark:text-[#D4AF37]' : 'text-[#800000] dark:text-[#D4AF37]'}`}>
                  <span>{stat.change}</span>
                </p>
                {stat.isSkills && dashboardData.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {dashboardData.skills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="bg-[#D4AF37]/20 dark:bg-[#D4AF37]/30 text-[#800000] dark:text-[#D4AF37] px-2 py-0.5 rounded-md text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                    {dashboardData.skills.length > 3 && (
                      <span className="bg-[#D4AF37]/20 dark:bg-[#D4AF37]/30 text-[#800000] dark:text-[#D4AF37] px-2 py-0.5 rounded-md text-xs font-bold">
                        +{dashboardData.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
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
                              {formatActivityDate(item)}
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