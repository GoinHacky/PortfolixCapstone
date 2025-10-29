import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import FacultySideBar from './FacultySideBar';
import {
  Users,
  FolderGit2,
  Award,
  Activity,
  Clock,
  TrendingUp,
  BarChart2,
  FileText,
  User,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Search,
  Plus,
  Sparkles,
  Code,
  Trophy,
  Eye,
  FolderKanban,
  Share2,
  ArrowRight,
  TrendingDown,
  Zap,
  Star,
  ExternalLink,
  Github
} from 'lucide-react';
import FacultyStudents from './FacultyStudents';
import Profile from './Profile';
import { useTheme } from '../../contexts/ThemeContext';
import { getApiBaseUrl } from '../../api/apiConfig';
import FacultyCourses from './FacultyCourses';
import NotificationPanel from '../NotificationPanel';

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function FacultyHomePage() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalProjects: 0,
    totalMicrocredentials: 0,
    recentActivity: [],
  });
  const { darkMode } = useTheme();

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchUserData();
    fetchDashboardData();
  }, [token, navigate]);

  const getActivityTimestamp = (item) => {
    if (!item) return 0;
    const raw = item.lastUpdated || item.updatedAt || item.createdAt;
    if (!raw) return 0;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  };

  const formatActivityDate = (item) => {
    if (!item) return '—';
    const raw = item.lastUpdated || item.updatedAt || item.createdAt;
    if (!raw) return '—';
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load user data');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const studentsRes = await fetch(`${getApiBaseUrl()}/api/users/students`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!studentsRes.ok) throw new Error('Failed to fetch students');
      const students = await studentsRes.json();
      let allPortfolios = [];
      for (const student of students) {
        try {
          const portRes = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${student.userID}`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (portRes.ok) {
            const portfolios = await portRes.json();
            allPortfolios = allPortfolios.concat(portfolios.map(p => ({ ...p, student })));
          }
        } catch (e) { /* skip student on error */ }
      }
      const totalProjects = allPortfolios.filter(p => p.category?.toLowerCase() === 'project').length;
      const totalMicrocredentials = allPortfolios.filter(p => p.category?.toLowerCase() === 'microcredentials').length;
      const recentActivity = [...allPortfolios]
        .sort((a, b) => getActivityTimestamp(b) - getActivityTimestamp(a))
        .slice(0, 5);
      setDashboardStats({
        totalStudents: students.length,
        totalProjects,
        totalMicrocredentials,
        recentActivity,
      });
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <DashboardContent loading={loading} error={error} data={userData} stats={dashboardStats} />;
      case 'Students':
        return <FacultyStudents />;
      case 'Courses':
        return <FacultyCourses />;
      case 'Profile':
        return <Profile />;
      default:
        return <DashboardContent loading={loading} error={error} data={userData} stats={dashboardStats} />;
    }
  };

  return (
    <div className={`flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden`}>
      {/* Sidebar */}
      <FacultySideBar 
        activeItem={activeItem} 
        onItemSelect={setActiveItem} 
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Top Navigation Bar */}
        <header className="relative z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-700/80 px-8 py-4 shadow-sm">
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
                  placeholder="Search students, projects..."
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

function DashboardContent({ loading, error, data, stats }) {
  const { darkMode } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-[#800000] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  const statCards = [
    { 
      icon: Users, 
      label: 'Total Students', 
      value: stats?.totalStudents ?? 0,
      change: `${stats?.totalStudents ?? 0} enrolled`, 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: Code, 
      label: 'Active Projects', 
      value: stats?.totalProjects ?? 0,
      change: `${stats?.totalProjects ?? 0} projects`, 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: Trophy, 
      label: 'Microcredentials', 
      value: stats?.totalMicrocredentials ?? 0,
      change: `${stats?.totalMicrocredentials ?? 0} achievements`, 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    },
    { 
      icon: Activity, 
      label: 'Recent Activity', 
      value: stats?.recentActivity?.length ?? 0,
      change: 'Last 24 hours', 
      color: 'text-[#800000] dark:text-[#D4AF37]',
      bgColor: 'bg-gradient-to-br from-[#800000]/10 to-[#D4AF37]/10 dark:from-[#800000]/20 dark:to-[#D4AF37]/20',
      trend: 'up'
    }
  ];

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
                Welcome back, {data?.fname || 'Faculty'}! 
                <span className="inline-block ml-2 animate-bounce">👋</span>
              </h2>
              <p className="text-white/90 text-lg leading-relaxed mb-2">
                You have <span className="font-semibold text-[#D4AF37]">{stats?.totalStudents ?? 0} students</span> with 
                <span className="font-medium"> {stats?.totalProjects ?? 0} active projects</span> and 
                <span className="font-medium"> {stats?.totalMicrocredentials ?? 0} microcredentials</span>.
              </p>
              <p className="text-white/70 text-sm">
                Monitor student progress and manage their portfolios
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => setActiveItem('Students')}
              className={`${goldBgSolid} text-[#800000] px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2`}
            >
              <Users className="w-5 h-5" />
              <span>View Students</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setActiveItem('Courses')}
              className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-300 hover:scale-105 flex items-center space-x-2 backdrop-blur-sm"
            >
              <FolderKanban className="w-5 h-5" />
              <span>Manage Courses</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
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
              <p className="text-gray-600 dark:text-gray-400 text-sm">Latest student portfolio updates</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#D4AF37]/20 to-[#800000]/10 rounded-2xl">
              <Activity className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          
          <div className="space-y-4">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((item, index) => (
                <div key={item.portfolioID || index} className="group relative bg-gradient-to-r from-[#800000]/5 to-[#D4AF37]/5 dark:from-[#800000]/10 dark:to-[#D4AF37]/10 p-5 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-[#800000]/10 dark:border-[#D4AF37]/10">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-3 h-3 bg-gradient-to-r from-[#800000] to-[#D4AF37] rounded-full"></div>
                      {index < stats.recentActivity.length - 1 && (
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
                            
                            <span className="text-[#800000] dark:text-[#D4AF37] font-medium">
                              {item.student?.fname} {item.student?.lname}
                            </span>
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
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Students haven't updated their portfolios recently</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-gray-100/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Quick Actions</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your students</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-[#D4AF37]/20 to-[#800000]/10 rounded-2xl">
              <Zap className="w-6 h-6 text-[#D4AF37]" />
            </div>
          </div>
          <div className="space-y-4">
            <button 
              onClick={() => setActiveItem('Students')}
              className="w-full group relative bg-gradient-to-r from-[#800000]/10 via-[#D4AF37]/10 to-[#800000]/10 dark:from-[#800000]/20 dark:via-[#D4AF37]/20 dark:to-[#800000]/20 hover:from-[#800000]/20 hover:via-[#D4AF37]/20 hover:to-[#800000]/20 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#800000]/20 dark:border-[#D4AF37]/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#800000] text-white rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-[#800000] dark:text-[#D4AF37] mb-1">View Students</h4>
                  <p className="text-[#800000] dark:text-[#D4AF37] text-sm">Manage student accounts</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#800000] dark:text-[#D4AF37] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
            </button>
            <button 
              onClick={() => setActiveItem('Courses')}
              className="w-full group relative bg-gradient-to-r from-[#D4AF37]/10 via-[#800000]/10 to-[#D4AF37]/10 dark:from-[#D4AF37]/20 dark:via-[#800000]/20 dark:to-[#D4AF37]/20 hover:from-[#D4AF37]/20 hover:via-[#800000]/20 hover:to-[#D4AF37]/20 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#D4AF37]/20 dark:border-[#800000]/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#D4AF37] text-[#800000] rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-[#D4AF37] dark:text-[#800000] mb-1">Manage Courses</h4>
                  <p className="text-[#D4AF37] dark:text-[#800000] text-sm">Review student projects</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#D4AF37] dark:text-[#800000] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
            </button>
            <button 
              onClick={() => setActiveItem('Profile')}
              className="w-full group relative bg-gradient-to-r from-[#800000]/10 via-[#D4AF37]/10 to-[#800000]/10 dark:from-[#800000]/20 dark:via-[#D4AF37]/20 dark:to-[#800000]/20 hover:from-[#800000]/20 hover:via-[#D4AF37]/20 hover:to-[#800000]/20 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl border border-[#800000]/20 dark:border-[#D4AF37]/20"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-[#800000] text-white rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-bold text-[#800000] dark:text-[#D4AF37] mb-1">Profile Settings</h4>
                  <p className="text-[#800000] dark:text-[#D4AF37] text-sm">Update your account</p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-[#800000] dark:text-[#D4AF37] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}