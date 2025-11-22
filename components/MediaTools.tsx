import React, { useState } from 'react';
import { Image as ImageIcon, Video, Mic, Wand2, RefreshCw, Download, Play, Zap, Upload, FileAudio } from 'lucide-react';
import { generateRealImage, generateVideo, generateSpeech, generateAudioMimic } from '../services/geminiService';

// --- IMAGE GENERATOR VIEW ---
export const ImageGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const img = await generateRealImage(prompt, aspectRatio);
      setResultImage(img);
    } catch (e) {
      alert('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in pb-20">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <ImageIcon className="text-purple-600" size={32} />
           <h1 className="text-3xl font-bold text-slate-900">AI Image Generator</h1>
        </div>
        <p className="text-slate-500 text-lg">Create visuals using Imagen 4 / Nano Banana.</p>
      </header>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Prompt</label>
               <textarea 
                 className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                 rows={3}
                 placeholder="Describe the image you want to generate..."
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
               />
            </div>
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Aspect Ratio</label>
               <div className="flex gap-2">
                 {['16:9', '4:3', '1:1', '9:16'].map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-4 py-2 text-sm font-medium rounded border ${aspectRatio === ratio ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-300'}`}
                    >
                      {ratio}
                    </button>
                 ))}
               </div>
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={20} />}
              Generate Image
            </button>
         </div>
      </div>

      {resultImage && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-700 mb-4">Result</h3>
           <img src={resultImage} alt="Generated" className="w-full h-auto rounded-lg shadow-md" />
           <a href={resultImage} download="generated-image.jpg" className="mt-4 inline-flex items-center gap-2 text-sm text-purple-600 hover:underline font-medium">
              <Download size={16} /> Download Image
           </a>
        </div>
      )}
    </div>
  );
};

// --- VIDEO GENERATOR VIEW ---
export const VideoGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultVideo, setResultVideo] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    try {
      const videoUrl = await generateVideo(prompt);
      setResultVideo(videoUrl);
    } catch (e) {
      alert('Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in pb-20">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <Video className="text-red-600" size={32} />
           <h1 className="text-3xl font-bold text-slate-900">AI Video Generator</h1>
        </div>
        <p className="text-slate-500 text-lg">Create 720p videos using Google Veo.</p>
      </header>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Prompt</label>
               <textarea 
                 className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                 rows={3}
                 placeholder="Describe the video (e.g., A neon hologram of a cat driving at top speed)..."
                 value={prompt}
                 onChange={(e) => setPrompt(e.target.value)}
               />
            </div>
            <div className="bg-red-50 p-3 rounded text-xs text-red-800 border border-red-100">
               Note: Video generation can take 1-2 minutes. Please stay on this page.
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
              Generate Video
            </button>
         </div>
      </div>

      {resultVideo && (
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
           <h3 className="font-bold text-slate-700 mb-4">Result</h3>
           <video controls className="w-full h-auto rounded-lg shadow-md" src={resultVideo}></video>
           <a href={resultVideo} download="generated-video.mp4" className="mt-4 inline-flex items-center gap-2 text-sm text-red-600 hover:underline font-medium">
              <Download size={16} /> Download Video
           </a>
        </div>
      )}
    </div>
  );
};

