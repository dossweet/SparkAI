import React, { useState } from 'react';
import { X, Github, Flame } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: 'google' | 'github') => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'github' | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider);
    await onLogin(provider);
    setLoadingProvider(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center p-8 pt-12">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-[#0a0a0e] border border-white/5 flex items-center justify-center text-orange-500 mb-6 shadow-lg shadow-orange-900/20">
                <Flame size={36} strokeWidth={2} className="fill-orange-500/20" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">登录 Spark 账号</h2>
            <p className="text-gray-400 text-sm text-center mb-8 px-4">
                登录以同步您的对话历史、收藏的闪应用以及保存生成的 3D 模型。
            </p>

            <div className="w-full space-y-3">
                <button
                    onClick={() => handleLogin('google')}
                    disabled={loadingProvider !== null}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-white text-black hover:bg-gray-200 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingProvider === 'google' ? (
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    <span>通过 Google 账号继续</span>
                </button>

                <button
                    onClick={() => handleLogin('github')}
                    disabled={loadingProvider !== null}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-[#27272a] hover:bg-[#323236] text-white border border-white/10 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loadingProvider === 'github' ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                         <Github size={20} />
                    )}
                   
                    <span>通过 GitHub 账号继续</span>
                </button>
            </div>

            <p className="mt-8 text-xs text-gray-600">
                登录即代表您同意我们的 <span className="text-gray-400 cursor-pointer hover:underline">服务条款</span> 和 <span className="text-gray-400 cursor-pointer hover:underline">隐私政策</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;