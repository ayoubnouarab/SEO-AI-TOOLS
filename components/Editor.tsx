import React, { useState, useEffect } from 'react';
import { ArticleType, SEOConfig, GeneratedContent, LogMessage, ClusterPlan, ArticleVersion } from '../types';
import { generateArticleContent, reviewArticleContent, performSeoResearch, generateClusterPlan, generateRealImage, suggestTopicFromNiche } from '../services/geminiService';
import { Wand2, RefreshCw, FileSearch, Copy, Check, ClipboardCopy, Search, Layers, Database, Image as ImageIcon, Palette, Download, X, Zap, History, RotateCcw, Lightbulb } from 'lucide-react';
import { SeoChecklist } from './SeoChecklist';

export const Editor: React.FC = () => {
  const [config, setConfig] = useState<SEOConfig>({
    topic: '',
    audience: 'Salma, 28 ans, freelance, manque de temps',
    mainKeyword: '',
    secondaryKeywords: [],
    type: ArticleType.SATELLITE,
    relatedPillarTopic: ''
  });

  const [mode, setMode] = useState<'SINGLE' | 'CLUSTER'>('SINGLE');
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedContent[]>([]);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  // Niche Idea State
  const [nicheInput, setNicheInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [subCategoryInput, setSubCategoryInput] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  // Image Generation State
  const [showImageModal, setShowImageModal] = useState(false);
  const [detectedImages, setDetectedImages] = useState<{alt: string, url: string, index: number}[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState<number | null>(null); // Index of image being generated
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');

  // History State
  const [showHistory, setShowHistory] = useState(false);

  // Derived state for the currently viewed article
  const currentArticle = generatedArticles.find(a => a.id === activeArticleId) || null;

  // Detect images in current article whenever it changes
  useEffect(() => {
    if (currentArticle) {
      const regex = /!\[(.*?)\]\((.*?)\)/g;
      let match;
      const images = [];
      let i = 0;
      while ((match = regex.exec(currentArticle.content)) !== null) {
        images.push({ alt: match[1], url: match[2], index: i });
        i++;
      }
      setDetectedImages(images);
    }
  }, [currentArticle]);

  const addLog = (text: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ timestamp: Date.now(), text, type }, ...prev]);
  };

  // Helper to save current state to history
  const saveToHistory = (articleId: string, note: string) => {
    setGeneratedArticles(prev => prev.map(article => {
      if (article.id === articleId) {
        const newVersion: ArticleVersion = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          content: article.content,
          note: note
        };
        return {
          ...article,
          history: [newVersion, ...(article.history || [])]
        };
      }
      return article;
    }));
  };

  const handleRestoreVersion = (version: ArticleVersion) => {
    if (!currentArticle) return;
    
    // Save current as history before restoring? Yes, to avoid losing latest work.
    saveToHistory(currentArticle.id, "Auto-save before restore");

    setGeneratedArticles(prev => prev.map(article => {
      if (article.id === currentArticle.id) {
        return {
          ...article,
          content: version.content
        };
      }
      return article;
    }));
    addLog(`Restored version from ${new Date(version.timestamp).toLocaleTimeString()}`, 'success');
    setShowHistory(false);
  };

  const handleSuggestTopic = async () => {
    if (!nicheInput) return;
    setIsSuggesting(true);
    addLog(`Analyzing niche "${nicheInput}", category "${categoryInput}"${subCategoryInput ? `, sub-category "${subCategoryInput}"` : ''} for topic ideas...`);
    try {
      const topic = await suggestTopicFromNiche(nicheInput, categoryInput, subCategoryInput);
      setConfig(prev => ({ ...prev, topic: topic }));
      addLog(`Topic found: "${topic}"`, 'success');
    } catch (error) {
      addLog('Failed to suggest topic.', 'error');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleResearch = async () => {
    if (!config.topic) {
      addLog('Please enter a topic to research.', 'error');
      return;
    }
    setIsResearching(true);
    addLog(`Googling trends for: ${config.topic}...`);
    try {
      const result = await performSeoResearch(config.topic);
      setConfig(prev => ({
        ...prev,
        mainKeyword: result.mainKeyword || prev.mainKeyword,
        audience: result.audience || prev.audience,
        secondaryKeywords: result.secondaryKeywords || prev.secondaryKeywords,
      }));
      addLog('Research complete! Form auto-filled.', 'success');
    } catch (error) {
      addLog('Research failed.', 'error');
    } finally {
      setIsResearching(false);
    }
  };

  const handleGenerateSingle = async () => {
     setIsGenerating(true);
     setReviewResult(null);
     addLog('Generating single article...');
     try {
       const result = await generateArticleContent(config);
       setGeneratedArticles(prev => [result, ...prev]);
       setActiveArticleId(result.id);
       addLog('Article generated successfully!', 'success');
     } catch (error) {
       addLog('Generation failed.', 'error');
     } finally {
       setIsGenerating(false);
     }
  };

  const handleGenerateCluster = async () => {
    if (!config.topic) return;
    setIsGenerating(true);
    addLog('Phase 1: Designing Cluster Plan (Pillar + 6 Satellites)...');

    try {
      // 1. Plan
      const plan: ClusterPlan = await generateClusterPlan(config.topic);
      addLog('Plan created. Starting batch generation (7 articles)...', 'success');

      // 2. Queue Setup
      const queue = [
        { type: ArticleType.PILLAR, title: plan.pillar.title, keyword: plan.pillar.mainKeyword, related: '' },
        ...plan.satellites.map(s => ({
          type: ArticleType.SATELLITE,
          title: s.title,
          keyword: s.mainKeyword,
          related: plan.pillar.title
        }))
      ];

      // 3. Sequential Processing
      let count = 0;
      const newArticles: GeneratedContent[] = [];

      for (const task of queue) {
        count++;
        addLog(`Generating ${count}/7: ${task.type} - "${task.title}"...`);
        
        const article = await generateArticleContent({
          ...config,
          type: task.type,
          mainKeyword: task.keyword,
          topic: task.title, // Use specific title as topic
          relatedPillarTopic: task.related
        });

        newArticles.push(article);
        setGeneratedArticles(prev => [...prev, article]);
        if (count === 1) setActiveArticleId(article.id); // Set first one as active immediately
      }

      addLog('Cluster Generation Complete! 7 Articles ready.', 'success');

    } catch (error) {
      addLog('Cluster generation stopped due to error.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReview = async () => {
    if (!currentArticle) return;
    setIsReviewing(true);
    addLog('Starting peer review...');
    try {
      const review = await reviewArticleContent(currentArticle.content, config);
      setReviewResult(review);
      addLog('Review complete.', 'success');
    } catch (error) {
      addLog('Review failed.', 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerateRealImage = async (imgData: {alt: string, url: string, index: number}) => {
    if (!currentArticle) return;
    
    // Save history before modification
    saveToHistory(currentArticle.id, `Before generating image: ${imgData.alt.substring(0, 20)}...`);

    setIsGeneratingImage(imgData.index);
    addLog(`Generating real image (${selectedAspectRatio}) for: "${imgData.alt}"...`);
    
    try {
      const base64Image = await generateRealImage(imgData.alt, selectedAspectRatio);
      
      // Replace in content
      // We need to be careful to replace only the specific instance if alt texts are same
      // A safer way with index matching:
      let occurrence = 0;
      // Note: We use currentArticle.content here, but we need to ensure we aren't using stale closure if we didn't use functional update in setGeneratedArticles, 
      // but since we're inside the function scope and currentArticle is a dependency or derived from state, it's generally fine if we update state correctly.
      // However, to be safe with the saveToHistory call above (which is async state update), we should calculate new content first then update.
      
      const newContent = currentArticle.content.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        if (occurrence === imgData.index) {
          occurrence++;
          return `![${alt}](${base64Image})`;
        }
        occurrence++;
        return match;
      });

      // Update state
      setGeneratedArticles(prev => prev.map(a => a.id === currentArticle.id ? { ...a, content: newContent } : a));
      addLog('Image generated and injected!', 'success');
    } catch (error) {
      addLog('Image generation failed.', 'error');
    } finally {
      setIsGeneratingImage(null);
    }
  };

  const handleGenerateAllImages = async () => {
    if (!currentArticle) return;
    const targets = detectedImages.filter(img => img.url.includes('placehold.co'));
    
    if (targets.length === 0) {
      addLog('No placeholder images found to generate.', 'info');
      return;
    }

    // Save history
    saveToHistory(currentArticle.id, `Before batch image generation (${targets.length} images)`);

    setIsBatchGenerating(true);
    addLog(`Starting batch generation for ${targets.length} images...`);

    try {
      // Parallel generation
      const results = await Promise.all(targets.map(async (img) => {
        try {
          addLog(`Generating image: "${img.alt}"...`);
          const base64 = await generateRealImage(img.alt, selectedAspectRatio);
          return { index: img.index, base64, success: true };
        } catch (e) {
          addLog(`Failed to generate image for "${img.alt}"`, 'error');
          return { index: img.index, base64: null, success: false };
        }
      }));

      // Replace in content respecting index
      let occurrence = 0;
      const newContent = currentArticle.content.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        const currentIdx = occurrence++;
        const result = results.find(r => r.index === currentIdx);
        
        if (result && result.success && result.base64) {
          return `![${alt}](${result.base64})`;
        }
        return match;
      });

      setGeneratedArticles(prev => prev.map(a => a.id === currentArticle.id ? { ...a, content: newContent } : a));
      addLog('Batch generation completed!', 'success');

    } catch (error) {
      addLog('Batch generation encountered an error.', 'error');
    } finally {
      setIsBatchGenerating(false);
    }
  };

  const handleCopy = () => {
    if (currentArticle) {
      navigator.clipboard.writeText(currentArticle.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyAll = () => {
    if (currentArticle) {
      const fullContent = `# ${currentArticle.title}

**Slug:** ${currentArticle.slug}
**Meta Description:** ${currentArticle.metaDescription}

---

${currentArticle.content}`;
      navigator.clipboard.writeText(fullContent);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const keywordInputHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      if (val && !config.secondaryKeywords.includes(val)) {
        setConfig(prev => ({
          ...prev,
          secondaryKeywords: [...prev.secondaryKeywords, val]
        }));
        e.currentTarget.value = '';
      }
    }
  };

  const removeKeyword = (kw: string) => {
    setConfig(prev => ({
      ...prev,
      secondaryKeywords: prev.secondaryKeywords.filter(k => k !== kw)
    }));
  };

  // Lightweight Markdown Renderer for Preview
  const renderMarkdownPreview = (text: string) => {
    if (!text) return { __html: '' };
    
    // Simple sanitization
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Headers (H1, H2, H3)
    html = html.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-slate-900 mt-6 mb-4 pb-2 border-b border-slate-200">$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-slate-800 mt-6 mb-3">$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-slate-800 mt-4 mb-2">$1</h3>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Images: ![alt](url)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="w-full h-auto rounded-lg shadow-md my-6 border border-slate-100" title="$1" />');

    // Links: [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

    // Lists
    html = html.replace(/^\s*-\s+(.*$)/gm, '<li class="ml-4 list-disc text-slate-700 mb-1">$1</li>');

    // Paragraphs
    html = html.replace(/\n\n/g, '</p><p class="mb-4 text-slate-700 leading-relaxed">');
    
    return { __html: '<div class="markdown-preview"><p class="mb-4 text-slate-700 leading-relaxed">' + html + '</p></div>' };
  };

  return (
    <div className="flex h-full relative">
      {/* Configuration Panel */}
      <div className="w-96 bg-white border-r border-slate-200 p-6 flex flex-col h-full overflow-y-auto shrink-0">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-lg font-bold text-slate-800">Brief Config</h2>
           <div className="flex bg-slate-100 rounded p-1">
             <button 
               onClick={() => setMode('SINGLE')}
               className={`px-2 py-1 text-xs font-semibold rounded ${mode === 'SINGLE' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
             >
               Single
             </button>
             <button 
               onClick={() => setMode('CLUSTER')}
               className={`px-2 py-1 text-xs font-semibold rounded ${mode === 'CLUSTER' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
             >
               Cluster
             </button>
           </div>
        </div>
        
        <div className="space-y-5">
          
          {/* Niche & Category Input (Generator) */}
          <div className="bg-blue-50 p-3 rounded border border-blue-100 mb-4">
            <label className="block text-xs font-bold text-blue-800 uppercase mb-1">
               <span className="flex items-center gap-1"><Lightbulb size={12} /> Idea Generator</span>
            </label>
            <div className="space-y-2">
              <input
                type="text"
                className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Niche (e.g., 'Digital Marketing')"
                value={nicheInput}
                onChange={(e) => setNicheInput(e.target.value)}
              />
              <input
                type="text"
                className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Category (e.g., 'SEO Tools')"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full p-2 border border-blue-200 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Sub-Category (e.g., 'AI Writing')"
                  value={subCategoryInput}
                  onChange={(e) => setSubCategoryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSuggestTopic()}
                />
                <button 
                  onClick={handleSuggestTopic}
                  disabled={isSuggesting || !nicheInput}
                  className="px-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 shadow-sm font-medium text-xs whitespace-nowrap"
                >
                  {isSuggesting ? <RefreshCw className="animate-spin" size={14} /> : 'Get Topic'}
                </button>
              </div>
            </div>
          </div>

          {/* Topic Input with Research */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Main Topic</label>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., AI Writing"
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
              />
              <button 
                onClick={handleResearch}
                disabled={isResearching}
                title="Auto-Research with Google"
                className="p-2 bg-indigo-50 text-indigo-600 rounded border border-indigo-200 hover:bg-indigo-100 disabled:opacity-50"
              >
                {isResearching ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Tip: Click Search to auto-fill audience & keywords.</p>
          </div>

          {mode === 'SINGLE' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Article Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setConfig({ ...config, type: ArticleType.PILLAR })}
                  className={`py-2 px-3 text-sm rounded border transition-all ${config.type === ArticleType.PILLAR ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300'}`}
                >
                  Pillar
                </button>
                <button
                  onClick={() => setConfig({ ...config, type: ArticleType.SATELLITE })}
                  className={`py-2 px-3 text-sm rounded border transition-all ${config.type === ArticleType.SATELLITE ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-300'}`}
                >
                  Satellite
                </button>
              </div>
            </div>
          )}

          {mode === 'CLUSTER' && (
             <div className="bg-indigo-50 p-3 rounded border border-indigo-100 text-xs text-indigo-800">
               <div className="font-bold flex items-center gap-2 mb-1"><Layers size={14}/> Cluster Mode Active</div>
               <p>Generates 1 Pillar (5000w) + 6 Satellites simultaneously.</p>
             </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Audience</label>
            <textarea
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
              value={config.audience}
              onChange={(e) => setConfig({ ...config, audience: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Main Keyword (H1)</label>
            <input
              type="text"
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., best ai tools"
              value={config.mainKeyword}
              onChange={(e) => setConfig({ ...config, mainKeyword: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Secondary Keywords</label>
            <input
              type="text"
              className="w-full p-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-2"
              placeholder="Add keyword..."
              onKeyDown={keywordInputHandler}
            />
            <div className="flex flex-wrap gap-2">
              {config.secondaryKeywords.map(kw => (
                <span key={kw} className="inline-flex items-center bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="ml-1 text-slate-400 hover:text-red-500">&times;</button>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={mode === 'SINGLE' ? handleGenerateSingle : handleGenerateCluster}
            disabled={isGenerating || !config.topic}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Wand2 size={18} />}
            {mode === 'SINGLE' ? 'Generate Article' : 'Generate Cluster (7)'}
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100">
           <div className="text-xs text-slate-400 font-mono space-y-1 h-32 overflow-y-auto">
             {logs.map(log => (
               <div key={log.timestamp} className={log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-500' : ''}>
                 [{new Date(log.timestamp).toLocaleTimeString()}] {log.text}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Content Preview Area */}
      <div className="flex-1 bg-slate-50 flex h-full overflow-hidden relative">
        {/* Cluster/Article Navigation Sidebar */}
        {generatedArticles.length > 0 && (
          <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0">
             <div className="p-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Database size={16} /> Generated Content
                </h3>
             </div>
             <div className="divide-y divide-slate-50">
               {generatedArticles.map(article => (
                 <button
                   key={article.id}
                   onClick={() => setActiveArticleId(article.id)}
                   className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${activeArticleId === article.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                 >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${article.type === ArticleType.PILLAR ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {article.type}
                      </span>
                      {article.validation && article.validation.keywordInH1 && (
                        <Check size={12} className="text-green-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-800 line-clamp-2">{article.title}</p>
                 </button>
               ))}
             </div>
          </div>
        )}

        {/* Main Preview */}
        <div className="flex-1 overflow-y-auto p-8">
        {currentArticle ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Metadata Card */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <span className="text-xs text-slate-400 uppercase font-bold">SEO Title (H1)</span>
                  <h1 className="text-xl font-bold text-slate-900">{currentArticle.title}</h1>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Slug</span>
                  <div className="font-mono text-sm text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded truncate max-w-full">{currentArticle.slug}</div>
                </div>
                <div className="md:col-span-2">
                  <span className="text-xs text-slate-400 uppercase font-bold">Meta Description</span>
                  <p className="text-sm text-slate-600">{currentArticle.metaDescription}</p>
                </div>
              </div>
              <div className="flex gap-2 border-t pt-4">
                <button 
                  onClick={() => setShowImageModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded transition-colors"
                >
                  <Palette size={16} />
                  Image Studio
                </button>

                <button 
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  {copied ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy MD'}
                </button>

                <button 
                  onClick={handleCopyAll}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                >
                  {copiedAll ? <Check size={16} className="text-green-600"/> : <ClipboardCopy size={16} />}
                  {copiedAll ? 'All Info' : 'Copy All'}
                </button>

                <div className="ml-auto flex items-center gap-2">
                  <button 
                    onClick={() => setShowHistory(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    <History size={16} />
                    History
                    {currentArticle.history?.length > 0 && (
                      <span className="bg-slate-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{currentArticle.history.length}</span>
                    )}
                  </button>

                  <button 
                    onClick={handleReview}
                    disabled={isReviewing}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                  >
                    {isReviewing ? <RefreshCw className="animate-spin" size={16} /> : <FileSearch size={16} />}
                    Manual Review
                  </button>
                </div>
              </div>
            </div>
            
            {/* Automated Checklist View (Integrated) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
               <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-700">Validation Status</h3>
               </div>
               <div className="p-0">
                  {currentArticle.validation ? (
                    <SeoChecklist validationResult={currentArticle.validation} />
                  ) : (
                    <div className="p-6 text-center text-slate-400">Validation data not available</div>
                  )}
               </div>
            </div>

            {/* Peer Review Result */}
            {reviewResult && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 animate-fade-in">
                <h3 className="text-orange-800 font-bold flex items-center gap-2 mb-3">
                  <FileSearch size={20} /> Review Feedback
                </h3>
                <div className="prose prose-sm prose-orange max-w-none whitespace-pre-wrap text-orange-900">
                   {reviewResult}
                </div>
              </div>
            )}

            {/* Main Content Editor (Visual Preview) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 min-h-[500px] p-8">
               {/* Use DangerouslySetInnerHTML to render the preview with images */}
               <div 
                 className="prose max-w-none font-sans text-slate-800"
                 dangerouslySetInnerHTML={renderMarkdownPreview(currentArticle.content)}
               />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <Wand2 size={48} className="text-slate-200" />
            <div className="text-center max-w-md">
              <p className="text-lg font-medium text-slate-500">Ready to draft</p>
              <p className="text-sm mb-4">
                Use the configuration panel to start research or generate content.
                Select "Cluster" mode to generate a full Pillar + 6 Satellites strategy at once.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Image Studio Modal */}
      {showImageModal && currentArticle && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-8">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                 <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                   <Palette className="text-purple-600" /> Image Studio
                 </h3>
                 <p className="text-sm text-slate-500 mt-1">Generate real AI images from article descriptions using Imagen 3.</p>
              </div>
              <button onClick={() => setShowImageModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
               {/* Aspect Ratio Controls */}
               <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Generation Settings</label>
                    <button
                      onClick={handleGenerateAllImages}
                      disabled={isBatchGenerating || detectedImages.every(img => !img.url.includes('placehold.co'))}
                      className="flex items-center gap-2 px-3 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isBatchGenerating ? <RefreshCw className="animate-spin" size={12} /> : <Zap size={12} />}
                      Generate All Images
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="text-sm text-slate-700">Aspect Ratio:</span>
                      <div className="flex gap-2">
                          {['16:9', '4:3', '1:1', '3:4', '9:16'].map(ratio => (
                              <button
                                  key={ratio}
                                  onClick={() => setSelectedAspectRatio(ratio)}
                                  className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                                      selectedAspectRatio === ratio 
                                      ? 'bg-purple-600 text-white border-purple-600' 
                                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                  }`}
                              >
                                  {ratio}
                              </button>
                          ))}
                      </div>
                  </div>
               </div>

               {detectedImages.length === 0 ? (
                 <div className="text-center py-12 text-slate-400">
                   <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
                   <p>No images detected in this article.</p>
                 </div>
               ) : (
                 detectedImages.map((img, idx) => {
                   const isGenerated = img.url.startsWith('data:image');
                   return (
                     <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex gap-4">
                       <div className="w-32 h-24 shrink-0 bg-slate-100 rounded overflow-hidden border border-slate-100 flex items-center justify-center relative">
                         <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                         {!isGenerated && <span className="absolute inset-0 bg-black/10 flex items-center justify-center text-xs font-bold text-white">Placeholder</span>}
                       </div>
                       <div className="flex-1 min-w-0">
                         <h4 className="font-semibold text-sm text-slate-700 mb-1">Image #{idx + 1}</h4>
                         <p className="text-xs text-slate-500 line-clamp-2 mb-3 bg-slate-50 p-2 rounded border border-slate-100 italic">
                           Prompt: "{img.alt}"
                         </p>
                         <div className="flex items-center gap-2">
                           {!isGenerated ? (
                             <button
                               onClick={() => handleGenerateRealImage(img)}
                               disabled={isGeneratingImage === img.index || isBatchGenerating}
                               className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded flex items-center gap-2 transition-all disabled:opacity-50"
                             >
                               {isGeneratingImage === img.index ? <RefreshCw className="animate-spin" size={12} /> : <Wand2 size={12} />}
                               Generate Real Image
                             </button>
                           ) : (
                             <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                               <Check size={12} /> Generated ({selectedAspectRatio})
                             </span>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })
               )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white text-xs text-slate-400 flex justify-between items-center">
               <span>Powered by Imagen 4</span>
               <button onClick={() => setShowImageModal(false)} className="text-slate-600 hover:underline">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer/Modal */}
      {showHistory && currentArticle && (
         <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-slate-200 z-40 flex flex-col animate-slide-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
               <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <History size={18} /> Version History
               </h3>
               <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
               {(!currentArticle.history || currentArticle.history.length === 0) ? (
                  <div className="text-center py-8 text-slate-400">
                     <p>No history available.</p>
                     <p className="text-xs mt-1">Modifications will appear here.</p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     <div className="relative pl-4 border-l-2 border-green-500">
                        <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <p className="text-xs font-bold text-green-600 uppercase mb-1">Current Version</p>
                        <p className="text-sm text-slate-800">Latest Edit</p>
                     </div>
                     
                     {currentArticle.history.map((version) => (
                        <div key={version.id} className="relative pl-4 border-l-2 border-slate-200 hover:border-blue-300 transition-colors group">
                           <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors"></div>
                           <div className="mb-1 flex justify-between items-start">
                             <span className="text-xs font-bold text-slate-500 uppercase">
                               {new Date(version.timestamp).toLocaleTimeString()} <span className="font-normal opacity-75">({new Date(version.timestamp).toLocaleDateString()})</span>
                             </span>
                           </div>
                           <p className="text-sm font-medium text-slate-800 mb-2">{version.note || "Auto-save"}</p>
                           <button 
                             onClick={() => handleRestoreVersion(version)}
                             className="text-xs flex items-center gap-1 text-blue-600 hover:underline"
                           >
                             <RotateCcw size={12} /> Restore this version
                           </button>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
};