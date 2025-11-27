
import React, { useState } from 'react';
import { Layout, FileText, CheckSquare, BookOpen, History, Image, Video, Mic, LogOut, User as UserIcon, Home, CreditCard, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: 'home', label: 'Accueil / Dashboard', icon: <Home size={20} /> },
    { id: 'editor', label: 'Editor & Generator', icon: <FileText size={20} /> },
    { id: 'guidelines', label: 'SEO Guidelines', icon: <BookOpen size={20} /> },
    { id: 'checklist', label: 'Validation Checklist', icon: <CheckSquare size={20} /> },
    { id: 'history', label: 'Article History', icon: <History size={20} /> },
    { id: 'image-gen', label: 'Image Generator', icon: <Image size={20} /> },
    { id: 'video-gen', label: 'Video Generator', icon: <Video size={20} /> },
    { id: 'audio-gen', label: 'Audio Generator', icon: <Mic size={20} /> },
    { id: 'pricing', label: 'Plans & Billing', icon: <CreditCard size={20} /> },
  ];

  return (
    <div 
      className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-white h-screen flex flex-col flex-shrink-0 shadow-xl z-50 transition-all duration-300 ease-in-out relative`}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-blue-600 text-white rounded-full p-1 shadow-lg hover:bg-blue-500 transition-colors border-2 border-slate-800 z-50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className={`p-6 border-b border-slate-800 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} overflow-hidden whitespace-nowrap`}>
        <div className="flex items-center gap-3">
          <div className="shrink-0 text-blue-500">
             <Layout size={28} />
          </div>
          <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            <h1 className="font-bold text-lg leading-tight">SEO Studio</h1>
            <p className="text-xs text-slate-400">Pro Workspace</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={isCollapsed ? item.label : ''}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-sm font-medium whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="shrink-0">{item.icon}</div>
            <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-slate-800 space-y-4 overflow-hidden whitespace-nowrap">
        {/* User Profile Section */}
        <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-blue-400 shrink-0">
             <UserIcon size={18} />
          </div>
          <div className={`flex-1 min-w-0 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>

        <button 
          onClick={onLogout}
          title={isCollapsed ? 'Logout' : ''}
          className={`w-full flex items-center gap-2 p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-colors border border-red-500/20 ${isCollapsed ? 'justify-center' : 'justify-center'}`}
        >
          <LogOut size={16} className="shrink-0" /> 
          <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Logout</span>
        </button>
        
        <div className={`bg-slate-800 rounded p-2 text-xs text-slate-400 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
          <div className="flex items-center gap-1.5 justify-center">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Online
          </div>
        </div>
      </div>
    </div>
  );
};
