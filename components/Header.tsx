
import React, { useState } from 'react';
import { AppView } from '../types.ts';

interface HeaderProps {
  onSearch: (query: string) => void;
  currentView: AppView;
  onNavigate: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, currentView, onNavigate }) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
    if (currentView !== 'home') onNavigate('home');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0047BA] text-white shadow-xl border-b border-[#FFD700]/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo - Simbolo de Caixa */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
            <div className="bg-[#FFD700] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3">
              <i className="fa-solid fa-box-open text-[#0047BA] text-2xl"></i>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-none text-white">
                Chegou seu <span className="text-[#FFD700]">pedido</span>
              </h1>
              <span className="text-[10px] font-bold text-[#FFD700] tracking-widest uppercase opacity-90">Achadinhos & Ofertas</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSubmit} className="relative w-full md:max-w-xl">
            <input
              type="text"
              placeholder="O que você está procurando hoje?"
              className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-100 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:bg-white/20 transition-all shadow-inner"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform bg-[#FFD700] p-2 rounded-xl shadow-md">
              <i className="fa-solid fa-magnifying-glass text-blue-900"></i>
            </button>
          </form>

          {/* Nav */}
          <div className="hidden lg:flex items-center gap-4 font-bold">
            <button onClick={() => onNavigate('home')} className={`transition-colors flex flex-col items-center px-2 ${currentView === 'home' ? 'text-[#FFD700]' : 'hover:text-[#FFD700] text-white'}`}>
              <i className="fa-solid fa-house mb-1"></i>
              <span className="text-[10px] uppercase">Home</span>
            </button>
            <button onClick={() => onNavigate(currentView === 'admin' ? 'admin' : 'login')} className={`transition-colors flex flex-col items-center px-2 ${currentView !== 'home' ? 'text-[#FFD700]' : 'hover:text-[#FFD700] text-white'}`}>
              <i className="fa-solid fa-user-lock mb-1"></i>
              <span className="text-[10px] uppercase">{currentView === 'admin' ? 'Painel' : 'Admin'}</span>
            </button>
            
            <div className="flex items-center gap-2">
              <a href="https://t.me/chegouseupedido" target="_blank" rel="noreferrer" className="bg-[#229ED9] hover:bg-[#1e8dbf] px-3 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                <i className="fa-brands fa-telegram text-base"></i>
                TELEGRAM
              </a>
              <a href="https://whatsapp.com/channel/0029Vb6ykHH8fewqFQ0fv71pS" target="_blank" rel="noreferrer" className="bg-[#25D366] hover:bg-[#20ba59] px-3 py-2 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-lg transition-transform active:scale-95">
                <i className="fa-brands fa-whatsapp text-base"></i>
                WHATSAPP
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
