import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Trash2, Edit, Eye, Folder, FolderOpen, ChevronDown, ChevronRight, FileText, Search, X, Wand2, Unlock, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { ConfirmDialog } from '../Notification';
import { getApiBaseUrl } from '../../api/apiConfig';

export default function MyPortfolio() {
  const location = useLocation();
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
  const [existingCertPath, setExistingCertPath] = useState(null);
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
    // Open create form if navigated with preset from MyCourse
    if (location.state?.openCreate) {
      setEditingPortfolio(null);
      setFormData(prev => ({
        ...prev,
        category: location.state?.preset?.category || 'project',
        courseCode: location.state?.preset?.courseCode || ''
      }));
      setShowForm(true);
      // clear once consumed to avoid reopening on back
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      // Fallback: read preset from localStorage if state not propagated
      try {
        const raw = localStorage.getItem('portfolioCreatePreset');
        if (raw) {
          const preset = JSON.parse(raw);
          setEditingPortfolio(null);
          setFormData(prev => ({
            ...prev,
            category: preset?.category || 'project',
            courseCode: preset?.courseCode || ''
          }));
          setShowForm(true);
          localStorage.removeItem('portfolioCreatePreset');
        }
      } catch {}
    }
  }, [token, navigate]);

  const fetchPortfolios = async () => {
    try {
      console.log('Fetching portfolios for user:', userId);
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${userId}`, {
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
      const response = await fetch(`${getApiBaseUrl()}/api/courses/student/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setCourses([]);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setCourses([]);
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
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/${portfolioId}`, {
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
      category: portfolio.category,
      githubLink: portfolio.githubLink || '',
      certTitle: portfolio.certTitle || '',
      issueDate: portfolio.issueDate || '',
      certFile: null,
      skills: portfolio.skills?.map(s => s.skillName) || [],
      courseCode: portfolio.courseCode || '',
    });
    setExistingCertPath(portfolio.certFile || null);
    setCertFilePreview(null);
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

      formDataPayload.append('skills', JSON.stringify(formData.skills.map(skill => ({ skillName: skill }))));

      const url = editingPortfolio
        ? `${getApiBaseUrl()}/api/portfolios/${editingPortfolio.portfolioID}`
        : `${getApiBaseUrl()}/api/portfolios`;

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
      setExistingCertPath(null);
      setCertFilePreview(null);
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
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/${portfolioId}/public-status?isPublic=${!currentStatus}`, {
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
    <div className="p-8 bg-gradient-to-br from-transparent via-gray-50/40 to-transparent dark:from-transparent dark:via-gray-900/30 dark:to-transparent min-h-screen">
      {/* Enhanced Header */}
      <div className="mb-10">
        <div className="bg-gradient-to-r from-[#800000] via-[#600000] to-[#800000] rounded-3xl p-8 shadow-2xl border border-[#D4AF37]/20 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2 tracking-tight">My Portfolio</h1>
              <p className="text-[#D4AF37] text-sm font-medium">Showcase your achievements and skills</p>
            </div>
            <button
              onClick={async () => {
                try {
                  // First, get the current resume content
                  const portfoliosResponse = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${userId}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });
                  if (!portfoliosResponse.ok) {
                    throw new Error('Failed to fetch portfolios');
                  }

                  const portfolios = await portfoliosResponse.json();
                  
                  // Check if user has any portfolios
                  if (!portfolios || portfolios.length === 0) {
                    throw new Error('No portfolios found. Please add some projects or microcredentials first.');
                  }

                  // Remove duplicate portfolios to avoid confusing the AI
                  const uniquePortfolios = portfolios.filter((p, index, self) => 
                    index === self.findIndex((t) => t.portfolioTitle === p.portfolioTitle && t.portfolioDescription === p.portfolioDescription)
                  );

                  console.log(`Original portfolios: ${portfolios.length}, Unique portfolios: ${uniquePortfolios.length}`);

                  // Clean portfolio descriptions before sending to AI
                  const cleanPortfolioDescription = (description) => {
                    if (!description) return '';
                    return description
                      .replace(/\[\/?B_INST\]/g, '')
                      .replace(/\[\/?INST\]/g, '')
                      .replace(/<[^>]*>/g, '')
                      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
                      .replace(/\*\*(.*?)\*\*/g, '$1')
                      .replace(/\*(.*?)\*/g, '$1')
                      .replace(/\*/g, '')
                      // Remove AI-generated prefixes and common phrases - more comprehensive approach
                      .replace(/Here.*refined.*portfolio.*description[:\s]*/gi, '')
                      .replace(/Here.*polished.*portfolio.*description[:\s]*/gi, '')
                      .replace(/This.*version.*emphasizes.*\.\s*/gi, '')
                      .replace(/This.*version.*highlights.*\.\s*/gi, '')
                      .replace(/This.*version.*concise.*action.*oriented.*\.\s*/gi, '')
                      .replace(/This\s+version\s+is\s+concise,\s+action-oriented,\s+and\s+highlights\s+your\s+achievements\s+without\s+repetition\.\s*/gi, '')
                      // Remove "Project:" and "Category:" prefixes
                      .replace(/Project:\s*/gi, '')
                      .replace(/Category:\s*/gi, '')
                      // Remove "GitHub Link:" prefixes
                      .replace(/GitHub\s+Link[:\s]*/gi, '')
                      .replace(/\s+/g, ' ')
                      .trim();
                  };

                  // Create a simple text version of the portfolio content
                  const content = uniquePortfolios.map(p => {
                    const cleanedDesc = cleanPortfolioDescription(p.portfolioDescription) || 'No description';
                    console.log('Original description:', p.portfolioDescription);
                    console.log('Cleaned description:', cleanedDesc);
                    return `
                    ${p.portfolioTitle || 'Untitled'}
                    ${cleanedDesc}
                    ${p.category === 'project' ? `GitHub: ${p.githubLink || 'No link provided'}` : ''}
                    ${p.category === 'microcredentials' ? `Certificate: ${p.certTitle || 'No title'}, Issued: ${p.issueDate || 'No date'}` : ''}
                  `;
                  }).join('\n\n');

                  console.log('Sending content to AI:', content); // Debug log

                  const enhanceResponse = await fetch(`${getApiBaseUrl()}/api/ai/enhance-resume`, {
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
                  
                  // Validate enhanced content
                  if (!enhancedData || !enhancedData.enhancedContent) {
                    throw new Error('AI enhancement failed - no enhanced content received');
                  }
                  
                  // Now generate the enhanced PDF
                  const response = await fetch(`${getApiBaseUrl()}/api/portfolios/generate-resume/${userId}?enhanced=true`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ enhancedContent: (enhancedData.enhancedContent || '').trim() }),
                  });
                  
                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Resume generation failed:', errorText);
                    throw new Error(`Failed to generate resume: ${errorText}`);
                  }
                  
                  const blob = await response.blob();
                  
                  // Check if we actually got a PDF
                  if (blob.size === 0) {
                    throw new Error('Generated PDF is empty');
                  }
                  
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'enhanced-portfolio-resume.pdf';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                  
                  showNotification({ message: 'AI-enhanced resume generated successfully!', type: 'success' });
                } catch (error) {
                  console.error('Error:', error);
                  showNotification({ message: 'Failed to generate enhanced resume', type: 'error' });
                }
              }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#800000] rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold whitespace-nowrap"
            >
              <Wand2 size={20} />
              <span>Generate AI Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="mb-10">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#800000] dark:text-[#D4AF37]" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search portfolios by title, description, or content..."
            className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl shadow-md focus:ring-4 focus:ring-[#800000]/20 focus:border-[#800000] dark:focus:border-[#D4AF37] bg-white dark:bg-gray-900 dark:text-white transition-all duration-300"
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
      <div className="space-y-6">
        {/* Projects Folder */}
        <div className="bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white backdrop-blur rounded-2xl shadow-lg border border-[#800000]/10 dark:border-[#D4AF37]/10 overflow-hidden">
          <button
            onClick={() => toggleFolder('projects')}
            className="w-full flex items-center gap-3 p-4 hover:bg-[#800000]/5 dark:hover:bg-[#D4AF37]/10 transition-colors border-b border-gray-100 dark:border-gray-800"
          >
            {expandedFolders.projects ? (
              <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
            ) : (
              <Folder className="w-6 h-6 text-[#D4AF37]" />
            )}
            <div className="flex-1 flex items-center">
              <span className="font-semibold text-gray-800 dark:text-white">Projects</span>
              <span className="ml-2 px-2 py-0.5 bg-[#800000]/10 dark:bg-[#D4AF37]/20 text-[#800000] dark:text-[#D4AF37] text-xs rounded-full">
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
            <div className="p-6 bg-gradient-to-b from-white/60 via-white/40 to-white/20 dark:from-gray-900/70 dark:via-gray-900/60 dark:to-gray-900/40">
              <div className="mb-4">
                <button
                  onClick={() => handleAddPortfolio('project')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#800000] to-[#600000] text-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm"
                >
                  <Plus size={16} />
                  Add New Project
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedPortfolios.projects.map((portfolio) => (
                  <div key={portfolio.portfolioID} 
                    className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-800 hover:border-[#D4AF37] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-[#800000] to-[#600000] rounded-xl shadow-md">
                          <FileText className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight mb-2">{portfolio.portfolioTitle}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 break-words whitespace-pre-line leading-relaxed">{portfolio.portfolioDescription}</p>
                          {portfolio.validatedByFaculty && (
                            <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
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
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => setViewPortfolio(portfolio)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(portfolio)}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all hover:scale-110"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => requestDelete(portfolio.portfolioID)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {portfolio.skills && portfolio.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          {portfolio.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
                            >
                              {skill.skillName || skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {groupedPortfolios.projects.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white/40 dark:bg-gray-900/40">
                  {searchTerm 
                    ? 'No projects match your search.'
                    : 'No projects yet. Click "Add New Project" to create one.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Microcredentials Folder */}
        <div className="bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white backdrop-blur rounded-2xl shadow-lg border border-[#800000]/10 dark:border-[#D4AF37]/10 overflow-hidden">
          <button
            onClick={() => toggleFolder('microcredentials')}
            className="w-full flex items-center gap-3 p-4 hover:bg-[#800000]/5 dark:hover:bg-[#D4AF37]/10 transition-colors border-b border-gray-100 dark:border-gray-800"
          >
            {expandedFolders.microcredentials ? (
              <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
            ) : (
              <Folder className="w-6 h-6 text-[#D4AF37]" />
            )}
            <div className="flex-1 flex items-center">
              <span className="font-semibold text-gray-800 dark:text-white">Microcredentials</span>
              <span className="ml-2 px-2 py-0.5 bg-[#800000]/10 dark:bg-[#D4AF37]/20 text-[#800000] dark:text-[#D4AF37] text-xs rounded-full">
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
            <div className="p-6 bg-gradient-to-b from-white/60 via-white/40 to-white/20 dark:from-gray-900/70 dark:via-gray-900/60 dark:to-gray-900/40">
              <div className="mb-4">
                <button
                  onClick={() => handleAddPortfolio('microcredentials')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#800000] to-[#600000] text-white rounded-xl shadow-sm hover:shadow-md transition-all text-sm"
                >
                  <Plus size={16} />
                  Add New Microcredential
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedPortfolios.microcredentials.map((portfolio) => (
                  <div key={portfolio.portfolioID} 
                    className="group bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-800 hover:border-[#D4AF37] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-xl shadow-md">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight mb-2">{portfolio.portfolioTitle}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 break-words whitespace-pre-line leading-relaxed">{portfolio.portfolioDescription}</p>
                        </div>
                      </div>
                      <div className="space-y-3 mb-4">
                        <p className="text-sm font-semibold text-[#800000] dark:text-[#D4AF37]">{portfolio.certTitle}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">Issued: {portfolio.issueDate}</p>
                        {portfolio.witnessedByNames && portfolio.witnessedByNames.length > 0 ? (
                          <div className="mt-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2">
                            <div className="flex items-center gap-1 mb-1">
                              <Lock className="w-3 h-3 text-green-700 dark:text-green-400" />
                              <p className="text-xs font-semibold text-green-700 dark:text-green-400">Verified & Witnessed</p>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-300">{portfolio.witnessedByNames}</p>
                          </div>
                        ) : (
                          <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-2">
                            <div className="flex items-center gap-1">
                              <Unlock className="w-3 h-3 text-yellow-700 dark:text-yellow-400" />
                              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">Pending Faculty Witness</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={() => setViewPortfolio(portfolio)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                            title="View details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(portfolio)}
                            className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-all hover:scale-110"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => requestDelete(portfolio.portfolioID)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      {portfolio.skills && portfolio.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          {portfolio.skills.map((skill, idx) => (
                            <span key={idx} className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all">{skill.skillName || skill}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {groupedPortfolios.microcredentials.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white/40 dark:bg-gray-900/40">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white/95 dark:bg-gray-900/95 border border-[#800000]/15 dark:border-[#D4AF37]/15 p-6 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
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
                    className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#800000] focus:border-transparent"
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
                          const response = await fetch(`${getApiBaseUrl()}/api/ai/enhance-description`, {
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
                    className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-3 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white text-gray-900 dark:text-white focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#800000] focus:border-transparent"
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
                      className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#800000] focus:border-transparent"
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
                      className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#800000] focus:border-transparent"
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
                        className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issue Date</label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2.5 bg-white/90 dark:bg-gray-900/80 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#800000] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload Certificate</label>
                      <div
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors ${(formData.certFile || existingCertPath) ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-[#800000]'}`}
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
                        {certFilePreview ? (
                          <img
                            src={certFilePreview}
                            alt="Certificate Preview"
                            className="max-h-32 rounded shadow mb-2"
                            style={{ objectFit: 'contain' }}
                          />
                        ) : formData.certFile && typeof formData.certFile === 'string' ? (
                          <img
                            src={`${getApiBaseUrl()}/${formData.certFile.replace(/^uploads\//, 'uploads/')}`}
                            alt="Certificate Preview"
                            className="max-h-32 rounded shadow mb-2"
                            style={{ objectFit: 'contain' }}
                          />
                        ) : existingCertPath ? (
                          <img
                            src={`${getApiBaseUrl()}/${existingCertPath.replace(/^uploads\//, 'uploads/')}`}
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
                        {(formData.certFile || existingCertPath) && (
                          <button
                            type="button"
                            className="mt-2 px-3 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800"
                            onClick={e => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, certFile: null }));
                              setExistingCertPath(null);
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Programming Languages
                  </label>

                  {/* Show detected GitHub languages with percentages */}
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

                  {/* Programming Languages selection */}
                  <div className="max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                    <div className="flex flex-wrap gap-2">
                      {programmingLanguages.map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            if (formData.skills.includes(lang)) {
                              setFormData(prev => ({
                                ...prev,
                                skills: prev.skills.filter(skill => skill !== lang),
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                skills: [...prev.skills, lang],
                              }));
                            }
                          }}
                          className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            formData.skills.includes(lang)
                              ? 'bg-[#800000] text-white shadow-md transform scale-105'
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-[#D4AF37] hover:text-[#800000] hover:border-[#D4AF37] hover:shadow-md hover:scale-105'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Other (specify) button and input */}
                  <div className="mt-3 flex items-center gap-3">
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

                  {/* Selected Skills */}
                  {formData.skills.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected ({formData.skills.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((lang, idx) => (
                          <span
                            key={idx}
                                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#800000] rounded-full text-sm font-semibold shadow-sm"
                          >
                            {lang}
                            <button
                              type="button"
                              className="ml-2 text-[#800000] hover:text-red-600 font-bold text-lg leading-none"
                              onClick={() =>
                                setFormData(prev => ({
                                  ...prev,
                                  skills: prev.skills.filter((s, i) => i !== idx),
                                }))
                              }
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
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
                <div className="text-gray-700 dark:text-gray-200 text-left">
                  {viewPortfolio.portfolioDescription?.split('\n').map((line, index) => (
                    <div key={index} className="mb-1">
                      {line.trim() && (
                        <div className="flex items-start">
                          <span className="text-[#D4AF37] mr-2 mt-1">•</span>
                          <span>{line.trim()}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
                        src={`${getApiBaseUrl()}/${viewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`}
                        alt="Certificate"
                        className="max-w-full max-h-64 rounded border border-gray-200 dark:border-gray-700 shadow cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => setPreviewImage(`${getApiBaseUrl()}/${viewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`)}
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
                <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 text-green-700 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-400">Validated by Faculty</span>
                  </div>
                  <span className="text-gray-800 dark:text-gray-300 text-sm">{viewPortfolio.validatedByName}</span>
                </div>
              )}
              {viewPortfolio.category === 'microcredentials' && (
                viewPortfolio.witnessedByNames && viewPortfolio.witnessedByNames.length > 0 ? (
                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-green-700 dark:text-green-400" />
                      <span className="font-semibold text-green-700 dark:text-green-400">Verified & Witnessed by Faculty</span>
                    </div>
                    <div className="text-gray-800 dark:text-gray-300 text-sm">
                      {viewPortfolio.witnessedByNames.split(',').map((name, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1">
                          <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                          <span>{name.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-yellow-700 dark:text-yellow-400" />
                      <span className="font-semibold text-yellow-700 dark:text-yellow-400">Pending Faculty Witness</span>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">This microcredential is awaiting verification from faculty members.</p>
                  </div>
                )
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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-40" onClick={() => setPreviewImage(null)}>
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