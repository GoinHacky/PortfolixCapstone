import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from '../../contexts/ThemeContext';
import PortfolioLogo from '../../assets/images/Portfolio.svg';
import { 
  ChevronDown, 
  Star, 
  Users, 
  Award, 
  BookOpen, 
  ArrowRight, 
  CheckCircle,
  Laptop,
  Shield,
  Share2,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Play,
  Moon,
  Sun,
  Menu,
  X,
  Eye,
  Heart,
  MessageCircle,
  Download
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
    background: linear-gradient(-45deg, #800000, #D4AF37, #B8860B, #600000);
    background-size: 400% 400%;
    animation: gradient-shift 8s ease infinite;
  }
  
  .animate-sparkle {
    animation: sparkle 2s ease-in-out infinite;
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
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(featureInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Project Showcase",
      description: "Display your academic work with rich media, interactive galleries, and detailed project breakdowns that tell your story.",
      stats: "50K+ projects"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Smart Credentials",
      description: "Automatically verify and showcase your certifications, degrees, and achievements with blockchain-backed authenticity.",
      stats: "98% verified"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Social Portfolio",
      description: "Connect with peers, get feedback on your work, and build meaningful professional relationships in your field.",
      stats: "10K+ connections"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI-Powered Insights",
      description: "Get personalized recommendations to improve your portfolio based on industry trends and employer preferences."
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal Tracking",
      description: "Set and track your academic and career goals with our intelligent milestone system."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Monitor portfolio views, engagement metrics, and track your professional growth over time."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy Controls",
      description: "Granular privacy settings to control who sees what, perfect for academic and professional contexts."
    }
  ];

  const stats = [
    { number: "25K+", label: "Active Students", growth: "+127%" },
    { number: "150K+", label: "Projects Tracked", growth: "+89%" },
    { number: "500+", label: "Universities", growth: "+156%" },
    { number: "95%", label: "Success Rate", growth: "+12%" }
  ];

  const testimonials = [
    {
      quote: "PortfolioX completely transformed how I present my work to employers. I landed my dream internship within weeks of creating my portfolio!",
      author: "Sarah Chen",
      role: "Computer Science Student • MIT",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 5
    },
    {
      quote: "As an educator, I've never seen a platform that so elegantly showcases student work. It's revolutionized how we assess and celebrate achievements.",
      author: "Dr. James Wilson",
      role: "Professor of Engineering • Stanford",
      avatar: "https://i.pravatar.cc/150?img=2",
      rating: 5
    },
    {
      quote: "Hiring has never been easier. We can see real work, not just resumes. PortfolioX candidates consistently outperform others in interviews.",
      author: "Michael Roberts",
      role: "Senior Tech Recruiter • Google",
      avatar: "https://i.pravatar.cc/150?img=3",
      rating: 5
    }
  ];

  const benefits = [
    { icon: <Laptop className="w-6 h-6" />, title: "Modern Interface", desc: "Intuitive design" },
    { icon: <Shield className="w-6 h-6" />, title: "Enterprise Security", desc: "Bank-level protection" },
    { icon: <Share2 className="w-6 h-6" />, title: "One-Click Sharing", desc: "Instant portfolio links" },
    { icon: <Clock className="w-6 h-6" />, title: "5-Min Setup", desc: "Get started instantly" },
    { icon: <Zap className="w-6 h-6" />, title: "Lightning Fast", desc: "Optimized performance" },
    { icon: <Target className="w-6 h-6" />, title: "Goal Tracking", desc: "Measure progress" }
  ];

  const handleSignIn = () => {
    navigate('/auth/login');
  };

  const handleStartFree = () => {
    navigate('/auth/register');
  };

  const handleWatchDemo = () => {
    // Implement demo video logic here
    console.log('Opening demo video...');
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        
        {/* Enhanced Animated Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Primary gradient orbs */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/20 to-[#800000]/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-1/3 -right-32 w-80 h-80 bg-gradient-to-tl from-[#800000]/20 to-[#D4AF37]/10 rounded-full blur-3xl animate-float-reverse"></div>
          <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-tr from-[#600000]/15 to-[#B8860B]/10 rounded-full blur-2xl animate-float"></div>
          
          {/* Sparkle effects */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-[#D4AF37] rounded-full animate-sparkle" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-[#800000] rounded-full animate-sparkle" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-sparkle" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="relative z-50 w-full py-4 glass-morphism sticky top-0 border-b border-white/20 dark:border-gray-800/50">
          <div className="container mx-auto flex items-center justify-between px-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg animate-pulse-glow overflow-hidden bg-transparent">
                  <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex flex-col items-start">
                  <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-[2px_2px_0px_#800000] w-full" style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', letterSpacing: '-0.03em', position: 'relative', display: 'inline-block' }}>
                    PortfolioX
                  </h1>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-0.5" style={{fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif'}}>Student Portfolio Tracker</span>
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full glass-morphism border-t border-white/20 dark:border-gray-800/50">
              <div className="px-6 py-4 space-y-4">
                <a href="#features" className="block text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors">Features</a>
                <a href="#testimonials" className="block text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors">Success Stories</a>
                <a href="#pricing" className="block text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors">Pricing</a>
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
          <div className="container mx-auto px-6 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className={`space-y-8 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'} transition-all duration-1000`}>
                <div className="inline-flex items-center px-4 py-2 glass-morphism rounded-full border border-[#D4AF37]/30">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] mr-3 animate-pulse"></div>
                  <span className="text-sm font-medium text-[#800000] dark:text-[#D4AF37]">🚀 New: AI Portfolio Builder</span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-tight text-shadow">
                  Your Academic
                  <span className="block bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent">
                    Excellence
                  </span>
                  <span className="block">Showcased</span>
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
                  Create stunning academic portfolios that land internships, jobs, and admissions. 
                  Join <span className="font-semibold text-[#800000] dark:text-[#D4AF37]">25,000+</span> successful students.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleStartFree}
                    className="px-8 py-4 gradient-shift text-white rounded-xl hover:shadow-2xl transition-all duration-300 text-lg font-semibold flex items-center justify-center gap-3 hover-lift group"
                  >
                    Start Building Free
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
                
                <div className="flex items-center gap-6 pt-8">
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
                  {/* Enhanced background effects */}
                  <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/30 to-[#800000]/20 rounded-full blur-3xl animate-float"></div>
                  <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-[#800000]/30 to-[#D4AF37]/20 rounded-full blur-3xl animate-float-reverse"></div>
                  
                  {/* Main dashboard image with enhanced styling */}
                  <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#800000] via-[#D4AF37] to-[#B8860B] rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
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
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="w-4 h-4 text-red-500 fill-current" />
                          <span className="text-gray-700 dark:text-gray-300 font-medium">89 likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section id="features" className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 glass-morphism rounded-full border border-[#D4AF37]/30 mb-6">
                <div className="w-4 h-4 mr-2 inline-block align-middle">
                  <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-4 h-4 object-contain" />
                </div>
                <span className="text-sm font-medium text-[#800000] dark:text-[#D4AF37]">Core Features</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Real stories from students and educators who've transformed their academic journey
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#800000] via-[#D4AF37] to-[#800000] rounded-2xl blur opacity-20"></div>
                <div className="relative glass-morphism p-12 rounded-2xl shadow-2xl">
                  <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-1 text-[#D4AF37] mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-6 h-6 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].author}
                      className="w-16 h-16 rounded-full border-4 border-[#D4AF37] shadow-lg mr-6"
                    />
                    <div className="text-left">
                      <div className="font-bold text-xl text-gray-900 dark:text-white">
                        {testimonials[currentTestimonial].author}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 font-medium">
                        {testimonials[currentTestimonial].role}
                      </div>
                    </div>
                  </div>
                  
                  {/* Testimonial navigation dots */}
                  <div className="flex justify-center mt-8 gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentTestimonial === index 
                            ? 'bg-[#D4AF37] w-8' 
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-[#D4AF37]/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="py-24 gradient-shift">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-6">
                Trusted by Students Worldwide
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Join thousands of successful students who've transformed their academic journey with PortfolioX
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <div className="text-white/80 font-medium mb-1">{stat.label}</div>
                  <div className="text-white/60 text-sm">↗ {stat.growth}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials Section */}
        <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 glass-morphism rounded-full border border-[#D4AF37]/30 mb-6">
                <Star className="w-4 h-4 text-[#D4AF37] mr-2 fill-current" />
                <span className="text-sm font-medium text-[#800000] dark:text-[#D4AF37]">Success Stories</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                What Our Users Say
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Real stories from students and educators who've transformed their academic journey
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#800000] via-[#D4AF37] to-[#800000] rounded-2xl blur opacity-20"></div>
                <div className="relative glass-morphism p-12 rounded-2xl shadow-2xl">
                  <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-1 text-[#D4AF37] mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-6 h-6 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-2xl text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                      "{testimonials[currentTestimonial].quote}"
                    </blockquote>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <img
                      src={testimonials[currentTestimonial].avatar}
                      alt={testimonials[currentTestimonial].author}
                      className="w-16 h-16 rounded-full border-4 border-[#D4AF37] shadow-lg mr-6"
                    />
                    <div className="text-left">
                      <div className="font-bold text-xl text-gray-900 dark:text-white">
                        {testimonials[currentTestimonial].author}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400 font-medium">
                        {testimonials[currentTestimonial].role}
                      </div>
                    </div>
                  </div>
                  
                  {/* Testimonial navigation dots */}
                  <div className="flex justify-center mt-8 gap-2">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentTestimonial === index 
                            ? 'bg-[#D4AF37] w-8' 
                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-[#D4AF37]/50'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Benefits Section */}
        <section className="py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Students Choose 
                <span className="block bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent">
                  PortfolioX
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Experience the most comprehensive academic portfolio platform designed for the modern student
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start p-6 glass-morphism rounded-xl hover-lift group">
                  <div className="w-12 h-12 gradient-shift rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                    {React.cloneElement(benefit.icon, { className: 'text-white w-6 h-6' })}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-[#800000] dark:group-hover:text-[#D4AF37] transition-colors">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 gradient-shift"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-lg animate-float-reverse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          </div>
          
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl font-bold text-white mb-8 text-shadow">
              Ready to Transform Your
              <span className="block">Academic Journey?</span>
            </h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Join 25,000+ successful students who've already built their dream portfolios. 
              Start free today and see the difference in just 5 minutes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="px-12 py-4 bg-white text-[#800000] rounded-xl hover:bg-gray-100 transition-all duration-300 text-lg font-bold inline-flex items-center gap-3 shadow-2xl hover-lift group">
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 glass-morphism text-white rounded-xl hover:bg-white/20 transition-all duration-300 text-lg font-semibold inline-flex items-center gap-3 border border-white/30">
                <Play className="w-5 h-5" />
                Watch 2-Min Demo
              </button>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Pricing Section */}
        <section id="pricing" className="py-24 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 glass-morphism rounded-full border border-[#D4AF37]/30 mb-6">
                <Target className="w-4 h-4 text-[#D4AF37] mr-2" />
                <span className="text-sm font-medium text-[#800000] dark:text-[#D4AF37]">Simple Pricing</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Choose Your 
                <span className="block bg-gradient-to-r from-[#800000] to-[#D4AF37] bg-clip-text text-transparent">
                  Perfect Plan
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Start free and upgrade as you grow. All plans include our core features with no hidden fees.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="relative p-8 glass-morphism rounded-2xl border border-gray-200 dark:border-gray-700 hover-lift">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student</h3>
                  <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">Free</div>
                  <p className="text-gray-600 dark:text-gray-400">Perfect to get started</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">1 Portfolio</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Basic Templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">5 Projects</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Community Support</span>
                  </li>
                </ul>
                
                <button className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                  Get Started Free
                </button>
              </div>
              
              {/* Pro Plan - Featured */}
              <div className="relative p-8 glass-morphism rounded-2xl border-2 border-[#D4AF37] hover-lift group">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="px-4 py-1 gradient-shift text-white text-sm font-semibold rounded-full">
                    Most Popular
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Professional</h3>
                  <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                    $9<span className="text-lg font-medium text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">For serious students</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Unlimited Portfolios</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Premium Templates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Unlimited Projects</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Custom Domain</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Analytics Dashboard</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Priority Support</span>
                  </li>
                </ul>
                
                <button className="w-full px-6 py-3 gradient-shift text-white rounded-xl hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  Start Free Trial
                </button>
              </div>
              
              {/* Enterprise Plan */}
              <div className="relative p-8 glass-morphism rounded-2xl border border-gray-200 dark:border-gray-700 hover-lift">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Enterprise</h3>
                  <div className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                    $29<span className="text-lg font-medium text-gray-600 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">For institutions</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#800000] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#800000] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Team Management</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#800000] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Advanced Analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#800000] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">White-label Options</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-[#800000] flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Dedicated Support</span>
                  </li>
                </ul>
                
                <button className="w-full px-6 py-3 bg-[#800000] text-white rounded-xl hover:bg-[#600000] transition-all duration-300">
                  Contact Sales
                </button>
              </div>
            </div>
            
            {/* FAQ Section */}
            <div className="mt-20 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-12">
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                <div className="glass-morphism p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Can I switch plans anytime?</h4>
                  <p className="text-gray-600 dark:text-gray-400">Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately.</p>
                </div>
                <div className="glass-morphism p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Is there a student discount?</h4>
                  <p className="text-gray-600 dark:text-gray-400">Students get 50% off all paid plans with a valid student email. Plus, our free plan is always available!</p>
                </div>
                <div className="glass-morphism p-6 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What payment methods do you accept?</h4>
                  <p className="text-gray-600 dark:text-gray-400">We accept all major credit cards, PayPal, and offer annual billing discounts of 20%.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="py-16 bg-gray-900 dark:bg-black">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand Section */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 gradient-shift rounded-xl flex items-center justify-center mr-3 shadow-lg">
                    <img src={PortfolioLogo} alt="PortfolioX Logo" className="w-10 h-10 object-contain" />
                  </div>
                </div>
                <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                  Empowering students worldwide to showcase their academic excellence and unlock their potential. 
                  Join the future of academic portfolios.
                </p>
                <div className="flex gap-4">
                  <button className="w-10 h-10 bg-gray-800 hover:bg-[#800000] rounded-lg flex items-center justify-center transition-colors">
                    <Share2 className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                  <button className="w-10 h-10 bg-gray-800 hover:bg-[#800000] rounded-lg flex items-center justify-center transition-colors">
                    <MessageCircle className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                  <button className="w-10 h-10 bg-gray-800 hover:bg-[#800000] rounded-lg flex items-center justify-center transition-colors">
                    <Users className="w-5 h-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h4 className="font-bold text-white mb-4">Platform</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Templates</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Integrations</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">API</a></li>
                </ul>
              </div>
              
              {/* Support */}
              <div>
                <h4 className="font-bold text-white mb-4">Support</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Tutorials</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Community</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">Contact Us</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} PortfolioX. All rights reserved. Made with ❤️ for students.
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#D4AF37] transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}