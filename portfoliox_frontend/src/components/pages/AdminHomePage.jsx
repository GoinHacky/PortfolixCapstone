import React, { useState, useEffect } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid, Area, AreaChart } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

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
    totalProjects: 0,
    totalMicrocredentials: 0,
    recent: [],
    topSkills: [],
    growth: [],
    userGrowth: [],
    projectMicroPie: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // For demo purposes, we'll use in-memory storage instead of localStorage
  // In a real implementation, you would handle token management differently
  const token = localStorage.getItem('token');
  const { darkMode } = useTheme();

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch students
        const studentsRes = await fetch('http://localhost:8080/api/users/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!studentsRes.ok) {
          if (studentsRes.status === 401) {
            localStorage.clear();
            navigate('/auth/login');
            return;
          }
          throw new Error('Failed to fetch students');
        }
        const students = await studentsRes.json();

        // Fetch faculty
        const facultyRes = await fetch('http://localhost:8080/api/users/faculty', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!facultyRes.ok) {
          if (facultyRes.status === 401) {
            localStorage.clear();
            navigate('/auth/login');
            return;
          }
          throw new Error('Failed to fetch faculty');
        }
        const faculty = await facultyRes.json();

        // Fetch portfolios
        const portfoliosRes = await fetch('http://localhost:8080/api/portfolios', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!portfoliosRes.ok) {
          if (portfoliosRes.status === 401) {
            localStorage.clear();
            navigate('/auth/login');
            return;
          }
          throw new Error('Failed to fetch portfolios');
        }
        const portfolios = await portfoliosRes.json();

        // Count projects and microcredentials
        const projects = portfolios.filter(p => p.category === 'project');
        const microcredentials = portfolios.filter(p => p.category === 'microcredentials');
        
        // Recent activity (last 5 updated)
        const recent = [...portfolios].sort((a, b) =>
          new Date(b.lastUpdated || b.createdAt) - new Date(a.lastUpdated || a.createdAt)
        ).slice(0, 5);
        
        // Top skills
        const skillCounts = {};
        portfolios.forEach(p => (p.skills || []).forEach(s => {
          const name = s.skillName || s;
          skillCounts[name] = (skillCounts[name] || 0) + 1;
        }));
        const topSkills = Object.entries(skillCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));
        
        // Growth over time (by month)
        const growthMap = {};
        portfolios.forEach(p => {
          const date = new Date(p.createdAt);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          growthMap[key] = (growthMap[key] || 0) + 1;
        });
        const growth = Object.entries(growthMap)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, count]) => ({ month, count }));
        
        // Group student and faculty creation by month
        const studentGrowthMap = {};
        students.forEach(s => {
          const date = new Date(s.createdAt);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          studentGrowthMap[key] = (studentGrowthMap[key] || 0) + 1;
        });
        
        const facultyGrowthMap = {};
        faculty.forEach(f => {
          const date = new Date(f.createdAt);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          facultyGrowthMap[key] = (facultyGrowthMap[key] || 0) + 1;
        });
        
        // Merge months
        const allMonths = Array.from(new Set([...Object.keys(studentGrowthMap), ...Object.keys(facultyGrowthMap)])).sort();
        const userGrowth = allMonths.map(month => ({
          month,
          students: studentGrowthMap[month] || 0,
          faculty: facultyGrowthMap[month] || 0
        }));
        
        const projectMicroPie = [
          { name: 'Projects', value: projects.length },
          { name: 'Microcredentials', value: microcredentials.length }
        ];
        
        setDashboardData({
          totalStudents: students.length,
          totalFaculty: faculty.length,
          totalProjects: projects.length,
          totalMicrocredentials: microcredentials.length,
          recent,
          topSkills,
          growth,
          userGrowth,
          projectMicroPie,
        });
        setError(null);
      } catch (e) {
        setError('Failed to fetch dashboard data');
        console.error('Dashboard data fetch error:', e);
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
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    );
  }
  
  const COLORS = ['#800000', '#D4AF37', '#B8860B', '#600000', '#A0522D'];

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{`Month: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300 font-medium">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{`Count: ${payload[0].value}`}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{`${((payload[0].value / (dashboardData.totalProjects + dashboardData.totalMicrocredentials)) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="font-semibold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Admin Dashboard</h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Overview of system statistics and activities</p>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`rounded-2xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">Total Students</h3> <div className="text-3xl font-bold text-[#800000] dark:text-[#D4AF37]">{dashboardData.totalStudents}</div> </div>
        <div className={`rounded-2xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">Total Faculty</h3> <div className="text-3xl font-bold text-[#800000] dark:text-[#D4AF37]">{dashboardData.totalFaculty}</div> </div>
        <div className={`rounded-2xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">Total Projects</h3> <div className="text-3xl font-bold text-[#800000] dark:text-[#D4AF37]">{dashboardData.totalProjects}</div> </div>
        <div className={`rounded-2xl shadow-xl border p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> <h3 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">Total Microcredentials</h3> <div className="text-3xl font-bold text-[#800000] dark:text-[#D4AF37]">{dashboardData.totalMicrocredentials}</div> </div>
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bar Chart for User Growth */}
        <div className={`rounded-xl shadow border flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} ${darkMode ? 'text-gray-200' : 'text-gray-800'} border-gray-700 p-6`}>
          <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Monthly Account Creation</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboardData.userGrowth} margin={{ top: 10, right: 30, left: 10, bottom: 40 }} style={{ background: darkMode ? '#1f2937' : '#fff', borderRadius: '1rem' }}>
              <XAxis dataKey="month" stroke={darkMode ? '#d1d5db' : '#6B7280'} fontSize={12} angle={-35} textAnchor="end" height={60} tick={{ fill: darkMode ? '#d1d5db' : '#6B7280' }} />
              <YAxis allowDecimals={false} stroke={darkMode ? '#d1d5db' : '#6B7280'} fontSize={12} tick={{ fill: darkMode ? '#d1d5db' : '#6B7280' }} label={{ value: 'Accounts', angle: -90, position: 'insideLeft', fill: darkMode ? '#d1d5db' : '#6B7280', fontSize: 13 }} />
              <Tooltip contentStyle={{ fontSize: 13, background: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#222', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb', borderRadius: 12 }} labelStyle={{ color: darkMode ? '#fff' : '#222' }} itemStyle={{ color: darkMode ? '#fff' : '#222' }} />
              <Bar dataKey="students" fill="#800000" name="Students" barSize={32} />
              <Bar dataKey="faculty" fill="#D4AF37" name="Faculty" barSize={32} />
              <Legend verticalAlign="top" height={36} iconType="plainline" wrapperStyle={{ fontSize: 13, color: darkMode ? '#d1d5db' : '#222' }} />
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart for Projects vs Microcredentials */}
        <div className={`rounded-xl shadow border flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} ${darkMode ? 'text-gray-200' : 'text-gray-800'} border-gray-700 p-6`}>
          <h3 className={`text-lg font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Portfolio Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart style={{ background: darkMode ? '#1f2937' : '#fff', borderRadius: '1rem' }}>
              <Pie data={dashboardData.projectMicroPie} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={100} innerRadius={50} fill="#8884d8" dataKey="value" stroke="white" strokeWidth={3}>
                <Cell key="projects" fill="#800000" />
                <Cell key="microcredentials" fill="#D4AF37" />
              </Pie>
              <Tooltip contentStyle={{ fontSize: 13, background: darkMode ? '#1f2937' : '#fff', color: darkMode ? '#fff' : '#222', border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb', borderRadius: 12 }} labelStyle={{ color: darkMode ? '#fff' : '#222' }} itemStyle={{ color: darkMode ? '#fff' : '#222' }} />
              <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: 13, color: darkMode ? '#d1d5db' : '#222' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Activity */}
      <div className={`rounded-2xl shadow-xl border p-6 mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Portfolio Activity</h2> {dashboardData.recent.length > 0 ? ( <ul className="divide-y divide-gray-200 dark:divide-gray-700"> {dashboardData.recent.map((item) => ( <li key={item.portfolioID} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"> <div> <div className="font-semibold text-[#800000] dark:text-[#D4AF37]">{item.portfolioTitle}</div> <div className="text-xs text-gray-500 dark:text-gray-400">{item.category} &bull; {item.user?.fname} {item.user?.lname}</div> </div> <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(item.lastUpdated || item.createdAt).toLocaleString()}</div> </li> ))} </ul> ) : ( <div className="text-gray-500 dark:text-gray-400">No recent activity.</div> )} </div>
      {/* Quick Actions */}
      <div className={`rounded-2xl shadow-2xl border p-6 mb-8 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2> <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> <button onClick={() => navigate('/admin/dashboard/requests')} className="p-4 rounded-xl bg-orange-50 dark:bg-[#D4AF37]/10 text-orange-600 dark:text-[#D4AF37] hover:bg-orange-100 dark:hover:bg-[#D4AF37]/20 transition-colors text-center shadow-md"> <Clock className="w-6 h-6 mx-auto mb-2" /> <span className="text-sm font-medium">View Pending Requests</span> </button> <button onClick={() => navigate('/admin/dashboard/faculty')} className="p-4 rounded-xl bg-blue-50 dark:bg-[#800000]/10 text-blue-600 dark:text-[#800000] hover:bg-blue-100 dark:hover:bg-[#800000]/20 transition-colors text-center shadow-md"> <Users className="w-6 h-6 mx-auto mb-2" /> <span className="text-sm font-medium">Manage Faculty</span> </button> <button onClick={() => navigate('/admin/dashboard/students')} className="p-4 rounded-xl bg-green-50 dark:bg-[#D4AF37]/10 text-green-600 dark:text-[#D4AF37] hover:bg-green-100 dark:hover:bg-[#D4AF37]/20 transition-colors text-center shadow-md"> <GraduationCap className="w-6 h-6 mx-auto mb-2" /> <span className="text-sm font-medium">View Students</span> </button> <button onClick={() => navigate('/admin/dashboard/profile')} className="p-4 rounded-xl bg-purple-50 dark:bg-[#800000]/10 text-purple-600 dark:text-[#800000] hover:bg-purple-100 dark:hover:bg-[#800000]/20 transition-colors text-center shadow-md"> <User className="w-6 h-6 mx-auto mb-2" /> <span className="text-sm font-medium">Profile Settings</span> </button> </div> </div>
      {/* System Status Footer */}
      <div className={`rounded-2xl shadow-2xl border p-6 overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}> <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"> <div> <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">System Status</h3> <div className="flex items-center space-x-4"> <div className="flex items-center space-x-2"> <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> <span className="text-sm text-gray-500 dark:text-gray-300">All Systems Online</span> </div> <div className="flex items-center space-x-2"> <Server className="w-4 h-4 text-gray-400 dark:text-gray-500" /> <span className="text-xs text-gray-500 dark:text-gray-400">Server: Healthy</span> </div> <div className="flex items-center space-x-2"> <Database className="w-4 h-4 text-gray-400 dark:text-gray-500" /> <span className="text-xs text-gray-500 dark:text-gray-400">Database: Connected</span> </div> </div> </div> <div className="text-right"> <div className="text-sm text-gray-500 dark:text-gray-300">Last Updated</div> <div className="text-xs text-gray-400 dark:text-gray-500">{new Date().toLocaleString()}</div> </div> </div> </div>
    </div>
  );
}