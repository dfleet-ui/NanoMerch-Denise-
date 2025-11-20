import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ImagePreview } from './components/ImagePreview';
import { Button } from './components/Button';
import { StoryboardView } from './components/StoryboardView';
import { GeneratedImage, Scenario, ScenarioOption, StoryboardItem } from './types';
import { SCENARIOS, ICON_MAP } from './constants';
import { fileToGenerativePart, generateMarketingImage } from './services/geminiService';
import { Sparkles, Wand2, Download, AlertCircle, Check, Plus, LayoutTemplate } from 'lucide-react';

const App: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<ScenarioOption | null>(null);

  // Storyboard state
  const [storyboardItems, setStoryboardItems] = useState<StoryboardItem[]>([]);
  const [showStoryboard, setShowStoryboard] = useState(false);

  // Auto-select first scenario on load
  useEffect(() => {
    if (!selectedScenarioId && SCENARIOS.length > 0) {
      handleSelectScenario(SCENARIOS[0]);
    }
  }, []);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenarioId(scenario.id);
    if (scenario.options?.colors && scenario.options.colors.length > 0) {
      setSelectedColor(scenario.options.colors[0]);
    } else {
      setSelectedColor(null);
    }
  };

  const handleGenerate = async () => {
    if (!sourceFile) return;

    setIsGenerating(true);
    setError(null);

    try {
      const imagePart = await fileToGenerativePart(sourceFile);
      
      let prompt = '';
      let type: 'preset' | 'custom' = 'custom';
      
      if (activeTab === 'presets' && selectedScenarioId) {
        const scenario = SCENARIOS.find(s => s.id === selectedScenarioId);
        if (scenario) {
          prompt = scenario.promptTemplate;
          if (selectedColor) {
            prompt = prompt.replace('{color}', selectedColor.value);
          } else {
            prompt = prompt.replace('{color}', 'white');
          }
          type = 'preset';
        }
      } else if (activeTab === 'custom' && customPrompt) {
        prompt = `Edit this image: ${customPrompt}. Maintain product consistency. Output a high quality image.`;
        type = 'custom';
      }

      if (!prompt) throw new Error("No prompt provided");

      const generatedBase64 = await generateMarketingImage(imagePart.data, imagePart.mimeType, prompt);

      const newImage: GeneratedImage = {
        id: Math.random().toString(36).substring(7),
        url: generatedBase64,
        prompt: prompt,
        timestamp: Date.now(),
        scenarioType: type
      };

      setGeneratedImages(prev => [newImage, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addToStoryboard = (image: GeneratedImage) => {
    // Find scenario if it's a preset to get defaults
    let title = 'Custom Product';
    let features = '- High quality print\n- Durable material\n- Custom design';
    let price = '$0.00';

    if (image.scenarioType === 'preset') {
        // We try to guess the scenario based on the prompt or if we tracked the scenario ID in GeneratedImage. 
        // To keep it simple, we'll just look at the current selection if it matches or default to a generic "Generated Item".
        // ideally GeneratedImage should store scenarioId. 
        // For now, let's iterate scenarios to see if prompt matches template roughly or just default to generic.
        // Actually, let's improve the lookup.
        const scenario = SCENARIOS.find(s => image.prompt.includes(s.name) || (s.defaultSpecs && image.prompt.includes(s.name.split(' ')[0]))); // Loose match
        
        // Better approach: Let's just map simple text for now since we didn't store scenarioId in GeneratedImage type initially.
        // But wait, we can infer it or just use generic defaults.
        // Let's try to find a matching scenario by checking keywords in the prompt.
        const found = SCENARIOS.find(s => image.prompt.includes(s.promptTemplate.split(' ')[0].substring(0, 10)));
        
        // Fallback: user can edit it.
        if (found) {
            title = found.name;
            if (found.defaultSpecs) {
                features = found.defaultSpecs.features.map(f => `* ${f}`).join('\n');
                price = found.defaultSpecs.price;
            }
        } else {
             // Check specific keywords
             if(image.prompt.includes('mug')) {
                 const s = SCENARIOS.find(x => x.id === 'coffee-mug');
                 if(s) { title = s.name; features = s.defaultSpecs!.features.map(f => `* ${f}`).join('\n'); price = s.defaultSpecs!.price; }
             } else if (image.prompt.includes('hoodie')) {
                 const s = SCENARIOS.find(x => x.id === 'hoodie');
                 if(s) { title = s.name; features = s.defaultSpecs!.features.map(f => `* ${f}`).join('\n'); price = s.defaultSpecs!.price; }
             } else if (image.prompt.includes('cap') || image.prompt.includes('hat')) {
                 const s = SCENARIOS.find(x => x.id === 'baseball-cap');
                 if(s) { title = s.name; features = s.defaultSpecs!.features.map(f => `* ${f}`).join('\n'); price = s.defaultSpecs!.price; }
             } else if (image.prompt.includes('T-Shirt')) {
                 const s = SCENARIOS.find(x => x.id === 't-shirt');
                 if(s) { title = s.name; features = s.defaultSpecs!.features.map(f => `* ${f}`).join('\n'); price = s.defaultSpecs!.price; }
             }
        }
    }

    const newItem: StoryboardItem = {
      id: Math.random().toString(36).substring(7),
      image,
      title,
      features,
      price,
      description: ''
    };

    setStoryboardItems(prev => [...prev, newItem]);
    setShowStoryboard(true); // Optional: Auto open or just notify
  };

  const removeFromStoryboard = (id: string) => {
    setStoryboardItems(prev => prev.filter(item => item.id !== id));
  };

  const selectedScenario = SCENARIOS.find(s => s.id === selectedScenarioId);

  if (showStoryboard) {
    return (
      <StoryboardView 
        items={storyboardItems} 
        onClose={() => setShowStoryboard(false)} 
        onRemoveItem={removeFromStoryboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header 
        storyboardCount={storyboardItems.length} 
        onOpenStoryboard={() => setShowStoryboard(true)} 
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">1</span>
                Source Product
              </h2>
              
              {!sourceFile ? (
                <UploadZone onImageSelect={setSourceFile} />
              ) : (
                <ImagePreview file={sourceFile} onRemove={() => setSourceFile(null)} />
              )}
            </div>

            {sourceFile && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">2</span>
                  Configure & Generate
                </h2>

                <div className="flex rounded-lg bg-zinc-900 p-1">
                  <button
                    onClick={() => setActiveTab('presets')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                      activeTab === 'presets' 
                        ? 'bg-zinc-800 text-white shadow' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Merch Presets
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                      activeTab === 'custom' 
                        ? 'bg-zinc-800 text-white shadow' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Custom Edit
                  </button>
                </div>

                {activeTab === 'presets' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      {SCENARIOS.map((scenario) => (
                        <button
                          key={scenario.id}
                          disabled={isGenerating}
                          onClick={() => handleSelectScenario(scenario)}
                          className={`group relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all disabled:opacity-50 ${
                            selectedScenarioId === scenario.id
                              ? 'border-indigo-500 bg-zinc-800 ring-1 ring-indigo-500'
                              : 'border-zinc-800 bg-zinc-900/50 hover:border-indigo-500/50 hover:bg-zinc-800'
                          }`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            selectedScenarioId === scenario.id ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
                          }`}>
                            {ICON_MAP[scenario.iconName] || <Sparkles />}
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${selectedScenarioId === scenario.id ? 'text-white' : 'text-zinc-200'}`}>
                              {scenario.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedScenario?.options?.colors && (
                      <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Select Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {selectedScenario.options.colors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setSelectedColor(color)}
                              title={color.label}
                              className={`relative h-8 w-8 rounded-full border-2 shadow-sm transition-all ${
                                selectedColor?.value === color.value 
                                  ? 'border-indigo-500 scale-110 ring-2 ring-indigo-500/30' 
                                  : 'border-transparent hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            >
                              {selectedColor?.value === color.value && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <Check className={`h-4 w-4 ${['white', 'heather grey'].includes(color.value) ? 'text-black' : 'text-white'}`} />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500">
                          Selected: <span className="text-zinc-300">{selectedColor?.label}</span>
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedScenarioId}
                      className="w-full"
                      size="lg"
                      icon={<Wand2 className="w-4 h-4" />}
                    >
                      {isGenerating ? 'Generating Asset...' : `Generate ${selectedScenario?.name || 'Asset'}`}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe how you want to modify this image (e.g., 'Add a vintage filter', 'Place on a marble table')"
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[120px]"
                    />
                    <Button 
                      onClick={handleGenerate}
                      disabled={!customPrompt.trim() || isGenerating}
                      className="w-full"
                      icon={<Wand2 className="w-4 h-4" />}
                    >
                      Generate Custom
                    </Button>
                  </div>
                )}
                
                {error && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Gallery */}
          <div className="lg:col-span-8">
             <h2 className="mb-6 text-lg font-semibold text-white flex items-center justify-between">
               <span>Generated Assets</span>
               {generatedImages.length > 0 && (
                 <span className="text-sm font-normal text-zinc-500">{generatedImages.length} results</span>
               )}
             </h2>

             {generatedImages.length === 0 ? (
               <div className="flex h-[500px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 text-center">
                 {isGenerating ? (
                    <div className="flex flex-col items-center space-y-4">
                       <div className="relative h-12 w-12">
                         <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500 opacity-20"></div>
                         <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                           <Wand2 className="h-6 w-6 animate-pulse" />
                         </div>
                       </div>
                       <p className="text-zinc-400 animate-pulse">Consulting Nano Banana...</p>
                    </div>
                 ) : (
                   <>
                     <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
                       <Sparkles className="h-8 w-8" />
                     </div>
                     <p className="text-lg font-medium text-zinc-300">No images generated yet</p>
                     <p className="text-sm text-zinc-500">Upload a product and configure options to begin.</p>
                   </>
                 )}
               </div>
             ) : (
               <div className="grid gap-6 sm:grid-cols-2">
                 {isGenerating && (
                    <div className="flex aspect-square flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 animate-pulse">
                       <Wand2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                       <span className="text-sm text-zinc-500">Generating...</span>
                    </div>
                 )}
                 {generatedImages.map((img) => (
                   <div key={img.id} className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl transition-all hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 animate-in fade-in zoom-in duration-300">
                     <img 
                       src={img.url} 
                       alt="Generated result" 
                       className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                       <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                          <button 
                            onClick={() => addToStoryboard(img)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 shadow-lg"
                          >
                            <LayoutTemplate className="h-4 w-4" />
                            Add to Storyboard
                          </button>
                          <a 
                            href={img.url} 
                            download={`nanomerch-${img.id}.png`}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-800 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
                          >
                            <Download className="h-4 w-4" />
                            Download Asset
                          </a>
                       </div>
                     </div>
                     <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md border border-white/10">
                        {img.scenarioType === 'preset' ? 'Scenario' : 'Custom Edit'}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;