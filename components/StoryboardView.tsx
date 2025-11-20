import React, { useState, useEffect, useRef } from 'react';
import { StoryboardItem } from '../types';
import { Button } from './Button';
import { ArrowLeft, Download, Trash2, Loader2 } from 'lucide-react';

interface StoryboardViewProps {
  items: StoryboardItem[];
  onClose: () => void;
  onRemoveItem: (id: string) => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({ items, onClose, onRemoveItem }) => {
  // Default values matching the branding
  const [companyNameLine1, setCompanyNameLine1] = useState('ISLAND');
  const [companyNameLine2, setCompanyNameLine2] = useState('WIDE');
  const [companyNameLine3, setCompanyNameLine3] = useState('promotions');
  
  const [contactInfo, setContactInfo] = useState('Denise Fleet | denise@iwpromotions.ca | (709) 743-3763');
  const [footerNote, setFooterNote] = useState('Pricing for setups are based on specific logo placements for quotation purposes; subject to change with finalized artwork and design. Pricing for freight is based on entire order shipping to St. John\'s, Newfoundland and Labrador; subject to change if multiple locations required or for areas outside shipping point. Pricing is valid for 30 days.');
  
  const [isDownloading, setIsDownloading] = useState(false);

  // Local state to handle edits
  const [localItems, setLocalItems] = useState(items);

  // Refs for auto-resizing textareas
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>({});

  const handleUpdateItem = (id: string, field: keyof StoryboardItem, value: string) => {
    setLocalItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Auto-resize textareas helper
  const adjustHeight = (element: HTMLTextAreaElement | null) => {
    if (!element) return;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Effect to resize all textareas when content changes
  useEffect(() => {
    adjustHeight(textareaRefs.current['footer-note']);
    localItems.forEach(item => {
      adjustHeight(textareaRefs.current[`features-${item.id}`]);
      adjustHeight(textareaRefs.current[`title-${item.id}`]);
    });
  }, [localItems, footerNote, contactInfo]);

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

    // Configuration for 8.5" x 11" Letter size
    const opt = {
      margin: [0.5, 0.5], 
      filename: 'storyboard.pdf',
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
      .then(() => {
        setIsDownloading(false);
      })
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

      {/* Printable Document Area Wrapper */}
      <div className="min-h-screen bg-zinc-900 p-8 overflow-x-auto flex justify-center print:p-0 print:bg-white">
        {/* 
            Fixed pixel width: 816px = 8.5 inches * 96 DPI.
            This ensures WYSIWYG alignment for the PDF generator.
        */}
        <div 
          id="printable-storyboard" 
          style={{ width: '816px', minHeight: '1056px' }} 
          className="bg-white p-10 text-black relative mx-auto flex flex-col"
        >
          
          {/* Header - Left Aligned Logo Block */}
          <div className="flex flex-col items-start mb-2">
             <div className="flex flex-col">
                {/* Line 1: ISLAND */}
                <input 
                  value={companyNameLine1}
                  onChange={(e) => setCompanyNameLine1(e.target.value)}
                  className="text-left text-6xl font-black uppercase tracking-tight text-slate-900 outline-none bg-transparent border-none p-0 leading-[0.85] w-full mb-1"
                />
                
                {/* Line 2: WIDE */}
                <div className="flex items-center gap-2 mb-1">
                   <input 
                    value={companyNameLine2}
                    onChange={(e) => setCompanyNameLine2(e.target.value)}
                    className="text-left text-6xl font-black uppercase tracking-tight text-slate-900 outline-none bg-transparent border-none p-0 leading-[0.85]"
                   />
                </div>
                
                {/* Line 3: promotions */}
                <input 
                  value={companyNameLine3}
                  onChange={(e) => setCompanyNameLine3(e.target.value)}
                  className="text-left text-5xl text-slate-900 outline-none bg-transparent border-none p-0 w-full leading-none font-normal"
                  style={{ fontFamily: 'sans-serif' }}
                />
             </div>
          </div>

          {/* Red Divider Line - Positioned below the logo */}
          <div className="w-full h-1 bg-red-700 mb-8 mt-2"></div>

          {/* Items List */}
          <div className="flex-1 flex flex-col">
            {localItems.map((item, index) => (
              <div key={item.id}>
                
                {/* Thick Divider for items after the first one */}
                {index > 0 && (
                  <div className="w-full h-1.5 bg-slate-800 my-8 break-inside-avoid"></div>
                )}

                <div className="group relative flex flex-col gap-8 md:flex-row break-inside-avoid page-break-inside-avoid mb-4">
                  
                  {/* Delete Button (Hidden in print) */}
                  {!isDownloading && (
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="absolute -left-10 top-0 rounded-full p-2 text-zinc-400 hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all print:hidden"
                      title="Remove from storyboard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Left Column: Text Info */}
                  <div className="flex-[1.2] pt-2 min-w-0">
                    <textarea
                      ref={(el) => { textareaRefs.current[`title-${item.id}`] = el; }}
                      value={item.title}
                      onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                      className="w-full text-xl font-bold uppercase text-slate-900 outline-none bg-transparent resize-none overflow-hidden mb-4 leading-tight"
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

                    <div className="mt-4">
                      <input
                        value={item.price}
                        onChange={(e) => handleUpdateItem(item.id, 'price', e.target.value)}
                        className="w-full text-lg font-bold text-slate-900 outline-none bg-transparent p-0"
                      />
                      <p className="text-sm text-slate-800 mt-1 font-medium">
                        Pricing includes a left chest embroidered logo, all setup fees and freight
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Image */}
                  <div className="flex-[0.8] flex items-start justify-center md:justify-end">
                    <img 
                      src={item.image.url} 
                      alt={item.title}
                      className="max-h-[350px] w-auto object-contain" 
                    />
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

          {/* Footer - Matches the dark blue block style */}
          <div className="mt-auto pt-8 break-inside-avoid page-break-inside-avoid">
             <div className="bg-[#1a2b4b] text-white p-6 text-center">
                <textarea
                  ref={(el) => { textareaRefs.current['footer-note'] = el; }}
                  value={footerNote}
                  onChange={(e) => setFooterNote(e.target.value)}
                  className="w-full bg-transparent text-center text-[10px] leading-tight italic text-slate-200 outline-none resize-none overflow-hidden border-none p-0 focus:ring-0 mb-4"
                  rows={3}
                />
                
                <div className="border-t border-white/20 pt-3 w-1/2 mx-auto"></div>
                
                <input 
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="w-full bg-transparent text-center text-sm font-bold text-white outline-none border-none p-0 focus:ring-0"
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};