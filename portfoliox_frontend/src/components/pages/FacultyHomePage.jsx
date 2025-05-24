import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Bell
} from 'lucide-react';
import FacultyStudents from './FacultyStudents';
import Profile from './Profile';

export default function FacultyHomePage() {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalProjects: 0,
    totalMicrocredentials: 0,
    recentActivities: [],
    studentProgress: [],
    portfolioStats: {
      projects: 0,
      microcredentials: 0
    }
  });

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
    setLoading(true);
    try {
      // Fetch total students
      const studentsResponse = await fetch('http://localhost:8080/api/users/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const studentsData = await studentsResponse.json();

      // Initialize counters
      let totalProjects = 0;
      let totalMicrocredentials = 0;
      const recentActivities = [];

      // Fetch portfolios for each student
      for (const student of studentsData) {
        const portfoliosResponse = await fetch(
          `http://localhost:8080/api/portfolios/student/${student.userID}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        const portfolios = await portfoliosResponse.json();

        // Count projects and microcredentials
        portfolios.forEach(portfolio => {
          if (portfolio.category?.toLowerCase() === 'project') {
            totalProjects++;
          } else if (portfolio.category?.toLowerCase() === 'microcredentials') {
            totalMicrocredentials++;
          }

          // Add to recent activities
          recentActivities.push({
            id: portfolio.portfolioID,
            studentName: `${student.fname} ${student.lname}`,
            studentId: student.userID,
            type: portfolio.category,
            title: portfolio.portfolioTitle,
            timestamp: new Date().toISOString(), // You might want to add a timestamp field in your portfolio entity
          });
        });
      }

      // Sort activities by timestamp
      recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setDashboardData({
        totalStudents: studentsData.length,
        totalProjects,
        totalMicrocredentials,
        recentActivities: recentActivities.slice(0, 10), // Get only the 10 most recent activities
        studentProgress: studentsData.map(student => ({
          id: student.userID,
          name: `${student.fname} ${student.lname}`,
          progress: Math.floor(Math.random() * 100) // Replace with actual progress calculation
        })).slice(0, 5),
        portfolioStats: {
          projects: totalProjects,
          microcredentials: totalMicrocredentials
        }
      });

      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <DashboardContent loading={loading} error={error} data={dashboardData} />;
      case 'Students':
        return <FacultyStudents />;
      case 'Profile':
        return <Profile />;
      default:
        return <DashboardContent loading={loading} error={error} data={dashboardData} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <FacultySideBar activeItem={activeItem} onItemSelect={setActiveItem} />
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#800000] via-[#8B0000] to-[#800000] shadow-lg">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    Welcome back, {userData ? `${userData.fname} ${userData.lname}` : 'Faculty'}
                  </h1>
                  <div className="px-3 py-1 bg-white/10 rounded-full">
                    <span className="text-[#D4AF37] text-sm font-medium">Faculty Member</span>
                  </div>
                </div>
                <p className="text-white/80">
                  College of Information Technology
                </p>
                <p className="text-white/60 mt-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} • {new Date().toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="w-6 h-6 text-white/80 hover:text-[#D4AF37] cursor-pointer transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg text-[#D4AF37] font-semibold text-sm backdrop-blur-sm">
                  Faculty Portal
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function DashboardContent({ loading, error, data }) {
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

  const stats = [
    {
      title: "Total Students",
      value: data.totalStudents,
      icon: Users,
      trend: "+5%",
      positive: true,
      color: "bg-blue-500"
    },
    {
      title: "Total Projects",
      value: data.totalProjects,
      icon: FolderGit2,
      trend: "+12%",
      positive: true,
      color: "bg-green-500"
    },
    {
      title: "Total Microcredentials",
      value: data.totalMicrocredentials,
      icon: Award,
      trend: "+8%",
      positive: true,
      color: "bg-purple-500"
    },
    {
      title: "Active Students",
      value: Math.floor(data.totalStudents * 0.8),
      icon: Activity,
      trend: "-2%",
      positive: false,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 ${stat.color} rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 ${
                  stat.positive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.positive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{stat.trend}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Recent Activities</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    activity.type?.toLowerCase() === 'project' 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type?.toLowerCase() === 'project' ? (
                      <FolderGit2 className="w-5 h-5" />
                    ) : (
                      <Award className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.studentName} added a new {activity.type}
                    </p>
                    <p className="text-sm text-gray-600">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Student Progress</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.studentProgress.map((student, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-800">{student.name}</p>
                    <span className="text-sm text-gray-600">{student.progress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#800000] rounded-full transition-all duration-500"
                      style={{ width: `${student.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Portfolio Distribution</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#800000] rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Projects</span>
                </div>
                <span className="text-sm text-gray-600">{data.portfolioStats.projects}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#800000] rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(data.portfolioStats.projects / (data.portfolioStats.projects + data.portfolioStats.microcredentials)) * 100}%` 
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#D4AF37] rounded-full" />
                  <span className="text-sm font-medium text-gray-700">Microcredentials</span>
                </div>
                <span className="text-sm text-gray-600">{data.portfolioStats.microcredentials}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(data.portfolioStats.microcredentials / (data.portfolioStats.projects + data.portfolioStats.microcredentials)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}