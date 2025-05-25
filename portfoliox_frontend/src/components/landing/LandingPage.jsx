import React, { useState, useEffect } from "react";
import { 
  ChevronDown, 
  Star, 
  Users, 
  Award, 
  BookOpen, 
  Sparkles, 
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
  Sun
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

const style = document.createElement('style');
style.textContent = `
  @keyframes tilt {
    0%, 100% { transform: rotate(0deg) translateY(0); }
    25% { transform: rotate(1deg) translateY(-5px); }
    75% { transform: rotate(-1deg) translateY(5px); }
  }
  @keyframes tilt-reverse {
    0%, 100% { transform: rotate(0deg) translateY(0); }
    25% { transform: rotate(-1deg) translateY(5px); }
    75% { transform: rotate(1deg) translateY(-5px); }
  }
  .animate-tilt {
    animation: tilt 10s infinite ease-in-out;
  }
  .animate-tilt-reverse {
    animation: tilt-reverse 12s infinite ease-in-out;
  }
  .shadow-3xl {
    box-shadow: 0 25px 50px -12px rgba(128, 0, 0, 0.15);
  }
`;
document.head.appendChild(style);

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    setIsVisible(true);
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);

    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      clearInterval(featureInterval);
      clearInterval(testimonialInterval);
    };
  }, []);

  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Project Showcase",
      description: "Display your academic work with rich media and detailed descriptions"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Microcredentials",
      description: "Track and verify your certifications and achievements"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Easy Sharing",
      description: "Share your portfolio with educators, peers, and employers"
    }
  ];

  const stats = [
    { number: "10K+", label: "Active Students" },
    { number: "50K+", label: "Projects Tracked" },
    { number: "200+", label: "Universities" }
  ];

  const testimonials = [
    {
      quote: "PortfolioX has transformed how I present my academic achievements to potential employers.",
      author: "Sarah Chen",
      role: "Computer Science Student",
      avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
      quote: "The best platform for showcasing student work I've ever used. Highly recommended!",
      author: "Dr. James Wilson",
      role: "Professor of Engineering",
      avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
      quote: "Makes hiring fresh graduates so much easier. We can see their actual work and capabilities.",
      author: "Michael Roberts",
      role: "Tech Recruiter",
      avatar: "https://i.pravatar.cc/150?img=3"
    }
  ];

  const benefits = [
    { icon: <Laptop className="w-6 h-6" />, title: "Modern Interface" },
    { icon: <Shield className="w-6 h-6" />, title: "Secure Platform" },
    { icon: <Share2 className="w-6 h-6" />, title: "Easy Sharing" },
    { icon: <Clock className="w-6 h-6" />, title: "Quick Setup" },
    { icon: <Zap className="w-6 h-6" />, title: "Fast Performance" },
    { icon: <Target className="w-6 h-6" />, title: "Goal Tracking" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#D4AF37]/10 to-[#800000]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-[#800000]/10 to-[#D4AF37]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-transparent via-[#D4AF37]/5 to-transparent rounded-full animate-spin" style={{animationDuration: '60s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${goldBgSolid} rounded-lg flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300`}>
              <Sparkles className={`w-6 h-6 ${maroonText}`} />
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${maroonText} dark:text-white`}>
              PortfolioX
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors font-medium relative group">
              Features
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#800000] dark:bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors font-medium relative group">
              Testimonials
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#800000] dark:bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] transition-colors font-medium relative group">
              Contact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#800000] dark:bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <div className="flex items-center space-x-4 ml-8">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => navigate('/auth/login')}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-[#800000] dark:hover:text-[#D4AF37] font-semibold transition-colors relative group"
              >
                Log In
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#800000] dark:bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => navigate('/auth/signup')}
                className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] dark:from-[#800000] dark:to-[#600000] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen bg-white dark:bg-gray-900">
        {/* Fiery Background Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Main fire core */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-t from-[#800000] dark:from-[#D4AF37] to-transparent opacity-20 blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-to-t from-[#D4AF37] dark:from-[#800000] to-transparent opacity-10 blur-2xl animate-pulse"></div>
          
          {/* Fire wisps */}
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-[#800000] dark:from-[#D4AF37] to-transparent opacity-20 blur-2xl"></div>
          <div className="absolute top-40 -right-10 w-80 h-80 rounded-full bg-gradient-to-tl from-[#600000] dark:from-[#B8860B] to-transparent opacity-25 blur-2xl"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full bg-gradient-to-tr from-[#800000] dark:from-[#D4AF37] to-transparent opacity-15 blur-xl"></div>
          
          {/* Ember effects */}
          <div className="absolute top-1/3 right-1/3 w-40 h-40 rounded-full bg-gradient-to-t from-[#D4AF37] dark:from-[#800000] to-transparent opacity-10 blur-xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-gradient-to-tl from-[#800000] dark:from-[#D4AF37] to-transparent opacity-20 blur-2xl"></div>
          <div className="absolute top-20 left-1/2 w-64 h-64 rounded-full bg-gradient-to-br from-[#600000] dark:from-[#B8860B] to-transparent opacity-15 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-6 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'} transition-all duration-1000`}>
              <div className="inline-flex items-center px-4 py-2 bg-[#800000]/5 dark:bg-[#D4AF37]/5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#800000] dark:bg-[#D4AF37] mr-2"></div>
                <span className="text-sm font-medium text-[#800000] dark:text-[#D4AF37]">New: Portfolio Analytics</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Showcase Your Academic Excellence
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Build a professional portfolio that highlights your academic achievements, projects, and skills. Perfect for students and educators.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/auth/signup')}
                  className={`px-8 py-4 ${maroon} dark:bg-[#D4AF37] text-white rounded-lg hover:bg-[#600000] dark:hover:bg-[#B8860B] transition-colors text-lg font-semibold flex items-center gap-2`}
                >
                  Get Started <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-lg font-semibold"
                >
                  Learn More
                </button>
              </div>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/40?img=${i}`}
                      alt={`User ${i}`}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">10,000+</span> students trust us
                </div>
              </div>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className={`relative ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'} transition-all duration-1000 delay-300`}>
              <div className="relative">
                {/* Background Blobs */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-[#800000]/20 dark:from-[#D4AF37]/20 to-transparent rounded-full blur-2xl animate-tilt"></div>
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tr from-[#D4AF37]/20 dark:from-[#800000]/20 to-transparent rounded-full blur-2xl animate-tilt-reverse"></div>
                
                {/* Dashboard Image */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#800000] dark:from-[#D4AF37] to-[#D4AF37] dark:to-[#800000] rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white dark:bg-gray-800 ring-1 ring-gray-900/5 dark:ring-gray-100/5 rounded-lg leading-none flex">
                    <img
                      src="https://i.postimg.cc/FsKpy6Pp/image-2025-05-24-221727498.png"
                      alt="Dashboard Preview"
                      className="w-full h-auto rounded-lg shadow-2xl transform transition-all duration-500 group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              PortfolioX provides all the tools you need to create a stunning academic portfolio that stands out.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 ${
                  activeFeature === index ? 'ring-2 ring-[#800000] dark:ring-[#D4AF37]' : ''
                }`}
              >
                <div className={`w-12 h-12 ${maroon} dark:bg-[#D4AF37] rounded-lg flex items-center justify-center mb-4`}>
                  {React.cloneElement(feature.icon, { className: 'text-white w-6 h-6' })}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#800000] dark:text-[#D4AF37] mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#800000] dark:from-[#D4AF37] to-[#D4AF37] dark:to-[#800000] rounded-lg blur opacity-20"></div>
              <div className="relative bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
                <div className="text-[#800000] dark:text-[#D4AF37] mb-6">
                  <Star className="w-8 h-8 mx-auto" />
                </div>
                <blockquote className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                  {testimonials[currentTestimonial].quote}
                </blockquote>
                <div className="flex items-center justify-center">
                  <img
                    src={testimonials[currentTestimonial].avatar}
                    alt={testimonials[currentTestimonial].author}
                    className="w-12 h-12 rounded-full border-2 border-[#800000] dark:border-[#D4AF37]"
                  />
                  <div className="ml-4 text-left">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonials[currentTestimonial].author}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose PortfolioX?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the most comprehensive academic portfolio platform designed for students and educators.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="mr-4 text-[#800000] dark:text-[#D4AF37]">
                  {benefit.icon}
                </div>
                <div className="font-medium text-gray-900 dark:text-white">{benefit.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#800000] dark:from-[#D4AF37] to-[#600000] dark:to-[#B8860B]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Ready to Build Your Professional Portfolio?
          </h2>
          <button
            onClick={() => navigate('/auth/signup')}
            className="px-8 py-4 bg-white dark:bg-gray-900 text-[#800000] dark:text-[#D4AF37] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg font-semibold inline-flex items-center gap-2"
          >
            Get Started Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className={`w-8 h-8 ${goldBgSolid} rounded-lg flex items-center justify-center mr-2`}>
                <Sparkles className={`w-4 h-4 ${maroonText}`} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">PortfolioX</span>
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} PortfolioX. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}