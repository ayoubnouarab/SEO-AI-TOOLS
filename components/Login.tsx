import React, { useState, useEffect } from 'react';
import { Lock, Key, Mail, ArrowRight, ShieldCheck, User as UserIcon, ArrowLeft, AlertTriangle } from 'lucide-react';
import { hasValidApiKey } from '../services/geminiService';

interface LoginProps {
  onLogin: (email: string, id: string) => void;
  onBack: () => void;
  error: string | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack, error }) => {
  const [email, setEmail] = useState('');
  const [accessId, setAccessId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemReady, setSystemReady] = useState(true);

  useEffect(() => {
    // Check if API key is present
    setSystemReady(hasValidApiKey());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a brief network check for UX
    setTimeout(() => {
      onLogin(email, accessId);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative">
      
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 text-slate-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in mt-10 md:mt-0 relative">
        
        {/* System Diagnostics Warning */}
        {!systemReady && (
           <div className="absolute inset-x-0 top-0 bg-red-500 text-white text-xs p-4 z-50">
             <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                   <p className="font-bold">Configuration Error</p>
                   <p className="mt-1">VITE_API_KEY is missing. The app will fail to generate content.</p>
                   <p className="mt-2 text-white/80">Go to Vercel Settings > Environment Variables and add <strong>VITE_API_KEY</strong>.</p>
                </div>
             </div>
           </div>
        )}

        <div className={`p-8 text-center bg-blue-600 transition-colors duration-300 ${!systemReady ? 'pt-24' : ''}`}>
           <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg bg-blue-500">
              <ShieldCheck className="text-white" size={32} />
           </div>
           <h1 className="text-2xl font-bold text-white">SEO Studio Access</h1>
           <p className="text-blue-100 text-sm mt-2">
             Secure Workspace for Ayoub Nouar
           </p>
        </div>
        
        <div className="p-8">
           <form onSubmit={handleSubmit} className="space-y-5">
             
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                 <Mail size={14} /> Authorized Email
               </label>
               <input 
                 type="email" 
                 required
                 className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 outline-none text-slate-800 focus:ring-blue-500"
                 placeholder="name@example.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
               />
             </div>

             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                 <Key size={14} /> Access ID (Code)
               </label>
               <input 
                 type="password" 
                 required
                 className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 outline-none text-slate-800 focus:ring-blue-500"
                 placeholder="Enter your unique ID"
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
               className="w-full py-3.5 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 bg-slate-900 hover:bg-slate-800"
             >
               {isLoading ? (
                 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
               ) : (
                 <>
                   Login 
                   <ArrowRight size={18} />
                 </>
               )}
             </button>
           </form>
           
           <div className="mt-6 text-center pt-4 border-t border-slate-100">
             <p className="text-xs text-slate-400">
               Restricted Access. Authorized personnel only.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};