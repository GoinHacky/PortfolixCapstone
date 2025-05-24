import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Eye, Folder, FolderOpen, ChevronDown, ChevronRight, FileText, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'project',
    githubLink: '',
    certTitle: '',
    issueDate: '',
    certFile: null,
  });

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/auth/login');
      return;
    }
    console.log('Token found:', token);
    fetchPortfolios();
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
      alert('Failed to fetch portfolios');
    }
  };

  const handleDelete = async (portfolioId) => {
    if (!window.confirm('Are you sure you want to delete this portfolio?')) {
      return;
    }

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
      alert('Portfolio deleted successfully!');
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      alert('Failed to delete portfolio');
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
      } else if (formData.category === 'microcredentials') {
        formDataPayload.append('certTitle', formData.certTitle);
        const formattedDate = formData.issueDate ? new Date(formData.issueDate).toISOString().split('T')[0] : '';
        formDataPayload.append('issueDate', formattedDate);
        if (formData.certFile) {
          formDataPayload.append('certFile', formData.certFile);
        }
      }

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
      });
      fetchPortfolios();
      alert(`Portfolio ${editingPortfolio ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error(`Error ${editingPortfolio ? 'updating' : 'creating'} portfolio:`, error);
      alert(error.message || `Failed to ${editingPortfolio ? 'update' : 'create'} portfolio`);
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
    });
    setShowForm(true);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Portfolio</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search portfolios by title, description, or content..."
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleFolder('projects')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            {expandedFolders.projects ? (
              <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
            ) : (
              <Folder className="w-6 h-6 text-[#D4AF37]" />
            )}
            <div className="flex-1 flex items-center">
              <span className="font-medium text-gray-800">Projects</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                {groupedPortfolios.projects.length}
              </span>
            </div>
            {expandedFolders.projects ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedFolders.projects && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
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
                    className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-5 h-5 text-[#800000] mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{portfolio.portfolioTitle}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{portfolio.portfolioDescription}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {portfolio.githubLink && (
                          <a
                            href={portfolio.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            View on GitHub
                          </a>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const publicLink = `http://localhost:8080/api/portfolios/public/${portfolio.publicToken}`;
                              navigator.clipboard.writeText(publicLink);
                              alert('Public link copied to clipboard!');
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                            title="Copy public link"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(portfolio)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(portfolio.portfolioID)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {groupedPortfolios.projects.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm 
                    ? 'No projects match your search.'
                    : 'No projects yet. Click "Add New Project" to create one.'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Microcredentials Folder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleFolder('microcredentials')}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-200"
          >
            {expandedFolders.microcredentials ? (
              <FolderOpen className="w-6 h-6 text-[#D4AF37]" />
            ) : (
              <Folder className="w-6 h-6 text-[#D4AF37]" />
            )}
            <div className="flex-1 flex items-center">
              <span className="font-medium text-gray-800">Microcredentials</span>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                {groupedPortfolios.microcredentials.length}
              </span>
            </div>
            {expandedFolders.microcredentials ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedFolders.microcredentials && (
            <div className="p-4 bg-gray-50 border-b border-gray-200">
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
                    className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-5 h-5 text-[#800000] mt-1" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{portfolio.portfolioTitle}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{portfolio.portfolioDescription}</p>
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <p className="text-sm font-medium text-gray-700">{portfolio.certTitle}</p>
                        <p className="text-sm text-gray-500">Issued: {portfolio.issueDate}</p>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              const publicLink = `http://localhost:8080/api/portfolios/public/${portfolio.publicToken}`;
                              navigator.clipboard.writeText(publicLink);
                              alert('Public link copied to clipboard!');
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                            title="Copy public link"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(portfolio)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(portfolio.portfolioID)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {groupedPortfolios.microcredentials.length === 0 && (
                <div className="text-center py-8 text-gray-500">
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
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingPortfolio ? 'Edit Portfolio' : `Add New ${formData.category === 'project' ? 'Project' : 'Microcredential'}`}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  >
                    <option value="project">Project</option>
                    <option value="microcredentials">Microcredentials</option>
                  </select>
                </div>

                {formData.category === 'project' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GitHub Link</label>
                    <input
                      type="url"
                      name="githubLink"
                      value={formData.githubLink}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                )}

                {formData.category === 'microcredentials' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Certificate Title</label>
                      <input
                        type="text"
                        name="certTitle"
                        value={formData.certTitle}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Issue Date</label>
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Certificate File</label>
                      <input
                        type="file"
                        name="certFile"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            certFile: e.target.files[0],
                          }))
                        }
                        className="mt-1 block w-full"
                        accept=".pdf,.jpg,.png"
                        required={!editingPortfolio}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPortfolio(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
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
    </div>
  );
}