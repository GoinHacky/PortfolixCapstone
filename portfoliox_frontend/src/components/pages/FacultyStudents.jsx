import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Folder, GraduationCap, X, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function FacultyStudents() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPortfolios, setStudentPortfolios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({
    projects: true,
    microcredentials: true
  });
  const [viewPortfolio, setViewPortfolio] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchStudents();
  }, [token, navigate]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users/students', {
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
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      console.log('Fetched students:', data);
      setStudents(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch students');
    }
  };

  const fetchStudentPortfolios = async (studentId) => {
    try {
      console.log('Fetching portfolios for student:', studentId);
      const response = await fetch(`http://localhost:8080/api/portfolios/student/${studentId}`, {
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
        throw new Error('Failed to fetch portfolios');
      }

      const data = await response.json();
      console.log('Fetched portfolios:', data);
      setStudentPortfolios(data);
      // Update selected student
      const student = students.find(s => s.userID === studentId);
      console.log('Setting selected student:', student);
      setSelectedStudent(student);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch portfolios');
    }
  };

  const handleStudentClick = (studentId) => {
    console.log('Student clicked:', studentId);
    fetchStudentPortfolios(studentId);
  };

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    `${student.fname} ${student.lname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group portfolios by category
  const groupedPortfolios = studentPortfolios.reduce((acc, portfolio) => {
    console.log('Processing portfolio:', portfolio);
    const category = (portfolio.category || '').toLowerCase();
    console.log('Portfolio category:', category);

    if (!acc.projects) acc.projects = [];
    if (!acc.microcredentials) acc.microcredentials = [];

    if (category === 'project') {
      acc.projects.push(portfolio);
    } else if (category === 'microcredentials') {
      acc.microcredentials.push(portfolio);
    }

    return acc;
  }, { projects: [], microcredentials: [] });

  console.log('Grouped portfolios:', groupedPortfolios);

  return (
    <div className="container mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Students Panel */}
        <div className="glass-morphism bg-white/70 dark:bg-gray-800/70 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStudents.map((student) => (
              <button
                key={student.userID}
                onClick={() => handleStudentClick(student.userID)}
                className={`w-full p-4 text-left flex items-center gap-4 transition-colors rounded-xl ${
                  selectedStudent?.userID === student.userID ? 'bg-[#800000]/10 dark:bg-[#D4AF37]/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {student.profilePic ? (
                  <img
                    src={student.profilePic.startsWith('http') ? student.profilePic : `http://localhost:8080${student.profilePic}`}
                    alt={student.fname + ' ' + student.lname}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#800000] bg-white"
                    onError={e => { e.target.onerror = null; e.target.src = ''; }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#800000] flex items-center justify-center text-white font-semibold">
                    {student.fname[0]}{student.lname[0]}
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white">
                    {student.fname} {student.lname}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{student.userEmail}</p>
                </div>
              </button>
            ))}
            {filteredStudents.length === 0 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No students found
              </div>
            )}
          </div>
        </div>

        {/* Portfolios Panel */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="glass-morphism bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {selectedStudent.fname} {selectedStudent.lname}'s Portfolios
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedStudent.userEmail}</p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Projects Folder */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
                  <button
                    onClick={() => toggleFolder('projects')}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Folder className="w-6 h-6 text-[#D4AF37]" />
                    <div className="flex-1 flex items-center">
                      <span className="font-medium text-gray-800 dark:text-white">Projects</span>
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                        {groupedPortfolios.projects?.length || 0}
                      </span>
                    </div>
                    {expandedFolders.projects ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>

                  {expandedFolders.projects && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      {groupedPortfolios.projects.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          No projects found
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedPortfolios.projects.map((portfolio) => (
                            <div
                              key={portfolio.portfolioID}
                              className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                              {/* Project card content */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <FileText className="w-5 h-5 text-[#800000]" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-800 dark:text-white">{portfolio.portfolioTitle}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 break-words whitespace-pre-line">{portfolio.portfolioDescription}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setViewPortfolio(portfolio)}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                  title="View Portfolio"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {portfolio.githubLink && (
                                  <a
                                    href={portfolio.githubLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    View on GitHub
                                  </a>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Microcredentials Folder */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => toggleFolder('microcredentials')}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Folder className="w-6 h-6 text-[#D4AF37]" />
                    <div className="flex-1 flex items-center">
                      <span className="font-medium text-gray-800 dark:text-white">Microcredentials</span>
                      <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                        {groupedPortfolios.microcredentials?.length || 0}
                      </span>
                    </div>
                    {expandedFolders.microcredentials ? (
                      <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>

                  {expandedFolders.microcredentials && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      {groupedPortfolios.microcredentials.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                          No microcredentials found
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {groupedPortfolios.microcredentials.map((portfolio) => (
                            <div
                              key={portfolio.portfolioID}
                              className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                            >
                              {/* Microcredential card content */}
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <FileText className="w-5 h-5 text-[#800000]" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-800 dark:text-white">{portfolio.portfolioTitle}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 break-words whitespace-pre-line">{portfolio.portfolioDescription}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setViewPortfolio(portfolio)}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                  title="View Portfolio"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-2 space-y-1">
                                {portfolio.certTitle && (
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Certificate: {portfolio.certTitle}
                                  </p>
                                )}
                                {portfolio.issueDate && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Issued: {new Date(portfolio.issueDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              Select a student to view their portfolios
            </div>
          )}
        </div>
      </div>

      {/* Portfolio Details Modal */}
      {viewPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg w-full max-w-md shadow-lg relative max-h-[80vh] overflow-y-auto hide-scrollbar">
            <button
              onClick={() => setViewPortfolio(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-[#800000] mb-2">{viewPortfolio.portfolioTitle}</h2>
            <div className="mb-4">
              <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Category:</span>
              <span className="ml-2 text-sm text-gray-500 capitalize">{viewPortfolio.category}</span>
            </div>
            <div className="mb-4">
              <span className="font-semibold text-[#800000] uppercase tracking-wide text-xs">Description:</span>
              <p className="mt-1 text-gray-700 dark:text-gray-200 break-words whitespace-pre-line">{viewPortfolio.portfolioDescription}</p>
            </div>
            {viewPortfolio.githubLink && (
              <div className="mb-2">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">GitHub:</span>
                <a href={viewPortfolio.githubLink} className="ml-2 text-blue-700 hover:underline break-all text-sm" target="_blank" rel="noopener noreferrer">{viewPortfolio.githubLink}</a>
              </div>
            )}
            {viewPortfolio.certTitle && (
              <div className="mb-2">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Certificate:</span>
                <span className="ml-2 text-gray-800 text-sm">{viewPortfolio.certTitle}</span>
              </div>
            )}
            {viewPortfolio.issueDate && (
              <div className="mb-2">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Issue Date:</span>
                <span className="ml-2 text-gray-800 text-sm">{new Date(viewPortfolio.issueDate).toLocaleDateString()}</span>
              </div>
            )}
            {viewPortfolio.certFile &&
              (viewPortfolio.certFile.endsWith('.jpg') || viewPortfolio.certFile.endsWith('.jpeg') || viewPortfolio.certFile.endsWith('.png')) && (
                <div className="mb-4">
                  <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Certificate Image:</span>
                  <div className="mt-2">
                    <img
                      src={`http://localhost:8080/${viewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`}
                      alt="Certificate"
                      className="max-w-full max-h-64 rounded border border-gray-200 dark:border-gray-700 shadow cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setPreviewImage(`http://localhost:8080/${viewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`)}
                    />
                  </div>
                </div>
            )}
            {viewPortfolio.skills && viewPortfolio.skills.length > 0 && (
              <div className="mb-2">
                <span className="font-semibold text-[#D4AF37] uppercase tracking-wide text-xs">Skills:</span>
                <span className="ml-2 text-gray-800 text-sm">{viewPortfolio.skills.map(skill => skill.skillName || skill).join(', ')}</span>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewPortfolio(null)}
                className="px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 z-10"
            >
              <X size={32} />
            </button>
            <img
              src={previewImage}
              alt="Certificate Preview"
              className="max-w-full max-h-[80vh] rounded shadow-lg border-4 border-white"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
