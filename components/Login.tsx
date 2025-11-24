
import React, { useState, useEffect } from 'react';
import { Lock, Key, Mail, ArrowRight, ShieldCheck, UserPlus, User as UserIcon, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, id: string) => void;
  onSignup: (name: string, email: string, id: string) => void;
  onBack: () => void;
  initialMode?: 'login' | 'signup';
  error: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onSignup, onBack, initialMode = 'login', error }) => {
  const [isSignup, setIsSignup] = useState(initialMode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accessId, setAccessId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsSignup(initialMode === 'signup');
  }, [initialMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a brief network check for UX
    setTimeout(() => {
      if (isSignup) {
        onSignup(name, email, accessId);
      } else {
        onLogin(email, accessId);
      }
      setIsLoading(false);
    }, 800);
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative">
      
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in mt-10 md:mt-0">
        <div className={`p-8 text-center transition-colors duration-300 ${isSignup ? 'bg-indigo-600' : 'bg-blue-600'}`}>
           <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ${isSignup ? 'bg-indigo-500' : 'bg-blue-500'}`}>
              {isSignup ? <UserPlus className="text-white" size={32} /> : <ShieldCheck className="text-white" size={32} />}
           </div>
           <h1 className="text-2xl font-bold text-white">{isSignup ? 'Create Account' : 'SEO Studio Access'}</h1>
           <p className="text-blue-100 text-sm mt-2">
             {isSignup ? 'Join the Ayoub Nouar Workspace' : 'Secure Workspace for Ayoub Nouar'}
           </p>
        </div>
        
        <div className="p-8">
           <form onSubmit={handleSubmit} className="space-y-5">
             
             {isSignup && (
               <div className="animate-slide-in">
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                   <UserIcon size={14} /> Full Name
                 </label>
                 <input 
                   type="text" 
                   required={isSignup}
                   className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                   placeholder="John Doe"
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                 />
               </div>
             )}

             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                 <Mail size={14} /> {isSignup ? 'Email Address' : 'Authorized Email'}
               </label>
               <input 
                 type="email" 
                 required
                 className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 outline-none text-slate-800 ${isSignup ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}`}
                 placeholder="name@example.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                 <Key size={14} /> {isSignup ? 'Create Access ID' : 'Access ID (Code)'}
               </label>
               <input 
                 type="password" 
                 required
                 className={`w-full p-3 border border-slate-200 rounded-lg focus:ring-2 outline-none text-slate-800 ${isSignup ? 'focus:ring-indigo-500' : 'focus:ring-blue-500'}`}
                 placeholder={isSignup ? "Set a secure code" : "Enter your unique ID"}
                 value={accessId}
                 onChange={(e) => setAccessId(e.target.value)}
               />
             </div>

             {error && (
               <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2 animate-shake">
                  <Lock size={16} /> {error}
               </div>
             )}

             <button 
               type="submit" 
               disabled={isLoading}
               className={`w-full py-3.5 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 ${isSignup ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'}`}
             >
               {isLoading ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
               ) : (
                 <>
                   {isSignup ? 'Create Account' : 'Login'} 
                   <ArrowRight size={18} />
                 </>
               )}
             </button>
           </form>
           
           <div className="mt-6 text-center pt-4 border-t border-slate-100">
             <button 
               onClick={toggleMode}
               className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
             >
               {isSignup ? (
                 <>Already have an account? <span className="text-indigo-600">Login</span></>
               ) : (
                 <>Don't have an account? <span className="text-blue-600">Create one</span></>
               )}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
