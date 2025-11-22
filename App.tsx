import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Editor } from './components/Editor';
import { GuidelinesView } from './components/GuidelinesView';
import { SeoChecklist } from './components/SeoChecklist';
import { ArticleHistoryView } from './components/ArticleHistoryView';
import { ImageGeneratorView, VideoGeneratorView, AudioGeneratorView } from './components/MediaTools';
import { GeneratedContent } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editor');
  // Lifted state to persist generated articles across tabs
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedContent[]>([]);

  const renderContent = () => {
    switch (activeTab) {
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
      default:
        return <Editor articles={generatedArticles} setArticles={setGeneratedArticles} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 h-full overflow-hidden relative">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;