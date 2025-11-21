import React, { useState } from 'react';
import { 
  MessageSquare, 
  LayoutGrid, 
  Bookmark, 
  Sparkles, 
  Plus,
  Flame,
  LogOut,
  User as UserIcon,
  QrCode
} from 'lucide-react';
import { ChatSession, User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onNewChat: () => void;
  activeItem: string;
  onItemClick: (item: string) => void;
  
  // History Props
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionClick: (id: string) => void;
  
  // User Props
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, 
    toggleSidebar, 
    onNewChat, 
    activeItem, 
    onItemClick,
    sessions,
    currentSessionId,
    onSessionClick,
    user,
    onLoginClick,
    onLogoutClick
}) => {
  const [showQrCode, setShowQrCode] = useState(false);

  return (
    <div className={`
      flex flex-col h-full bg-[#131316] border-r border-[#1f1f23] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
      ${isOpen ? 'w-[260px]' : 'w-[70px]'}
      z-20 relative flex-shrink-0
    `}>
      {/* Header / Logo */}
      <div className="flex items-center px-4 h-16 mb-2">
        {isOpen ? (
            <div className="flex items-center space-x-1 animate-fade-in cursor-pointer overflow-hidden">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-500">
                    <Flame size={24} strokeWidth={2.5} className="fill-orange-500/20" />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">
                    Spark
                </span>
            </div>
        ) : (
             <div className="w-full flex justify-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-500">
                    <Flame size={24} strokeWidth={2.5} className="fill-orange-500/20" />
                </div>
             </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-4">
        <button 
          onClick={onNewChat}
          className={`
            flex items-center justify-start w-full bg-[#2b2d31] hover:bg-[#36383d] text-white rounded-lg transition-all border border-transparent hover:border-gray-700 group
            ${isOpen ? 'px-4 py-2.5' : 'p-2.5 justify-center aspect-square'}
          `}
        >
            {isOpen ? (
                <>
                    <Plus size={18} className="mr-3 text-gray-300 group-hover:text-white" />
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white">新对话</span>
                </>
            ) : (
                <Plus size={20} className="text-gray-300 group-hover:text-white" />
            )}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-none">
        <NavItem 
            icon={<LayoutGrid size={18} />} 
            label="我的闪应用" 
            isOpen={isOpen} 
            isActive={activeItem === 'apps'}
            onClick={() => onItemClick('apps')}
        />
        <NavItem 
            icon={<Bookmark size={18} />} 
            label="我的收藏" 
            isOpen={isOpen} 
            isActive={activeItem === 'bookmarks'}
            onClick={() => onItemClick('bookmarks')}
        />
        <NavItem 
            icon={<Sparkles size={18} />} 
            label="我的创作" 
            isOpen={isOpen} 
            isActive={activeItem === 'creations'}
            onClick={() => onItemClick('creations')}
        />
        
        {isOpen && sessions.length > 0 && (
            <div className="pt-6 pb-2 animate-fade-in">
                <div className="px-3 flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-500">近期对话</p>
                </div>
                <div className="space-y-0.5">
                    {sessions.slice(0, 10).map(session => (
                        <HistoryItem 
                            key={session.id}
                            label={session.title} 
                            isActive={currentSessionId === session.id}
                            onClick={() => onSessionClick(session.id)}
                        />
                    ))}
                </div>
            </div>
        )}
      </nav>

      {/* Footer - Settings & User Profile */}
      <div className="p-3 border-t border-[#1f1f23] space-y-1 bg-[#131316]">
         
         {/* Follow Author / QR Code Popup */}
         <div className="relative">
             {showQrCode && (
                 <>
                    {/* Backdrop to close when clicking outside */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowQrCode(false)} />
                    
                    {/* QR Bubble */}
                    <div className={`
                        absolute z-50 bg-[#2b2d31] p-2 rounded-xl shadow-2xl animate-slide-up border border-gray-700/50
                        ${isOpen ? 'bottom-full left-0 w-[236px] mb-2' : 'left-full bottom-0 ml-4 w-[200px] origin-bottom-left'}
                    `}>
                        <img 
                            src="https://youke1.picui.cn/s1/2025/11/21/691f5a38ab645.png" 
                            alt="关注作者 - Coding101" 
                            className="w-full h-auto rounded-lg block"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                 </>
             )}
             <button 
                onClick={() => setShowQrCode(!showQrCode)}
                className={`
                    flex items-center w-full p-2.5 rounded-lg transition-all duration-200 group relative z-50
                    text-gray-400 hover:text-gray-200 hover:bg-[#2b2d31]/50
                    ${!isOpen ? 'justify-center' : ''}
                `}
             >
                <span className="transition-colors group-hover:text-gray-200">
                    <QrCode size={18} />
                </span>
                {isOpen && <span className="ml-3 text-sm font-medium whitespace-nowrap animate-fade-in">关注作者</span>}
             </button>
         </div>
         
         {/* User Profile Section */}
         {user ? (
            <div className={`
                flex items-center w-full rounded-lg transition-all duration-200 group mt-2
                ${isOpen ? 'px-2 py-2 hover:bg-[#2b2d31]' : 'justify-center py-2'}
            `}>
                <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover border border-gray-700" 
                />
                
                {isOpen && (
                    <div className="ml-3 flex-1 min-w-0 flex items-center justify-between animate-fade-in">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white truncate max-w-[100px]">{user.name}</span>
                            <span className="text-[10px] text-orange-500">Pro 账号</span>
                        </div>
                        <button 
                            onClick={onLogoutClick}
                            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-600 rounded-md transition-colors"
                            title="Logout"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                )}
            </div>
         ) : (
            <button 
                onClick={onLoginClick}
                className={`
                    flex items-center w-full p-2.5 rounded-lg transition-all duration-200 group mt-2
                    ${isOpen ? 'bg-[#2b2d31] hover:bg-[#36383d]' : 'justify-center hover:bg-[#2b2d31]'}
                `}
            >
                <UserIcon size={18} className="text-gray-400 group-hover:text-white" />
                {isOpen && <span className="ml-3 text-sm font-medium text-gray-300 group-hover:text-white animate-fade-in">登录账号</span>}
            </button>
         )}
      </div>
    </div>
  );
};

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isOpen: boolean;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isOpen, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center w-full p-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden
            ${isActive ? 'bg-[#2b2d31] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2b2d31]/50'}
        `}
    >
        <span className={`transition-colors ${isActive ? 'text-white' : 'group-hover:text-gray-200'}`}>{icon}</span>
        {isOpen && <span className="ml-3 text-sm font-medium whitespace-nowrap animate-fade-in">{label}</span>}
    </button>
);

interface HistoryItemProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`
            flex items-center w-full px-3 py-2 text-sm rounded-lg transition-colors group text-left
            ${isActive ? 'bg-[#2b2d31] text-white' : 'text-gray-400 hover:bg-[#2b2d31]/50 hover:text-gray-200'}
        `}
    >
        <MessageSquare size={14} className={`mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`} />
        <span className="truncate">{label}</span>
    </button>
);

export default Sidebar;