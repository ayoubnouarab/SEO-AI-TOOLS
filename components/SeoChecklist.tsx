import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';
import { ChecklistItem, ValidationResult } from '../types';

interface SeoChecklistProps {
  validationResult?: ValidationResult;
}

export const SeoChecklist: React.FC<SeoChecklistProps> = ({ validationResult }) => {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', label: 'H1 unique et optimisé', category: 'Structure', checked: false },
    { id: '2', label: 'Balises H2/H3 cohérentes', category: 'Structure', checked: false },
    { id: '3', label: 'Mot-clé principal dans H1, Intro, H2', category: 'SEO', checked: false },
    { id: '4', label: 'Densité équilibrée (pas de keyword stuffing)', category: 'SEO', checked: false },
    { id: '5', label: '3–5 mots-clés secondaires intégrés', category: 'SEO', checked: false },
    { id: '6', label: 'Images optimisées (ALT / taille)', category: 'Quality', checked: false },
    { id: '7', label: 'Liens internes (Pilier <-> Satellites)', category: 'Structure', checked: false },
    { id: '8', label: 'Meta title & description SEO-friendly', category: 'SEO', checked: false },
    { id: '9', label: 'Phrases courtes (20 mots max)', category: 'Quality', checked: false },
    { id: '10', label: 'URL courte et optimisée', category: 'SEO', checked: false },
    { id: '11', label: 'Score SEO > 85 (Surfer / NeuronWriter)', category: 'SEO', checked: false },
  ]);

  // Auto-update based on validation result
  useEffect(() => {
    if (validationResult) {
      setItems(prev => prev.map(item => {
        let checked = item.checked;
        switch(item.id) {
          case '1': checked = validationResult.h1Present && validationResult.keywordInH1; break;
          case '2': checked = validationResult.structureValid; break;
          case '3': checked = validationResult.keywordInH1 && validationResult.introStructure; break;
          case '4': checked = validationResult.keywordDensity === 'Good'; break;
          case '5': checked = validationResult.secondaryKeywordsCount >= 3; break;
          case '7': checked = validationResult.linksPresent; break;
          case '8': checked = true; // Generated automatically
          case '9': checked = validationResult.shortSentences; break;
          case '10': checked = true; // Generated automatically
          default: break;
        }
        return { ...item, checked };
      }));
    }
  }, [validationResult]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const progress = Math.round((items.filter(i => i.checked).length / items.length) * 100);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Validation & Publication Checklist</h2>
          <p className="text-slate-500">
            {validationResult ? 'Automated Analysis Based on Generated Content' : 'Manual Validation Step'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border">
          <span className="text-sm font-medium text-slate-600">Score:</span>
          <span className={`font-bold text-lg ${progress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
            {progress}%
          </span>
        </div>
      </div>

      {validationResult && (
         <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
           <AlertTriangle className="text-blue-600 shrink-0" size={20} />
           <div>
             <h4 className="font-bold text-blue-800 text-sm">Auto-Analysis Active</h4>
             <p className="text-xs text-blue-700 mt-1">
               Some items have been automatically checked based on the generated content analysis. 
               Review manually for accuracy, especially "Quality" items and SEO Score.
             </p>
           </div>
         </div>
      )}

      <div className="space-y-6">
        {['Structure', 'SEO', 'Quality'].map(category => (
          <div key={category} className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">{category}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {items.filter(i => i.category === category).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                >
                  {item.checked ? (
                    <CheckCircle2 className="text-green-500 group-hover:text-green-600 transition-colors" />
                  ) : (
                    <Circle className="text-slate-300 group-hover:text-slate-400 transition-colors" />
                  )}
                  <span className={`${item.checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};