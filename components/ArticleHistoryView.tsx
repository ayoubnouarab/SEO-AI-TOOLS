import React, { useState } from 'react';
import { GeneratedContent, ArticleType } from '../types';
import { History, Database, ClipboardCopy, Check } from 'lucide-react';

interface ArticleHistoryViewProps {
  articles: GeneratedContent[];
}

export const ArticleHistoryView: React.FC<ArticleHistoryViewProps> = ({ articles }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (article: GeneratedContent) => {
    navigator.clipboard.writeText(article.content);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 animate-fade-in pb-20">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <History className="text-blue-600" size={32} />
           <h1 className="text-3xl font-bold text-slate-900">Global Article History</h1>
        </div>
        <p className="text-slate-500 text-lg">Archive of all content generated in this session.</p>
      </header>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-lg border border-slate-200 border-dashed">
           <Database size={48} className="mb-4 opacity-30" />
           <p className="text-lg font-medium">No articles generated yet.</p>
           <p className="text-sm">Go to the Editor to start creating content.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
           {articles.map((article) => (
             <div key={article.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${article.type === ArticleType.PILLAR ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                           {article.type}
                         </span>
                         <span className="text-xs text-slate-400">ID: {article.id.substring(0, 8)}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{article.title}</h3>
                      <p className="text-sm text-blue-600 font-mono mt-1">{article.slug}</p>
                   </div>
                   <button 
                     onClick={() => handleCopy(article)}
                     className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                     title="Copy Content"
                   >
                     {copiedId === article.id ? <Check size={20} className="text-green-600" /> : <ClipboardCopy size={20} />}
                   </button>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{article.metaDescription}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
                   <span>{article.content.length} characters</span>
                   {article.validation && (
                     <div className="flex items-center gap-2">
                        <span>SEO Score:</span>
                        <span className={`font-bold ${article.validation.seoScore >= 85 ? 'text-green-600' : 'text-orange-500'}`}>
                          {article.validation.seoScore}/100
                        </span>
                     </div>
                   )}
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};