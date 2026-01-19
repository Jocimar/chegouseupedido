
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header.tsx';
import CategoryBar from './components/CategoryBar.tsx';
import ProductCard from './components/ProductCard.tsx';
import Login from './components/Login.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import { MOCK_PRODUCTS } from './constants.tsx';
import { FilterType, Product, AppView } from './types.ts';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterType>('all');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const savedProducts = localStorage.getItem('affiliate_products');
    const savedAdmin = sessionStorage.getItem('is_admin');
    
    let currentProducts: Product[] = [];
    if (savedProducts) {
      try {
        currentProducts = JSON.parse(savedProducts);
      } catch (e) {
        currentProducts = [];
      }
    } else {
      // No primeiro acesso, garantir que o mock tenha data de hoje para aparecer
      currentProducts = MOCK_PRODUCTS.map(p => ({
        ...p,
        createdAt: new Date().toISOString()
      }));
    }

    // Lógica RIGOROSA: Mostrar apenas ofertas cujo dia de criação é HOJE
    const todayStr = new Date().toDateString();
    
    const validProducts = currentProducts.filter(p => {
      const createdDate = new Date(p.createdAt);
      return createdDate.toDateString() === todayStr;
    });

    setProducts(validProducts);

    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('affiliate_products', JSON.stringify(products));
  }, [products]);

  const handleAddProduct = (product: Product) => {
    setProducts([product, ...products]);
  };

  const handleBulkAdd = (newProducts: Product[]) => {
    setProducts(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const filteredNew = newProducts.filter(p => !existingIds.has(p.id));
      return [...filteredNew, ...prev];
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta oferta?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleLogin = () => {
    setIsAdmin(true);
    sessionStorage.setItem('is_admin', 'true');
    setCurrentView('admin');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('is_admin');
    setCurrentView('home');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || product.category.slug === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, products]);

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-0 bg-white">
      <Header 
        onSearch={setSearchQuery} 
        currentView={currentView} 
        onNavigate={(v) => setCurrentView(isAdmin && v === 'login' ? 'admin' : v)} 
      />
      
      {currentView === 'home' && (
        <CategoryBar 
          activeCategory={activeCategory} 
          onCategorySelect={setActiveCategory} 
        />
      )}

      <main className="flex-grow">
        {currentView === 'home' && (
          <div className="container mx-auto px-4 py-8">
            <section className="mb-10">
              <div className="bg-gradient-to-br from-[#0047BA] to-[#00338a] rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-[#FFD700]">
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-2 bg-[#FFD700] text-[#0047BA] px-4 py-1.5 rounded-full text-[10px] font-black mb-6 inline-block uppercase tracking-widest shadow-lg">
                    <i className="fa-solid fa-clock-rotate-left"></i>
                    SÓ VALE ATÉ AS 23:59
                  </div>
                  <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[0.9] italic tracking-tighter text-white">
                    AS MELHORES <br/> 
                    <span className="text-[#FFD700] text-5xl md:text-7xl">OFERTAS DE HOJE!</span>
                  </h2>
                  <p className="text-blue-50 text-lg md:text-xl mb-8 font-medium max-w-lg leading-relaxed">
                    Garimpamos a internet para você! <br/>
                    <strong className="text-white">Atenção:</strong> Todas as ofertas são removidas automaticamente à meia-noite para garantir os preços reais.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-[#FFD700] text-[#0047BA] px-10 py-5 rounded-2xl font-black shadow-[0_8px_0_0_#b39700] hover:translate-y-1 hover:shadow-[0_4px_0_0_#b39700] active:translate-y-2 active:shadow-none transition-all text-lg uppercase italic tracking-tighter">
                      APROVEITAR AGORA
                    </button>
                    <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-5 py-3 rounded-2xl border border-white/20 text-white">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                      <span className="text-xs font-bold uppercase tracking-widest">Limpando às 00:00</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-10 pointer-events-none text-white hidden md:block">
                   <i className="fa-solid fa-bolt text-[400px] rotate-12"></i>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between mb-10 border-b-2 border-gray-100 pb-6">
              <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3 italic tracking-tighter">
                <div className="w-3 bg-[#0047BA] h-10 rounded-full"></div>
                OFERTAS SELECIONADAS
              </h2>
              <div className="flex flex-col items-end">
                <span className="bg-[#0047BA] text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">
                   Válidas hoje
                </span>
                <span className="text-[10px] text-gray-400 font-bold mt-1 uppercase">Expiram em poucas horas</span>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-gray-50 rounded-[60px] border-4 border-dashed border-gray-200">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl border border-gray-100">
                   <i className="fa-solid fa-hourglass-empty text-4xl text-blue-200"></i>
                </div>
                <h3 className="text-2xl font-black text-gray-400 uppercase italic tracking-tighter">Aguardando novas ofertas de hoje...</h3>
                <p className="text-gray-400 font-bold mt-2">O robô está processando novos achadinhos!</p>
                <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="mt-8 bg-[#0047BA] text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all uppercase text-sm">LIMPAR FILTROS</button>
              </div>
            )}
          </div>
        )}

        {currentView === 'login' && <Login onLogin={handleLogin} onCancel={() => setCurrentView('home')} />}
        {currentView === 'admin' && isAdmin && (
          <AdminDashboard 
            products={products} 
            onAddProduct={handleAddProduct} 
            onBulkAdd={handleBulkAdd}
            onDeleteProduct={handleDeleteProduct} 
            onLogout={handleLogout}
          />
        )}
      </main>

      <footer className="bg-gray-900 text-white pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-7xl text-[#FFD700] opacity-40 mb-8 flex justify-center hover:opacity-100 transition-all hover:scale-110">
            <i className="fa-solid fa-box-archive"></i>
          </div>
          <p className="text-gray-500 font-black uppercase text-xs tracking-[8px] mb-10">CHEGOU SEU PEDIDO © 2024</p>
          <div className="flex justify-center gap-10 text-gray-400 mb-12">
            <a href="#" className="hover:text-[#FFD700] transition-colors"><i className="fa-brands fa-instagram text-3xl"></i></a>
            <a href="#" className="hover:text-[#FFD700] transition-colors"><i className="fa-brands fa-facebook text-3xl"></i></a>
            <a href="https://t.me/chegouseupedido" className="hover:text-[#229ED9] transition-colors"><i className="fa-brands fa-telegram text-3xl"></i></a>
          </div>
          <div className="max-w-2xl mx-auto border-t border-white/5 pt-10">
            <p className="text-gray-500 text-[11px] leading-relaxed uppercase font-bold tracking-widest px-4">
              Agregador oficial de promoções. Todas as ofertas são removidas automaticamente à meia-noite (00:00) para garantir que você não perca tempo com links expirados. Compras realizadas através do site podem gerar comissão ao administrador.
            </p>
          </div>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t flex justify-around py-4 px-4 z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.1)] rounded-t-[40px]">
        <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center flex-1 py-1 rounded-2xl transition-all ${currentView === 'home' ? 'text-[#0047BA] bg-blue-50' : 'text-gray-400'}`}>
          <i className="fa-solid fa-house-chimney text-2xl"></i>
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Início</span>
        </button>
        <button onClick={() => setCurrentView(isAdmin ? 'admin' : 'login')} className={`flex flex-col items-center flex-1 py-1 rounded-2xl transition-all ${currentView !== 'home' ? 'text-[#0047BA] bg-blue-50' : 'text-gray-400'}`}>
          <i className="fa-solid fa-user-gear text-2xl"></i>
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Gestão</span>
        </button>
      </div>
    </div>
  );
};

export default App;
