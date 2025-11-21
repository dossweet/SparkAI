import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Role, User, ChatSession, AppItem, BookmarkItem, ImageSize } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { userService } from './services/userService';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import HtmlPreview from './components/HtmlPreview';
import WelcomeScreen from './components/WelcomeScreen';
import LoginModal from './components/LoginModal';
import { LayoutGrid, ArrowRight, X, MessageSquare, Box, Code, Play } from 'lucide-react';

function App() {
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('chat');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<BookmarkItem | null>(null);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);

  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [myApps, setMyApps] = useState<AppItem[]>([]);
  const [myBookmarks, setMyBookmarks] = useState<BookmarkItem[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Init: Load User & Sessions
  useEffect(() => {
    const storedUser = userService.getUser();
    setUser(storedUser);
    
    const storedSessions = userService.getSessions();
    setSessions(storedSessions);

    // Check for shared session in URL
    const urlParams = new URLSearchParams(window.location.search);
    const shareId = urlParams.get('session_id');
    
    if (shareId) {
         // In a real app, we'd fetch this session from backend.
         // Here, we just check if we have it locally.
         const sharedSession = storedSessions.find(s => s.id === shareId);
         if (sharedSession) {
             setCurrentSessionId(sharedSession.id);
             setMessages(sharedSession.messages);
         } else {
             // Fallback if not found locally
             if (storedSessions.length > 0) {
                setCurrentSessionId(storedSessions[0].id);
                setMessages(storedSessions[0].messages);
            } else {
                startNewSession();
            }
         }
    } else {
        if (storedSessions.length > 0) {
            setCurrentSessionId(storedSessions[0].id);
            setMessages(storedSessions[0].messages);
        } else {
            startNewSession();
        }
    }
  }, []);

  // Refresh Apps and Bookmarks when view changes
  useEffect(() => {
      if (activeSidebarItem === 'apps') {
          setMyApps(userService.getApps());
      }
      if (activeSidebarItem === 'bookmarks') {
          setMyBookmarks(userService.getBookmarks());
      }
  }, [activeSidebarItem]);

  // Auto-Save Session
  useEffect(() => {
    if (currentSessionId && messages.length > 0 && activeSidebarItem === 'chat') {
        userService.saveSession(currentSessionId, messages);
        setSessions(userService.getSessions());
    }
  }, [messages, currentSessionId, activeSidebarItem]);

  // Scroll logic
  useEffect(() => {
    if (activeSidebarItem === 'chat') {
        const lastMsg = messages[messages.length - 1];
        if (isLoading || lastMsg?.role === Role.USER) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }
  }, [messages, isLoading, activeSidebarItem]);

  const startNewSession = () => {
      const newId = userService.createNewSessionId();
      setCurrentSessionId(newId);
      setMessages([]);
      setActiveSidebarItem('chat');
  };

  const handleSessionSwitch = (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
          setCurrentSessionId(sessionId);
          setMessages(session.messages);
          setActiveSidebarItem('chat');
          if (window.innerWidth < 768) setIsSidebarOpen(false);
      }
  };

  const handleLogin = async (provider: 'google' | 'github') => {
      const loggedInUser = await userService.login(provider);
      setUser(loggedInUser);
      setShowLoginModal(false);
  };

  const handleLogout = async () => {
      await userService.logout();
      setUser(null);
      startNewSession();
  };

  const handleToggleBookmark = (message: ChatMessage) => {
      // LOGIN GUARD: Check if user is logged in
      if (!user) {
          setShowLoginModal(true);
          return;
      }

      // Find previous user message for context
      const msgIndex = messages.findIndex(m => m.id === message.id);
      const questionText = msgIndex > 0 ? messages[msgIndex - 1].text : "Unknown Question";

      const newStatus = userService.toggleBookmark(message, questionText);
      
      setMessages(prev => prev.map(msg => {
          if (msg.id === message.id) {
              return { ...msg, isBookmarked: newStatus };
          }
          return msg;
      }));
  };
  
  const handleRegenerate = () => {
      if (isLoading) return;
      if (messages.length < 2) return;

      // Get the last user message
      const lastUserMsg = messages[messages.length - 2];
      // Remove the last model message (the one we want to regenerate)
      const newHistory = messages.slice(0, -1);
      
      setMessages(newHistory);
      setIsLoading(true);
      
      // Trigger API call with shortened history
      const loadingId = (Date.now() + 1).toString();
       setMessages(prev => [...prev, {
          id: loadingId,
          role: Role.MODEL,
          text: '',
          timestamp: Date.now(),
          isLoading: true
      }]);

      getCurrentLocation().then(location => {
          // Pass history excluding the last user message (since sendMessageToGemini appends it)
          const historyForApi = newHistory.slice(0, -1);
          return sendMessageToGemini(historyForApi, lastUserMsg.text, location, lastUserMsg.image);
      }).then(response => {
          setMessages(prev => prev.map(msg => {
              if (msg.id === loadingId) {
                  return {
                      ...msg,
                      text: response.text,
                      groundingChunks: response.groundingChunks,
                      themeColor: response.themeColor,
                      isLoading: false
                  };
              }
              return msg;
          }));
      }).catch(error => {
           setMessages(prev => prev.map(msg => {
              if (msg.id === loadingId) {
                  return { ...msg, text: "重试失败，请检查网络。", isLoading: false };
              }
              return msg;
          }));
      }).finally(() => setIsLoading(false));
  };

  const handleShareSession = () => {
      if (!currentSessionId) return;
      // Use mock link generation
      const link = userService.generateShareLink(currentSessionId, window.location.origin);
      
      // Copy to clipboard
      navigator.clipboard.writeText(link).then(() => {
          console.log("Link copied:", link);
      }).catch(err => {
          console.error("Failed to copy:", err);
      });
  };


  const getCurrentLocation = async () => {
      return new Promise<{latitude: number, longitude: number} | undefined>((resolve) => {
          if (!navigator.geolocation) {
              resolve(undefined);
              return;
          }
          const timeout = setTimeout(() => resolve(undefined), 2000);
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  clearTimeout(timeout);
                  resolve({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                  });
              },
              (error) => {
                  clearTimeout(timeout);
                  resolve(undefined);
              }
          );
      });
  };

  const handleSendMessage = async (text: string, image?: string, imageSettings?: { size: ImageSize }) => {
    if (!text.trim() && !image) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      image: image,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    const loadingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
        id: loadingId,
        role: Role.MODEL,
        text: '',
        timestamp: Date.now(),
        isLoading: true
    }]);

    try {
      const location = await getCurrentLocation();
      const response = await sendMessageToGemini(messages.concat(newUserMsg), text, location, image, imageSettings);
      
      setMessages(prev => prev.map(msg => {
          if (msg.id === loadingId) {
              return {
                  ...msg,
                  text: response.text,
                  groundingChunks: response.groundingChunks,
                  themeColor: response.themeColor,
                  isLoading: false
              };
          }
          return msg;
      }));

    } catch (error) {
        setMessages(prev => prev.map(msg => {
            if (msg.id === loadingId) {
                return { ...msg, text: "网络连接异常，请稍后重试。", isLoading: false };
            }
            return msg;
        }));
    } finally {
        setIsLoading(false);
    }
  };

  // Render View Logic
  const renderMainContent = () => {
      // 1. If not logged in and trying to access protected routes
      if ((activeSidebarItem === 'apps' || activeSidebarItem === 'bookmarks') && !user) {
           return <WelcomeScreen onSuggestionClick={(text) => handleSendMessage(text)} />;
      }

      // 2. My Apps View
      if (activeSidebarItem === 'apps') {
          return (
              <div className="p-8 w-full max-w-6xl mx-auto animate-fade-in">
                  <div className="flex items-center mb-8 space-x-3">
                      <LayoutGrid size={24} className="text-white" />
                      <h2 className="text-2xl font-bold text-white">我的闪应用</h2>
                  </div>
                  
                  {myApps.length === 0 ? (
                      <div className="text-center py-20 text-gray-500">
                          <p>暂无保存的闪应用</p>
                          <p className="text-sm mt-2">在对话中点击收藏包含代码的回答，即可自动保存。</p>
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {myApps.map(app => (
                              <div key={app.id} className="bg-[#18181b] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-all group flex flex-col h-[280px]">
                                  <div 
                                    className="h-32 w-full flex items-center justify-center relative overflow-hidden"
                                    style={{ backgroundColor: `${app.previewColor}20` }}
                                  >
                                      {app.type === '3d' ? (
                                          <Box size={48} className="text-cyan-400/50 group-hover:scale-110 transition-transform duration-500" />
                                      ) : (
                                          <Code size={48} className="text-gray-500/50 group-hover:text-white/80 transition-colors duration-500" />
                                      )}
                                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/40 backdrop-blur rounded text-[10px] uppercase font-bold tracking-wider text-white/70">
                                          {app.type === '3d' ? '3D Model' : 'Micro App'}
                                      </div>
                                  </div>
                                  <div className="p-5 flex-1 flex flex-col">
                                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">{app.title}</h3>
                                      <div className="flex-1"></div>
                                      <button 
                                          onClick={() => setSelectedApp(app)}
                                          className="w-full py-2 bg-[#2b2d31] hover:bg-white hover:text-black text-gray-300 rounded-lg text-sm font-medium transition-all flex items-center justify-center"
                                      >
                                          <Play size={14} className="mr-2" /> 运行应用
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          );
      }

      // 3. My Bookmarks View
      if (activeSidebarItem === 'bookmarks') {
          return (
              <div className="p-8 w-full max-w-4xl mx-auto animate-fade-in">
                   <div className="flex items-center mb-8 space-x-3">
                      <Box size={24} className="text-white" /> 
                      <h2 className="text-2xl font-bold text-white">我的收藏</h2>
                  </div>

                  {myBookmarks.length === 0 ? (
                      <div className="text-center py-20 text-gray-500">暂无收藏内容</div>
                  ) : (
                      <div className="space-y-4">
                          {myBookmarks.map(bm => (
                              <div 
                                key={bm.id} 
                                onClick={() => setSelectedBookmark(bm)}
                                className="p-5 bg-[#18181b] border border-gray-800 rounded-xl hover:bg-[#202024] cursor-pointer transition-colors group"
                              >
                                  <div className="text-sm text-white font-medium mb-1 line-clamp-1">
                                      {bm.question}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                      {new Date(bm.timestamp).toLocaleDateString()}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          );
      }

      // 4. Default Chat View
      return (
          <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-800 p-4 md:p-8 flex flex-col">
                {messages.length === 0 ? (
                <WelcomeScreen onSuggestionClick={(text) => handleSendMessage(text)} />
                ) : (
                <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col min-h-0 pb-4">
                    <div className="flex-1" /> 
                    {messages.map((msg) => (
                    <MessageBubble 
                            key={msg.id} 
                            message={msg} 
                            onBookmark={(m) => handleToggleBookmark(m)}
                            onRegenerate={msg.role === Role.MODEL && !msg.isLoading && msg.id === messages[messages.length - 1].id ? handleRegenerate : undefined}
                            onShare={handleShareSession}
                    />
                    ))}
                    <div ref={chatEndRef} className="h-4" />
                </div>
                )}
            </div>
            {/* Input Area */}
            <div className="w-full p-4 md:p-6 z-20 bg-gradient-to-t from-[#0a0a0e] via-[#0a0a0e]/95 to-transparent shrink-0">
                <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </>
      );
  };

  return (
    <div className="flex h-[100dvh] bg-[#0a0a0e] text-gray-100 overflow-hidden font-sans">
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLogin={handleLogin}
      />

      {/* App Preview Modal (Full Screen) */}
      {selectedApp && (
          <div className="fixed inset-0 z-50 bg-[#0a0a0e] flex flex-col animate-fade-in">
               <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#131316]">
                   <div className="flex items-center space-x-3">
                       {selectedApp.type === '3d' ? <Box className="text-cyan-400" /> : <Code className="text-gray-400" />}
                       <h3 className="font-bold text-white text-lg">{selectedApp.title}</h3>
                   </div>
                   <button 
                        onClick={() => setSelectedApp(null)} 
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                   </button>
               </div>
               <div className="flex-1 overflow-hidden p-6 bg-[#0a0a0e]">
                   <HtmlPreview code={selectedApp.code} isFullScreen={true} />
               </div>
          </div>
      )}

      {/* Bookmark Detail Modal / Slide-over */}
      {selectedBookmark && (
          <div className="fixed inset-0 z-50 flex justify-end">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBookmark(null)} />
              <div className="relative w-full max-w-2xl h-full bg-[#0a0a0e] border-l border-gray-800 shadow-2xl flex flex-col animate-slide-up md:animate-fade-in">
                  <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#131316]">
                      <h3 className="font-bold text-white">收藏详情</h3>
                      <button onClick={() => setSelectedBookmark(null)} className="p-2 hover:bg-gray-800 rounded-full text-gray-400">
                          <X size={20} />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6">
                      <div className="mb-8 flex justify-end">
                           <div className="bg-[#2b2d31] text-gray-200 rounded-[24px_24px_4px_24px] px-4 py-3 max-w-[90%] text-sm">
                               {selectedBookmark.question}
                           </div>
                      </div>
                      <MessageBubble message={selectedBookmark.answer} />
                  </div>
              </div>
          </div>
      )}

      <div className="relative z-10 flex w-full h-full">
        <Sidebar 
            isOpen={isSidebarOpen} 
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onNewChat={startNewSession}
            activeItem={activeSidebarItem}
            onItemClick={setActiveSidebarItem}
            
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSessionClick={handleSessionSwitch}
            
            user={user}
            onLoginClick={() => setShowLoginModal(true)}
            onLogoutClick={handleLogout}
        />

        <main className="flex-1 flex flex-col h-full relative transition-all duration-300 min-w-0">
            {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

export default App;