import React from 'react';
import { Zap, LayoutTemplate } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  storyboardCount?: number;
  onOpenStoryboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ storyboardCount = 0, onOpenStoryboard }) => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Nano<span className="text-indigo-400">Merch</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-zinc-400 hidden sm:block">
              Powered by Gemini 2.5 Flash Image
            </div>
            
            {onOpenStoryboard && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onOpenStoryboard}
                className="relative"
                icon={<LayoutTemplate className="w-4 h-4" />}
              >
                Storyboard
                {storyboardCount > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] text-white">
                    {storyboardCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};