import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Editor } from './components/Editor';
import { GuidelinesView } from './components/GuidelinesView';
import { SeoChecklist } from './components/SeoChecklist';
import { ArticleHistoryView } from './components/ArticleHistoryView';
import { ImageGeneratorView, VideoGeneratorView, AudioGeneratorView } from './components/MediaTools';
import { PricingView } from './components/PricingView';
import { Login } from './components/Login';
import { LandingPage } from './components/LandingPage'; // Import Landing Page
import { Home } from './components/Home';
import { GeneratedContent, User } from './types';

// --- INITIAL USERS CONFIGURATION ---
const INITIAL_USERS: User[] = [
  { 
    email: "ayoub.nouar@seo.com", 
    accessId: "admin2024", 
    name: "Ayoub Nouar" 
  },
  { 
    email: "writer@seo.com", 
    accessId: "write123", 
    name: "Content Writer" 
  },
  {
    email: "AYOUB@GMAI.com",
    accessId: "1234567",
    name: "Ayoub Owner"
  }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_USERS);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Auth View State: 'landing' | 'login'
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');

  // Check local storage for persistent login AND custom users
  useEffect(() => {
    // Load custom registered users if any
    const savedUsers = localStorage.getItem('seo_app_all_users');
    if (savedUsers) {
      // Merge initial users with saved users to ensure hardcoded admins always exist
      const parsedSavedUsers = JSON.parse(savedUsers) as User[];
      // Filter out initial users from saved to avoid duplicates if structure changed
      const uniqueSaved = parsedSavedUsers.filter(s => !INITIAL_USERS.some(i => i.email === s.email));
      setAllUsers([...INITIAL_USERS, ...uniqueSaved]);
    } else {
      // If no custom users, ensure initial users are set
      localStorage.setItem('seo_app_all_users', JSON.stringify(INITIAL_USERS));
      setAllUsers(INITIAL_USERS);
    }

    // Load current logged in user
    const savedUser = localStorage.getItem('seo_app_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (email: string, id: string) => {
    const foundUser = allUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.accessId === id
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setLoginError(null);
      localStorage.setItem('seo_app_user', JSON.stringify(foundUser));
      setAuthView('landing'); // Reset for logout
    } else {
      setLoginError("Invalid Email or Access ID.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('seo_app_user');
    setAuthView('landing'); // Go back to landing page
  };

  const [activeTab, setActiveTab] = useState('home');
  // Lifted state to persist generated articles across tabs
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedContent[]>([]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home user={currentUser!} setActiveTab={setActiveTab} articlesCount={generatedArticles.length} />;
      case 'editor':
        return <Editor articles={generatedArticles} setArticles={setGeneratedArticles} />;
      case 'guidelines':
        return <div className="h-full overflow-y-auto bg-slate-50"><GuidelinesView /></div>;
      case 'checklist':
        return <div className="h-full overflow-y-auto bg-slate-50"><SeoChecklist /></div>;
      case 'history':
        return <div className="h-full overflow-y-auto bg-slate-50"><ArticleHistoryView articles={generatedArticles} /></div>;
      case 'image-gen':
         return <div className="h-full overflow-y-auto bg-slate-50"><ImageGeneratorView /></div>;
      case 'video-gen':
         return <div className="h-full overflow-y-auto bg-slate-50"><VideoGeneratorView /></div>;
      case 'audio-gen':
         return <div className="h-full overflow-y-auto bg-slate-50"><AudioGeneratorView /></div>;
      case 'pricing':
         return <div className="h-full overflow-y-auto bg-slate-50"><PricingView /></div>;
      default:
        return <Home user={currentUser!} setActiveTab={setActiveTab} articlesCount={generatedArticles.length} />;
    }
  };

  // AUTH FLOW LOGIC
  if (!currentUser) {
    return (
      <div className="h-screen w-screen overflow-y-auto bg-slate-50">
        {authView === 'landing' ? (
          <LandingPage 
            onLoginClick={() => setAuthView('login')} 
          />
        ) : (
          <Login 
            onLogin={handleLogin} 
            onBack={() => setAuthView('landing')}
            error={loginError} 
          />
        )}
      </div>
    );
  }

  // MAIN APP (Logged In)
  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 h-full overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;