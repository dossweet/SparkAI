import React, { useState, useRef } from 'react';
import { Send, Globe, Paperclip, X, SlidersHorizontal } from 'lucide-react';
import { ImageSize } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, image?: string, imageSettings?: { size: ImageSize }) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((input.trim() || selectedImage) && !isLoading) {
      onSendMessage(input, selectedImage || undefined, { size: imageSize });
      setInput('');
      setSelectedImage(null);
      setShowSettings(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value so same file can be selected again if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className={`
        relative rounded-[24px] overflow-hidden transition-all duration-300
        bg-[#262626] border border-white/10
        flex flex-col shadow-xl
        ${selectedImage ? 'h-auto min-h-[140px]' : 'h-[103px]'}
      `}>
        
        {selectedImage && (
            <div className="px-5 pt-4 pb-2 flex">
                <div className="relative group">
                    <img 
                        src={selectedImage} 
                        alt="Selected" 
                        className="h-16 w-16 object-cover rounded-lg border border-white/10" 
                    />
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-1.5 -right-1.5 bg-gray-800 text-white rounded-full p-0.5 border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X size={12} />
                    </button>
                </div>
            </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="问一问 Spark..."
          className={`w-full flex-1 bg-transparent text-gray-200 placeholder-gray-500 px-5 py-4 resize-none outline-none scrollbar-thin text-[15px] ${selectedImage ? 'h-20' : ''}`}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between px-4 pb-3 shrink-0">
           <div className="flex items-center space-x-2 text-gray-500 relative">
               <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group" title="Search/Network">
                    <Globe size={18} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
               </button>
               
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group" 
                title="Upload Image"
               >
                    <Paperclip size={18} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
               </button>
               <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileSelect}
                   accept="image/*"
                   className="hidden"
               />

               <div className="relative">
                   <button 
                       onClick={() => setShowSettings(!showSettings)}
                       className={`p-1.5 hover:bg-white/10 rounded-lg transition-colors group ${showSettings ? 'bg-white/10 text-gray-200' : ''}`}
                       title="Image Settings"
                   >
                        <SlidersHorizontal size={18} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                   </button>
                   {showSettings && (
                       <div className="absolute bottom-full left-0 mb-2 bg-[#18181b] border border-white/10 rounded-xl p-2 shadow-2xl min-w-[140px] z-50 flex flex-col animate-slide-up">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1">Image Quality</span>
                           {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                               <button 
                                   key={size}
                                   onClick={() => { setImageSize(size); setShowSettings(false); }}
                                   className={`
                                       px-2 py-1.5 text-xs text-left rounded-lg transition-colors flex items-center justify-between
                                       ${imageSize === size ? 'bg-[#2b2d31] text-white' : 'text-gray-400 hover:bg-[#2b2d31] hover:text-gray-200'}
                                   `}
                               >
                                   <span>{size}</span>
                                   {imageSize === size && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                               </button>
                           ))}
                       </div>
                   )}
               </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className={`
                  w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center
                  ${(input.trim() || selectedImage) && !isLoading 
                    ? 'bg-white text-black hover:bg-gray-200' 
                    : 'bg-[#363636] text-gray-500 cursor-not-allowed'}
                `}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={14} className={(input.trim() || selectedImage) ? 'ml-0.5' : ''} />
                )}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;