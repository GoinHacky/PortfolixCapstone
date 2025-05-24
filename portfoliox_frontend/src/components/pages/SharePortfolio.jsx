import React, { useState, useEffect } from 'react';
import { Link2, Copy, ExternalLink, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SharePortfolio() {
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [links, setLinks] = useState({});
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(`http://localhost:8080/api/portfolios/student/${userId}`, {
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
      alert('Failed to fetch portfolios');
    }
  };

  const fetchPortfolioLink = async (portfolioId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/portfolios/${portfolioId}/public-link`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const link = await response.text();
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
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/portfolios/${portfolioId}/public-link`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate link');
      }

      const link = await response.text();
      setLinks(prev => ({
        ...prev,
        [portfolioId]: link
      }));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Share Portfolio</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search portfolios..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800000]"
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
          <div key={portfolio.portfolioID} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{portfolio.portfolioTitle || 'Untitled Portfolio'}</h3>
                <span className="text-sm text-gray-500 capitalize">{portfolio.category || 'No Category'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Link2 className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{portfolio.portfolioDescription || 'No description available'}</p>
            
            {links[portfolio.portfolioID] ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 truncate mr-2">
                    <span className="text-sm text-gray-600">{links[portfolio.portfolioID]}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(links[portfolio.portfolioID])}
                      className="p-2 text-gray-600 hover:text-[#800000] transition-colors"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={links[portfolio.portfolioID]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-600 hover:text-[#800000] transition-colors"
                      title="Open link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>Link expires in 30 days</span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => generateLink(portfolio.portfolioID)}
                disabled={loading}
                className="w-full px-4 py-2 bg-[#800000] text-white rounded-lg hover:bg-[#600000] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating...' : 'Generate Sharing Link'}
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredPortfolios.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No portfolios found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
