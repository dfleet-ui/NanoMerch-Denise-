import React, { useMemo, useState } from 'react';
import { Download, Code2, Eye, ExternalLink } from 'lucide-react';

export const LandingPreview: React.FC<{ html: string; slug: string }> = ({ html, slug }) => {
  const [mode, setMode] = useState<'preview' | 'code'>('preview');

  const blobUrl = useMemo(() => {
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [html]);

  const download = () => {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${slug || 'landing-page'}.html`;
    a.click();
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
        <div className="flex rounded-lg bg-zinc-900 p-0.5">
          <button
            onClick={() => setMode('preview')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              mode === 'preview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
          <button
            onClick={() => setMode('code')}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
              mode === 'code' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" /> HTML
          </button>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={blobUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open
          </a>
          <button
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-500"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </div>
      </div>

      {mode === 'preview' ? (
        <iframe
          srcDoc={html}
          title="Landing page preview"
          sandbox="allow-scripts allow-same-origin"
          className="h-[520px] w-full bg-white"
        />
      ) : (
        <pre className="max-h-[520px] overflow-auto p-3 text-[11px] leading-relaxed text-zinc-300">
          <code>{html}</code>
        </pre>
      )}
    </div>
  );
};
