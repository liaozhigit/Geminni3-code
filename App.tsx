import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { StepCard } from './components/StepCard';
import { AssetGrid } from './components/AssetGrid';
import { AppStep, ImageAsset } from './types';
import { PRESET_PEOPLE, PRESET_CLOTHES } from './constants';
import { generateClothingAsset, generateTryOnResult } from './services/geminiService';
import { blobToBase64, urlToBase64, getDisplayUrl } from './services/imageUtils';

const App = () => {
  // State
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_PERSON);
  const [people, setPeople] = useState<ImageAsset[]>(PRESET_PEOPLE);
  const [clothes, setClothes] = useState<ImageAsset[]>(PRESET_CLOTHES);
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedClothId, setSelectedClothId] = useState<string | null>(null);
  
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  
  const [clothingPrompt, setClothingPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCloth, setIsGeneratingCloth] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper to find selected assets
  const selectedPerson = people.find(p => p.id === selectedPersonId);
  const selectedCloth = clothes.find(c => c.id === selectedClothId);

  // Handlers
  const handlePersonUpload = async (file: File) => {
    try {
      const base64 = await blobToBase64(file);
      const url = URL.createObjectURL(file);
      const newAsset: ImageAsset = {
        id: Math.random().toString(36).substring(7),
        url,
        base64,
        type: 'upload'
      };
      setPeople([newAsset, ...people]);
      setSelectedPersonId(newAsset.id);
    } catch (e) {
      setErrorMsg("上传图片失败");
    }
  };

  const handleClothUpload = async (file: File) => {
    try {
      const base64 = await blobToBase64(file);
      const url = URL.createObjectURL(file);
      const newAsset: ImageAsset = {
        id: Math.random().toString(36).substring(7),
        url,
        base64,
        type: 'upload'
      };
      setClothes([newAsset, ...clothes]);
      setSelectedClothId(newAsset.id);
    } catch (e) {
      setErrorMsg("上传图片失败");
    }
  };

  const handleGenerateCloth = async () => {
    if (!clothingPrompt.trim()) return;
    setIsGeneratingCloth(true);
    setErrorMsg(null);
    try {
      const base64 = await generateClothingAsset(clothingPrompt);
      const url = getDisplayUrl(base64, 'image/jpeg');
      const newAsset: ImageAsset = {
        id: Math.random().toString(36).substring(7),
        url,
        base64,
        type: 'generated'
      };
      setClothes([newAsset, ...clothes]);
      setSelectedClothId(newAsset.id);
      setClothingPrompt('');
    } catch (e) {
      console.error(e);
      setErrorMsg("生成衣服失败，请稍后重试。");
    } finally {
      setIsGeneratingCloth(false);
    }
  };

  const handleTryOn = async () => {
    if (!selectedPerson || !selectedCloth) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setResultImage(null);
    setStep(AppStep.RESULT); // Move to visual state

    try {
        // Ensure we have base64 for person
        let personB64 = selectedPerson.base64;
        if (!personB64) {
            personB64 = await urlToBase64(selectedPerson.url);
        }

        // Ensure we have base64 for cloth
        let clothB64 = selectedCloth.base64;
        if (!clothB64) {
            clothB64 = await urlToBase64(selectedCloth.url);
        }

        const resultBase64 = await generateTryOnResult(personB64, clothB64);
        const resultUrl = getDisplayUrl(resultBase64, 'image/jpeg');
        
        setResultImage(resultUrl);
        setHistory(prev => [resultUrl, ...prev]);

    } catch (e) {
        console.error(e);
        setErrorMsg("试穿生成失败。可能是网络问题或图片无法访问 (CORS)。");
        setStep(AppStep.SELECT_CLOTH); // Go back
    } finally {
        setIsGenerating(false);
    }
  };

  // UI Render Helpers
  const renderOperations = () => {
    if (step === AppStep.SELECT_PERSON) {
      return (
        <div className="animate-fade-in-up">
           <AssetGrid 
             title="选择模特" 
             assets={people} 
             selectedId={selectedPersonId} 
             onSelect={(a) => setSelectedPersonId(a.id)}
             onUpload={handlePersonUpload}
           />
           <div className="mt-8 flex justify-center">
             <button 
               onClick={() => setStep(AppStep.SELECT_CLOTH)}
               disabled={!selectedPersonId}
               className={`
                 px-8 py-3 rounded-full text-white font-semibold shadow-lg transition-all transform
                 ${selectedPersonId ? 'bg-primary hover:bg-black hover:scale-105' : 'bg-gray-300 cursor-not-allowed'}
               `}
             >
               下一步：选择服装
             </button>
           </div>
        </div>
      );
    }

    if (step === AppStep.SELECT_CLOTH) {
      return (
        <div className="animate-fade-in-up space-y-8">
           {/* Context of Step 1 */}
           {selectedPerson && (
             <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto">
               <span className="text-sm text-gray-500 ml-2">当前模特:</span>
               <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                 <img src={selectedPerson.url} alt="Selected Person" className="w-full h-full object-cover" />
               </div>
               <button 
                onClick={() => setStep(AppStep.SELECT_PERSON)}
                className="text-xs text-accent hover:underline ml-auto mr-2"
               >
                 更换
               </button>
             </div>
           )}

           {/* AI Gen Cloth */}
           <div className="bg-gradient-to-r from-purple-50 to-white p-5 rounded-2xl border border-purple-100">
             <label className="block text-sm font-medium text-gray-700 mb-2">AI 设计服装 (Nano Banana)</label>
             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={clothingPrompt}
                 onChange={(e) => setClothingPrompt(e.target.value)}
                 placeholder="例如：一件红色的复古夹克，丝绸材质..."
                 className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50"
                 onKeyDown={(e) => e.key === 'Enter' && handleGenerateCloth()}
               />
               <button 
                 onClick={handleGenerateCloth}
                 disabled={isGeneratingCloth || !clothingPrompt.trim()}
                 className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${isGeneratingCloth || !clothingPrompt.trim() ? 'bg-purple-300' : 'bg-accent hover:bg-purple-700'}`}
               >
                 {isGeneratingCloth ? '生成中...' : '生成'}
               </button>
             </div>
           </div>

           <AssetGrid 
             title="选择或上传服装" 
             assets={clothes} 
             selectedId={selectedClothId} 
             onSelect={(a) => setSelectedClothId(a.id)}
             onUpload={handleClothUpload}
           />

           <div className="flex justify-center gap-4">
             <button 
                onClick={() => setStep(AppStep.SELECT_PERSON)}
                className="px-6 py-3 rounded-full text-gray-600 bg-gray-200 hover:bg-gray-300 transition-colors"
             >
               上一步
             </button>
             <button 
               onClick={handleTryOn}
               disabled={!selectedClothId}
               className={`
                 px-8 py-3 rounded-full text-white font-semibold shadow-lg transition-all transform flex items-center gap-2
                 ${selectedClothId ? 'bg-primary hover:bg-black hover:scale-105' : 'bg-gray-300 cursor-not-allowed'}
               `}
             >
               <span className="text-xl">✨</span> 开始试穿
             </button>
           </div>
        </div>
      );
    }

    if (step === AppStep.RESULT) {
      return (
        <div className="flex flex-col items-center justify-center animate-fade-in-up">
           {isGenerating ? (
             <div className="flex flex-col items-center p-12 text-center">
               <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-gray-500 font-medium">Nano Banana 正在为您施展魔法...</p>
               <p className="text-gray-400 text-sm mt-2">正在合成全身效果</p>
             </div>
           ) : resultImage ? (
             <div className="space-y-6 w-full max-w-md">
               <div className="w-full bg-white p-2 rounded-2xl shadow-xl border border-gray-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <img src={resultImage} alt="Try On Result" className="w-full rounded-xl" />
               </div>
               
               <div className="flex justify-center gap-4">
                 <button 
                    onClick={() => setStep(AppStep.SELECT_CLOTH)}
                    className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                 >
                   再试一件
                 </button>
                 <a 
                    href={resultImage} 
                    download={`try-on-${Date.now()}.jpg`}
                    className="flex-1 px-6 py-3 rounded-xl bg-primary hover:bg-black text-white font-medium text-center transition-colors shadow-lg"
                 >
                   保存照片
                 </a>
               </div>
             </div>
           ) : (
             <div className="text-red-500 p-4 bg-red-50 rounded-lg">
                {errorMsg || "未知错误"}
                <button onClick={() => setStep(AppStep.SELECT_CLOTH)} className="block mt-2 text-primary underline">返回重试</button>
             </div>
           )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Header / Top Section */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold tracking-tight text-primary flex items-center gap-2">
                <span className="text-2xl text-accent">◈</span> 
                Nano Try-On
            </h1>
            {!process.env.API_KEY && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Missing API Key</span>
            )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Top Cards Visualization */}
        <div className="flex justify-center items-center gap-2 md:gap-8 mb-12 h-64 perspective-1000">
          <StepCard 
            stepNumber={1} 
            title="模特" 
            isActive={step === AppStep.SELECT_PERSON} 
            isCompleted={!!selectedPersonId}
            image={selectedPerson?.url}
            rotationClass="-rotate-6 translate-y-2 hover:rotate-0"
            onClick={() => setStep(AppStep.SELECT_PERSON)}
          />
          <StepCard 
            stepNumber={2} 
            title="服饰" 
            isActive={step === AppStep.SELECT_CLOTH} 
            isCompleted={!!selectedClothId}
            image={selectedCloth?.url}
            rotationClass="rotate-0 z-10 -translate-y-2"
            onClick={() => selectedPersonId && setStep(AppStep.SELECT_CLOTH)}
          />
          <StepCard 
            stepNumber={3} 
            title="效果" 
            isActive={step === AppStep.RESULT} 
            isCompleted={!!resultImage}
            image={resultImage || undefined}
            rotationClass="rotate-6 translate-y-2 hover:rotate-0"
            onClick={() => resultImage && setStep(AppStep.RESULT)}
          />
        </div>

        {/* Error Message Toast */}
        {errorMsg && !isGenerating && !isGeneratingCloth && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex justify-between items-center">
                <p className="text-red-700 text-sm">{errorMsg}</p>
                <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">&times;</button>
            </div>
        )}

        {/* Operation Area */}
        <div className="min-h-[400px]">
           {renderOperations()}
        </div>

        {/* Gallery */}
        {history.length > 0 && (
            <div className="mt-20 border-t border-gray-200 pt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">历史记录</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x">
                    {history.map((img, idx) => (
                        <div key={idx} className="snap-start shrink-0 w-24 h-32 md:w-32 md:h-44 rounded-lg overflow-hidden shadow-md cursor-pointer hover:opacity-90">
                            <img src={img} alt={`History ${idx}`} className="w-full h-full object-cover" onClick={() => setResultImage(img)} />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);