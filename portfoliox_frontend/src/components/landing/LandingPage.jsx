import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../contexts/ThemeContext';
import PortfolioLogo from '../../assets/images/Portfolio.svg';
import { 
  Star, 
  ArrowRight, 
  Play,
  Moon,
  Sun,
  Menu,
  X,
  Eye,
  Heart
} from "lucide-react";

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

// Enhanced custom styles with more sophisticated animations
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
  
  @keyframes float-reverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(20px) rotate(-2deg); }
  }
  
  @keyframes constellation-drift-1 {
    0%, 100% { transform: translate(0px, 0px); }
    25% { transform: translate(40px, -30px); }
    50% { transform: translate(-20px, -50px); }
    75% { transform: translate(-40px, 30px); }
  }
  
  @keyframes constellation-drift-2 {
    0%, 100% { transform: translate(0px, 0px); }
    25% { transform: translate(-30px, 40px); }
    50% { transform: translate(50px, 20px); }
    75% { transform: translate(10px, -40px); }
  }
  
  @keyframes constellation-drift-3 {
    0%, 100% { transform: translate(0px, 0px); }
    33% { transform: translate(30px, 35px); }
    66% { transform: translate(-35px, -25px); }
  }
  
  @keyframes star-twinkle {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.3); }
  }
  
  @keyframes connection-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  
  @keyframes pulse-glow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
      transform: scale(1);
    }
    50% { 
      box-shadow: 0 0 40px rgba(212, 175, 55, 0.6);
      transform: scale(1.02);
    }
  }
  
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-float-reverse {
    animation: float-reverse 8s ease-in-out infinite;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 3s ease-in-out infinite;
  }
  
  .gradient-shift {
    background: linear-gradient(-45deg, #dc2626, #f97316, #eab308, #b91c1c, #ea580c);
    background-size: 400% 400%;
    animation: gradient-shift 8s ease infinite;
  }
  
  .animate-sparkle {
    animation: sparkle 2s ease-in-out infinite;
  }
  
  .animate-constellation-1 {
    animation: constellation-drift-1 12s ease-in-out infinite;
  }
  
  .animate-constellation-2 {
    animation: constellation-drift-2 15s ease-in-out infinite;
  }
  
  .animate-constellation-3 {
    animation: constellation-drift-3 18s ease-in-out infinite;
  }
  
  .animate-star-twinkle {
    animation: star-twinkle 3s ease-in-out infinite;
  }
  
  .animate-connection-pulse {
    animation: connection-pulse 4s ease-in-out infinite;
  }
  
  .glass-morphism {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  .dark .glass-morphism {
    background: rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(128, 0, 0, 0.2);
  }
  
  .card-hover {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  .card-hover:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 25px 50px rgba(128, 0, 0, 0.25);
  }
`;
document.head.appendChild(style);

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(89);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignIn = () => {
    navigate('/auth/login');
  };

  const handleStartFree = () => {
    navigate('/auth/signup');
  };

  const handleWatchDemo = () => {
    // Implement demo video logic here
    console.log('Opening demo video...');
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Enhanced Animated Background - Constellation Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Constellation Connection Lines */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="constellationGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(127, 29, 29)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="rgb(153, 27, 27)" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="constellationGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(91, 33, 182)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="constellationGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(185, 28, 28)" stopOpacity="0.7" />
                <stop offset="100%" stopColor="rgb(220, 38, 38)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            
            {/* Dynamic constellation connections */}
            <line x1="15%" y1="20%" x2="35%" y2="30%" stroke="url(#constellationGradient1)" strokeWidth="1.5" className="animate-connection-pulse" />
            <line x1="35%" y1="30%" x2="60%" y2="25%" stroke="url(#constellationGradient2)" strokeWidth="1.5" className="animate-connection-pulse" style={{animationDelay: '1s'}} />
            <line x1="60%" y1="25%" x2="80%" y2="40%" stroke="url(#constellationGradient1)" strokeWidth="1.5" className="animate-connection-pulse" style={{animationDelay: '2s'}} />
            <line x1="20%" y1="60%" x2="45%" y2="70%" stroke="url(#constellationGradient3)" strokeWidth="1.5" className="animate-connection-pulse" style={{animationDelay: '3s'}} />
            <line x1="45%" y1="70%" x2="70%" y2="65%" stroke="url(#constellationGradient2)" strokeWidth="1.5" className="animate-connection-pulse" style={{animationDelay: '4s'}} />
            <line x1="70%" y1="65%" x2="85%" y2="75%" stroke="url(#constellationGradient1)" strokeWidth="1.5" className="animate-connection-pulse" style={{animationDelay: '5s'}} />
            <line x1="25%" y1="45%" x2="55%" y2="50%" stroke="url(#constellationGradient3)" strokeWidth="1.5" className="animate-connection-pulse" style={{animationDelay: '6s'}} />
            <line x1="15%" y1="20%" x2="25%" y2="45%" stroke="url(#constellationGradient2)" strokeWidth="1.5" className="animate-connection-pulse" style={{animationDelay: '7s'}} />
            <line x1="60%" y1="25%" x2="70%" y2="65%" stroke="url(#constellationGradient1)" strokeWidth="1.5" className="animate-connection-pulse" style={{animationDelay: '8s'}} />
          </svg>
          
          {/* Constellation Stars/Particles */}
          <div className="absolute top-1/5 left-[15%] w-3 h-3 bg-red-800 rounded-full animate-constellation-1 animate-star-twinkle shadow-lg shadow-red-800/60" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-[30%] left-[35%] w-2.5 h-2.5 bg-red-900 rounded-full animate-constellation-2 animate-star-twinkle shadow-lg shadow-red-900/60" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/4 right-[20%] w-3.5 h-3.5 bg-red-700 rounded-full animate-constellation-3 animate-star-twinkle shadow-lg shadow-red-700/60" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-2/5 right-[15%] w-2 h-2 bg-red-800 rounded-full animate-constellation-1 animate-star-twinkle shadow-lg shadow-red-800/60" style={{animationDelay: '3s'}}></div>
          
          <div className="absolute bottom-2/5 left-1/5 w-2.5 h-2.5 bg-red-900 rounded-full animate-constellation-2 animate-star-twinkle shadow-lg shadow-red-900/60" style={{animationDelay: '4s'}}></div>
          <div className="absolute bottom-[30%] left-[45%] w-3 h-3 bg-red-800 rounded-full animate-constellation-3 animate-star-twinkle shadow-lg shadow-red-800/60" style={{animationDelay: '5s'}}></div>
          <div className="absolute bottom-[35%] right-[30%] w-2.5 h-2.5 bg-red-700 rounded-full animate-constellation-1 animate-star-twinkle shadow-lg shadow-red-700/60" style={{animationDelay: '6s'}}></div>
          <div className="absolute bottom-1/4 right-[15%] w-2 h-2 bg-red-900 rounded-full animate-constellation-2 animate-star-twinkle shadow-lg shadow-red-900/60" style={{animationDelay: '7s'}}></div>
          
          {/* Additional smaller constellation points */}
          <div className="absolute top-[45%] left-1/4 w-1.5 h-1.5 bg-red-700 rounded-full animate-constellation-3 animate-star-twinkle shadow-sm shadow-red-700/50" style={{animationDelay: '8s'}}></div>
          <div className="absolute top-1/2 right-[45%] w-2 h-2 bg-red-800 rounded-full animate-constellation-1 animate-star-twinkle shadow-sm shadow-red-800/50" style={{animationDelay: '9s'}}></div>
          <div className="absolute bottom-1/2 left-[55%] w-1.5 h-1.5 bg-red-900 rounded-full animate-constellation-2 animate-star-twinkle shadow-sm shadow-red-900/50" style={{animationDelay: '10s'}}></div>
          <div className="absolute top-[35%] left-1/2 w-1 h-1 bg-red-800 rounded-full animate-constellation-3 animate-star-twinkle shadow-sm shadow-red-800/50" style={{animationDelay: '11s'}}></div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="relative z-50 w-full py-4 glass-morphism sticky top-0 border-b border-white/20 dark:border-gray-800/50 backdrop-blur-lg">
          <div className="container mx-auto flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow overflow-hidden bg-transparent">
                  <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex flex-col items-start">
                  <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[2px_2px_0px_#800000] w-full" style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: '-0.03em', position: 'relative', display: 'inline-block' }}>
                    PortfolioX
                  </h1>
                  <span className="text-sm font-semibold text-gray-500 mt-0.5" style={{fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif'}}>Student Portfolio Tracker</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-all duration-300 font-medium relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#800000] to-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-all duration-300 font-medium relative group">
                Success Stories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#800000] to-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-all duration-300 font-medium relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#800000] to-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
              </a>
              
              <div className="flex items-center space-x-4 ml-8">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button 
                  onClick={handleSignIn}
                  className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] font-semibold transition-all duration-300 relative group"
                >
                  Sign In
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#800000] to-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button 
                  onClick={handleStartFree}
                  className="px-6 py-3 gradient-shift text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                >
                  <span className="relative z-10">Start Free</span>
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-3">
              <button
                onClick={handleSignIn}
                className="px-4 py-2 text-sm font-semibold rounded-lg shadow-sm bg-white/80 dark:bg-gray-900/60 text-[#800000] dark:text-[#D4AF37] border border-[#800000]/20 dark:border-[#D4AF37]/30"
              >
                Sign In
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 border border-transparent rounded-md hover:bg-white/30 dark:hover:bg-gray-800/60 transition"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full glass-morphism border-t border-white/20 dark:border-gray-800/50 backdrop-blur-xl">
              <div className="px-6 py-4 space-y-4">
                <a href="#features" className="block text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors">Features</a>
                <a href="#testimonials" className="block text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors">Success Stories</a>
                <a href="#pricing" className="block text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors">Pricing</a>
                <button
                  onClick={handleSignIn}
                  className="w-full px-6 py-3 text-[#800000] dark:text-[#D4AF37] font-semibold border border-[#800000]/30 dark:border-[#D4AF37]/40 rounded-xl bg-white/80 dark:bg-gray-900/40"
                >
                  Sign In
                </button>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={handleStartFree}
                    className="w-full px-6 py-3 gradient-shift text-white font-semibold rounded-xl"
                  >
                    Start Free
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Enhanced Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center">
          <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Content */}
              <div className={`space-y-8 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'} transition-all duration-1000`}>
                <div className="inline-flex items-center px-4 py-2 glass-morphism rounded-full border border-[#D4AF37]/30 mb-6">
                  <div className="w-4 h-4 mr-2 inline-block align-middle">
                    <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-4 h-4 object-contain" />
                  </div>
                  <span className="text-sm font-medium text-[#800000] dark:text-[#D4AF37]">🚀 New: AI Portfolio Builder</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight text-shadow text-center sm:text-left">
                  Your Academic
                  <span className="block bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent">
                    Excellence
                  </span>
                  <span className="block">Showcased</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg text-center sm:text-left">
                  Create academic portfolios that land internships, jobs, and admissions. 
                  
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:justify-start justify-center">
                  <button 
                    onClick={handleStartFree}
                    className="px-8 py-4 gradient-shift text-white rounded-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold flex items-center justify-center gap-3 hover-lift group"
                  >
                    Start Creating
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={handleWatchDemo}
                    className="px-8 py-4 glass-morphism text-gray-700 dark:text-gray-300 rounded-xl hover:shadow-lg transition-all duration-300 text-lg font-semibold flex items-center justify-center gap-3 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 pt-8 text-center sm:text-left">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <img
                        key={i}
                        src={`https://i.pravatar.cc/40?img=${i}`}
                        alt={`Student ${i}`}
                        className="w-10 h-10 rounded-full border-3 border-white dark:border-gray-900 shadow-lg"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[#D4AF37]">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-gray-900 dark:text-white">4.9/5</span> from 25K+ students
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content - Enhanced Dashboard Preview */}
              <div className={`relative ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'} transition-all duration-1000 delay-300`}>
                <div className="relative">
                  {/* Enhanced constellation background effects */}
                  <div className="absolute -top-3 -right-3 w-2.5 h-2.5 bg-red-800 rounded-full animate-constellation-1 animate-star-twinkle shadow-lg shadow-red-800/50" style={{animationDelay: '2s'}}></div>
                  <div className="absolute -bottom-3 -left-3 w-2 h-2 bg-red-900 rounded-full animate-constellation-2 animate-star-twinkle shadow-lg shadow-red-900/50" style={{animationDelay: '4s'}}></div>
                  <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-red-700 rounded-full animate-constellation-3 animate-star-twinkle shadow-lg shadow-red-700/50" style={{animationDelay: '6s'}}></div>
                  
                  {/* Main dashboard image with enhanced styling */}
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-rose-400 via-pink-300 to-orange-300 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative">
                      <img
                        src="https://i.postimg.cc/FsKpy6Pp/image-2025-05-24-221727498.png"
                        alt="PortfolioX Dashboard Preview"
                        className="w-full h-auto rounded-2xl shadow-2xl transform transition-all duration-700 group-hover:scale-[1.02] card-hover"
                        style={{
                          transform: `translateY(${scrollY * 0.1}px)`,
                        }}
                      />
                      
                      {/* Floating UI elements */}
                      <div className="absolute top-4 right-4 glass-morphism rounded-lg p-3 animate-float">
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4 text-[#D4AF37]" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">1.2k views</span>
                        </div>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 glass-morphism rounded-lg p-3 animate-float-reverse">
                        <button 
                          onClick={handleLike}
                          className="flex items-center gap-2 text-sm hover:scale-110 transition-all duration-200 group"
                        >
                          <Heart 
                            className={`w-4 h-4 transition-all duration-200 ${
                              isLiked 
                                ? 'text-red-500 fill-current animate-pulse' 
                                : 'text-gray-500 hover:text-red-500 group-hover:fill-current'
                            }`} 
                          />
                          <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-red-500 transition-colors">
                            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}