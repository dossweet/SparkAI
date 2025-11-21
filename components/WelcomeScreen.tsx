import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
    onSuggestionClick: (text: string) => void;
}

interface SuggestionItem {
    text: string;
    gradient: string;
    shadow: string;
    cursorColor: string;
}

const SUGGESTIONS_DATA: SuggestionItem[] = [
    { 
        text: "如果声音可以被触摸", 
        gradient: "bg-gradient-to-br from-[#AE88B5] to-[#95759A]", // Morandi Pink/Purple
        shadow: "shadow-[#AE88B5]/30",
        cursorColor: "text-[#AE88B5]"
    },
    { 
        text: "帮我生成一个 React 待办事项应用", 
        gradient: "bg-gradient-to-br from-[#749FAE] to-[#5C7F8C]", // Morandi Blue
        shadow: "shadow-[#749FAE]/30",
        cursorColor: "text-[#749FAE]"
    },
    { 
        text: "解释量子纠缠原理", 
        gradient: "bg-gradient-to-br from-[#8588B5] to-[#6A6D91]", // Morandi Indigo
        shadow: "shadow-[#8588B5]/30",
        cursorColor: "text-[#8588B5]"
    },
    { 
        text: "分析 2025 科技趋势", 
        gradient: "bg-gradient-to-br from-[#88B596] to-[#6D9178]", // Morandi Green
        shadow: "shadow-[#88B596]/30",
        cursorColor: "text-[#88B596]"
    },
    { 
        text: "设计一款概念跑车 3D 模型", 
        gradient: "bg-gradient-to-br from-[#D68C6E] to-[#AB7058]", // Morandi Orange
        shadow: "shadow-[#D68C6E]/30",
        cursorColor: "text-[#D68C6E]"
    },
    { 
        text: "附近的评分最高的咖啡馆", 
        gradient: "bg-gradient-to-br from-[#B5AE88] to-[#918B6D]", // Morandi Yellow
        shadow: "shadow-[#B5AE88]/30",
        cursorColor: "text-[#B5AE88]"
    }
];

const SLOGAN = "灵光一现，星火燎原";

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuggestionClick }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'waiting' | 'suggestions'>('typing');
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  
  // Text actually shown for the current suggestion (typewriter effect)
  const [suggestionDisplayed, setSuggestionDisplayed] = useState('');
  const sloganTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Phase 1: Slogan Typewriter
  useEffect(() => {
    let currentIndex = 0;
    
    const typeChar = () => {
        if (currentIndex <= SLOGAN.length) {
            setDisplayedText(SLOGAN.slice(0, currentIndex));
            
            // Determine delay based on the character just typed
            // If it was the comma '，', wait longer (600ms), else standard (300ms)
            let nextDelay = 300;
            if (currentIndex > 0 && SLOGAN[currentIndex - 1] === '，') {
                nextDelay = 600;
            }

            currentIndex++;
            
            sloganTimeoutRef.current = setTimeout(typeChar, nextDelay);
        } else {
            setPhase('waiting');
        }
    };

    typeChar();

    return () => {
        if (sloganTimeoutRef.current) clearTimeout(sloganTimeoutRef.current);
    };
  }, []);

  // Phase 2: Wait 1.5s then switch to suggestions
  useEffect(() => {
    if (phase === 'waiting') {
      const timer = setTimeout(() => {
        setPhase('suggestions');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Phase 3: Rotate Suggestion Index
  useEffect(() => {
    if (phase === 'suggestions') {
      const interval = setInterval(() => {
         setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS_DATA.length);
      }, 4000); // Change suggestion every 4s
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Phase 3: Typewriter effect for the active suggestion
  useEffect(() => {
      if (phase === 'suggestions') {
          const targetText = SUGGESTIONS_DATA[suggestionIndex].text;
          let charIndex = 0;
          setSuggestionDisplayed(''); // Clear text immediately on switch
          
          const typeTimer = setInterval(() => {
              if (charIndex <= targetText.length) {
                  setSuggestionDisplayed(targetText.slice(0, charIndex));
                  charIndex++;
              } else {
                  clearInterval(typeTimer);
              }
          }, 50); // Suggestion typing speed (Faster than slogan)
          
          return () => clearInterval(typeTimer);
      }
  }, [phase, suggestionIndex]);

  const handleSuggestionClick = () => {
      onSuggestionClick(SUGGESTIONS_DATA[suggestionIndex].text);
  };

  const currentSuggestion = SUGGESTIONS_DATA[suggestionIndex];

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-full relative select-none py-10 overflow-hidden">
      {/* Abstract Background Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-950/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[45%] left-[52%] -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-orange-500/10 rounded-full blur-[60px] pointer-events-none mix-blend-screen" />
      
      <div className="relative z-10 text-center w-full max-w-4xl px-4 min-h-[200px] flex flex-col items-center justify-center">
        
        {/* Slogan Display */}
        {phase !== 'suggestions' && (
            <div className={`transition-opacity duration-1000 ${phase === 'waiting' ? 'opacity-100' : 'opacity-100'}`}>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white drop-shadow-2xl h-[1.2em]">
                    {displayedText}
                    <span className="animate-pulse text-orange-500 ml-1">|</span>
                </h1>
            </div>
        )}

        {/* Rotating Suggestions Display */}
        {phase === 'suggestions' && (
             <div 
                className="animate-slide-up flex flex-col items-center cursor-pointer group"
                onClick={handleSuggestionClick}
             >
                <div className="flex items-center space-x-3 md:space-x-4">
                    <h2 className="text-2xl md:text-4xl font-bold text-white/90 tracking-wide group-hover:text-white transition-colors h-[1.5em] flex items-center">
                        {suggestionDisplayed}
                        <span className={`animate-pulse ${currentSuggestion.cursorColor} ml-1 w-2 inline-block`}>|</span>
                    </h2>
                    
                    {/* Colorful Button - Smaller (w-8 h-8) and Dynamic */}
                    <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center 
                        ${currentSuggestion.gradient} ${currentSuggestion.shadow} shadow-lg
                        group-hover:scale-110 transition-transform duration-300 shrink-0
                    `}>
                        <ArrowRight size={16} className="text-white" />
                    </div>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default WelcomeScreen;