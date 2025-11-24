
import React from 'react';
import { User } from '../types';
import { Wand2, Image as ImageIcon, Video, Mic, Zap, TrendingUp, FileText, ArrowRight, Sparkles, Activity, Cpu, Layers, BarChart3, History } from 'lucide-react';

interface HomeProps {
  user: User;
  setActiveTab: (tab: string) => void;
  articlesCount: number;
}

export const Home: React.FC<HomeProps> = ({ user, setActiveTab, articlesCount }) => {
  return (
    <div className="h-full bg-slate-50 relative overflow-hidden flex flex-col">
      {/* --- GLOBAL BACKGROUND EFFECTS (Shared with Landing Page) --- */}
      <div className="absolute inset-0 bg-slate-50 z-0">
         {/* Ambient Glows */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
         <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
         <div className="absolute top-40 left-10 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2.5s' }}></div>
      </div>

      {/* Floating 3D Elements */}
      <div className="absolute top-20 right-20 text-blue-200 animate-float opacity-40 z-0 pointer-events-none hidden lg:block">
         <Cpu size={120} />
      </div>
      <div className="absolute bottom-40 left-20 text-purple-200 animate-float opacity-40 z-0 pointer-events-none hidden lg:block" style={{ animationDelay: '1s' }}>
         <Zap size={100} />
      </div>

      <div className="flex-1 overflow-y-auto z-10 p-8 pb-32">
        <div className="max-w-7xl mx-auto space-y-12 animate-fade-in-up">
          
          {/* --- HERO SECTION --- */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 text-white p-12 group">
             {/* Dynamic Background Image */}
             <div 
               className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-[2s] group-hover:scale-105"
               style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop")' }}
             ></div>
             <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
             
             <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  System Online
                </div>
                
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
                  Ready to Dominate, <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    {user.name.split(' ')[0]}?
                  </span>
                </h1>
                
                <p className="text-xl text-slate-300 mb-10 font-light leading-relaxed">
                  Your AI Command Center is fully operational. Deploy <strong>Topical Clusters</strong>, generate <strong>Veo Videos</strong>, and scale your traffic with next-gen precision.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => setActiveTab('editor')}
                    className="relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 flex items-center gap-3 transition-all hover:-translate-y-1 group overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2"><Wand2 size={20} /> Start New Project</span>
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700"></div>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('checklist')}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md rounded-xl font-bold flex items-center gap-3 transition-all hover:-translate-y-1"
                  >
                    <Activity size={20} /> View Status
                  </button>
                </div>
             </div>

             {/* Hero Abstract Graphic */}
             <div className="absolute right-0 bottom-0 h-full w-1/3 opacity-20 pointer-events-none hidden md:block">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-current text-blue-500 animate-pulse-slow">
                  <path transform="translate(100 100)" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.4,8.6,81.8,21.5,70.6,32.3C59.4,43.1,48.6,51.8,36.9,58.7C25.2,65.6,12.6,70.7,-1.2,72.8C-15,74.9,-30,73.9,-43.3,67.7C-56.6,61.5,-68.2,50.1,-76.3,36.3C-84.4,22.5,-89,6.3,-86.6,-8.7C-84.2,-23.7,-74.8,-37.5,-63.3,-48.6C-51.8,-59.7,-38.2,-68.1,-24.5,-75.6C-10.8,-83.1,3,-89.7,16.5,-89.5C30,-89.3,44.7,-76.4,44.7,-76.4Z" />
                </svg>
             </div>
          </div>

          {/* --- STATS ROW (Glassmorphism) --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {[
              { label: 'Total Articles', value: articlesCount, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Avg SEO Score', value: '94%', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
              { label: 'Words Generated', value: '1.2M', icon: Layers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { label: 'Cluster Efficiency', value: 'High', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                 <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                       <stat.icon size={24} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                       <p className="text-2xl font-extrabold text-slate-800">{stat.value}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>

          {/* --- TOOLS GRID (Bento Style) --- */}
          <div>
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                 <Sparkles className="text-amber-500" /> Platform Intelligence
               </h2>
               <span className="text-sm font-medium text-slate-500">Access your tools</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Main Card: Article Editor */}
              <div 
                onClick={() => setActiveTab('editor')}
                className="col-span-1 md:col-span-2 relative h-80 rounded-3xl overflow-hidden shadow-xl cursor-pointer group border border-slate-200"
              >
                 <div 
                   className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                   style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1973&auto=format&fit=crop")' }}
                 ></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/60 to-transparent"></div>
                 
                 <div className="absolute inset-0 p-10 flex flex-col justify-center items-start z-10">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-white/20 shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <FileText size={28} />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">Editor & Cluster Builder</h3>
                    <p className="text-slate-300 max-w-md mb-8 leading-relaxed">
                       Deploy Gemini 2.5 to write 5,000-word pillars. Research, outline, and validate with live SEO scoring.
                    </p>
                    <span className="px-5 py-2.5 bg-white text-slate-900 rounded-lg font-bold text-sm flex items-center gap-2 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       Launch Workspace <ArrowRight size={16} />
                    </span>
                 </div>
              </div>

              {/* Secondary Card: Image Gen */}
              <div 
                onClick={() => setActiveTab('image-gen')}
                className="relative h-80 rounded-3xl overflow-hidden shadow-xl cursor-pointer group border border-slate-200"
              >
                 <div 
                   className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                   style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop")' }}
                 ></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/50 to-transparent mix-blend-multiply"></div>
                 
                 <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div>
                       <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-4">
                          <ImageIcon size={24} />
                       </div>
                       <h3 className="text-2xl font-bold text-white">Nano Banana</h3>
                       <p className="text-purple-200 text-sm font-medium">Visual Engine</p>
                    </div>
                    <div>
                       <p className="text-white/80 text-sm mb-4">Generate context-aware charts and diagrams.</p>
                       <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wide">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Active
                       </div>
                    </div>
                 </div>
              </div>

              {/* Tertiary Card: Video */}
              <div 
                onClick={() => setActiveTab('video-gen')}
                className="relative h-64 rounded-3xl overflow-hidden shadow-lg cursor-pointer group border border-slate-200 bg-slate-900"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Video size={100} className="text-red-500 transform rotate-12" />
                 </div>
                 
                 <div className="absolute inset-0 p-8 z-10 flex flex-col justify-end">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white mb-3 shadow-lg shadow-red-900/50">
                       <Video size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Google Veo</h3>
                    <p className="text-slate-400 text-sm">720p Video Generation</p>
                 </div>
              </div>

              {/* Tertiary Card: Audio */}
              <div 
                onClick={() => setActiveTab('audio-gen')}
                className="relative h-64 rounded-3xl overflow-hidden shadow-lg cursor-pointer group border border-slate-200 bg-slate-900"
              >
                 <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity">
                    <Mic size={100} className="text-green-500 transform -rotate-12" />
                 </div>
                 
                 <div className="absolute inset-0 p-8 z-10 flex flex-col justify-end">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white mb-3 shadow-lg shadow-green-900/50">
                       <Mic size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Audio Studio</h3>
                    <p className="text-slate-400 text-sm">TTS & Voice Mimic</p>
                 </div>
              </div>

              {/* Tertiary Card: History */}
              <div 
                onClick={() => setActiveTab('history')}
                className="relative h-64 rounded-3xl overflow-hidden shadow-lg cursor-pointer group border border-slate-200 bg-white"
              >
                 <div className="absolute inset-0 bg-slate-50 group-hover:bg-slate-100 transition-colors"></div>
                 <div className="absolute inset-0 flex items-center justify-center opacity-5">
                    <BarChart3 size={150} />
                 </div>
                 
                 <div className="absolute inset-0 p-8 z-10 flex flex-col items-center justify-center text-center">
                    <h3 className="text-5xl font-extrabold text-slate-900 mb-2 group-hover:scale-110 transition-transform">{articlesCount}</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Projects</p>
                    <button className="mt-4 text-blue-600 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                       View Archives <ArrowRight size={14} />
                    </button>
                 </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
