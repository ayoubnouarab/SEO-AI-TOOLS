
import React from 'react';
import { Layout, FileText, CheckSquare, BookOpen, History, Image, Video, Mic, LogOut, User as UserIcon, Home, CreditCard } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const navItems = [
    { id: 'home', label: 'Accueil / Dashboard', icon: <Home size={18} /> },
    { id: 'editor', label: 'Editor & Generator', icon: <FileText size={18} /> },
    { id: 'guidelines', label: 'SEO Guidelines', icon: <BookOpen size={18} /> },
    { id: 'checklist', label: 'Validation Checklist', icon: <CheckSquare size={18} /> },
    { id: 'history', label: 'Article History', icon: <History size={18} /> },
    { id: 'image-gen', label: 'Image Generator', icon: <Image size={18} /> },
    { id: 'video-gen', label: 'Video Generator', icon: <Video size={18} /> },
    { id: 'audio-gen', label: 'Audio Generator', icon: <Mic size={18} /> },
    { id: 'pricing', label: 'Plans & Billing', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col flex-shrink-0 shadow-xl z-50">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layout className="text-blue-500" size={24} />
          <div>
            <h1 className="font-bold text-lg leading-tight">SEO Studio</h1>
            <p className="text-xs text-slate-400">Pro Workspace</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        {/* User Profile Section */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-blue-400">
             <UserIcon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors border border-red-500/20"
        >
          <LogOut size={14} /> Logout
        </button>
        
        <div className="bg-slate-800 rounded p-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </div>
        </div>
      </div>
    </div>
  );
};