// --- AUDIO GENERATOR VIEW ---
export const AudioGeneratorView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'TTS' | 'MIMIC'>('TTS');

  // TTS State
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [isGeneratingTTS, setIsGeneratingTTS] = useState(false);
  const [resultAudioTTS, setResultAudioTTS] = useState<string | null>(null);

  // Mimic State
  const [mimicFile, setMimicFile] = useState<File | null>(null);
  const [mimicText, setMimicText] = useState('');
  const [isGeneratingMimic, setIsGeneratingMimic] = useState(false);
  const [resultAudioMimic, setResultAudioMimic] = useState<string | null>(null);

  const handleGenerateTTS = async () => {
    if (!text) return;
    setIsGeneratingTTS(true);
    try {
      const audioUrl = await generateSpeech(text, voice);
      setResultAudioTTS(audioUrl);
    } catch (e) {
      alert('Failed to generate audio');
    } finally {
      setIsGeneratingTTS(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMimicFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerateMimic = async () => {
    if (!mimicFile || !mimicText) return;
    setIsGeneratingMimic(true);
    try {
      const base64 = await fileToBase64(mimicFile);
      const audioUrl = await generateAudioMimic(base64, mimicText);
      setResultAudioMimic(audioUrl);
    } catch (e) {
      console.error(e);
      alert('Failed to generate mimic audio');
    } finally {
      setIsGeneratingMimic(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-fade-in pb-20">
      <header className="mb-8 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
           <Mic className="text-green-600" size={32} />
           <h1 className="text-3xl font-bold text-slate-900">AI Audio Generator</h1>
        </div>
        <p className="text-slate-500 text-lg">Generate speech using Gemini Flash Audio.</p>
      </header>

      <div className="flex gap-2 mb-4">
         <button 
           onClick={() => setActiveTab('TTS')}
           className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'TTS' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border'}`}
         >
            Text to Speech (Standard)
         </button>
         <button 
           onClick={() => setActiveTab('MIMIC')}
           className={`px-4 py-2 rounded text-sm font-medium ${activeTab === 'MIMIC' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border'}`}
         >
            Voice Mimic (Experimental)
         </button>
      </div>

      {activeTab === 'TTS' ? (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Text</label>
                 <textarea 
                   className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                   rows={4}
                   placeholder="Enter text to speak..."
                   value={text}
                   onChange={(e) => setText(e.target.value)}
                 />
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">Voice</label>
                 <select 
                   className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                   value={voice}
                   onChange={(e) => setVoice(e.target.value)}
                 >
                   <option value="Kore">Kore (Female, Calm)</option>
                   <option value="Puck">Puck (Male, Deep)</option>
                   <option value="Charon">Charon (Male, Authoritative)</option>
                   <option value="Fenrir">Fenrir (Male, Fast)</option>
                   <option value="Zephyr">Zephyr (Female, Soft)</option>
                 </select>
              </div>
              <button
                onClick={handleGenerateTTS}
                disabled={isGeneratingTTS || !text}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingTTS ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} />}
                Generate Audio
              </button>
           </div>
           {resultAudioTTS && (
            <div className="mt-6 pt-6 border-t border-slate-100">
               <h3 className="font-bold text-slate-700 mb-4">Result</h3>
               <audio controls className="w-full" src={resultAudioTTS}></audio>
               <a href={resultAudioTTS} download="generated-audio.wav" className="mt-4 inline-flex items-center gap-2 text-sm text-green-600 hover:underline font-medium">
                  <Download size={16} /> Download Audio
               </a>
            </div>
           )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
           <div className="bg-green-50 border border-green-100 rounded p-3 text-xs text-green-800 mb-4">
             <h4 className="font-bold mb-1">Experimental Feature</h4>
             <p>Upload a clear audio clip of your voice. The AI will attempt to mimic the tone and style to read your new text.</p>
           </div>
           
           <div className="space-y-4">
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">1. Upload Reference Voice</label>
                 <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors relative">
                    <input 
                       type="file" 
                       accept="audio/*" 
                       onChange={handleFileChange}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileAudio size={32} className="text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">{mimicFile ? mimicFile.name : "Click or Drag audio file here"}</p>
                    <p className="text-xs text-slate-400 mt-1">MP3, WAV, AAC supported</p>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-2">2. Text to Speak</label>
                 <textarea 
                   className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                   rows={3}
                   placeholder="What should the voice say?"
                   value={mimicText}
                   onChange={(e) => setMimicText(e.target.value)}
                 />
              </div>

              <button
                onClick={handleGenerateMimic}
                disabled={isGeneratingMimic || !mimicFile || !mimicText}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isGeneratingMimic ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} />}
                Clone & Speak
              </button>
           </div>
           
           {resultAudioMimic && (
            <div className="mt-6 pt-6 border-t border-slate-100">
               <h3 className="font-bold text-slate-700 mb-4">Result</h3>
               <audio controls className="w-full" src={resultAudioMimic}></audio>
               <a href={resultAudioMimic} download="mimic-audio.wav" className="mt-4 inline-flex items-center gap-2 text-sm text-green-600 hover:underline font-medium">
                  <Download size={16} /> Download Result
               </a>
            </div>
           )}
        </div>
      )}
    </div>
  );
};