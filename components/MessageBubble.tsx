import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MapPin, ExternalLink, Check, Copy, Quote, Sparkles, Bookmark, Share2, RotateCw } from 'lucide-react';
import { ChatMessage, Role } from '../types';
import HtmlPreview from './HtmlPreview';

interface MessageBubbleProps {
  message: ChatMessage;
  onBookmark?: (message: ChatMessage) => void;
  onRegenerate?: () => void;
  onShare?: () => void;
}

interface ComicPanel {
    image: string;
    caption: string;
}

const ComicCarousel = ({ data }: { data: ComicPanel[] }) => {
    return (
        <div className="my-8 w-full">
            <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory space-x-4 scrollbar-thin scrollbar-thumb-gray-700">
                {data.map((panel, idx) => (
                    <div key={idx} className="flex-shrink-0 w-[85%] md:w-[45%] snap-center bg-[#18181b] rounded-xl overflow-hidden border border-gray-800 shadow-xl">
                        <div className="aspect-video relative">
                             <img src={panel.image} alt={panel.caption} className="w-full h-full object-cover" />
                             <div className="absolute top-2 left-2 bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                                 Panel {idx + 1}
                             </div>
                        </div>
                        <div className="p-3 border-t border-gray-800">
                            <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                                {panel.caption}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Helper component to safely render images with progress
const SafeImage = (props: any) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isLoaded) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 99) return 99;
                const increment = Math.max(1, Math.floor((100 - prev) / 10));
                return prev + increment;
            });
        }, 150);
        return () => clearInterval(interval);
    }, [isLoaded]);

    const handleLoad = () => {
        setIsLoaded(true);
        setProgress(100);
    };

    if (hasError) return null;

    return (
        <div className="my-6 relative group rounded-xl overflow-hidden bg-[#121215]">
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#121215] z-10">
                    <div className="flex flex-col items-center space-y-1">
                         <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-gray-600 to-gray-400 animate-pulse font-mono tracking-tighter">
                            {progress}%
                         </span>
                         <span className="text-[10px] text-gray-600 uppercase tracking-[0.2em]">Generating Visuals</span>
                    </div>
                </div>
            )}
            <div className="relative aspect-video w-full">
                <img 
                    {...props} 
                    className={`w-full h-full object-cover transition-all duration-1000 ease-out ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-md'}`}
                    loading="lazy" 
                    onLoad={handleLoad}
                    onError={() => setHasError(true)}
                />
            </div>
            {isLoaded && props.alt && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-xs text-gray-300 font-mono tracking-wide">{props.alt}</p>
                </div>
            )}
        </div>
    );
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onBookmark, onRegenerate, onShare }) => {
  const isUser = message.role === Role.USER;
  const themeColor = message.themeColor || '#D68C6E'; 
  const [showCopied, setShowCopied] = useState(false);

  const handleShareClick = () => {
      if (onShare) {
          onShare();
          setShowCopied(true);
          setTimeout(() => setShowCopied(false), 2000);
      }
  };

  const components = {
      h2: ({node, ...props}: any) => (
          <h2 className="text-[1.75rem] md:text-[1.8rem] font-semibold text-[var(--theme-color)] mb-[0.8rem] mt-10 tracking-[0.02em] leading-[2.2rem]" {...props} />
      ),
      h3: ({node, ...props}: any) => (
          <h3 className="text-lg md:text-xl font-bold text-[var(--theme-color)] mb-4 mt-8" {...props} />
      ),
      blockquote: ({node, ...props}: any) => (
          <div className="relative my-8 pl-6 pr-4 py-4 border-l-2 border-gray-700 italic text-gray-400 bg-[#18181b] rounded-r-lg">
             <Quote size={20} className="absolute -top-3 -left-3 text-gray-600 fill-[#18181b] bg-[#0a0a0e] rounded-full p-0.5" />
             <blockquote className="pl-2" {...props} />
          </div>
      ),
      img: ({node, ...props}: any) => <SafeImage {...props} />,
      table: ({node, ...props}: any) => (
          <div className="my-8 overflow-hidden rounded-xl border border-gray-800 bg-[#151518] shadow-xl ring-1 ring-white/5">
              <div className="bg-[#1e1e22] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full mr-2 animate-pulse bg-[var(--theme-color)]"></div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Data Sketch</span>
                  </div>
                  <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-600 rounded-full" />
                      <div className="w-1 h-1 bg-gray-600 rounded-full" />
                      <div className="w-1 h-1 bg-gray-600 rounded-full" />
                  </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left" {...props} />
              </div>
          </div>
      ),
      thead: ({node, ...props}: any) => (
          <thead className="bg-[#1e1e22] text-gray-400 font-medium border-b border-gray-800" {...props} />
      ),
      th: ({node, ...props}: any) => (
          <th className="px-6 py-3.5 font-semibold tracking-wide text-xs uppercase" {...props} />
      ),
      td: ({node, ...props}: any) => (
          <td className="px-6 py-4 border-b border-gray-800/50 text-gray-300 font-mono" {...props} />
      ),
      code({node, inline, className, children, ...props}: any) {
        const match = /language-(\w+)/.exec(className || '');
        const language = match?.[1];
        const [copied, setCopied] = useState(false);
        const codeContent = String(children).replace(/\n$/, '');

        if (!inline && language === 'html') {
            return <HtmlPreview code={codeContent} />;
        }
        
        if (!inline && language === 'comic-strip') {
            try {
                const data = JSON.parse(codeContent);
                return <ComicCarousel data={data} />;
            } catch (e) {
                return <div>Error loading comic</div>;
            }
        }

        const handleCopy = () => {
             navigator.clipboard.writeText(codeContent);
             setCopied(true);
             setTimeout(() => setCopied(false), 2000);
        };

        return !inline && match ? (
          <div className="my-8 rounded-lg overflow-hidden border border-gray-800 bg-[#0d0d10] shadow-2xl group ring-1 ring-white/5">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1e] border-b border-gray-800">
                <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                    </div>
                    <span className="text-xs font-mono text-gray-500 ml-2 uppercase font-semibold">{language}</span>
                </div>
                <button 
                    onClick={handleCopy}
                    className="text-gray-500 hover:text-white transition-colors p-1.5 hover:bg-gray-700 rounded-md" 
                    title="Copy Code"
                >
                   {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
            </div>
            <div className="relative">
                <pre className="p-5 overflow-x-auto text-sm font-mono leading-relaxed text-gray-300 bg-[#0d0d10]">
                <code className={className} {...props}>
                    {children}
                </code>
                </pre>
            </div>
          </div>
        ) : (
          <code className="bg-[#1e1e22] px-1.5 py-0.5 rounded text-sm font-mono text-[var(--theme-color)] border border-gray-800 mx-1" {...props}>
            {children}
          </code>
        );
      }
  };

  if (isUser) {
    return (
      <div className="flex w-full mb-10 justify-end animate-slide-up">
        <div className="flex flex-col items-end max-w-[600px]">
            {/* Uploaded Image */}
            {message.image && (
                <div className="mb-2 overflow-hidden rounded-xl border border-white/10 w-full max-w-[240px]">
                    <img src={message.image} alt="User Upload" className="w-full h-auto object-cover" />
                </div>
            )}
            <div className="bg-[#2b2d31] text-gray-200 rounded-[24px_24px_4px_24px] px-4 py-3 w-full text-sm md:text-base leading-relaxed shadow-sm">
                {message.text}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div 
        className="w-full mb-16 animate-fade-in px-2 md:px-0"
        style={{ '--theme-color': themeColor } as React.CSSProperties}
    >
        <div className="prose prose-invert prose-lg max-w-none 
            prose-headings:text-[var(--theme-color)] 
            prose-p:text-gray-300 prose-p:leading-8 prose-p:font-light
            prose-li:text-gray-300
            prose-strong:text-white prose-strong:font-semibold
            prose-a:text-[var(--theme-color)] prose-a:opacity-80 prose-a:no-underline hover:prose-a:underline hover:prose-a:opacity-100
        ">
            {message.text ? (
                 <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={components}
                >
                    {message.text}
                </ReactMarkdown>
            ) : (
                <div className="w-full max-w-full mt-6 space-y-8 animate-pulse select-none">
                     <div className="flex items-center space-x-2">
                         <Sparkles size={15} className="text-[var(--theme-color)] animate-pulse" />
                         <span className="text-xs font-medium text-gray-500 tracking-wider">请稍等...</span>
                    </div>
                    <div className="h-12 w-1/2 rounded-lg bg-gradient-to-r from-[#1a1a1e] via-[#222226] to-[#1a1a1e]"></div>
                    <div className="h-64 w-full rounded-xl border border-white/5 bg-gradient-to-r from-[#1a1a1e] via-[#222226] to-[#1a1a1e]"></div>
                    <div className="space-y-3">
                         <div className="h-4 w-full rounded bg-gradient-to-r from-[#1a1a1e] via-[#222226] to-[#1a1a1e]"></div>
                         <div className="h-4 w-[90%] rounded bg-gradient-to-r from-[#1a1a1e] via-[#222226] to-[#1a1a1e]"></div>
                         <div className="h-4 w-[80%] rounded bg-gradient-to-r from-[#1a1a1e] via-[#222226] to-[#1a1a1e]"></div>
                    </div>
                </div>
            )}
        </div>

        {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-800/60">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3 flex items-center">
                    <ExternalLink size={12} className="mr-2" /> 
                    Sources
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {message.groundingChunks.map((chunk, idx) => {
                        if (chunk.maps || chunk.web) {
                            const data = chunk.maps || chunk.web;
                            return (
                                <a key={idx} href={data!.uri} target="_blank" rel="noreferrer" 
                                    className="flex items-center p-2.5 bg-[#151518] hover:bg-[#1e1e22] border border-gray-800 hover:border-gray-700 rounded-lg transition-all group duration-200">
                                    <div className="bg-[#1e1e22] p-1.5 rounded text-gray-400 mr-3 group-hover:text-[var(--theme-color)]">
                                        {chunk.maps ? <MapPin size={14} /> : <ExternalLink size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-300 group-hover:text-white truncate">{data!.title}</p>
                                    </div>
                                </a>
                            )
                        }
                        return null;
                    })}
                </div>
            </div>
        )}

        {!message.isLoading && (
            <div className="mt-12 flex items-center justify-end space-x-4 border-t border-gray-800/30 pt-4 relative">
                 {showCopied && (
                    <div className="absolute -top-10 right-0 bg-black/90 text-white text-xs px-3 py-1.5 rounded-md animate-fade-in z-50">
                        Link Copied!
                    </div>
                )}
                
                {onRegenerate && (
                    <button 
                        onClick={onRegenerate}
                        className="flex items-center space-x-2 px-3 py-1.5 text-gray-500 hover:text-white hover:bg-[#1e1e22] rounded-full transition-all duration-200 group"
                        title="重新生成"
                    >
                        <RotateCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="text-xs font-medium">重新生成</span>
                    </button>
                )}

                <button 
                    onClick={() => onBookmark?.(message)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all duration-200 group ${message.isBookmarked ? 'bg-orange-500/10 text-orange-500' : 'text-gray-500 hover:bg-[#1e1e22] hover:text-gray-300'}`}
                    title="收藏"
                >
                    <Bookmark size={18} className={`transition-all duration-200 ${message.isBookmarked ? 'fill-orange-500' : 'group-hover:scale-110'}`} />
                    <span className="text-xs font-medium">{message.isBookmarked ? '已收藏' : '收藏'}</span>
                </button>
                
                <button 
                    onClick={handleShareClick}
                    className="flex items-center space-x-2 px-3 py-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#1e1e22] rounded-full transition-all duration-200 group"
                    title="分享"
                >
                    <Share2 size={18} className="group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium">分享</span>
                </button>
            </div>
        )}
    </div>
  );
};

export default MessageBubble;