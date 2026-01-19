
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Store, Category } from '../types.ts';
import { STORES, CATEGORIES } from '../constants.tsx';
import { extractProductInfoFromUrl, parseTelegramContent } from '../services/geminiService.ts';

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onBulkAdd: (products: Product[]) => void;
  onDeleteProduct: (id: string) => void;
  onLogout: () => void;
}

const AUTO_SCAN_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products, onAddProduct, onBulkAdd, onDeleteProduct, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'bot' | 'manual'>('bot');
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  
  // Automação
  const [isAutoScanActive, setIsAutoScanActive] = useState(() => localStorage.getItem('auto_scan_active') === 'true');
  const [nextScanSeconds, setNextScanSeconds] = useState(AUTO_SCAN_INTERVAL_MS / 1000);
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const [botToken, setBotToken] = useState(() => localStorage.getItem('tg_bot_token') || '');
  const [channelId, setChannelId] = useState(() => localStorage.getItem('tg_channel_id') || '');
  const [botLogs, setBotLogs] = useState<string[]>([]);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    store: STORES[0],
    category: CATEGORIES[0],
    affiliateUrl: '',
  });

  const addLog = useCallback((msg: string) => {
    setBotLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
  }, []);

  useEffect(() => {
    localStorage.setItem('tg_bot_token', botToken);
    localStorage.setItem('tg_channel_id', channelId);
    localStorage.setItem('auto_scan_active', String(isAutoScanActive));
  }, [botToken, channelId, isAutoScanActive]);

  const fetchFromTelegram = useCallback(async (isAuto = false) => {
    if (!botToken || !channelId) {
      if (!isAuto) alert('Configure o Token e o ID do Canal primeiro!');
      return;
    }

    setIsSyncing(true);
    addLog(isAuto ? '🤖 [AUTO] Iniciando busca periódica...' : '🤖 Conectando com Telegram...');

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?limit=50&allowed_updates=["channel_post"]`);
      const data = await response.json();

      if (!data.ok) throw new Error(data.description);

      const targetId = channelId.startsWith('@') ? channelId.replace('@', '') : channelId;
      const messages = data.result
        .filter((u: any) => u.channel_post && (u.channel_post.chat.username === targetId || u.channel_post.chat.id.toString() === targetId))
        .map((u: any) => u.channel_post.text || u.channel_post.caption || '')
        .filter(Boolean)
        .join('\n---\n');

      if (!messages) {
        addLog(isAuto ? '💤 [AUTO] Nada de novo no canal.' : '⚠️ Sem novas ofertas detectadas no histórico recente.');
        setIsSyncing(false);
        return;
      }

      addLog(`📩 Processando mensagens com Gemini AI...`);
      const extracted = await parseTelegramContent(messages);
      
      if (extracted && extracted.length > 0) {
        const productsToAdd: Product[] = extracted.map((item: any) => ({
          id: `tg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: item.title,
          description: item.description || '',
          price: Number(item.price),
          originalPrice: Number(item.originalPrice || item.price),
          discountPercentage: item.originalPrice ? Math.round(((Number(item.originalPrice) - Number(item.price)) / Number(item.originalPrice)) * 100) : 0,
          imageUrl: item.imageUrl,
          affiliateUrl: item.affiliateUrl,
          store: STORES.find(s => s.id === item.storeId) || STORES[0],
          category: CATEGORIES.find(c => c.slug === item.categorySlug) || CATEGORIES[0],
          updatedAt: 'Sincronizado via Bot',
          createdAt: new Date().toISOString(),
        }));

        onBulkAdd(productsToAdd);
        addLog(`✅ ${isAuto ? '[AUTO] ' : ''}${productsToAdd.length} novas ofertas importadas com sucesso!`);
      } else {
        addLog('❌ Nenhuma oferta válida encontrada nas mensagens.');
      }
    } catch (err: any) {
      addLog(`❌ Erro: ${err.message}`);
    } finally {
      setIsSyncing(false);
      if (isAutoScanActive) {
        setNextScanSeconds(AUTO_SCAN_INTERVAL_MS / 1000);
      }
    }
  }, [botToken, channelId, isAutoScanActive, onBulkAdd, addLog]);

  // Gerenciamento da Varredura Automática
  useEffect(() => {
    if (isAutoScanActive) {
      addLog('🚀 Varredura Automática ATIVADA (Ciclo de 5min)');
      
      // Countdown Timer
      countdownRef.current = window.setInterval(() => {
        setNextScanSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      // Main Interval
      timerRef.current = window.setInterval(() => {
        fetchFromTelegram(true);
      }, AUTO_SCAN_INTERVAL_MS);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      addLog('🛑 Varredura Automática DESATIVADA');
      setNextScanSeconds(AUTO_SCAN_INTERVAL_MS / 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isAutoScanActive, fetchFromTelegram, addLog]);

  const handleMagicFill = async () => {
    if (!newProduct.affiliateUrl) return;
    setIsExtracting(true);
    try {
      const data = await extractProductInfoFromUrl(newProduct.affiliateUrl);
      if (data) {
        setNewProduct(prev => ({
          ...prev,
          title: data.title,
          price: data.price,
          originalPrice: data.originalPrice || data.price,
          description: data.description,
          imageUrl: data.imageUrl,
          category: CATEGORIES.find(c => c.slug === data.categorySlug) || CATEGORIES[0],
          store: STORES.find(s => s.id === data.storeId) || STORES[0],
        }));
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price || !newProduct.affiliateUrl || !newProduct.imageUrl) return;
    
    onAddProduct({
      id: Date.now().toString(),
      title: newProduct.title!,
      description: newProduct.description || '',
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice || newProduct.price),
      discountPercentage: Math.round(((Number(newProduct.originalPrice || newProduct.price) - Number(newProduct.price)) / Number(newProduct.originalPrice || newProduct.price)) * 100),
      imageUrl: newProduct.imageUrl!,
      affiliateUrl: newProduct.affiliateUrl!,
      store: newProduct.store as Store,
      category: newProduct.category as Category,
      updatedAt: 'Postado agora',
      createdAt: new Date().toISOString(),
    });
    setIsAdding(false);
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="bg-[#0047BA] w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-200">
            <i className="fa-solid fa-box-open"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase italic">Painel do Administrador</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[3px]">Gerenciamento Inteligente</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-green-100">
            <i className="fa-solid fa-circle-check animate-pulse"></i>
            Sistema Online
          </div>
          <button onClick={onLogout} className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold px-6 py-2 rounded-xl transition-all">Sair</button>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('bot')}
          className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'bot' ? 'bg-white text-[#0047BA] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <i className="fa-solid fa-robot mr-2"></i> Robô de Busca
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'manual' ? 'bg-white text-[#0047BA] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <i className="fa-solid fa-plus mr-2"></i> Postagem Manual
        </button>
      </div>

      {activeTab === 'bot' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1 bg-white p-8 rounded-[40px] shadow-xl border border-blue-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-800 uppercase italic tracking-tighter">Configurar API</h3>
              {isAutoScanActive && (
                <span className="text-[9px] font-black text-blue-500 animate-pulse uppercase">Auto: {formatCountdown(nextScanSeconds)}</span>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">Bot Token (@BotFather)</label>
                <input 
                  type="password"
                  className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-[#0047BA] transition-all font-mono text-xs"
                  placeholder="000000:AAAbbbCCC..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1">ID do Canal ou @Username</label>
                <input 
                  className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-[#0047BA] transition-all font-bold"
                  placeholder="@chegouseupedido"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                />
              </div>

              {/* Toggle Varredura Automática */}
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#0047BA] uppercase">Varredura Automática</p>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Busca ofertas a cada 5 min</p>
                </div>
                <button 
                  onClick={() => setIsAutoScanActive(!isAutoScanActive)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isAutoScanActive ? 'bg-[#0047BA]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isAutoScanActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>

              <button 
                onClick={() => fetchFromTelegram(false)}
                disabled={isSyncing}
                className="w-full bg-[#0047BA] text-white font-black py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 italic disabled:opacity-50"
              >
                {isSyncing ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt-lightning text-[#FFD700]"></i>}
                VARREDURA MANUAL
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 bg-gray-900 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-white font-black uppercase italic text-sm tracking-widest flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isAutoScanActive ? 'bg-blue-400 animate-pulse' : 'bg-gray-500'}`}></div>
                 {isAutoScanActive ? 'Monitoramento 24/7 Ativo' : 'Log de Operações'}
               </h3>
               <span className="text-gray-500 font-mono text-[10px]">v2.5 Enterprise</span>
            </div>
            <div className="font-mono text-xs space-y-2 h-72 overflow-y-auto custom-scrollbar">
              {botLogs.length > 0 ? botLogs.map((log, i) => (
                <div key={i} className={`${log.includes('✅') ? 'text-green-400' : log.includes('❌') || log.includes('Erro') ? 'text-red-400' : log.includes('[AUTO]') ? 'text-blue-300' : 'text-gray-400'} border-l-2 border-gray-800 pl-3 py-1`}>
                  {log}
                </div>
              )) : (
                <div className="text-gray-600 italic">Aguardando comando ou ativação do monitoramento...</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border-4 border-dashed border-gray-200 rounded-[40px] p-12 flex flex-col items-center justify-center text-center mb-12 cursor-pointer hover:border-[#0047BA]/20 transition-all" onClick={() => setIsAdding(true)}>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <i className="fa-solid fa-plus text-3xl text-[#0047BA]"></i>
          </div>
          <h3 className="text-2xl font-black text-gray-800 uppercase italic">Cadastrar Manualmente</h3>
        </div>
      )}

      <div className="bg-white rounded-[40px] shadow-sm overflow-hidden border border-gray-100">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <div>
            <h4 className="font-black text-gray-800 uppercase italic tracking-tighter text-xl">Ofertas no Ar</h4>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[3px]">Total de {products.length} itens ativos</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-blue-50/30 transition-all">
                  <td className="px-8 py-5 flex items-center gap-4">
                    <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{p.title}</p>
                      <span className="text-[9px] font-black text-[#0047BA] uppercase">{p.store.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => onDeleteProduct(p.id)} className="w-10 h-10 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-blue-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[48px] p-12 shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-[#0047BA]">Nova Promoção</h3>
              <button onClick={() => setIsAdding(false)} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
                <i className="fa-solid fa-times text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                <label className="block text-[10px] font-black text-[#0047BA] uppercase mb-3 ml-1">Link de Afiliado</label>
                <div className="flex gap-4">
                  <input required className="flex-grow bg-white border-2 border-blue-200 p-4 rounded-2xl outline-none focus:border-[#0047BA] transition-all font-bold" value={newProduct.affiliateUrl || ''} onChange={(e) => setNewProduct({...newProduct, affiliateUrl: e.target.value})} />
                  <button type="button" onClick={handleMagicFill} disabled={isExtracting} className="bg-[#FFD700] text-[#0047BA] px-6 rounded-2xl font-black shadow-md">
                    {isExtracting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                  </button>
                </div>
              </div>
              <input required className="md:col-span-2 w-full bg-gray-50 p-5 rounded-2xl font-bold" placeholder="Título" value={newProduct.title || ''} onChange={(e) => setNewProduct({...newProduct, title: e.target.value})} />
              <input type="number" step="0.01" required className="w-full bg-gray-50 p-5 rounded-2xl" placeholder="Preço" value={newProduct.price || ''} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} />
              <input required className="w-full bg-gray-50 p-5 rounded-2xl" placeholder="URL Imagem" value={newProduct.imageUrl || ''} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} />
              <button type="submit" className="md:col-span-2 w-full bg-[#0047BA] text-white font-black py-6 rounded-[24px] shadow-2xl uppercase italic">PUBLICAR AGORA</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
