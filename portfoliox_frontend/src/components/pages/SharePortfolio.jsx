import React, { useState, useEffect } from 'react';
import { Link2, Copy, ExternalLink, Clock, Unlock, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PublicPortfolio from './PublicPortfolio';
import { useNotification } from '../../contexts/NotificationContext';

import { getApiBaseUrl } from '../../api/apiConfig';
export default function SharePortfolio() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [links, setLinks] = useState({});
  const [loading, setLoading] = useState(false);
  const [publicLinkInput, setPublicLinkInput] = useState('');
  const [previewPortfolio, setPreviewPortfolio] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const { showNotification } = useNotification();

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/auth/login');
      return;
    }
    fetchPortfolios();
  }, [token, navigate]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/student/${userId}`, {
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
      setPortfolios(data);
      
      // Fetch existing links for each portfolio
      data.forEach(portfolio => {
        fetchPortfolioLink(portfolio.portfolioID);
      });
    } catch (error) {
      console.error('Error:', error);
      showNotification({ message: 'Failed to fetch portfolios', type: 'error' });
    }
  };

  const fetchPortfolioLink = async (portfolioId) => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/${portfolioId}/public-link`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        let link = await response.text();
        // Always use the React public view route for sharing
        // Extract the token from the backend link
        const tokenMatch = link.match(/([a-f0-9\-]{36})$/);
        const publicToken = tokenMatch ? tokenMatch[1] : link;
        link = `http://localhost:5173/public/view/${publicToken}`;
        setLinks(prev => ({
          ...prev,
          [portfolioId]: link
        }));
      }
    } catch (error) {
      console.error('Error fetching link:', error);
    }
  };

  const generateLink = async (portfolioId) => {
    setActionLoading(prev => ({ ...prev, [portfolioId]: true }));
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/${portfolioId}/public-link`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to generate link');
      }
      let link = await response.text();
      // Always use the React public view route for sharing
      const tokenMatch = link.match(/([a-f0-9\-]{36})$/);
      const publicToken = tokenMatch ? tokenMatch[1] : link;
      link = `http://localhost:5173/public/view/${publicToken}`;
      setLinks(prev => ({
        ...prev,
        [portfolioId]: link
      }));
      setPortfolios(prev => prev.map(p => p.portfolioID === portfolioId ? { ...p, link: { ...p.link, isActive: true } } : p));
    } catch (error) {
      console.error('Error:', error);
      showNotification({ message: 'Failed to generate link', type: 'error' });
    } finally {
      setActionLoading(prev => ({ ...prev, [portfolioId]: false }));
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification({ message: 'Link copied to clipboard!', type: 'success' });
    } catch (err) {
      console.error('Failed to copy:', err);
      showNotification({ message: 'Failed to copy link', type: 'error' });
    }
  };

  const handleOpenPublicLink = async () => {
    if (publicLinkInput && publicLinkInput.trim().length > 0) {
      let input = publicLinkInput.trim();
      // Remove known prefixes if present
      input = input.replace(/^https?:\/\/localhost:8080\/api\/portfolios\/public\//, '');
      input = input.replace(/^https?:\/\/localhost:8080\/public\/view\//, '');
      input = input.replace(/^https?:\/\/localhost:5173\/public\/view\//, '');
      input = input.replace(/^\/api\/portfolios\/public\//, '');
      input = input.replace(/^\/public\/view\//, '');
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewPortfolio(null);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/portfolios/public/${input}`);
        if (!res.ok) throw new Error('Portfolio not found');
        const data = await res.json();
        setPreviewPortfolio(data);
      } catch (err) {
        setPreviewError(err.message);
      } finally {
        setPreviewLoading(false);
      }
    } else {
      showNotification({ message: 'Please enter a valid portfolio token or link.', type: 'info' });
    }
  };

  const togglePublicStatus = async (portfolioId, currentStatus) => {
    setActionLoading(prev => ({ ...prev, [portfolioId]: true }));
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/portfolios/${portfolioId}/public-status?isPublic=${!currentStatus}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Update just this portfolio's link in state
        setPortfolios(prev => prev.map(p => p.portfolioID === portfolioId ? { ...p, link: { ...p.link, isActive: !currentStatus } } : p));
      } else {
        showNotification({ message: 'Failed to update public/private status', type: 'error' });
      }
    } catch (error) {
      showNotification({ message: 'Error updating public/private status', type: 'error' });
    } finally {
      setActionLoading(prev => ({ ...prev, [portfolioId]: false }));
    }
  };

  const filteredPortfolios = portfolios.filter(portfolio => {
    // Check if portfolio exists and has required properties
    if (!portfolio) return false;
    
    const matchesCategory = selectedCategory === 'all' || 
                          (portfolio.category && portfolio.category.toLowerCase() === selectedCategory);
    const matchesSearch = (portfolio.portfolioTitle && portfolio.portfolioTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (portfolio.portfolioDescription && portfolio.portfolioDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-8 bg-gradient-to-br from-transparent via-gray-50/40 to-transparent dark:from-transparent dark:via-gray-900/30 dark:to-transparent min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-black bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent mb-4">Share Portfolio</h1>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Paste a portfolio token or ID to preview..."
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white/95 dark:bg-gray-900/80 dark:text-white"
            value={publicLinkInput}
            onChange={e => setPublicLinkInput(e.target.value)}
          />
          <button
            onClick={handleOpenPublicLink}
            className="px-5 py-3 bg-gradient-to-r from-[#800000] to-[#600000] text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
          >
            Preview Portfolio
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search portfolios..."
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white/95 dark:bg-gray-900/80 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#800000] focus:border-transparent bg-white/95 dark:bg-gray-900/80 dark:text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="project">Projects</option>
            <option value="microcredentials">Microcredentials</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPortfolios.map((portfolio) => (
          <div
            key={portfolio.portfolioID}
            className="bg-white/95 dark:bg-gray-900/80 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white tracking-tight">{portfolio.portfolioTitle || 'Untitled Portfolio'}</h3>
                <span className="inline-flex items-center px-2 py-0.5 mt-1 text-xs font-medium bg-[#800000]/10 dark:bg-[#D4AF37]/20 text-[#800000] dark:text-[#D4AF37] rounded-full capitalize">
                  {portfolio.category || 'No Category'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Link2 className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{portfolio.portfolioDescription || 'No description available'}</p>
            
            {portfolio.link ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="flex-1 truncate mr-2">
                    {portfolio.link.isActive ? (
                      <span className="text-sm text-gray-700 dark:text-gray-200">{links[portfolio.portfolioID]}</span>
                    ) : (
                      <span className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-700 dark:text-yellow-300 text-sm">This portfolio is <b>private</b>. Unlock to enable sharing.</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {portfolio.link.isActive && (
                      <>
                        <button
                          onClick={() => copyToClipboard(links[portfolio.portfolioID])}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors"
                          title="Copy link"
                          disabled={!!actionLoading[portfolio.portfolioID]}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={links[portfolio.portfolioID]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors"
                          title="Open link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => togglePublicStatus(portfolio.portfolioID, portfolio.link.isActive)}
                      className={`p-1.5 rounded-full border ml-2 ${portfolio.link.isActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100'} hover:bg-gray-200 transition-colors`}
                      title={portfolio.link.isActive ? 'Set Private (Lock)' : 'Set Public (Unlock)'}
                      disabled={!!actionLoading[portfolio.portfolioID]}
                    >
                      {portfolio.link.isActive ? (
                        <Unlock className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-[#D4AF37]" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Link expires in 30 days</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => generateLink(portfolio.portfolioID)}
                disabled={!!actionLoading[portfolio.portfolioID]}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#800000] to-[#600000] text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!!actionLoading[portfolio.portfolioID] ? 'Generating...' : 'Generate Sharing Link'}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredPortfolios.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl mt-8 bg-white/50 dark:bg-gray-900/40">
          <p className="text-gray-500 dark:text-gray-400">No portfolios found matching your criteria.</p>
        </div>
      )}

      {/* Preview Container */}
      {(previewLoading || previewError || previewPortfolio) && (
        <div className="mb-6">
          <div className="mb-2 text-gray-700 dark:text-gray-300 font-medium">Portfolio Preview:</div>
          {previewLoading && <div className="p-8 text-center text-gray-500">Loading...</div>}
          {previewError && <div className="p-8 text-center text-red-600">{previewError}</div>}
          {previewPortfolio && (
            <div className="bg-white/70 dark:bg-gray-900/70 flex items-center justify-center font-serif rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
              <div className="w-full max-w-2xl mx-auto bg-white/95 dark:bg-gray-900/90 border border-gray-100 dark:border-gray-700 rounded-xl p-8">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-[#800000] mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                  <div className="ml-3">
                    <h1 className="text-2xl font-bold text-[#800000] tracking-tight">{previewPortfolio.portfolioTitle}</h1>
                    <div className="text-sm text-gray-500">{previewPortfolio.category}</div>
                  </div>
                </div>
                <hr className="my-4 border-gray-300" />
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-[#800000] mb-1">Description</h2>
                  <div className="text-gray-700 leading-relaxed mb-2 text-left">
                    {previewPortfolio.portfolioDescription?.split('\n').map((line, index) => (
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
                  {previewPortfolio.githubLink && (
                    <div className="mb-2">
                      <span className="font-semibold text-[#D4AF37]">GitHub:</span>{' '}
                      <a href={previewPortfolio.githubLink} className="text-blue-700 hover:underline break-all text-sm" target="_blank" rel="noopener noreferrer">{previewPortfolio.githubLink}</a>
                    </div>
                  )}
                  {previewPortfolio.certTitle && (
                    <div className="mb-2">
                      <span className="font-semibold text-[#D4AF37]">Certificate:</span>{' '}
                      <span className="text-gray-800 text-sm">{previewPortfolio.certTitle}</span>
                    </div>
                  )}
                  {previewPortfolio.issueDate && (
                    <div className="mb-2">
                      <span className="font-semibold text-[#D4AF37]">Issue Date:</span>{' '}
                      <span className="text-gray-800 text-sm">{previewPortfolio.issueDate}</span>
                    </div>
                  )}
                </div>
                {previewPortfolio.skills && previewPortfolio.skills.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#800000] mb-2">Skills</h3>
                    <ul className="flex flex-wrap gap-2">
                      {previewPortfolio.skills.map((skill, idx) => (
                        <li key={idx} className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800">{skill.skillName || skill}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {previewPortfolio.certifications && previewPortfolio.certifications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#800000] mb-2">Certifications</h3>
                    <ul className="flex flex-wrap gap-2">
                      {previewPortfolio.certifications.map((cert, idx) => (
                        <li key={idx} className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800">{cert.certTitle || cert}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {previewPortfolio.projects && previewPortfolio.projects.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-[#800000] mb-2">Projects</h2>
                    <ul className="space-y-2">
                      {previewPortfolio.projects.map((proj, idx) => (
                        <li key={idx} className="bg-gray-50 border-l-4 border-[#800000] pl-3 py-2 text-sm text-gray-800">{proj.projectName || proj}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {previewPortfolio.certFile &&
                  (previewPortfolio.certFile.endsWith('.jpg') || previewPortfolio.certFile.endsWith('.jpeg') || previewPortfolio.certFile.endsWith('.png')) && (
                    <div className="mb-4">
                      <span className="font-semibold text-[#D4AF37]">Certificate Image:</span>
                      <div className="mt-2">
                        <img
                          src={`${getApiBaseUrl()}/${previewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`}
                          alt="Certificate"
                          className="max-w-full max-h-64 rounded border border-gray-200 dark:border-gray-700 shadow cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => setPreviewImage(`${getApiBaseUrl()}/${previewPortfolio.certFile.replace(/^uploads\//, 'uploads/')}`)}
                        />
                      </div>
                    </div>
                  )}
                <div className="flex justify-between items-center text-xs text-gray-500 mt-8 pt-4 border-t">
                  <span className="text-[#D4AF37] font-semibold">PortfolioX &copy; 2024</span>
                  <span className="ml-2">Token: <span className="font-mono text-gray-400">{previewPortfolio.publicToken}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
