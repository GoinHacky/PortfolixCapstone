import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getApiBaseUrl } from '../../api/apiConfig';

export default function PublicPortfolio() {
  const { token } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPortfolio() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/portfolios/public/${token}`);
        if (!res.ok) throw new Error('Portfolio not found');
        const data = await res.json();
        setPortfolio(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, [token]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!portfolio) return null;

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center font-serif">
      <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-8 mt-8 mb-8">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-[#800000] mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          <div className="ml-3">
            <h1 className="text-2xl font-bold text-[#800000] tracking-tight">{portfolio.portfolioTitle}</h1>
            <div className="text-sm text-gray-500">{portfolio.category}</div>
          </div>
        </div>
        <hr className="my-4 border-gray-300" />
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#800000] mb-1">Description</h2>
          <p className="text-gray-700 leading-relaxed mb-2">{portfolio.portfolioDescription}</p>
          {portfolio.githubLink && (
            <div className="mb-2">
              <span className="font-semibold text-[#D4AF37]">GitHub:</span>{' '}
              <a href={portfolio.githubLink} className="text-blue-700 hover:underline break-all text-sm" target="_blank" rel="noopener noreferrer">{portfolio.githubLink}</a>
            </div>
          )}
          {portfolio.certTitle && (
            <div className="mb-2">
              <span className="font-semibold text-[#D4AF37]">Certificate:</span>{' '}
              <span className="text-gray-800 text-sm">{portfolio.certTitle}</span>
            </div>
          )}
          {portfolio.issueDate && (
            <div className="mb-2">
              <span className="font-semibold text-[#D4AF37]">Issue Date:</span>{' '}
              <span className="text-gray-800 text-sm">{portfolio.issueDate}</span>
            </div>
          )}
          {portfolio.certFile &&
            (portfolio.certFile.endsWith('.jpg') || portfolio.certFile.endsWith('.jpeg') || portfolio.certFile.endsWith('.png')) && (
              <div className="mb-4">
                <span className="font-semibold text-[#D4AF37]">Certificate Image:</span>
                <div className="mt-2">
                  <img
                    src={`${getApiBaseUrl()}/${portfolio.certFile.replace(/^uploads\//, 'uploads/')}`}
                    alt="Certificate"
                    className="max-w-full max-h-64 rounded border border-gray-200 dark:border-gray-700 shadow"
                  />
                </div>
              </div>
          )}
        </div>
        {portfolio.skills && portfolio.skills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#800000] mb-2">Skills</h3>
            <ul className="flex flex-wrap gap-2">
              {portfolio.skills.map((skill, idx) => (
                <li key={idx} className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800">{skill.skillName || skill}</li>
              ))}
            </ul>
          </div>
        )}
        {portfolio.certifications && portfolio.certifications.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#800000] mb-2">Certifications</h3>
            <ul className="flex flex-wrap gap-2">
              {portfolio.certifications.map((cert, idx) => (
                <li key={idx} className="bg-gray-200 px-3 py-1 rounded-full text-xs font-medium text-gray-800">{cert.certTitle || cert}</li>
              ))}
            </ul>
          </div>
        )}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#800000] mb-2">Projects</h2>
            <ul className="space-y-2">
              {portfolio.projects.map((proj, idx) => (
                <li key={idx} className="bg-gray-50 border-l-4 border-[#800000] pl-3 py-2 text-sm text-gray-800">{proj.projectName || proj}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-8 pt-4 border-t">
          <span className="text-[#D4AF37] font-semibold">PortfolioX &copy; 2024</span>
          <span className="ml-2">Token: <span className="font-mono text-gray-400">{portfolio.publicToken}</span></span>
        </div>
      </div>
    </div>
  );
} 