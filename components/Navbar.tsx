import React from 'react';
import { Layout, FileText, CheckSquare, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'editor', label: 'Editor & Generator', icon: <FileText size={18} /> },
    { id: 'guidelines', label: 'SEO Guidelines', icon: <BookOpen size={18} /> },
    { id: 'checklist', label: 'Validation Checklist', icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layout className="text-blue-500" size={24} />
          <div>
            <h1 className="font-bold text-lg leading-tight">SEO Studio</h1>
            <p className="text-xs text-slate-400">Strategist: Ayoub Nouar</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
              activeTab === item.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded p-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-200 mb-1">Current Model</p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Gemini 2.5 Flash / 3 Pro
          </div>
        </div>
      </div>
    </div>
  );
};