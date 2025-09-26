import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, Eye, Folder, FolderOpen, ChevronDown, ChevronRight, FileText, Search, X, Wand2, Unlock, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { ConfirmDialog } from '../Notification';

export default function MyPortfolio() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({
    projects: true,
    microcredentials: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'project',
    githubLink: '',
    certTitle: '',
    issueDate: '',
    certFile: null,
    skills: [],
    courseCode: '',
  });
  const [viewPortfolio, setViewPortfolio] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const [certFilePreview, setCertFilePreview] = useState(null);
  const { showNotification } = useNotification();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState(null);

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  const programmingLanguages = [
    'C++', 'Java', 'JavaScript', 'Go', 'Python', 'PHP', 'R', 'Ruby', 'SQL', 'Swift',
    'Assembly language', 'CSS', 'HTML', 'Kotlin', 'MATLAB', 'Objective-C', 'Delphi', 'Perl',
    'Rust', 'Visual Basic', 'COBOL', 'Dart', 'Elixir', 'Erlang', 'Fortran'
  ];

  const [githubLanguages, setGithubLanguages] = useState({});
  const [otherLanguage, setOtherLanguage] = useState('');

  useEffect(() => {
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/auth/login');
      return;
    }
    console.log('Token found:', token);
    fetchPortfolios();
    fetchCourses();
  }, [token, navigate]);

  const fetchPortfolios = async () => {
    try {
      console.log('Fetching portfolios for user:', userId);
      const response = await fetch(`http://localhost:8080/api/portfolios/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Portfolio fetch status:', response.status);
      if (!response.ok) {
        if (response.status === 403) {
          console.log('Token expired or invalid, redirecting to login');
          localStorage.clear();
          navigate('/auth/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched portfolios:', data);
      setPortfolios(data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      showNotification({ message: 'Failed to fetch portfolios', type: 'error' });
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const requestDelete = (portfolioId) => {
    setPortfolioToDelete(portfolioId);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    const portfolioId = portfolioToDelete;
    setShowDeleteConfirm(false);
    setPortfolioToDelete(null);
    if (!portfolioId) return;
    try {
      const response = await fetch(`http://localhost:8080/api/portfolios/${portfolioId}`, {
        method: 'DELETE',
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setPortfolios(portfolios.filter(p => p.portfolioID !== portfolioId));
      showNotification({ message: 'Portfolio deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      showNotification({ message: 'Failed to delete portfolio', type: 'error' });
    }
  };

  const handleEdit = (portfolio) => {
    setEditingPortfolio(portfolio);
    setFormData({
      title: portfolio.portfolioTitle,
      description: portfolio.portfolioDescription,
      category: portfolio.category.toLowerCase(),
      githubLink: portfolio.githubLink || '',
      certTitle: portfolio.certTitle || '',
      issueDate: portfolio.issueDate || '',
      certFile: null,
      skills: portfolio.skills?.map(s => s.skillName) || [],
      courseCode: portfolio.courseCode || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/auth/login');
        return;
      }

      const formDataPayload = new FormData();
      formDataPayload.append('portfolioTitle', formData.title);
      formDataPayload.append('portfolioDescription', formData.description);
      formDataPayload.append('category', formData.category.toLowerCase());
      formDataPayload.append('userID', userId);

      if (formData.category === 'project') {
        formDataPayload.append('githubLink', formData.githubLink);
        if (formData.courseCode) {
          formDataPayload.append('courseCode', formData.courseCode);
        }
      } else if (formData.category === 'microcredentials') {
        formDataPayload.append('certTitle', formData.certTitle);
        const formattedDate = formData.issueDate ? new Date(formData.issueDate).toISOString().split('T')[0] : '';
        formDataPayload.append('issueDate', formattedDate);
        if (formData.certFile) {
          formDataPayload.append('certFile', formData.certFile);
        }
      }

      formDataPayload.append('skills', JSON.stringify(formData.skills));

      const url = editingPortfolio
        ? `http://localhost:8080/api/portfolios/${editingPortfolio.portfolioID}`
        : 'http://localhost:8080/api/portfolios';

      const method = editingPortfolio ? 'PUT' : 'POST';

      console.log(`Sending portfolio ${editingPortfolio ? 'update' : 'creation'} request:`);
      console.log('Token:', token);
      console.log('FormData entries:');
      for (const [key, value] of formDataPayload.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataPayload,
      });

      console.log('Portfolio operation status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (!response.ok) {
        if (response.status === 403) {
          console.log('Token expired or invalid, redirecting to login');
          localStorage.clear();
          navigate('/auth/login');
          return;
        }
        throw new Error(responseText || `Failed to ${editingPortfolio ? 'update' : 'create'} portfolio`);
      }

      const result = responseText ? JSON.parse(responseText) : {};
      console.log('Success response:', result);

      setShowForm(false);
      setEditingPortfolio(null);
      setFormData({
        title: '',
        description: '',
        category: 'project',
        githubLink: '',
        certTitle: '',
        issueDate: '',
        certFile: null,
        skills: [],
        courseCode: '',
      });
      fetchPortfolios();
      showNotification({ message: `Portfolio ${editingPortfolio ? 'updated' : 'created'} successfully!`, type: 'success' });
    } catch (error) {
      console.error(`Error ${editingPortfolio ? 'updating' : 'creating'} portfolio:`, error);
      showNotification({ message: error.message || `Failed to ${editingPortfolio ? 'update' : 'create'} portfolio`, type: 'error' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleFolder = (folder) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folder]: !prev[folder]
    }));
  };

  // Filter portfolios based on search term
  const filteredPortfolios = portfolios.filter(portfolio => {
    const searchString = searchTerm.toLowerCase();
    return (
      portfolio.portfolioTitle?.toLowerCase().includes(searchString) ||
      portfolio.portfolioDescription?.toLowerCase().includes(searchString) ||
      portfolio.certTitle?.toLowerCase().includes(searchString) ||
      portfolio.githubLink?.toLowerCase().includes(searchString)
    );
  });

  // Group filtered portfolios by category
  const groupedPortfolios = {
    projects: filteredPortfolios.filter(p => p?.category?.toLowerCase() === 'project'),
    microcredentials: filteredPortfolios.filter(p => p?.category?.toLowerCase() === 'microcredentials')
  };

  const handleAddPortfolio = (category) => {
    setEditingPortfolio(null);
    setFormData({
      title: '',
      description: '',
      category: category,
      githubLink: '',
      certTitle: '',
      issueDate: '',
      certFile: null,
      skills: [],
      courseCode: '',
    });
    setShowForm(true);
  };

  const togglePublicStatus = async (portfolioId, currentStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/portfolios/${portfolioId}/public-status?isPublic=${!currentStatus}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchPortfolios(); // Refresh portfolios to update status
      } else {
        showNotification({ message: 'Failed to update public/private status', type: 'error' });
      }
    } catch (error) {
      showNotification({ message: 'Error updating public/private status', type: 'error' });
    }
  };

  useEffect(() => {
    const fetchGithubLanguages = async () => {
      setGithubLanguages({});
      if (
        formData.category === 'project' &&
        formData.githubLink &&
        formData.githubLink.includes('github.com')
      ) {
        try {
          // Extract owner/repo from URL
          const match = formData.githubLink.match(/github\.com\/([^/]+)\/([^/]+)/);
          if (!match) return;
          const owner = match[1];
          const repo = match[2].replace(/\.git$/, '');

          const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
          if (!res.ok) return;
          const langs = await res.json();
          setGithubLanguages(langs);

          // Auto-select languages (add to formData.skills if not already present)
          const detected = Object.keys(langs);
          setFormData(prev => {
            // Only add detected languages that are not already in skills
            const newSkills = [
              ...prev.skills,
              ...detected.filter(lang => !prev.skills.includes(lang))
            ];
            return {
              ...prev,
              skills: Array.from(new Set(newSkills))
            };
          });
        } catch (err) {
          // Ignore errors
        }
      }
    };
    fetchGithubLanguages();
    // eslint-disable-next-line
  }, [formData.githubLink, formData.category]);

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Portfolio</h1>
        <div className="flex gap-4">
          <button
            onClick={async () => {
              try {
                // First, get the current resume content
                const portfoliosResponse = await fetch(`http://localhost:8080/api/portfolios/student/${userId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                  },
                });
                
                if (!portfoliosResponse.ok) {
                  throw new Error('Failed to fetch portfolios');
                }
                
                const portfolios = await portfoliosResponse.json();
                
                // Create a simple text version of the portfolio content
                const content = portfolios.map(p => `
                  ${p.portfolioTitle}
                  ${p.portfolioDescription}
                  ${p.category === 'project' ? `GitHub: ${p.githubLink}` : ''}
                  ${p.category === 'microcredentials' ? `Certificate: ${p.certTitle}, Issued: ${p.issueDate}` : ''}
                `).join('\n\n');

                console.log('Sending content to AI:', content); // Debug log

                const enhanceResponse = await fetch('http://localhost:8080/api/ai/enhance-resume', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify({ content }),
                });

                if (!enhanceResponse.ok) {
                  const errorText = await enhanceResponse.text();
                  console.error('AI Enhancement failed:', errorText);
                  throw new Error(`Failed to enhance resume: ${errorText}`);
                }

                const enhancedData = await enhanceResponse.json();
                console.log('Received enhanced content:', enhancedData); // Debug log
                
                // Now generate the enhanced PDF
                const response = await fetch(`http://localhost:8080/api/portfolios/generate-resume/${userId}?enhanced=true`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ enhancedContent: enhancedData.enhancedContent }),
                });
                
                if (!response.ok) {
                  throw new Error('Failed to generate resume');
                }
                
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'enhanced-portfolio-resume.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
              } catch (error) {
                console.error('Error:', error);
                showNotification({ message: 'Failed to generate enhanced resume', type: 'error' });
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8860B] transition-colors"
          >
            <Wand2 size={16} />
            Generate AI-Enhanced Resume
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search portfolios by title, description, or content..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white dark:bg-gray-800 dark:text-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredPortfolios.length} result{filteredPortfolios.length !== 1 ? 's' : ''}
            {filteredPortfolios.length > 0 && (
              <span>
                : {groupedPortfolios.projects.length} project{groupedPortfolios.projects.length !== 1 ? 's' : ''} and{' '}
                {groupedPortfolios.microcredentials.length} microcredential{groupedPortfolios.microcredentials.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Portfolio Folders */}
      <div className="space-y-4">
        {/* Projects Folder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleFolder('projects')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            {expandedFolders.projects ? (
              <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
            ) : (
              <Folder className="w-6 h-6 text-[#D4AF37]" />
            )}
            <div className="flex-1 flex items-center">
              <span className="font-medium text-gray-800 dark:text-white">Projects</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                {groupedPortfolios.projects.length}
              </span>
            </div>
            {expandedFolders.projects ? (
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          
          {expandedFolders.projects && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <button
                  onClick={() => handleAddPortfolio('project')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors text-sm"
                >
                  <Plus size={16} />
                  Add New Project
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPortfolios.projects.map((portfolio) => (
                  <div key={portfolio.portfolioID} 
                    className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-5 h-5 text-[#800000] mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 dark:text-white">{portfolio.portfolioTitle}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 break-words whitespace-pre-line">{portfolio.portfolioDescription}</p>
                          {portfolio.validatedByFaculty && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              Validated by {portfolio.validatedByName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {portfolio.githubLink && (
                          <a
                            href={portfolio.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            View on GitHub
                          </a>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewPortfolio(portfolio)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(portfolio)}
                            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => requestDelete(portfolio.portfolioID)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {portfolio.skills && portfolio.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {portfolio.skills.map((skill, idx) => (
                            <span key={idx} className="bg-[#D4AF37] text-[#800000] px-2 py-0.5 rounded-full text-xs font-semibold">{skill.skillName || skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {groupedPortfolios.projects.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? 'No projects match your search.'
                    : 'No projects yet. Click "Add New Project" to create one.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Microcredentials Folder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => toggleFolder('microcredentials')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
          >
            {expandedFolders.microcredentials ? (
              <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
            ) : (
              <Folder className="w-6 h-6 text-[#D4AF37]" />
            )}
            <div className="flex-1 flex items-center">
              <span className="font-medium text-gray-800 dark:text-white">Microcredentials</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                {groupedPortfolios.microcredentials.length}
              </span>
            </div>
            {expandedFolders.microcredentials ? (
              <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </button>
          
          {expandedFolders.microcredentials && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <button
                  onClick={() => handleAddPortfolio('microcredentials')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors text-sm"
                >
                  <Plus size={16} />
                  Add New Microcredential
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedPortfolios.microcredentials.map((portfolio) => (
                  <div key={portfolio.portfolioID} 
                    className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-5 h-5 text-[#800000] mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800 dark:text-white">{portfolio.portfolioTitle}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 break-words whitespace-pre-line">{portfolio.portfolioDescription}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{portfolio.certTitle}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Issued: {portfolio.issueDate}</p>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewPortfolio(portfolio)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md"
                            title="View details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(portfolio)}
                            className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-md"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => requestDelete(portfolio.portfolioID)}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {portfolio.skills && portfolio.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {portfolio.skills.map((skill, idx) => (
                            <span key={idx} className="bg-[#D4AF37] text-[#800000] px-2 py-0.5 rounded-full text-xs font-semibold">{skill.skillName || skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {groupedPortfolios.microcredentials.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm 
                    ? 'No microcredentials match your search.'
                    : 'No microcredentials yet. Click "Add New Microcredential" to create one.'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              {editingPortfolio ? 'Edit Portfolio' : `Add New ${formData.category === 'project' ? 'Project' : 'Microcredential'}`}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const response = await fetch('http://localhost:8080/api/ai/enhance-description', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              title: formData.title,
                              description: formData.description,
                              category: formData.category,
                              githubLink: formData.githubLink
                            }),
                          });

                          if (!response.ok) {
                            throw new Error('Failed to get AI suggestions');
                          }

                          const data = await response.json();
                          setFormData(prev => ({
                            ...prev,
                            description: data.enhancedDescription
                          }));
                        } catch (error) {
                          console.error('Error getting AI suggestions:', error);
                          showNotification({ message: 'Failed to get AI suggestions', type: 'error' });
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-[#800000] dark:text-[#D4AF37] hover:text-[#600000] dark:hover:text-[#B8860B]"
                    >
                      <Wand2 className="w-4 h-4" />
                      Enhance with AI
                    </button>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                  >
                    <option value="project">Project</option>
                    <option value="microcredentials">Microcredentials</option>
                  </select>
                </div>

                {formData.category === 'project' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub Link</label>
                    <input
                      type="url"
                      name="githubLink"
                      value={formData.githubLink}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                      required
                    />
                  </div>
                )}

                {formData.category === 'project' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course Code (optional)</label>
                    <select
                      name="courseCode"
                      value={formData.courseCode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                    >
                      <option value="">-- None --</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.courseCode}>
                          {course.courseCode} - {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.category === 'microcredentials' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Certificate Title</label>
                      <input
                        type="text"
                        name="certTitle"
                        value={formData.certTitle}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Certificate Image</label>
                      <div
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${formData.certFile ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#800000]'}`}
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          const file = e.dataTransfer.files[0];
                          if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
                            setFormData(prev => ({ ...prev, certFile: file }));
                            setCertFilePreview(URL.createObjectURL(file));
                          } else {
                            showNotification({ message: 'Only JPG and PNG images are allowed.', type: 'info' });
                          }
                        }}
                        style={{ minHeight: 120 }}
                      >
                        {certFilePreview || (formData.certFile && typeof formData.certFile === 'string') ? (
                          <img
                            src={certFilePreview || (typeof formData.certFile === 'string' ? `http://localhost:8080/${formData.certFile.replace(/^uploads\//, 'uploads/')}` : undefined)}
                            alt="Certificate Preview"
                            className="max-h-32 rounded shadow mb-2"
                            style={{ objectFit: 'contain' }}
                          />
                        ) : (
                          <>
                            <span className="text-gray-400 dark:text-gray-500 mb-2">
                              Drag & drop an image here, or <span className="text-[#800000] dark:text-[#D4AF37] underline">click to select</span>
                            </span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">JPG or PNG, max 5MB</span>
                          </>
                        )}
                        <input
                          type="file"
                          name="certFile"
                          ref={fileInputRef}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file && (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg')) {
                              setFormData(prev => ({ ...prev, certFile: file }));
                              setCertFilePreview(URL.createObjectURL(file));
                            } else {
                              showNotification({ message: 'Only JPG and PNG images are allowed.', type: 'info' });
                            }
                          }}
                          className="hidden"
                          accept=".jpg,.jpeg,.png"
                          required={!editingPortfolio}
                        />
                        {formData.certFile && (
                          <button
                            type="button"
                            className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800"
                            onClick={e => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, certFile: null }));
                              setCertFilePreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Programming Languages</label>
                  {Object.keys(githubLanguages).length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Detected from GitHub:</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(githubLanguages).map(([lang, bytes]) => {
                          const total = Object.values(githubLanguages).reduce((a, b) => a + b, 0);
                          const percent = ((bytes / total) * 100).toFixed(1);
                          return (
                            <span
                              key={lang}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold"
                            >
                              {lang} ({percent}%)
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <select
                    multiple
                    value={formData.skills}
                    onChange={e => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      if (selected.includes('Other (specify)')) {
                        setFormData(prev => ({
                          ...prev,
                          skills: prev.skills.filter(s => s !== 'Other (specify)')
                        }));
                      } else {
                        setFormData(prev => ({
                          ...prev,
                          skills: selected
                        }));
                      }
                    }}
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                  >
                    {programmingLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                    {/* Add detected GitHub languages if not in the list */}
                    {Object.keys(githubLanguages)
                      .filter(lang => !programmingLanguages.includes(lang))
                      .map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                  </select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((lang, idx) => (
                      <span key={idx} className="inline-flex items-center px-3 py-1 bg-[#D4AF37] text-[#800000] rounded-full text-xs font-semibold">
                        {lang}
                        <button type="button" className="ml-2 text-[#800000] hover:text-red-600" onClick={() => setFormData(prev => ({ ...prev, skills: prev.skills.filter((s, i) => i !== idx) }))}>&times;</button>
                      </span>
                    ))}
                  </div>
                  {/* Show input if "Other (specify)" is selected in the select box */}
                  <div className="mt-2">
                    <button
                      type="button"
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mr-2"
                      onClick={() => {
                        // Show input for other language
                        setFormData(prev => ({
                          ...prev,
                          showOtherInput: true
                        }));
                      }}
                    >
                      Other (specify)
                    </button>
                    {formData.showOtherInput && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Specify other language"
                          value={otherLanguage}
                          onChange={e => setOtherLanguage(e.target.value)}
                          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2"
                        />
                        <button
                          type="button"
                          className="px-3 py-1 bg-[#D4AF37] text-[#800000] rounded text-xs"
                          onClick={() => {
                            if (
                              otherLanguage &&
                              !formData.skills.includes(otherLanguage)
                            ) {
                              setFormData(prev => ({
                                ...prev,
                                skills: [...prev.skills, otherLanguage],
                                showOtherInput: false
                              }));
                              setOtherLanguage('');
                            }
                          }}
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded text-xs"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              showOtherInput: false
                            }));
                            setOtherLanguage('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPortfolio(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#800000] text-white rounded-md hover:bg-[#600000]"
                >
                  {editingPortfolio ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewPortfolio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg w-full max-w-lg shadow-lg relative">
            <button
              onClick={() => setViewPortfolio(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 z-10"
            >
              <X size={24} />
            </button>
            <div className="max-h-[70vh] overflow-y-auto pr-2 hide-scrollbar">
              <h2 className="text-2xl font-bold text-[#800000] mb-2">{viewPortfolio.portfolioTitle}</h2>
              <div className="text-sm text-gray-500 mb-4 capitalize">{viewPortfolio.category}</div>
              <div className="mb-4">
                <h3 className="font-semibold text-[#800000] mb-1">Description</h3>
                <p className="text-gray-700 dark:text-gray-200 text-justify">{viewPortfolio.portfolioDescription}</p>
              </div>
              {viewPortfolio.githubLink && (
                <div className="mb-2">
                  <span className="font-semibold text-[#D4AF37]">GitHub:</span>{' '}
                  <a href={viewPortfolio.githubLink} className="text-blue-700 hover:underline break-all text-sm" target="_blank" rel="noopener noreferrer">{viewPortfolio.githubLink}</a>
                </div>
              )}
              {viewPortfolio.certTitle && (
                <div className="mb-2">
                  <span className="font-semibold text-[#D4AF37]">Certificate:</span>{' '}
                  <span className="text-gray-800 text-sm">{viewPortfolio.certTitle}</span>
                </div>
              )}
              {viewPortfolio.issueDate && (
                <div className="mb-2">
                  <span className="font-semibold text-[#D4AF37]">Issue Date:</span>{' '}
                  <span className="text-gray-800 text-sm">{viewPortfolio.issueDate}</span>
                </div>
              )}
              {viewPortfolio.certFile &&
                (viewPortfolio.certFile.endsWith('.jpg') || viewPortfolio.certFile.endsWith('.jpeg') || viewPortfolio.certFile.endsWith('.png')) && (
                  <div className="mb-4">
                    <span className="font-semibold text-[#D4AF37]">Certificate Image:</span>
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
                  <span className="font-semibold text-[#D4AF37]">Skills:</span>{' '}
                  <span className="text-gray-800 text-sm">{viewPortfolio.skills.map(skill => skill.skillName || skill).join(', ')}</span>
                </div>
              )}
              {viewPortfolio.certifications && viewPortfolio.certifications.length > 0 && (
                <div className="mb-2">
                  <span className="font-semibold text-[#D4AF37]">Certifications:</span>{' '}
                  <span className="text-gray-800 text-sm">{viewPortfolio.certifications.map(cert => cert.certTitle || cert).join(', ')}</span>
                </div>
              )}
              {viewPortfolio.projects && viewPortfolio.projects.length > 0 && (
                <div className="mb-2">
                  <span className="font-semibold text-[#D4AF37]">Projects:</span>{' '}
                  <span className="text-gray-800 text-sm">{viewPortfolio.projects.map(proj => proj.projectName || proj).join(', ')}</span>
                </div>
              )}
              {viewPortfolio.validatedByFaculty && (
                <div className="mb-2">
                  <span className="font-semibold text-green-700">Validated by:</span>{' '}
                  <span className="text-gray-800 text-sm">{viewPortfolio.validatedByName}</span>
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

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Portfolio"
        message="Are you sure you want to delete this portfolio? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => { setShowDeleteConfirm(false); setPortfolioToDelete(null); }}
      />
    </div>
  );
}