import React, { useState, useEffect, useRef } from 'react';
import { StoryboardItem, BrandSettings, DEFAULT_BRAND_SETTINGS, UCW_BRAND_SETTINGS, PricingTier } from '../types';
import { Button } from './Button';
import { ArrowLeft, Download, Trash2, Loader2, Building2, RefreshCw } from 'lucide-react';

interface StoryboardViewProps {
  items: StoryboardItem[];
  onClose: () => void;
  onRemoveItem: (id: string) => void;
}

const BRAND_STORAGE_KEY = 'nanomerch_brand_settings';

export const StoryboardView: React.FC<StoryboardViewProps> = ({ items, onClose, onRemoveItem }) => {
  const [activeBrand, setActiveBrand] = useState<'iwp' | 'ucw'>('iwp');

  // Load brand settings from localStorage on mount
  const [brandSettings, setBrandSettings] = useState<BrandSettings>(() => {
    try {
      const saved = localStorage.getItem(BRAND_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_BRAND_SETTINGS;
    } catch {
      return DEFAULT_BRAND_SETTINGS;
    }
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const [localItems, setLocalItems] = useState(items);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  // Save to localStorage whenever brandSettings changes
  useEffect(() => {
    try {
      localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify(brandSettings));
    } catch {}
  }, [brandSettings]);

  const switchBrand = (brand: 'iwp' | 'ucw') => {
    setActiveBrand(brand);
    if (brand === 'ucw') {
      setBrandSettings(UCW_BRAND_SETTINGS);
    } else {
      setBrandSettings(DEFAULT_BRAND_SETTINGS);
    }
  };

  const updateBrand = (field: keyof BrandSettings, value: string) => {
    setBrandSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateItem = (id: string, field: keyof StoryboardItem, value: any) => {
    setLocalItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleUpdateTier = (itemId: string, tierIndex: number, field: keyof PricingTier, value: string) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const tiers = [...item.pricingTiers];
      tiers[tierIndex] = { ...tiers[tierIndex], [field]: value };
      return { ...item, pricingTiers: tiers };
    }));
  };

  const handleAddTier = (itemId: string) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return { ...item, pricingTiers: [...item.pricingTiers, { qty: '', price: '' }] };
    }));
  };

  const handleRemoveTier = (itemId: string, tierIndex: number) => {
    setLocalItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const tiers = item.pricingTiers.filter((_, i) => i !== tierIndex);
      return { ...item, pricingTiers: tiers };
    }));
  };

  const adjustHeight = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    adjustHeight(textareaRefs.current['footer-note']);
    localItems.forEach(item => {
      adjustHeight(textareaRefs.current[`features-${item.id}`]);
      adjustHeight(textareaRefs.current[`title-${item.id}`]);
    });
  }, [localItems, brandSettings.footerNote]);

  const handleRemove = (id: string) => {
    onRemoveItem(id);
    setLocalItems(prev => prev.filter(i => i.id !== id));
  };

  const handleSavePDF = () => {
    const element = document.getElementById('printable-storyboard');
    if (!element || !window.html2pdf) {
      console.error("PDF generation library not loaded or element not found");
      return;
    }

    setIsDownloading(true);

    const opt = {
      margin: [0.5, 0.5], 
      filename: `${brandSettings.line1.toLowerCase()}-proposal.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true, 
        logging: false,
        letterRendering: true,
        scrollY: 0, 
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    window.html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => setIsDownloading(false))
      .catch((err: any) => {
        console.error("PDF Export Error:", err);
        setIsDownloading(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950">
      
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950/90 px-6 py-4 backdrop-blur-md print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h2 className="text-lg font-semibold text-white">Storyboard Preview</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Brand Switcher */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-900 p-1 border border-zinc-800">
            <button
              onClick={() => switchBrand('iwp')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeBrand === 'iwp' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3" />
              IWP
            </button>
            <button
              onClick={() => switchBrand('ucw')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeBrand === 'ucw' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3 h-3" />
              UCW
            </button>
          </div>

          <span className="text-sm text-zinc-500">
            {localItems.length} items
          </span>
          <Button 
            onClick={handleSavePDF} 
            disabled={isDownloading}
            icon={isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          >
            {isDownloading ? 'Processing...' : 'Save as PDF'}
          </Button>
        </div>
      </div>

      {/* Printable Document */}
      <div className="min-h-screen bg-zinc-900 p-8 overflow-x-auto flex justify-center print:p-0 print:bg-white">
        <div 
          id="printable-storyboard" 
          style={{ width: '816px', minHeight: '1056px' }} 
          className="bg-white p-10 text-black relative mx-auto flex flex-col"
        >
          
          {/* Header — Editable brand block */}
          <div className="flex flex-col items-start mb-2">
             <div className="flex flex-col">
                <input 
                  value={brandSettings.line1}
                  onChange={(e) => updateBrand('line1', e.target.value)}
                  className="text-left text-6xl font-black uppercase tracking-tight text-slate-900 outline-none bg-transparent border-none p-0 leading-[0.85] w-full mb-1"
                />
                <div className="flex items-center gap-2 mb-1">
                   <input 
                    value={brandSettings.line2}
                    onChange={(e) => updateBrand('line2', e.target.value)}
                    className="text-left text-6xl font-black uppercase tracking-tight text-slate-900 outline-none bg-transparent border-none p-0 leading-[0.85]"
                   />
                </div>
                <input 
                  value={brandSettings.line3}
                  onChange={(e) => updateBrand('line3', e.target.value)}
                  className="text-left text-5xl text-slate-900 outline-none bg-transparent border-none p-0 w-full leading-none font-normal"
                  style={{ fontFamily: 'sans-serif' }}
                />
             </div>
          </div>

          <div className="w-full h-1 bg-red-700 mb-8 mt-2"></div>

          {/* Items List */}
          <div className="flex-1 flex flex-col">
            {localItems.map((item, index) => (
              <div key={item.id}>
                {index > 0 && (
                  <div className="w-full h-1.5 bg-slate-800 my-8 break-inside-avoid"></div>
                )}

                <div className="group relative break-inside-avoid page-break-inside-avoid mb-4">
                  
                  {/* Delete Button */}
                  {!isDownloading && (
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="absolute -left-10 top-0 rounded-full p-2 text-zinc-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all print:hidden"
                      title="Remove from storyboard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Main row: text + image */}
                  <div className="flex flex-col gap-6 md:flex-row">

                    {/* Left Column: Text */}
                    <div className="flex-[1.2] pt-2 min-w-0">
                      <textarea
                        ref={(el) => { textareaRefs.current[`title-${item.id}`] = el; }}
                        value={item.title}
                        onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                        className="w-full text-xl font-bold uppercase text-slate-900 outline-none bg-transparent resize-none overflow-hidden mb-3 leading-tight"
                        rows={1}
                      />
                      
                      <div className="mb-4">
                        <textarea
                          ref={(el) => { textareaRefs.current[`features-${item.id}`] = el; }}
                          value={item.features}
                          onChange={(e) => handleUpdateItem(item.id, 'features', e.target.value)}
                          className="w-full resize-none text-sm leading-relaxed text-slate-800 outline-none bg-transparent overflow-hidden whitespace-pre-wrap font-medium"
                          style={{ minHeight: '60px' }}
                        />
                      </div>

                      {/* Quantity Pricing Tiers Table */}
                      <div className="mt-3 mb-4 print:hidden">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pricing Tiers</p>
                        <div className="space-y-1">
                          {item.pricingTiers.map((tier, ti) => (
                            <div key={ti} className="flex items-center gap-2">
                              <input
                                value={tier.qty}
                                onChange={(e) => handleUpdateTier(item.id, ti, 'qty', e.target.value)}
                                placeholder="Qty (e.g. 24–47)"
                                className="flex-1 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-800 outline-none focus:border-indigo-400"
                              />
                              <input
                                value={tier.price}
                                onChange={(e) => handleUpdateTier(item.id, ti, 'price', e.target.value)}
                                placeholder="Price (e.g. $14.25)"
                                className="flex-1 rounded border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-800 outline-none focus:border-indigo-400"
                              />
                              <button
                                onClick={() => handleRemoveTier(item.id, ti)}
                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                title="Remove tier"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => handleAddTier(item.id)}
                            className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors font-medium"
                          >
                            + Add tier
                          </button>
                        </div>
                      </div>

                      {/* Printed pricing table (visible in PDF) */}
                      {item.pricingTiers.length > 0 && (
                        <div className="mt-3 mb-4">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-slate-100">
                                <th className="text-left px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider border border-slate-200">Quantity</th>
                                <th className="text-left px-3 py-1.5 text-xs font-semibold text-slate-600 uppercase tracking-wider border border-slate-200">Price / Unit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.pricingTiers.map((tier, ti) => (
                                <tr key={ti} className={ti % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                  <td className="px-3 py-1.5 text-sm text-slate-800 border border-slate-200">{tier.qty}</td>
                                  <td className="px-3 py-1.5 text-sm font-bold text-slate-900 border border-slate-200">{tier.price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="text-xs text-slate-500 mt-1.5 italic">
                            Pricing includes logo decoration, all setup fees and freight to St. John's.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Column: Image */}
                    <div className="flex-[0.8] flex items-start justify-center md:justify-end">
                      <img 
                        src={item.image.url} 
                        alt={item.title}
                        className="max-h-[320px] w-auto object-contain" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {localItems.length === 0 && (
              <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 text-slate-400">
                Add items from the dashboard to see them here
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-8 break-inside-avoid page-break-inside-avoid">
             <div className="bg-[#1a2b4b] text-white p-6 text-center">
                <textarea
                  ref={(el) => { textareaRefs.current['footer-note'] = el; }}
                  value={brandSettings.footerNote}
                  onChange={(e) => updateBrand('footerNote', e.target.value)}
                  className="w-full bg-transparent text-center text-[10px] leading-tight italic text-slate-200 outline-none resize-none overflow-hidden border-none p-0 focus:ring-0 mb-4"
                  rows={3}
                />
                
                <div className="border-t border-white/20 pt-3 w-1/2 mx-auto"></div>
                
                <input 
                  value={brandSettings.contactInfo}
                  onChange={(e) => updateBrand('contactInfo', e.target.value)}
                  className="w-full bg-transparent text-center text-sm font-bold text-white outline-none border-none p-0 focus:ring-0"
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
