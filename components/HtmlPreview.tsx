import React, { useState } from 'react';
import { Eye, Code, RotateCcw, Box } from 'lucide-react';

interface HtmlPreviewProps {
  code: string;
  isFullScreen?: boolean;
}

const HtmlPreview: React.FC<HtmlPreviewProps> = ({ code, isFullScreen = false }) => {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [key, setKey] = useState(0); // To force re-render/reload
  
  const is3D = code.includes('<!-- 3D_MODEL_VIEWER -->');

  return (
    <div className={`
        overflow-hidden border border-gray-800 bg-[#0d0d10] shadow-2xl ring-1 ring-white/5 group
        ${isFullScreen ? 'h-full border-0 rounded-none shadow-none ring-0 my-0' : 'my-8 rounded-xl'}
    `}>
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1e] border-b border-gray-800 h-[57px]">
        {is3D ? (
            <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5 mr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500/50 group-hover:bg-cyan-400 transition-colors shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500/50 group-hover:bg-blue-400 transition-colors shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500/50 group-hover:bg-purple-400 transition-colors shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                </div>
                <Box size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center">
                    3D Digital Twin
                </span>
            </div>
        ) : (
            <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5 mr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50 group-hover:bg-red-500 transition-colors"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50 group-hover:bg-yellow-500 transition-colors"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50 group-hover:bg-green-500 transition-colors"></div>
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
                    Micro-App
                </span>
            </div>
        )}

        <div className="flex bg-[#0a0a0e] rounded-lg p-0.5 border border-gray-700/50">
            <button
                onClick={() => setView('preview')}
                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${view === 'preview' ? 'bg-[#2b2d31] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Eye size={14} className="mr-1.5" /> Preview
            </button>
            <button
                onClick={() => setView('code')}
                className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${view === 'code' ? 'bg-[#2b2d31] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Code size={14} className="mr-1.5" /> Code
            </button>
        </div>
      </div>

      {/* Content */}
      {view === 'preview' ? (
        <div className={`relative w-full bg-white ${isFullScreen ? 'h-[calc(100%-57px)]' : 'h-[500px]'}`}>
             <iframe
                key={key}
                srcDoc={code}
                className="w-full h-full border-0"
                title="App Preview"
                sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-downloads"
             />
             <button
                onClick={() => setKey(k => k + 1)}
                className="absolute bottom-4 right-4 p-2 bg-black/80 text-white rounded-full hover:bg-black hover:scale-110 transition-all shadow-lg backdrop-blur-sm"
                title="Reload App"
            >
                <RotateCcw size={16} />
            </button>
        </div>
      ) : (
        <div className={`relative overflow-y-auto custom-scrollbar bg-[#0d0d10] ${isFullScreen ? 'h-[calc(100%-57px)]' : 'max-h-[500px]'}`}>
             <pre className="p-5 text-sm font-mono leading-relaxed text-gray-300">
                <code>{code}</code>
            </pre>
        </div>
      )}
    </div>
  );
};

export default HtmlPreview;