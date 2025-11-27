import React from 'react';
import { Layout, ArrowRight, CheckCircle, Zap, Image as ImageIcon, Video, ShieldCheck, Mic, TrendingUp, X, BarChart3, Layers, Globe, Cpu, Smartphone, Lock, Sparkles, HelpCircle } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      {/* --- HEADER (Sticky) --- */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-white/20 z-50 transition-all shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={onLoginClick}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform">
              <Layout size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900 leading-none">SEO Studio</h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">AI Command Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="px-6 py-2.5 bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-900/30 flex items-center gap-2 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Member Login <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
              </span>
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================================================
          SECTION 1: ATTENTION (The Hook)
      ================================================================================== */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
           <img 
             src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop" 
             alt="AI Background" 
             className="w-full h-full object-cover opacity-10"
           />
           <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/90 to-slate-50"></div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-32 left-10 text-blue-200 animate-float opacity-50 z-0 hidden md:block">
           <Cpu size={64} />
        </div>
        <div className="absolute top-40 right-20 text-purple-200 animate-float opacity-50 z-0 hidden md:block" style={{ animationDelay: '1s' }}>
           <Zap size={56} />
        </div>
        <div className="absolute bottom-40 left-1/4 text-green-200 animate-float opacity-50 z-0 hidden md:block" style={{ animationDelay: '2s' }}>
           <TrendingUp size={48} />
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-400/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-400/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wide border border-slate-700 animate-fade-in-up">
            <Zap size={14} className="text-yellow-400 fill-current" /> 
            <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">New: Veo & Nano Banana Integration</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-slate-900 tracking-tight leading-[0.95] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Stop Writing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Start Dominating.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            The only AI Workspace that builds entire <strong>Topical Clusters</strong>, generates <strong>Context-Aware Images</strong>, and validates <strong>SEO Scores</strong> in seconds.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={onLoginClick}
              className="relative overflow-hidden px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold rounded-xl shadow-xl shadow-blue-900/30 transition-all hover:scale-105 hover:-translate-y-1 w-full md:w-auto flex items-center justify-center gap-3 group"
            >
              <span className="relative z-10 flex items-center gap-2">Access Workspace <ArrowRight size={20} /></span>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-150%] animate-shine"></div>
            </button>
            <div className="flex flex-col md:items-start items-center gap-1">
               <div className="flex -space-x-2">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden transform hover:scale-110 transition-transform cursor-pointer z-0 hover:z-10">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*123}`} alt="User" />
                   </div>
                 ))}
               </div>
               <span className="text-xs text-slate-500 font-medium">Join 2,000+ Strategists</span>
            </div>
          </div>
        </div>

        {/* Hero Dashboard Preview */}
        <div className="mt-20 relative max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-20"></div>
           <div className="rounded-2xl border-8 border-slate-900/5 shadow-2xl overflow-hidden bg-white transform hover:rotate-0 transition-transform duration-700">
              {/* Placeholder for a high-quality dashboard screenshot */}
              <div className="w-full aspect-video bg-slate-100 flex items-center justify-center relative group overflow-hidden">
                 <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop")' }}></div>
                 <div className="absolute inset-0 bg-white/50 backdrop-blur-sm"></div>
                 
                 <div className="absolute inset-0 grid grid-cols-12 gap-4 p-6 opacity-70">
                    <div className="col-span-3 bg-white/50 rounded-lg h-full border border-slate-200/50"></div>
                    <div className="col-span-9 space-y-4">
                       <div className="h-32 bg-white/50 rounded-lg w-full border border-slate-200/50"></div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="h-64 bg-white/50 rounded-lg border border-slate-200/50"></div>
                          <div className="h-64 bg-white/50 rounded-lg border border-slate-200/50"></div>
                       </div>
                    </div>
                 </div>
                 <div className="bg-white p-8 rounded-2xl shadow-2xl z-10 flex flex-col items-center animate-float">
                    <Layout size={48} className="text-blue-600 mb-4 drop-shadow-lg" />
                    <p className="font-bold text-slate-800 text-lg">Interactive Dashboard Preview</p>
                    <p className="text-sm text-slate-500">Sign in to access full features</p>
                    <button onClick={onLoginClick} className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors">
                      Enter Workspace
                    </button>
                 </div>
              </div>
           </div>
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-8 py-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-8 z-30 whitespace-nowrap animate-bounce">
              <div className="text-center">
                 <p className="text-xs text-slate-400 uppercase font-bold">Articles Generated</p>
                 <p className="text-2xl font-bold text-slate-900">12,405</p>
              </div>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="text-center">
                 <p className="text-xs text-slate-400 uppercase font-bold">Avg SEO Score</p>
                 <p className="text-2xl font-bold text-green-600">94%</p>
              </div>
           </div>
        </div>
      </section>

      {/* ==================================================================================
          SECTION 2: PLATFORM INTELLIGENCE (Nano Banana, Veo, Gemini)
      ================================================================================== */}
      <section className="py-24 bg-white border-t border-slate-100 relative">
         <div className="max-w-7xl mx-auto px-6 relative z-10">
             <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-slate-900 mb-4">Powered by Next-Gen Models</h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">We integrate the bleeding edge of AI directly into your workflow.</p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1: Gemini 2.5 */}
                <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all hover:-translate-y-2 duration-300">
                   <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                      <Cpu size={28} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-2">Gemini 2.5 Flash</h3>
                   <p className="text-sm font-bold text-blue-600 mb-4 uppercase tracking-wide">The Brain</p>
                   <p className="text-slate-600 leading-relaxed">
                      The core engine responsible for deep research, structuring logic, and producing 5,000-word Pillar articles with native American English nuance.
                   </p>
                </div>

                {/* Card 2: Nano Banana */}
                <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all hover:-translate-y-2 duration-300">
                   <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                      <ImageIcon size={28} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-2">Nano Banana / Imagen</h3>
                   <p className="text-sm font-bold text-purple-600 mb-4 uppercase tracking-wide">The Artist</p>
                   <p className="text-slate-600 leading-relaxed">
                      Specialized in generating context-aware charts, diagrams, and cover visuals. It reads your H2 headers and paints the perfect visual companion.
                   </p>
                </div>

                {/* Card 3: Veo */}
                <div className="group bg-slate-50 rounded-3xl p-8 border border-slate-100 hover:border-red-200 hover:bg-red-50/30 transition-all hover:-translate-y-2 duration-300">
                   <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6 group-hover:scale-110 transition-transform">
                      <Video size={28} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-2">Google Veo</h3>
                   <p className="text-sm font-bold text-red-600 mb-4 uppercase tracking-wide">The Director</p>
                   <p className="text-slate-600 leading-relaxed">
                      Capable of generating 720p video clips from text prompts. Perfect for adding engaging B-roll or intro clips to your high-value content.
                   </p>
                </div>
             </div>
         </div>
      </section>

      {/* ==================================================================================
          SECTION 3: VISUAL TOUR (Screenshots & Features)
      ================================================================================== */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
               
               <div className="space-y-12">
                  <div>
                     <h2 className="text-4xl font-bold mb-6">Your New Command Center.</h2>
                     <p className="text-slate-400 text-lg leading-relaxed">
                        Navigate through a unified interface designed for speed. From the Bento Grid dashboard to the deep-dive Editor, every pixel is optimized for productivity.
                     </p>
                  </div>

                  <div className="space-y-6">
                     <div className="flex gap-4 group">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                           <Layers size={24} />
                        </div>
                        <div>
                           <h4 className="text-xl font-bold mb-1">Cluster Mode</h4>
                           <p className="text-slate-400 text-sm">Generate 7 interconnected articles with one click. The system handles internal linking automatically.</p>
                        </div>
                     </div>

                     <div className="flex gap-4 group">
                        <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center text-green-400 shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                           <BarChart3 size={24} />
                        </div>
                        <div>
                           <h4 className="text-xl font-bold mb-1">Live SEO Validation</h4>
                           <p className="text-slate-400 text-sm">See your content score in real-time. Checks keyword density, structure, and LSI usage.</p>
                        </div>
                     </div>

                     <div className="flex gap-4 group">
                        <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center text-purple-400 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                           <Sparkles size={24} />
                        </div>
                        <div>
                           <h4 className="text-xl font-bold mb-1">Auto-Rewrite</h4>
                           <p className="text-slate-400 text-sm">Select any text and ask the AI to "Make it funnier" or "Make it more concise" instantly.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Abstract UI Mockup */}
               <div className="relative hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-40 animate-pulse-slow"></div>
                  <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl">
                     {/* Mock Browser Header */}
                     <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-4">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="ml-4 bg-slate-900 rounded px-3 py-1 text-xs text-slate-500 flex-1 text-center font-mono">seo-studio.app/editor</div>
                     </div>
                     {/* Mock Content */}
                     <div className="flex gap-4">
                        <div className="w-1/4 space-y-2">
                           <div className="h-8 bg-slate-700 rounded animate-pulse"></div>
                           <div className="h-8 bg-slate-700 rounded opacity-50"></div>
                           <div className="h-8 bg-slate-700 rounded opacity-50"></div>
                        </div>
                        <div className="w-3/4 bg-slate-900 rounded p-4 space-y-4">
                           <div className="h-40 bg-slate-700 rounded flex items-center justify-center text-slate-500 text-xs relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/10 to-transparent animate-shine"></div>
                              Cover Image Placeholder
                           </div>
                           <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                           <div className="h-4 bg-slate-700 rounded w-full"></div>
                           <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                           <div className="h-32 bg-blue-900/20 border border-blue-800/50 rounded p-2">
                              <div className="flex items-center gap-2 text-blue-400 text-xs mb-2">
                                 <Sparkles size={12} /> AI Suggestion
                              </div>
                              <div className="h-2 bg-blue-800/30 rounded w-full mb-1"></div>
                              <div className="h-2 bg-blue-800/30 rounded w-2/3"></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

            </div>
         </div>
      </section>

      {/* ==================================================================================
          SECTION 4: PRICING (Simple & Clean)
      ================================================================================== */}
      <section className="py-24 bg-slate-50">
         <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Transparent Pricing</h2>
               <p className="text-slate-500">Invest in growth, not overhead.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Free Tier */}
               <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm opacity-75 hover:opacity-100 transition-opacity">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
                  <p className="text-3xl font-bold text-slate-900 mb-6">$0<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                  <ul className="space-y-3 text-sm text-slate-600 mb-8">
                     <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600"/> 3 Articles / month</li>
                     <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600"/> Gemini 2.5 Flash</li>
                     <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600"/> Basic SEO Check</li>
                  </ul>
                  <button onClick={onLoginClick} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">Login to Account</button>
               </div>

               {/* Pro Tier */}
               <div className="bg-blue-600 rounded-2xl p-8 border-2 border-blue-500 shadow-xl text-white relative overflow-hidden transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="absolute top-0 right-0 bg-yellow-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase">Most Popular</div>
                  <h3 className="text-xl font-bold mb-2">Strategist</h3>
                  <p className="text-3xl font-bold mb-6">$49<span className="text-sm text-blue-200 font-normal">/mo</span></p>
                  <ul className="space-y-3 text-sm text-blue-100 mb-8">
                     <li className="flex gap-2"><CheckCircle size={16} className="text-white"/> Unlimited Articles</li>
                     <li className="flex gap-2"><CheckCircle size={16} className="text-white"/> Cluster Mode (7 at once)</li>
                     <li className="flex gap-2"><CheckCircle size={16} className="text-white"/> Nano Banana Images</li>
                     <li className="flex gap-2"><CheckCircle size={16} className="text-white"/> Veo Video Generation</li>
                  </ul>
                  <button onClick={onLoginClick} className="w-full py-3 bg-white hover:bg-blue-50 text-blue-600 font-bold rounded-lg transition-colors shadow-lg">Login to Upgrade</button>
               </div>

               {/* Enterprise Tier */}
               <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Agency</h3>
                  <p className="text-3xl font-bold text-slate-900 mb-6">$199<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                  <ul className="space-y-3 text-sm text-slate-600 mb-8">
                     <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600"/> 10 User Seats</li>
                     <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600"/> API Access</li>
                     <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600"/> White-label Reports</li>
                     <li className="flex gap-2"><CheckCircle size={16} className="text-blue-600"/> Custom Fine-tuning</li>
                  </ul>
                  <button className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors">Contact Sales</button>
               </div>
            </div>
         </div>
      </section>

      {/* ==================================================================================
          SECTION 5: FAQ
      ================================================================================== */}
      <section className="py-24 bg-white border-t border-slate-200">
         <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
               {[
                  { q: "Can I use my own API Keys?", a: "Yes! In the editor settings, you can toggle to use your own OpenAI or Claude keys if you prefer, although our native Gemini integration is included." },
                  { q: "Does this content pass AI detection?", a: "We optimize for 'Humanity Score' by enforcing short sentences, varied vocabulary, and opinionated tone. However, we focus on Reader Value over bypassing detectors." },
                  { q: "What is a Cluster?", a: "A cluster consists of one main 'Pillar' page that covers a broad topic, and several 'Satellite' pages that answer specific sub-questions, all interlinked." },
               ].map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group">
                     <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                        <HelpCircle size={16} className="text-blue-500" /> {item.q}
                     </h4>
                     <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ==================================================================================
          SECTION 6: ACTION (The Close)
      ================================================================================== */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
         {/* Decorative circles */}
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
         
         <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 tracking-tight">
               Ready to build your content empire?
            </h2>
            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
               Join the elite SEO strategists using AI to scale traffic, not costs. Access restricted to approved accounts only.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <button 
                  onClick={onLoginClick}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-900/50 transition-all hover:scale-105"
               >
                  Login to Workspace
               </button>
            </div>
            
            <p className="mt-8 text-sm text-slate-500">
               <ShieldCheck size={14} className="inline mr-1" /> 
               Secure Enterprise-Grade Environment.
            </p>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800 text-slate-400 text-sm">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <span className="font-bold text-white text-lg block mb-1">SEO Studio</span>
               <p>© 2024 Ayoub Nouar. All rights reserved.</p>
            </div>
            <div className="flex gap-8">
               <a href="#" className="hover:text-white transition-colors">Features</a>
               <a href="#" className="hover:text-white transition-colors">Pricing</a>
               <a href="#" className="hover:text-white transition-colors">Login</a>
               <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
         </div>
      </footer>
    </div>
  );
};