import React from 'react';

export default function Notification({ message, type = 'info', onClose }) {
  if (!message) return null;
  let bg = 'bg-white dark:bg-gray-900';
  let border = 'border-[#800000]';
  let text = 'text-[#800000]';
  let icon = null;
  let accent = 'bg-[#800000]';
  
  if (type === 'success') {
    bg = 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20';
    border = 'border-green-500 dark:border-green-400';
    text = 'text-green-700 dark:text-green-300';
    accent = 'bg-gradient-to-b from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400';
    icon = (
      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 rounded-full flex items-center justify-center mr-3 shadow-lg">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  } else if (type === 'error') {
    bg = 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20';
    border = 'border-red-500 dark:border-red-400';
    text = 'text-red-700 dark:text-red-300';
    accent = 'bg-gradient-to-b from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400';
    icon = (
      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 dark:from-red-400 dark:to-rose-400 rounded-full flex items-center justify-center mr-3 shadow-lg">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  } else if (type === 'create') {
    bg = 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20';
    border = 'border-blue-500 dark:border-blue-400';
    text = 'text-blue-700 dark:text-blue-300';
    accent = 'bg-gradient-to-b from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400';
    icon = (
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 rounded-full flex items-center justify-center mr-3 shadow-lg">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </div>
    );
  } else if (type === 'edit') {
    bg = 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20';
    border = 'border-purple-500 dark:border-purple-400';
    text = 'text-purple-700 dark:text-purple-300';
    accent = 'bg-gradient-to-b from-purple-500 to-violet-500 dark:from-purple-400 dark:to-violet-400';
    icon = (
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 dark:from-purple-400 dark:to-violet-400 rounded-full flex items-center justify-center mr-3 shadow-lg">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
    );
  } else if (type === 'delete') {
    bg = 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20';
    border = 'border-orange-500 dark:border-orange-400';
    text = 'text-orange-700 dark:text-orange-300';
    accent = 'bg-gradient-to-b from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400';
    icon = (
      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400 rounded-full flex items-center justify-center mr-3 shadow-lg">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
    );
  } else if (type === 'info') {
    bg = 'bg-gradient-to-r from-[#800000]/5 to-[#600000]/5 dark:from-[#800000]/10 dark:to-[#600000]/10';
    border = 'border-[#800000] dark:border-[#D4AF37]';
    text = 'text-[#800000] dark:text-[#D4AF37]';
    accent = 'bg-gradient-to-b from-[#800000] to-[#600000] dark:from-[#D4AF37] dark:to-[#B8860B]';
    icon = (
      <div className="w-8 h-8 bg-gradient-to-br from-[#800000] to-[#600000] dark:from-[#D4AF37] dark:to-[#B8860B] rounded-full flex items-center justify-center mr-3 shadow-lg">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" />
        </svg>
      </div>
    );
  }
  
  return (
    <div className={`fixed top-6 right-6 z-50 shadow-2xl rounded-xl px-0 py-0 ${bg} ${border} border-l-4 ${accent} flex items-stretch min-w-[320px] max-w-md animate-slide-in backdrop-blur-sm`} role="alert">
      <div className={`flex items-center px-4 py-4 flex-1 ${text}`}>
        {icon}
        <div className="flex-1">
          <span className="block font-semibold text-sm leading-tight">{message}</span>
          {type === 'create' && <span className="block text-xs mt-1 opacity-75">Added to your portfolio</span>}
          {type === 'edit' && <span className="block text-xs mt-1 opacity-75">Changes saved successfully</span>}
          {type === 'delete' && <span className="block text-xs mt-1 opacity-75">Removed from your portfolio</span>}
        </div>
        <button 
          onClick={onClose} 
          className={`ml-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10 ${text}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = "Yes, Continue" }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border-2 border-[#800000] max-w-sm w-full p-6 relative animate-fade-in">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#800000] mr-3">
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
          </div>
          <h2 className="text-lg font-bold text-[#800000]">{title || 'Are you sure?'}</h2>
        </div>
        <div className="text-gray-700 dark:text-gray-200 mb-6 text-sm">{message}</div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-[#800000] text-white font-semibold hover:bg-[#600000] transition-colors border-2 border-[#D4AF37]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add a fade-in animation
// In your App.css or index.css, add:
// @keyframes fade-in { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: none; } }
// .animate-fade-in { animation: fade-in 0.3s ease; } 