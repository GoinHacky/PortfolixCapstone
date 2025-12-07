import React from 'react';
import { Loader2, Brain, Sparkles, Wand2 } from 'lucide-react';

export default function AILoadingOverlay({ isVisible, message = "AI is working its magic..." }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-900/95 rounded-3xl p-8 max-w-md mx-4 shadow-2xl border border-[#800000]/20 dark:border-[#D4AF37]/20">
        {/* Animated Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            {/* Outer rotating ring */}
            <div className="w-16 h-16 rounded-full border-4 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin"></div>
            
            {/* Inner icons */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <Brain className="w-8 h-8 text-[#800000] animate-pulse" />
                <Sparkles className="absolute inset-0 w-8 h-8 text-[#D4AF37] animate-ping" />
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center">
            {message}
          </h3>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing your portfolio content...</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#800000] rounded-full animate-pulse" style={{ animationDelay: '500ms' }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Enhancing with AI intelligence...</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#D4AF37] rounded-full animate-pulse" style={{ animationDelay: '1000ms' }}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Generating professional resume...</span>
          </div>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-[#800000] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-500 italic">
            Creating your professional AI-enhanced resume
          </p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Wand2 className="w-3 h-3 text-[#D4AF37]" />
            <span className="text-xs text-[#800000] dark:text-[#D4AF37] font-medium">
              Powered by AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
