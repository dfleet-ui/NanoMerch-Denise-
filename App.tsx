import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { ImagePreview } from './components/ImagePreview';
import { Button } from './components/Button';
import { StoryboardView } from './components/StoryboardView';
import { PolsiaApp } from './polsia/PolsiaApp';
import { GeneratedImage, Scenario, ScenarioOption, StoryboardItem } from './types';
import { SCENARIOS, ICON_MAP } from './constants';
import { fileToGenerativePart, generateMarketingImage } from './services/geminiService';
import { Sparkles, Wand2, Download, AlertCircle, Check, Plus, LayoutTemplate, X, ZoomIn } from 'lucide-react';

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

  // Polsia-style AI co-founder view
  const [showPolsia, setShowPolsia] = useState(false);

  // Lightbox state
  const [lightboxImage, setLightboxImage] = useState<GeneratedImage | null>(null);

  // Auto-select first scenario on load
  useEffect(() => {
    if (!selectedScenarioId && SCENARIOS.length > 0) {
      handleSelectScenario(SCENARIOS[0]);
    }
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
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
      let scenarioId: string | undefined;
      let colorLabel: string | undefined;
      let colorHex: string | undefined;
      
      if (activeTab === 'presets' && selectedScenarioId) {
        const scenario = SCENARIOS.find(s => s.id === selectedScenarioId);
        if (scenario) {
          prompt = scenario.promptTemplate;
          if (selectedColor) {
            prompt = prompt.replace('{color}', selectedColor.value);
            colorLabel = selectedColor.label;
            colorHex = selectedColor.hex;
          } else {
            prompt = prompt.replace('{color}', 'natural');
          }
          type = 'preset';
          scenarioId = scenario.id;
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
        scenarioType: type,
        scenarioId,
        colorLabel,
        colorHex,
      };

      setGeneratedImages(prev => [newImage, ...prev]);
    } catch (err) {
      console.error(err);
      setError("Failed to generate image. Please check your API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addToStoryboard = (image: GeneratedImage) => {
    // Use properly tracked scenarioId — no more hacky prompt matching!
    const scenario = image.scenarioId 
      ? SCENARIOS.find(s => s.id === image.scenarioId) 
      : null;

    let title = scenario?.name ?? 'Custom Product';
    let features = '• High quality print\n• Durable material\n• Custom design';
    let price = '$0.00';
    let pricingTiers = [{ qty: '12+', price: 'Call for pricing' }];

    if (scenario?.defaultSpecs) {
      const specs = scenario.defaultSpecs;
      features = specs.features.map(f => `• ${f}`).join('\n');
      price = specs.price;
      if (specs.pricingTiers) pricingTiers = specs.pricingTiers;
    }

    // Append colour to title if available
    if (image.colorLabel) {
      title = `${title} — ${image.colorLabel}`;
    }

    const newItem: StoryboardItem = {
      id: Math.random().toString(36).substring(7),
      image,
      title,
      features,
      price,
      pricingTiers,
      description: ''
    };

    setStoryboardItems(prev => [...prev, newItem]);
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

  if (showPolsia) {
    return <PolsiaApp onExit={() => setShowPolsia(false)} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header
        storyboardCount={storyboardItems.length}
        onOpenStoryboard={() => setShowStoryboard(true)}
        onOpenPolsia={() => setShowPolsia(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs">1</span>
                Source Design / Logo
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
                    {/* Scenario grid — 2 columns, scrollable */}
                    <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
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
                            <div className={`text-xs font-medium leading-tight ${selectedScenarioId === scenario.id ? 'text-white' : 'text-zinc-200'}`}>
                              {scenario.name}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    {selectedScenario?.options?.colors && (
                      <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                          Select Colour
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
                                  : 'border-zinc-600 hover:scale-105 hover:border-zinc-400'
                              }`}
                              style={{ backgroundColor: color.hex }}
                            >
                              {selectedColor?.value === color.value && (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <Check className={`h-4 w-4 ${['white', 'heather grey', 'light grey', 'khaki', 'brushed silver'].includes(color.value) ? 'text-black' : 'text-white'}`} />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-500">
                          Selected: <span className="text-zinc-300">{selectedColor?.label ?? 'None'}</span>
                        </p>
                      </div>
                    )}

                    {/* Pricing preview */}
                    {selectedScenario?.defaultSpecs?.pricingTiers && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                        <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-3">
                          Pricing Guide (per unit)
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          {selectedScenario.defaultSpecs.pricingTiers.map((tier) => (
                            <div key={tier.qty} className="flex justify-between rounded-lg bg-zinc-800/60 px-3 py-1.5">
                              <span className="text-xs text-zinc-400">{tier.qty}</span>
                              <span className="text-xs font-semibold text-zinc-100">{tier.price}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-zinc-600 mt-2">+ setup fees and freight. Pricing valid 30 days.</p>
                      </div>
                    )}

                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedScenarioId}
                      className="w-full"
                      size="lg"
                      icon={<Wand2 className="w-4 h-4" />}
                    >
                      {isGenerating ? 'Generating...' : `Visualize ${selectedScenario?.name || 'Asset'}`}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Describe how you want to visualize this design (e.g., 'Place on a marble desk with a coffee cup', 'On a navy polo shirt hanging on a coat hook')"
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
               <span>Generated Visualizations</span>
               {generatedImages.length > 0 && (
                 <span className="text-sm font-normal text-zinc-500">{generatedImages.length} generated</span>
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
                       <p className="text-zinc-400 animate-pulse">Generating your visualization...</p>
                       <p className="text-xs text-zinc-600">This usually takes 10–20 seconds</p>
                    </div>
                 ) : (
                   <>
                     <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-zinc-600">
                       <Sparkles className="h-8 w-8" />
                     </div>
                     <p className="text-lg font-medium text-zinc-300">No visualizations yet</p>
                     <p className="text-sm text-zinc-500 mt-1">Upload a logo, pick a product, and click Generate.</p>
                   </>
                 )}
               </div>
             ) : (
               <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                       <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                          <button 
                            onClick={() => addToStoryboard(img)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 shadow-lg"
                          >
                            <LayoutTemplate className="h-4 w-4" />
                            Add to Storyboard
                          </button>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setLightboxImage(img)}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-800 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700"
                            >
                              <ZoomIn className="h-3.5 w-3.5" />
                              Zoom
                            </button>
                            <a 
                              href={img.url} 
                              download={`nanomerch-${img.id}.png`}
                              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-800 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                          </div>
                       </div>
                     </div>

                     {/* Colour swatch badge */}
                     {img.colorLabel && (
                       <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 backdrop-blur-md border border-white/10">
                         <span className="h-3 w-3 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: img.colorHex }} />
                         <span className="text-[10px] font-medium text-white">{img.colorLabel}</span>
                       </div>
                     )}

                     <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md border border-white/10">
                        {img.scenarioType === 'preset' ? 'Scenario' : 'Custom'}
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <X className="h-5 w-5" /> Close
            </button>
            <img 
              src={lightboxImage.url} 
              alt="Full size preview"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 px-4">
              {lightboxImage.colorLabel && (
                <div className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 backdrop-blur-md border border-white/10">
                  <span className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: lightboxImage.colorHex }} />
                  <span className="text-xs font-medium text-white">{lightboxImage.colorLabel}</span>
                </div>
              )}
              <button
                onClick={() => addToStoryboard(lightboxImage)}
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                <LayoutTemplate className="h-4 w-4" />
                Add to Storyboard
              </button>
              <a 
                href={lightboxImage.url} 
                download={`nanomerch-${lightboxImage.id}.png`}
                className="flex items-center gap-2 rounded-full bg-zinc-800 px-4 py-1.5 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
