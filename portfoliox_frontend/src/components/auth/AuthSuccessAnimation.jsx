import React, { useState, useEffect } from "react";
import { CheckCircle, Sparkles, ArrowRight, Shield, User, Lock } from "lucide-react";

const AuthSuccessAnimation = ({ 
  isLogin = true, 
  userName = "", 
  userRole = "",
  darkMode = false,
  onAnimationComplete 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const maroon = darkMode ? "text-[#D4AF37]" : "text-[#800000]";
  const goldBg = darkMode ? "bg-[#800000]" : "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
  const bgColor = darkMode ? "bg-gray-900/95" : "bg-white/95";
  const textColor = darkMode ? "text-white" : "text-gray-900";

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setShowConfetti(true), 100);
    const timer2 = setTimeout(() => setShowContent(true), 300);
    const timer3 = setTimeout(() => setShowButton(true), 800);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleContinue = () => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  const getWelcomeMessage = () => {
    if (isLogin) {
      return `Welcome back, ${userName}!`;
    } else {
      return userRole === "FACULTY" 
        ? `Faculty account created successfully!`
        : `Welcome to PortfolioX, ${userName}!`;
    }
  };

  const getSubMessage = () => {
    if (isLogin) {
      return "You're all set to continue your academic journey";
    } else if (userRole === "FACULTY") {
      return "Your account is awaiting admin approval. You'll be notified once approved.";
    } else {
      return "Your portfolio is ready to showcase your amazing achievements";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div
                className={`w-2 h-2 ${darkMode ? 'bg-[#D4AF37]' : 'bg-[#800000]'} rounded-full opacity-70`}
                style={{
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              ></div>
            </div>
          ))}
          {[...Array(15)].map((_, i) => (
            <div
              key={`sparkle-${i}`}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1.5}s`
              }}
            >
              <Sparkles className={`w-4 h-4 ${darkMode ? 'text-[#D4AF37]' : 'text-[#800000]'} opacity-60`} />
            </div>
          ))}
        </div>
      )}

      {/* Success Card */}
      <div className={`${bgColor} rounded-3xl shadow-2xl p-8 max-w-md mx-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} transform transition-all duration-500 ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className={`relative ${goldBg} p-6 rounded-2xl transform transition-all duration-700 ${showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
            <div className="absolute inset-0 rounded-2xl animate-pulse opacity-50"></div>
            <CheckCircle className="w-12 h-12 text-white relative z-10" />
            {/* Ring animation */}
            <div className={`absolute inset-0 rounded-2xl border-4 ${darkMode ? 'border-[#D4AF37]' : 'border-[#800000]'} animate-ping opacity-30`}></div>
          </div>
        </div>

        {/* Success Messages */}
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold ${textColor} mb-3 transform transition-all duration-500 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {getWelcomeMessage()}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed transform transition-all duration-500 delay-100 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {getSubMessage()}
          </p>
        </div>

        {/* Success Details */}
        <div className={`space-y-3 mb-6 transform transition-all duration-500 delay-200 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex items-center justify-center space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isLogin ? 'Session secured' : 'Account protected'}
            </span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            {isLogin ? (
              <Lock className="w-4 h-4 text-blue-500" />
            ) : (
              <User className="w-4 h-4 text-blue-500" />
            )}
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isLogin ? 'Access granted' : 'Profile created'}
            </span>
          </div>
        </div>

        {/* Continue Button */}
        <div className={`transform transition-all duration-500 delay-300 ${showButton ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <button
            onClick={handleContinue}
            className={`w-full py-3 px-4 ${goldBg} text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2`}
          >
            <span>
              {isLogin ? 'Continue to Dashboard' : 
               userRole === "FACULTY" ? 'Go to Login' : 'Get Started'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Additional Info for Faculty */}
        {userRole === "FACULTY" && !isLogin && (
          <div className={`mt-4 p-3 ${darkMode ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'} border rounded-lg transform transition-all duration-500 delay-400 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <p className={`text-xs ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              <strong>Note:</strong> Your faculty account requires admin approval before you can access the system. You will receive an email once approved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthSuccessAnimation;
