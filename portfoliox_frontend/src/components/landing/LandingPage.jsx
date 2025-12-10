import React, { useState, useEffect, useRef } from "react";
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
  Heart,
  Sparkles,
  Trophy,
  Users,
  Zap,
  Shield,
  CheckCircle,
  TrendingUp,
  Award,
  BookOpen,
  Code,
  Briefcase,
  GraduationCap
} from "lucide-react";

const maroon = "bg-[#800000]";

const STATS = [
  { number: "10K+", label: "Students", icon: <GraduationCap className="w-6 h-6" /> },
  { number: "50K+", label: "Portfolios", icon: <Briefcase className="w-6 h-6" /> },
  { number: "95%", label: "Success Rate", icon: <Trophy className="w-6 h-6" /> },
  { number: "24/7", label: "Support", icon: <Shield className="w-6 h-6" /> }
];

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
  
  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  
  @keyframes slide-in-left {
    0% { opacity: 0; transform: translateX(-100px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes slide-in-right {
    0% { opacity: 0; transform: translateX(100px); }
    100% { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes fade-in-up {
    0% { opacity: 0; transform: translateY(50px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes bounce-gentle {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    60% { transform: translateY(-5px); }
  }
  
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes wave {
    0%, 100% { transform: translateY(0) scaleY(1); }
    50% { transform: translateY(-10px) scaleY(0.8); }
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
  
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
    background-size: 200% 100%;
    animation: shimmer 3s infinite;
  }
  
  .animate-slide-in-left {
    animation: slide-in-left 1s ease-out;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 1s ease-out;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 1s ease-out;
  }
  
  .animate-bounce-gentle {
    animation: bounce-gentle 2s ease-in-out infinite;
  }
  
  .animate-rotate-slow {
    animation: rotate-slow 20s linear infinite;
  }
  
  .animate-wave {
    animation: wave 3s ease-in-out infinite;
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

  .grid-pattern {
    background-image: linear-gradient(
        to right,
        rgba(128, 0, 0, 0.14) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        rgba(212, 175, 55, 0.18) 1px,
        transparent 1px
      );
    background-size: 48px 48px;
    mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.9), transparent 75%);
  }

  .dark .grid-pattern {
    background-image: linear-gradient(
        to right,
        rgba(212, 175, 55, 0.25) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        rgba(128, 0, 0, 0.22) 1px,
        transparent 1px
      );
  }

  .grid-veil {
    background: radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.35), transparent 55%),
      radial-gradient(circle at 80% 30%, rgba(128, 0, 0, 0.25), transparent 60%),
      radial-gradient(circle at 50% 70%, rgba(128, 0, 0, 0.18), transparent 65%);
    mix-blend-mode: screen;
  }

  .dark .grid-veil {
    mix-blend-mode: lighten;
    opacity: 0.7;
  }
`;
document.head.appendChild(style);

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(89);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const heroRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(testimonialInterval);
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
        <nav className="relative z-50 w-full py-3 sm:py-4 glass-morphism sticky top-0 border-b border-white/20 dark:border-gray-800/50 backdrop-blur-lg">
          <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 md:px-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow overflow-hidden bg-transparent">
                  <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 object-contain" />
                </div>
                <div className="flex flex-col items-start">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-white drop-shadow-[2px_2px_0px_#800000] w-full" style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: '-0.03em', position: 'relative', display: 'inline-block' }}>
                    PortfolioX
                  </h1>
                  <span className="text-xs sm:text-sm font-semibold text-gray-500 mt-0.5" style={{fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif'}}>Student Portfolio Tracker</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-4 ml-auto">
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
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={handleSignIn}
                className="px-3 py-1.5 text-sm font-semibold rounded-lg shadow-sm bg-white/80 dark:bg-gray-900/60 text-[#800000] dark:text-[#D4AF37] border border-[#800000]/20 dark:border-[#D4AF37]/30"
              >
                Sign In
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 border border-transparent rounded-md hover:bg-white/30 dark:hover:bg-gray-800/60 transition"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full glass-morphism border-t border-white/20 dark:border-gray-800/50 backdrop-blur-xl">
              <div className="px-4 py-3 space-y-3">
                <button
                  onClick={handleSignIn}
                  className="w-full px-4 py-2 text-[#800000] dark:text-[#D4AF37] font-semibold border border-[#800000]/30 dark:border-[#D4AF37]/40 rounded-xl bg-white/80 dark:bg-gray-900/40"
                >
                  Sign In
                </button>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button 
                    onClick={handleStartFree}
                    className="w-full px-4 py-2 gradient-shift text-white font-semibold rounded-xl"
                  >
                    Start Free
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Enhanced Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center py-12 sm:py-16 lg:py-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 grid-pattern opacity-60" />
            <div className="absolute inset-0 grid-veil" />
            <div className="absolute left-1/4 top-16 h-40 w-40 rounded-full bg-[#D4AF37]/20 blur-3xl" />
            <div className="absolute right-1/3 bottom-24 h-56 w-56 rounded-full bg-[#800000]/15 blur-3xl" />
          </div>
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-12 sm:py-16 lg:py-20 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              {/* Left Content */}
              <div className={`space-y-8 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'} transition-all duration-1000`}>
                <div className="inline-flex items-center px-4 py-2 glass-morphism rounded-full border border-[#D4AF37]/30 mb-6">
                  <div className="w-4 h-4 mr-2 inline-block align-middle">
                    <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-4 h-4 object-contain" />
                  </div>
                  <span className="text-sm font-medium text-[#800000] dark:text-[#D4AF37]">≡ƒÜÇ New: AI Portfolio Builder</span>
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 dark:text-white leading-tight text-shadow text-center sm:text-left">
                  <span className="block">Your Academic</span>
                  <span className="block bg-gradient-to-r from-[#800000] via-[#D4AF37] to-[#800000] bg-clip-text text-transparent animate-pulse" style={{animationDuration: '3s'}}>
                    Excellence
                  </span>
                  <span className="block">Showcased</span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl text-center sm:text-left font-medium">
                  Create <span className="text-[#800000] dark:text-[#D4AF37] font-bold">stunning academic portfolios</span> that land internships, jobs, and admissions. 
                  <span className="block mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Showcase your projects, skills, and achievements with AI-powered tools.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-start justify-center">
                  <button 
                    onClick={handleStartFree}
                    className="group relative px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-[#800000] via-[#600000] to-[#800000] text-white rounded-2xl hover:shadow-2xl transition-all duration-300 text-base sm:text-lg font-black flex items-center justify-center gap-3 hover:scale-110 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#B8860B] to-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative z-10">Start Creating Free</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button 
                    onClick={handleWatchDemo}
                    className="group px-6 py-3 sm:px-8 sm:py-4 glass-morphism text-gray-800 dark:text-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 text-base sm:text-lg font-bold flex items-center justify-center gap-3 border-2 border-[#800000]/30 dark:border-[#D4AF37]/30 hover:border-[#800000] dark:hover:border-[#D4AF37] hover:scale-105"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-[#800000] dark:text-[#D4AF37]" />
                    Watch Demo
                  </button>
                </div>
              </div>

              {/* Right Content - Enhanced Dashboard Preview */}
              <div className={`relative ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'} transition-all duration-1000 delay-300`}>
                <div className="relative">
                  {/* Enhanced constellation background effects */}
                  <div className="absolute -top-3 -right-3 w-2.5 h-2.5 bg-red-800 rounded-full animate-constellation-1 animate-star-twinkle shadow-lg shadow-red-800/50" style={{animationDelay: '2s'}}></div>
                  <div className="absolute -bottom-3 -left-3 w-2 h-2 bg-red-900 rounded-full animate-constellation-2 animate-star-twinkle shadow-lg shadow-red-900/50" style={{animationDelay: '4s'}}></div>
                  <div className="absolute top-1/2 -right-2 w-1.5 h-1.5 bg-red-700 rounded-full animate-constellation-3 animate-star-twinkle shadow-lg shadow-red-700/50" style={{animationDelay: '6s'}}></div>
                  
                  {/* Main dashboard showcase */}
                  <div className="relative group">
                    <div className="absolute -inset-2 rounded-[28px] opacity-50 blur-2xl transition duration-500 group-hover:opacity-70" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.35), rgba(128,0,0,0.35))' }} />
                    <div
                      className="relative overflow-hidden rounded-[26px] border border-[#D4AF37]/20 bg-white/90 dark:bg-gray-900/80 shadow-[0_18px_45px_-18px_rgba(128,0,0,0.45)]"
                      style={{ transform: `translateY(${scrollY * 0.08}px)` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[#800000]/6 via-transparent to-[#D4AF37]/12" />
                      <img
                        src="https://i.postimg.cc/FsKpy6Pp/image-2025-05-24-221727498.png"
                        alt="PortfolioX dashboard"
                        className="relative w-full h-auto object-cover"
                      />

                      <div className="absolute top-5 left-5 flex flex-col gap-3">
                        <div className="glass-morphism rounded-2xl border border-white/60 dark:border-gray-800/50 px-4 py-3 shadow-lg">
                          <p className="text-xs font-semibold uppercase tracking-widest text-[#800000] dark:text-[#D4AF37]">Portfolio health</p>
                          <div className="mt-1 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-[#800000] dark:text-[#D4AF37]" />
                            <p className="text-lg font-black text-gray-900 dark:text-white">98% optimized</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Last update · 2m ago</p>
                        </div>
                        <div className="glass-morphism inline-flex items-center gap-3 rounded-2xl border border-white/50 dark:border-gray-800/50 px-3 py-2 shadow-lg">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#800000] to-[#D4AF37] text-white">
                            <Star className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Top 5%</p>
                            <p className="text-[11px] uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">Peer ranking</p>
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-gray-900/95 dark:via-gray-900/70 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400">SHOWCASE SNAPSHOT</p>
                            <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">Capstone Portfolio • Faculty verified</p>
                          </div>
                          <div className="glass-morphism flex items-center gap-2 rounded-full border border-white/60 dark:border-gray-800/60 px-4 py-2 shadow">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Live</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating UI elements */}
                    <div className="absolute top-6 right-6 glass-morphism rounded-2xl p-4 animate-float shadow-xl border border-[#D4AF37]/30">
                      <div className="flex items-center gap-3 text-base">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#800000] to-[#D4AF37] flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-black text-lg">1.2k</p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">views</p>
                        </div>
                      </div>
                    </div>

                    <div className="absolute -bottom-6 left-6 glass-morphism rounded-2xl p-4 animate-float-reverse shadow-xl border border-[#D4AF37]/30">
                      <button 
                        onClick={handleLike}
                        className="flex items-center gap-3 text-base hover:scale-110 transition-all duration-200 group"
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isLiked 
                            ? 'bg-gradient-to-br from-red-500 to-pink-500' 
                            : 'bg-gradient-to-br from-gray-400 to-gray-500 group-hover:from-red-500 group-hover:to-pink-500'
                        }`}>
                          <Heart 
                            className="w-5 h-5 text-white fill-current" 
                          />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-black text-lg group-hover:text-red-500 transition-colors">
                            {likeCount}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">likes</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative z-10 py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                Why Choose <span className="bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent">PortfolioX</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Everything you need to create a stunning academic portfolio that stands out
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Sparkles className="w-8 h-8" />,
                  title: "AI-Powered Builder",
                  description: "Let AI enhance your portfolio descriptions and make them shine",
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Secure & Private",
                  description: "Your data is protected with enterprise-grade security",
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: <TrendingUp className="w-8 h-8" />,
                  title: "Career Growth",
                  description: "Track your progress and showcase your achievements",
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Faculty Validation",
                  description: "Get your work verified by academic professionals",
                  color: "from-orange-500 to-red-500"
                },
                {
                  icon: <Award className="w-8 h-8" />,
                  title: "Microcredentials",
                  description: "Showcase certificates and achievements with pride",
                  color: "from-yellow-500 to-amber-500"
                },
                {
                  icon: <Code className="w-8 h-8" />,
                  title: "Project Showcase",
                  description: "Display your best work with interactive galleries",
                  color: "from-indigo-500 to-purple-500"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`group relative p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-200 dark:border-gray-700 hover:border-[#D4AF37] cursor-pointer animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-white mb-6 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  {hoveredFeature === index && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center animate-bounce-gentle">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 py-20 bg-gradient-to-r from-[#800000] to-[#600000] dark:from-[#D4AF37] dark:to-[#B8860B]">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { number: "10K+", label: "Students", icon: <GraduationCap className="w-6 h-6" /> },
                { number: "50K+", label: "Portfolios", icon: <Briefcase className="w-6 h-6" /> },
                { number: "95%", label: "Success Rate", icon: <Trophy className="w-6 h-6" /> },
                { number: "24/7", label: "Support", icon: <Shield className="w-6 h-6" /> }
              ].map((stat, index) => (
                <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="w-12 h-12 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                  <div className="text-3xl lg:text-4xl font-black text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/80 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="relative z-10 py-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
                What Students <span className="bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent">Say</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Join thousands of successful students who launched their careers with PortfolioX
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {[
                  {
                    name: "Sarah Chen",
                    role: "Computer Science Student",
                    content: "PortfolioX helped me land my dream internship at Google. The AI-powered descriptions made my portfolio stand out!",
                    avatar: "SC"
                  },
                  {
                    name: "Michael Rodriguez",
                    role: "Engineering Student",
                    content: "The faculty validation feature gave my projects credibility. Employers were impressed by the professional presentation.",
                    avatar: "MR"
                  },
                  {
                    name: "Emily Johnson",
                    role: "Design Student",
                    content: "I love how easy it is to showcase my creative work. The microcredentials section is perfect for certificates!",
                    avatar: "EJ"
                  }
                ].map((testimonial, index) => (
                  <div
                    key={index}
                    className={`transition-all duration-700 ${activeTestimonial === index ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute'}`}
                  >
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center mb-6">
                        <div className="w-16 h-16 bg-gradient-to-r from-[#800000] to-[#D4AF37] rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            {testimonial.name}
                          </h4>
                          <p className="text-[#D4AF37] font-medium">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic">
                        "{testimonial.content}"
                      </p>
                      <div className="flex mt-6">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-[#D4AF37] fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Testimonial Dots */}
              <div className="flex justify-center mt-8 space-x-2">
                {[...Array(3)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeTestimonial === index 
                        ? 'bg-[#800000] dark:bg-[#D4AF37] w-8' 
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-6">
                Ready to <span className="bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent">Showcase</span> Your Excellence?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already building their future with PortfolioX
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleStartFree}
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#800000] via-[#600000] to-[#800000] text-white rounded-2xl hover:shadow-2xl transition-all duration-300 text-lg font-black flex items-center justify-center gap-3 hover:scale-110 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#B8860B] to-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative z-10">Start Free Today</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                </button>
                <button 
                  onClick={handleWatchDemo}
                  className="group px-8 py-4 glass-morphism text-gray-800 dark:text-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 text-lg font-bold flex items-center justify-center gap-3 border-2 border-[#800000]/30 dark:border-[#D4AF37]/30 hover:border-[#800000] dark:hover:border-[#D4AF37] hover:scale-105"
                >
                  <Play className="w-5 h-5 text-[#800000] dark:text-[#D4AF37]" />
                  Watch Demo
                </button>
              </div>
              
              <div className="mt-12 flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium">Free forever plan</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
