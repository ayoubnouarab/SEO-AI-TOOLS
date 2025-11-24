
import React from 'react';
import { CheckCircle, Zap, Shield, CreditCard, Star } from 'lucide-react';

export const PricingView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10 animate-fade-in pb-20">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <CreditCard className="text-blue-600" size={32} />
           <h1 className="text-3xl font-bold text-slate-900">Plans & Billing</h1>
        </div>
        <p className="text-slate-500 text-lg">Manage your workspace subscription and access levels.</p>
      </header>

      {/* Current Plan Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-xl">
         <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-green-500 text-slate-900 text-xs font-bold px-2 py-1 rounded uppercase">Active Subscription</span>
               <span className="text-slate-400 text-sm">Renews on Nov 1, 2024</span>
            </div>
            <h2 className="text-2xl font-bold">Starter Plan</h2>
            <p className="text-slate-400 text-sm mt-1">Limited to 3 articles/month. Upgrade to unlock Cluster Mode.</p>
         </div>
         <div className="mt-6 md:mt-0">
            <div className="text-right">
               <p className="text-3xl font-bold">0 <span className="text-sm font-normal text-slate-400">/mo</span></p>
            </div>
         </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         
         {/* Free Tier */}
         <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm opacity-75">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
            <p className="text-3xl font-bold text-slate-900 mb-6">$0<span className="text-sm text-slate-400 font-normal">/mo</span></p>
            <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4">For hobbyists just trying out AI SEO.</p>
            
            <ul className="space-y-4 text-sm text-slate-600 mb-8">
               <li className="flex gap-3"><CheckCircle size={18} className="text-slate-400"/> 3 Articles / month</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-slate-400"/> Gemini 2.5 Flash</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-slate-400"/> Basic SEO Check</li>
               <li className="flex gap-3 text-slate-300"><XIcon /> No Image Gen</li>
               <li className="flex gap-3 text-slate-300"><XIcon /> No Cluster Mode</li>
            </ul>
            <button disabled className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed">Current Plan</button>
         </div>

         {/* Pro Tier */}
         <div className="bg-white rounded-2xl p-8 border-2 border-blue-600 shadow-xl relative transform scale-105 z-10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
               Recommended
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
               Strategist <Star size={16} className="text-yellow-400 fill-current"/>
            </h3>
            <p className="text-3xl font-bold text-slate-900 mb-6">$49<span className="text-sm text-slate-400 font-normal">/mo</span></p>
            <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4">For serious content creators scaling up.</p>
            
            <ul className="space-y-4 text-sm text-slate-700 mb-8 font-medium">
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> <strong>Unlimited</strong> Articles</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> <strong>Cluster Mode</strong> (7 at once)</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> Nano Banana Images</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> Veo Video Generation</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> Priority Support</li>
            </ul>
            <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-colors">Upgrade Now</button>
         </div>

         {/* Agency Tier */}
         <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Agency</h3>
            <p className="text-3xl font-bold text-slate-900 mb-6">$199<span className="text-sm text-slate-400 font-normal">/mo</span></p>
            <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-4">For teams managing multiple clients.</p>
            
            <ul className="space-y-4 text-sm text-slate-600 mb-8">
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> <strong>10 User Seats</strong></li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> API Access</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> White-label Reports</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> Custom Fine-tuning</li>
               <li className="flex gap-3"><CheckCircle size={18} className="text-blue-600"/> Dedicated Account Mgr</li>
            </ul>
            <button className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors">Contact Sales</button>
         </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-16 bg-white rounded-lg border border-slate-200 overflow-hidden">
         <div className="bg-slate-50 p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Feature Comparison</h3>
         </div>
         <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
               <tr>
                  <th className="px-6 py-4 font-medium">Feature</th>
                  <th className="px-6 py-4 font-medium text-center">Starter</th>
                  <th className="px-6 py-4 font-medium text-center text-blue-600">Strategist</th>
                  <th className="px-6 py-4 font-medium text-center">Agency</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               <tr>
                  <td className="px-6 py-4 font-medium text-slate-700">Article Generation Limit</td>
                  <td className="px-6 py-4 text-center text-slate-500">3 / mo</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">Unlimited</td>
                  <td className="px-6 py-4 text-center font-bold">Unlimited</td>
               </tr>
               <tr>
                  <td className="px-6 py-4 font-medium text-slate-700">Topic Cluster Mode</td>
                  <td className="px-6 py-4 text-center text-slate-300"><XIcon/></td>
                  <td className="px-6 py-4 text-center text-blue-600"><CheckCircle size={16} className="mx-auto"/></td>
                  <td className="px-6 py-4 text-center text-green-600"><CheckCircle size={16} className="mx-auto"/></td>
               </tr>
               <tr>
                  <td className="px-6 py-4 font-medium text-slate-700">Nano Banana Images</td>
                  <td className="px-6 py-4 text-center text-slate-300"><XIcon/></td>
                  <td className="px-6 py-4 text-center text-blue-600"><CheckCircle size={16} className="mx-auto"/></td>
                  <td className="px-6 py-4 text-center text-green-600"><CheckCircle size={16} className="mx-auto"/></td>
               </tr>
               <tr>
                  <td className="px-6 py-4 font-medium text-slate-700">OpenAI / Claude API Key</td>
                  <td className="px-6 py-4 text-center text-slate-500">Own Key Only</td>
                  <td className="px-6 py-4 text-center font-bold text-blue-600">Included (Fair Use)</td>
                  <td className="px-6 py-4 text-center font-bold">Included (High Limit)</td>
               </tr>
            </tbody>
         </table>
      </div>

      <div className="bg-slate-100 p-6 rounded-lg flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-full text-slate-400">
               <Shield size={24} />
            </div>
            <div>
               <h4 className="font-bold text-slate-800">Enterprise Security</h4>
               <p className="text-sm text-slate-500">We follow SOC2 compliance standards for data protection.</p>
            </div>
         </div>
         <button className="text-blue-600 font-bold text-sm hover:underline">Read Security Policy</button>
      </div>

    </div>
  );
};

const XIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
