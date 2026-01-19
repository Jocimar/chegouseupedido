
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { MOCK_PRODUCTS } from './constants';
import { FilterType, Product, AppView } from './types';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterType>('all');
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Persistence and Expiration logic
  useEffect(() => {
    const savedProducts = localStorage.getItem('affiliate_products');
    const savedAdmin = sessionStorage.getItem('is_admin');
    
    let currentProducts: Product[] = [];
    if (savedProducts) {
      currentProducts = JSON.parse(savedProducts);
    } else {
      // Initialize mocks with current date
      currentProducts = MOCK_PRODUCTS.map(p => ({
        ...p,
        createdAt: p.createdAt || new Date().toISOString()
      }));
    }

    // Auto-delete logic: Filter out products older than 7 days
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    
    const validProducts = currentProducts.filter(p => {
      const createdDate = new Date(p.createdAt).getTime();
      return (now - createdDate) < SEVEN_DAYS_MS;
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
    setProducts([...newProducts, ...products]);
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
              <div className="bg-gradient-to-br from-[#0047BA] to-[#00338a] rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border-b-8 border-[#FFD700]">
                <div className="relative z-10 max-w-2xl">
                  <span className="bg-[#FFD700] text-[#0047BA] px-4 py-1 rounded-full text-xs font-black mb-4 inline-block uppercase tracking-wider shadow-md">
                    Sua encomenda começa aqui
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight italic tracking-tighter">
                    OFERTAS QUE <br/> 
                    <span className="text-[#FFD700]">CHEGAM PARA VOCÊ!</span>
                  </h2>
                  <p className="text-blue-50 text-lg mb-6 font-medium max-w-lg">
                    Agregador oficial de promoções. Ofertas atualizadas minuto a minuto e removidas após 7 dias para garantir o menor preço!
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <button className="bg-[#FFD700] text-[#0047BA] px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all">
                      VER TUDO AGORA
                    </button>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-2xl border border-white/20">
                      <span className="text-sm font-bold">Limpando posts expirados...</span>
                    </div>
                  </div>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 opacity-10 pointer-events-none">
                   <i className="fa-solid fa-box-open text-[300px] rotate-12"></i>
                </div>
              </div>
            </section>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                <div className="w-2 bg-[#0047BA] h-8 rounded-full"></div>
                OFERTAS SELECIONADAS
              </h2>
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {filteredProducts.length} Achadinhos
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                <i className="fa-solid fa-search text-5xl text-gray-200 mb-4"></i>
                <h3 className="text-xl font-bold text-gray-400 uppercase italic">Nenhuma oferta encontrada</h3>
                <button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} className="mt-6 bg-[#0047BA] text-white px-8 py-3 rounded-xl font-black shadow-md">RESETAR FILTROS</button>
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

      <footer className="bg-gray-900 text-white pt-20 pb-10">
        <div className="container mx-auto px-4 text-center">
          {/* Logo substituto por ícone de caixa */}
          <div className="text-6xl text-[#FFD700] opacity-40 mb-6 flex justify-center hover:opacity-100 transition-opacity">
            <i className="fa-solid fa-box-open"></i>
          </div>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[5px] mb-8">Chegou seu pedido © 2024</p>
          <div className="flex justify-center gap-6 text-gray-400 mb-8">
            <a href="#" className="hover:text-[#FFD700] transition-colors"><i className="fa-brands fa-instagram text-2xl"></i></a>
            <a href="#" className="hover:text-[#FFD700] transition-colors"><i className="fa-brands fa-facebook text-2xl"></i></a>
            <a href="https://t.me/chegouseupedido" className="hover:text-[#229ED9] transition-colors"><i className="fa-brands fa-telegram text-2xl"></i></a>
          </div>
          <p className="text-gray-600 text-[10px] max-w-md mx-auto">
            Este site é um agregador de ofertas de afiliados. Ao clicar nos links, podemos receber uma comissão sem custo adicional para você. Os posts são deletados automaticamente após 7 dias para garantir a relevância das promoções.
          </p>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 px-2 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] rounded-t-[32px]">
        <button onClick={() => setCurrentView('home')} className={`flex flex-col items-center flex-1 py-1 rounded-2xl transition-all ${currentView === 'home' ? 'text-[#0047BA] bg-blue-50' : 'text-gray-400'}`}>
          <i className="fa-solid fa-house text-xl"></i>
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Início</span>
        </button>
        <button onClick={() => setCurrentView(isAdmin ? 'admin' : 'login')} className={`flex flex-col items-center flex-1 py-1 rounded-2xl transition-all ${currentView !== 'home' ? 'text-[#0047BA] bg-blue-50' : 'text-gray-400'}`}>
          <i className="fa-solid fa-user-shield text-xl"></i>
          <span className="text-[10px] font-black mt-1 uppercase tracking-tighter">Admin</span>
        </button>
      </div>
    </div>
  );
};

export default App;
