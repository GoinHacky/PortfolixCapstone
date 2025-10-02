import React from 'react';

export default function Notification({ message, type = 'info', onClose }) {
  if (!message) return null;
  let bg = 'bg-white dark:bg-gray-900';
  let border = 'border-[#800000]';
  let text = 'text-[#800000]';
  let icon = null;
  let accent = 'bg-[#800000]';
  if (type === 'success') {
    bg = 'bg-white dark:bg-gray-900';
    border = 'border-[#800000]';
    text = 'text-[#800000]';
    accent = 'bg-[#D4AF37]';
    icon = (
      <svg className="w-6 h-6 text-[#D4AF37] mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    );
  } else if (type === 'error') {
    bg = 'bg-[#800000]';
    border = 'border-[#D4AF37]';
    text = 'text-[#D4AF37]';
    accent = 'bg-[#D4AF37]';
    icon = (
      <svg className="w-6 h-6 text-[#D4AF37] mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    );
  } else if (type === 'info') {
    bg = 'bg-white dark:bg-gray-900';
    border = 'border-[#800000]';
    text = 'text-[#800000]';
    accent = 'bg-[#D4AF37]';
    icon = (
      <svg className="w-6 h-6 text-[#D4AF37] mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
    );
  }
  return (
    <div className={`fixed top-6 right-6 z-50 shadow-2xl rounded-lg px-0 py-0 ${bg} ${border} border-l-8 ${accent} flex items-stretch min-w-[280px] max-w-xs animate-fade-in`} role="alert">
      <div className={`flex items-center px-4 py-3 flex-1 ${text}`}>
        {icon}
        <span className="flex-1 font-semibold text-sm">{message}</span>
        <button onClick={onClose} className="ml-4 text-[#D4AF37] hover:text-[#800000] text-lg font-bold px-2 py-1 rounded transition-colors">&times;</button>
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