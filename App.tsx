import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Editor } from './components/Editor';
import { GuidelinesView } from './components/GuidelinesView';
import { SeoChecklist } from './components/SeoChecklist';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('editor');

  const renderContent = () => {
    switch (activeTab) {
      case 'editor':
        return <Editor />;
      case 'guidelines':
        return <div className="h-full overflow-y-auto bg-slate-50"><GuidelinesView /></div>;
      case 'checklist':
        return <div className="h-full overflow-y-auto bg-slate-50"><SeoChecklist /></div>;
      default:
        return <Editor />;
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