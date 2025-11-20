import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

interface UploadZoneProps {
  onImageSelect: (file: File) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]' 
          : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-600'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full transition-colors ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
          {isDragging ? <Upload className="h-8 w-8" /> : <ImageIcon className="h-8 w-8" />}
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">
          Upload Product Image
        </h3>
        <p className="mb-6 max-w-md text-sm text-zinc-400">
          Drag and drop your product photo here, or click to browse. 
          Works best with PNG or JPG images on a clean background.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        <Button onClick={() => inputRef.current?.click()} variant="secondary">
          Select File
        </Button>
      </div>
      
      {/* Background decorative gradients */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
    </div>
  );
};
