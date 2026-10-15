import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#00439c] text-white shadow-2xl border border-blue-400/30 text-xs font-semibold backdrop-blur-md">
        <CheckCircle2 className="w-4 h-4 text-blue-200 shrink-0" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
