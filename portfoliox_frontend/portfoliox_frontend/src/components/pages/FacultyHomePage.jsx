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
  Bell,
  Search,
  Plus
} from 'lucide-react';
import FacultyStudents from './FacultyStudents';
import Profile from './Profile';
import { useTheme } from '../../contexts/ThemeContext';
import FacultyCourses from './FacultyCourses';

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

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/user/${userId}`, {
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
      const studentsRes = await fetch('http://localhost:8080/api/users/students', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!studentsRes.ok) throw new Error('Failed to fetch students');
      const students = await studentsRes.json();
      let allPortfolios = [];
      for (const student of students) {
        try {
          const portRes = await fetch(`http://localhost:8080/api/portfolios/student/${student.userID}`, {
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
      const recentActivity = [...allPortfolios].sort((a, b) => new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt)).slice(0, 5);
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
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      <FacultySideBar activeItem={activeItem} onItemSelect={setActiveItem} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className={`text-2xl font-black ${maroonText} dark:text-white`}>
                {activeItem}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students, projects..."
                  className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent transition-all dark:text-white"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
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
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      trend: '',
      icon: Users,
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      trend: '',
      icon: FolderGit2,
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Microcredentials",
      value: stats?.totalMicrocredentials ?? 0,
      trend: '',
      icon: Award,
      color: `${goldText} dark:text-[#D4AF37]`
    },
    {
      title: "Recent Activity",
      value: stats?.recentActivity?.length ?? 0,
      trend: '',
      icon: Activity,
      color: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#800000] to-[#600000] dark:from-[#800000]/90 dark:to-[#600000]/90 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-l from-[#D4AF37]/20 to-transparent rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {data?.fname || 'Faculty'}! 👋</h2>
          <p className="text-white/80 text-lg mb-6">
            Here's what's happening with your students today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Activity className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{stat.title}</p>
                {stat.trend && <p className="text-green-600 dark:text-green-400 text-xs font-medium">{stat.trend}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity List */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        {stats?.recentActivity && stats.recentActivity.length > 0 ? (
          <ul className="space-y-3">
            {stats.recentActivity.map((item, idx) => (
              <li key={item.portfolioID || idx} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#800000]" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{item.portfolioTitle}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{item.student?.fname} {item.student?.lname} &bull; {item.category}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(item.lastUpdated || item.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No recent activity.</div>
        )}
      </div>
    </div>
  );
}