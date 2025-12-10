import React from "react";
import { Loader2, Shield, User, Lock, Mail } from "lucide-react";

const AuthLoadingAnimation = ({ isLogin = true, darkMode = false }) => {
  const maroon = darkMode ? "text-[#D4AF37]" : "text-[#800000]";
  const goldBg = darkMode ? "bg-[#800000]" : "bg-gradient-to-r from-[#D4AF37] to-[#B8860B]";
  const bgColor = darkMode ? "bg-gray-900/95" : "bg-white/95";
  const textColor = darkMode ? "text-white" : "text-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
      <div className={`${bgColor} rounded-3xl shadow-2xl p-8 max-w-sm mx-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Animated Logo */}
        <div className="flex justify-center mb-6">
          <div className={`relative ${goldBg} p-4 rounded-2xl`}>
            <div className="absolute inset-0 rounded-2xl animate-pulse opacity-50"></div>
            {isLogin ? (
              <Lock className="w-8 h-8 text-white relative z-10" />
            ) : (
              <User className="w-8 h-8 text-white relative z-10" />
            )}
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold ${textColor} mb-2`}>
            {isLogin ? 'Signing you in...' : 'Creating your account...'}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {isLogin 
              ? 'Securing your connection and preparing your workspace'
              : 'Setting up your portfolio and getting everything ready'
            }
          </p>
        </div>

        {/* Animated Progress Steps */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className={`relative w-6 h-6 ${goldBg} rounded-full flex items-center justify-center`}>
              <Shield className="w-3 h-3 text-white" />
              <div className="absolute inset-0 rounded-full border-2 border-current animate-ping opacity-20"></div>
            </div>
            <span className={`text-sm font-medium ${textColor}`}>Verifying credentials</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`relative w-6 h-6 ${goldBg} rounded-full flex items-center justify-center animate-pulse`}>
              <Loader2 className="w-3 h-3 text-white animate-spin" />
            </div>
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {isLogin ? 'Accessing your portfolio' : 'Setting up your profile'}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {isLogin ? 'Preparing dashboard' : 'Finalizing setup'}
            </span>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="relative">
          <div className={`h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
            <div className={`h-full ${goldBg} rounded-full animate-pulse`}>
              <div className="h-full bg-white/30 animate-pulse"></div>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex justify-center mt-6">
          <div className={`flex items-center space-x-2 px-3 py-1.5 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full`}>
            <Shield className="w-4 h-4 text-green-500" />
            <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Secure connection
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingAnimation;
