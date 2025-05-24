import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import SideBar from "./Sidebar";
import { 
  Bell, 
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
  Eye
} from "lucide-react";
import MyPortfolio from './MyPortfolio';
import SharePortfolio from './SharePortfolio';
import Profile from './Profile';
import { ChevronRight } from "lucide-react";

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function HomePage() {
  const [activeItem, setActiveItem] = useState('Dashboard');
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

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/portfolios/student/${localStorage.getItem('userId')}`, {
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
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50 overflow-hidden">
      {/* Sidebar */}
      <SideBar 
        activeItem={activeItem} 
        onItemSelect={handleMenuItemSelect} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className={`text-2xl font-black ${maroonText}`}>
                {activeItem}
              </h1>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <span>Home</span>
                <ArrowRight className="w-4 h-4" />
                <span className={goldText}>{activeItem}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, achievements..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-[#800000] hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Add New Button */}
              <button className={`${goldBg} text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-all`}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add New</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<DashboardContent />} />
            <Route path="portfolio" element={<MyPortfolio />} />
            <Route path="share" element={<SharePortfolio />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Dashboard Content Component
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch portfolio data
      const response = await fetch(`http://localhost:8080/api/portfolios/student/${userId}`, {
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
          project.skills.forEach(skill => allSkills.add(skill));
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
      icon: FolderKanban, 
      label: 'Projects', 
      value: dashboardData.projects.length,
      change: `${dashboardData.projects.length > 0 ? '+1' : '0'} this month`, 
      color: 'text-blue-600' 
    },
    { 
      icon: Award, 
      label: 'Microcredentials', 
      value: dashboardData.microcredentials.length,
      change: `${dashboardData.microcredentials.length > 0 ? '+1' : '0'} this week`, 
      color: 'text-green-600' 
    },
    { 
      icon: TrendingUp, 
      label: 'Total Items', 
      value: dashboardData.totalPortfolios,
      change: 'All portfolios', 
      color: goldText 
    },
    { 
      icon: Eye, 
      label: 'Profile Views', 
      value: dashboardData.profileViews,
      change: 'Last 30 days', 
      color: 'text-purple-600' 
    }
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#800000] to-[#600000] rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-[#D4AF37]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {firstName}! 👋</h2>
          <p className="text-white/80 text-lg mb-6">
            You have {dashboardData.totalPortfolios} portfolio items: {dashboardData.projects.length} projects and {dashboardData.microcredentials.length} microcredentials.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/dashboard/portfolio')}
              className={`${goldBgSolid} text-[#800000] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all`}
            >
              View Portfolio
            </button>
            <button 
              onClick={() => navigate('/dashboard/share')}
              className="border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              Share Portfolio
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                <p className="text-green-600 text-xs font-medium">{stat.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboardData.recentlyUpdated.length > 0 ? (
              dashboardData.recentlyUpdated.map((item) => (
                <div key={item.portfolioID} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
                  <div className="w-2 h-2 bg-[#D4AF37] rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.portfolioTitle}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">{item.portfolioDescription}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">
                        {new Date(item.lastUpdated || item.createdAt).toLocaleDateString()}
                      </span>
                      {item.category?.toLowerCase() === 'project' && item.githubLink && (
                        <a
                          href={item.githubLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#800000] hover:underline flex items-center gap-1"
                        >
                          <Github className="w-3 h-3" />
                          View Project
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent activity to show
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard/portfolio')}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all group"
            >
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">Add New Project</span>
              <ArrowRight className="w-4 h-4 text-blue-600 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/dashboard/portfolio')}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all group"
            >
              <Award className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">Add Microcredential</span>
              <ArrowRight className="w-4 h-4 text-green-600 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              onClick={() => navigate('/dashboard/share')}
              className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all group"
            >
              <Share2 className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-700">Share Portfolio</span>
              <ArrowRight className="w-4 h-4 text-purple-600 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Placeholder components for other menu items
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