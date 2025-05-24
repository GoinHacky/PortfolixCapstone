import React, { useState, useEffect } from "react";
import { ChevronDown, Star, Users, Award, BookOpen, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const maroon = "bg-[#800000]";
const gold = "text-[#D4AF37]";
const goldBg = "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
const goldBgSolid = "bg-[#D4AF37]";
const maroonText = "text-[#800000]";
const goldText = "text-[#D4AF37]";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-amber-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#D4AF37]/10 to-[#800000]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-l from-[#800000]/10 to-[#D4AF37]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-transparent via-[#D4AF37]/5 to-transparent rounded-full animate-spin" style={{animationDuration: '60s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${goldBgSolid} rounded-lg flex items-center justify-center shadow-lg`}>
              <Sparkles className={`w-6 h-6 ${maroonText}`} />
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${maroonText}`}>
              PortfolioX
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-[#800000] transition-colors font-medium">Features</a>
            <a href="#about" className="text-gray-700 hover:text-[#800000] transition-colors font-medium">About</a>
            <a href="#contact" className="text-gray-700 hover:text-[#800000] transition-colors font-medium">Contact</a>
            <div className="flex items-center space-x-4 ml-8">
              <button
                className="px-6 py-2 text-gray-700 hover:text-[#800000] font-semibold transition-colors"
                onClick={() => navigate('/auth/login')}
              >
                Log In
              </button>
              <button
                className="px-6 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => navigate('/auth/signup')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="container mx-auto px-6">
          <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
            <div className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-[#D4AF37]/30 mb-8">
              <Star className={`w-4 h-4 ${goldText} mr-2`} />
              <span className="text-sm font-semibold text-gray-700">Trusted by 10,000+ Students</span>
            </div>
            
            <h1 className={`text-5xl md:text-7xl font-black mb-6 ${maroonText} leading-tight`}>
              Your Academic
              <br />
              <span className="relative">
                <span className={`bg-gradient-to-r from-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent`}>
                  Portfolio
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-[#D4AF37]/30 to-[#B8860B]/30 -skew-x-12 transform"></div>
              </span>
              <br />
              Reimagined
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Transform your academic journey into a stunning digital portfolio. 
              Track projects, showcase achievements, and share your story with the world.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                className={`group px-10 py-4 ${goldBg} text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2`}
                onClick={() => navigate('/auth/signup')}
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                className={`px-10 py-4 bg-white/80 backdrop-blur-sm ${maroonText} rounded-full font-bold text-lg border-2 border-[#800000] hover:bg-[#800000] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg`}
                // You can add a demo handler here if needed
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className={`w-8 h-8 ${goldText}`} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-black ${maroonText} mb-4`}>
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to make your academic portfolio shine
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 border-2 ${
                  activeFeature === index ? 'border-[#D4AF37] shadow-[#D4AF37]/20' : 'border-transparent'
                }`}
              >
                <div className={`inline-flex p-4 ${goldBgSolid} rounded-xl text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className={`text-2xl font-bold ${maroonText} mb-4`}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-16 ${maroon} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#800000] via-[#600000] to-[#800000]"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="transform hover:scale-105 transition-transform duration-300">
                <div className={`text-5xl md:text-6xl font-black ${goldText} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-white/90 text-lg font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-t from-gray-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className={`text-4xl md:text-6xl font-black ${maroonText} mb-6`}>
              Ready to Elevate Your
              <br />
              <span className={`bg-gradient-to-r from-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent`}>
                Academic Story?
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of students who are already showcasing their work with PortfolioX
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button
                className={`group px-12 py-5 ${goldBg} text-white rounded-full font-bold text-xl shadow-2xl hover:shadow-[#D4AF37]/50 transform hover:scale-105 transition-all duration-300 flex items-center space-x-3`}
                onClick={() => navigate('/auth/signup')}
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                className={`px-12 py-5 bg-white ${maroonText} rounded-full font-bold text-xl border-2 border-[#800000] hover:bg-[#800000] hover:text-white transform hover:scale-105 transition-all duration-300 shadow-lg`}
                // You can add a learn more handler here if needed
              >
                Learn More
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Setup in minutes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${maroon} py-12`}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className={`w-8 h-8 ${goldBgSolid} rounded-lg flex items-center justify-center`}>
                <Sparkles className={`w-5 h-5 ${maroonText}`} />
              </div>
              <span className={`text-xl font-bold ${goldText}`}>PortfolioX</span>
            </div>
            
            <div className="text-white/80 text-center md:text-right">
              <p>&copy; {new Date().getFullYear()} PortfolioX. All rights reserved.</p>
              <p className="text-sm mt-1">Empowering students worldwide</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}