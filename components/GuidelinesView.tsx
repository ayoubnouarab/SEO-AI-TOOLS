import React from 'react';
import { BookOpen, CheckCircle, Users, Zap, Layers, ArrowRight } from 'lucide-react';

export const GuidelinesView: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-10 animate-fade-in pb-20">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <BookOpen className="text-blue-600" size={32} />
           <h1 className="text-3xl font-bold text-slate-900">Rédaction – Guidelines – Relecture</h1>
        </div>
        <p className="text-slate-500 text-lg">Documentation officielle pour la stratégie SEO "AI Tools" (Ayoub Nouar).</p>
      </header>

      {/* Section 1: Règles Générales */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-slate-800 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
          Règles générales de rédaction
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-bold text-slate-700 mb-3 border-b pb-2">📝 Ton & Style</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-start gap-2"><span className="text-blue-500">•</span> Clair, accessible, pédagogique.</li>
              <li className="flex items-start gap-2"><span className="text-blue-500">•</span> Pas de phrases longues (<strong>20 mots max</strong>).</li>
              <li className="flex items-start gap-2"><span className="text-blue-500">•</span> Paragraphes courts (2–4 lignes).</li>
              <li className="flex items-start gap-2"><span className="text-blue-500">•</span> Ton neutre, professionnel, sans remplissage.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-700 mb-3 border-b pb-2">🧩 Structure standard</h3>
            <ul className="space-y-2 text-slate-600 text-sm">
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> <strong>H1 unique</strong> (mot-clé principal intégré).</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Introduction (Problème → Promesse → Plan).</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> H2 (Idées principales).</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> H3 (Sous-parties + détails).</li>
              <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Conclusion + CTA + Lien Pilier.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Articles: Pilier vs Satellite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 2: Pilier */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
            <span className="bg-indigo-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
            Article PILIER (Master)
          </h2>
          <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 h-full hover:shadow-md transition-shadow">
            <div className="mb-4">
              <p className="text-indigo-900 font-medium">Le contenu le plus complet de la niche.</p>
            </div>
            <ul className="space-y-3 text-sm text-indigo-800">
              <li className="flex items-center gap-2 bg-white/50 p-2 rounded">
                <span className="text-xl">📏</span> 
                <span>Longueur : <strong>4 800 – 5 000 mots</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500">➤</span> Toutes les facettes du sujet.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500">➤</span> Définitions + concepts + exemples.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-indigo-500">➤</span> Insérer un lien vers chaque satellite.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Satellite */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
             <span className="bg-emerald-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
             Article SATELLITE
          </h2>
          <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100 h-full hover:shadow-md transition-shadow">
            <div className="mb-4">
              <p className="text-emerald-900 font-medium">Répond à une question spécifique.</p>
            </div>
            <ul className="space-y-3 text-sm text-emerald-800">
              <li className="flex items-center gap-2 bg-white/50 p-2 rounded">
                <span className="text-xl">📏</span> 
                <span>Longueur : <strong>800 – 1 500 mots</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-500">➤</span> Angle unique, pas de généralités.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-500">➤</span> Renvoyer vers le Pilier.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-500">➤</span> Lier un autre satellite si pertinent.
              </li>
            </ul>
          </div>
        </section>
      </div>

      {/* Section 4, 5, 6: Processus */}
      <section className="space-y-4">
         <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Layers size={20} /> Workflow & Validation
         </h2>
         <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
            
            {/* Relecture */}
            <div className="p-6 flex gap-4">
               <div className="bg-orange-100 text-orange-600 p-3 rounded-lg h-fit"><Users size={20} /></div>
               <div>
                  <h3 className="font-bold text-slate-800">4. Relecture Croisée</h3>
                  <p className="text-sm text-slate-600 mt-1">Chaque auteur relit 2 articles d'un autre membre sur Google Docs.</p>
                  <div className="mt-2 text-xs bg-orange-50 text-orange-800 p-2 rounded inline-block">
                     <strong>Points clés :</strong> Clarté, Structure, Orthographe, Ton, Liens internes.
                  </div>
               </div>
            </div>

            {/* SEO Checklist Summary */}
            <div className="p-6 flex gap-4">
               <div className="bg-blue-100 text-blue-600 p-3 rounded-lg h-fit"><CheckCircle size={20} /></div>
               <div>
                  <h3 className="font-bold text-slate-800">5. Validation SEO (Checklist)</h3>
                  <p className="text-sm text-slate-600 mt-1">Voir l'onglet "Validation Checklist" pour l'outil interactif.</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs border border-slate-200 px-2 py-1 rounded text-slate-500">H1 Unique</span>
                    <span className="text-xs border border-slate-200 px-2 py-1 rounded text-slate-500">Densité Mot-Clé</span>
                    <span className="text-xs border border-slate-200 px-2 py-1 rounded text-slate-500">3-5 Mots-clés secondaires</span>
                    <span className="text-xs border border-slate-200 px-2 py-1 rounded text-slate-500">Score {'>'} 85</span>
                  </div>
               </div>
            </div>

            {/* Publication Pipeline */}
            <div className="p-6 flex gap-4 bg-slate-50">
               <div className="bg-slate-200 text-slate-600 p-3 rounded-lg h-fit"><ArrowRight size={20} /></div>
               <div>
                  <h3 className="font-bold text-slate-800">6. Pipeline de Publication</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm font-medium text-slate-700">
                     <span>1. Auteur</span>
                     <span className="text-slate-400">→</span>
                     <span>2. Relecture</span>
                     <span className="text-slate-400">→</span>
                     <span>3. Optimisation SEO</span>
                     <span className="text-slate-400">→</span>
                     <span>4. Mise en page (WP)</span>
                     <span className="text-slate-400">→</span>
                     <span className="text-green-600">5. Publié</span>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Section 7: Conseils d'experts */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-amber-700 flex items-center gap-2">
           <Zap size={20} /> 7. Conseils d’experts (À suivre absolument)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 text-amber-900">
               <h4 className="font-bold mb-2">💡 1. Une personne précise</h4>
               <p className="text-sm">Imagine un lecteur exact (ex: Salma, 28 ans). Écris pour elle, pas pour tout le monde.</p>
            </div>
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 text-amber-900">
               <h4 className="font-bold mb-2">💡 2. Utilité des paragraphes</h4>
               <p className="text-sm">Chaque paragraphe doit avoir un but. Si ça ne sert à rien → Supprimer.</p>
            </div>
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 text-amber-900">
               <h4 className="font-bold mb-2">💡 3. Un article = un message</h4>
               <p className="text-sm">Pas de dispersion. Concentre-toi sur le message clé.</p>
            </div>
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 text-amber-900">
               <h4 className="font-bold mb-2">💡 4. Maillage Cohérent</h4>
               <p className="text-sm">Pilier → Satellites. Satellites → Pilier. Google aime la cohérence.</p>
            </div>
        </div>
      </section>
    </div>
  );
};