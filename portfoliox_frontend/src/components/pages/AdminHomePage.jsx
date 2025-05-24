import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import AdminSideBar from "./AdminSideBar";
import {
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Shield,
  Activity,
  Bell,
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  GraduationCap,
  Server,
  Database,
  Globe,
  Zap,
  User
} from "lucide-react";
import AdminRequest from './AdminRequest';
import AdminFaculty from './AdminFaculty';
import AdminStudents from './AdminStudents';
import Profile from './Profile';

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function AdminHomePage() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const handleMenuItemSelect = (itemId) => {
    setActiveItem(itemId);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSideBar activeItem={activeItem} onItemSelect={handleMenuItemSelect} />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/requests" element={<AdminRequest />} />
          <Route path="/faculty" element={<AdminFaculty />} />
          <Route path="/students" element={<AdminStudents />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </div>
  );
}

function DashboardContent() {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    pendingRequests: 0,
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch students
        const studentsResponse = await fetch('http://localhost:8080/api/users/students', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!studentsResponse.ok) {
          if (studentsResponse.status === 403) {
            navigate('/auth/login');
            return;
          }
          throw new Error('Failed to fetch students data');
        }
        const studentsData = await studentsResponse.json();

        // Fetch faculty
        const facultyResponse = await fetch('http://localhost:8080/api/users/faculty', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!facultyResponse.ok) {
          if (facultyResponse.status === 403) {
            navigate('/auth/login');
            return;
          }
          throw new Error('Failed to fetch faculty data');
        }
        const facultyData = await facultyResponse.json();

        // Fetch pending faculty requests
        const pendingResponse = await fetch('http://localhost:8080/api/users/faculty/pending', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!pendingResponse.ok) {
          if (pendingResponse.status === 403) {
            navigate('/auth/login');
            return;
          }
          throw new Error('Failed to fetch pending requests');
        }
        const pendingData = await pendingResponse.json();

        setDashboardData({
          totalStudents: studentsData.length,
          totalFaculty: facultyData.length,
          pendingRequests: pendingData.length,
          recentActivities: [] // We'll add this feature later
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: dashboardData.totalStudents + dashboardData.totalFaculty,
      change: null,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      details: `${dashboardData.totalStudents} Students, ${dashboardData.totalFaculty} Faculty`
    },
    {
      title: "Pending Approvals",
      value: dashboardData.pendingRequests,
      change: null,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      details: "Faculty Registration Requests"
    },
    {
      title: "Faculty Members",
      value: dashboardData.totalFaculty,
      change: null,
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      details: "Active Faculty Members"
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Overview of system statistics and activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              {card.change && (
                <span className={`text-sm font-medium ${
                  card.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {card.change}
                </span>
              )}
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-2">{card.title}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-800">{card.value}</span>
              {card.details && (
                <span className="text-sm text-gray-500">{card.details}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/dashboard/requests')}
            className="p-4 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors text-center"
          >
            <Clock className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View Pending Requests</span>
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/faculty')}
            className="p-4 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-center"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Manage Faculty</span>
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/students')}
            className="p-4 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-center"
          >
            <GraduationCap className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View Students</span>
          </button>
          <button
            onClick={() => navigate('/admin/dashboard/profile')}
            className="p-4 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors text-center"
          >
            <User className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Profile Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}