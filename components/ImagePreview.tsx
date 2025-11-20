import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onRemove }) => {
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!preview) return null;

  return (
    <div className="group relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg">
       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <img 
        src={preview} 
        alt="Source Product" 
        className="h-64 w-full object-contain p-4"
      />
      
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-red-500/80"
        title="Remove image"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="absolute bottom-2 left-3 rounded bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
        Source Image
      </div>
    </div>
  );
};
