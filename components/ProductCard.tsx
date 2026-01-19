
import React, { useState, useEffect } from 'react';
import { Product } from '../types.ts';
import { getProductHighlight } from '../services/geminiService.ts';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [aiHighlight, setAiHighlight] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchHighlight = async () => {
      const highlight = await getProductHighlight(product.title, product.description);
      setAiHighlight(highlight);
    };
    fetchHighlight();
  }, [product]);

  const handleRedirection = () => {
    window.open(product.affiliateUrl, '_blank');
  };

  const copyCoupon = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.coupon) {
      navigator.clipboard.writeText(product.coupon);
      alert('Cupom copiado com sucesso!');
    }
  };

  return (
    <div 
      className="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col h-full border border-gray-100 overflow-hidden relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
        <span className="bg-[#FFD700] text-[#0047BA] text-[11px] font-black px-3 py-1 rounded-lg shadow-lg transform -rotate-1 tracking-tighter">
          -{product.discountPercentage}% OFF
        </span>
        {product.isFlashDeal && (
          <span className="bg-[#0047BA] text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-lg flex items-center gap-1 animate-pulse italic">
            <i className="fa-solid fa-bolt"></i> ÚLTIMAS
          </span>
        )}
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md border border-gray-100">
           <img src={product.store.logo} alt={product.store.name} className="w-7 h-7 object-contain" title={product.store.name} />
        </div>
      </div>

      <div className="relative aspect-square overflow-hidden bg-gray-50 cursor-pointer p-4" onClick={handleRedirection}>
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className={`w-full h-full object-contain mix-blend-multiply transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
        />
        {isHovered && (
          <div className="absolute inset-0 bg-[#0047BA]/5 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-[#0047BA] text-white font-black px-6 py-3 rounded-2xl shadow-xl transform scale-110 transition-transform">
              EU QUERO <i className="fa-solid fa-chevron-right ml-2"></i>
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1.5 text-[9px] text-gray-400 mb-2 uppercase font-black tracking-widest">
          <i className="fa-solid fa-calendar-check text-[#0047BA]"></i>
          Postado em {new Date(product.createdAt).toLocaleDateString('pt-BR')}
        </div>
        
        <h3 className="font-bold text-gray-800 text-sm mb-3 line-clamp-2 min-h-[40px] leading-snug group-hover:text-[#0047BA] transition-colors">
          {product.title}
        </h3>

        {aiHighlight && (
          <div className="mb-4 bg-blue-50/50 p-2.5 rounded-xl border-l-4 border-[#0047BA]">
            <p className="text-[10px] text-blue-900 italic font-bold leading-tight">
              <i className="fa-solid fa-wand-magic-sparkles mr-1 text-[#0047BA]"></i>
              "{aiHighlight}"
            </p>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex flex-col mb-4">
            <span className="text-gray-400 line-through text-[11px] font-bold">R$ {product.originalPrice.toFixed(2)}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-[#0047BA] font-black text-2xl leading-none">R$ {product.price.toFixed(2)}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">No PIX</span>
            </div>
          </div>

          {product.coupon && (
            <button 
              onClick={copyCoupon}
              className="w-full mb-3 bg-[#FFD700]/10 border-2 border-dashed border-[#FFD700] text-[#0047BA] rounded-2xl py-2 px-4 flex items-center justify-between group/coupon hover:bg-[#FFD700]/20 transition-all"
            >
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-black uppercase tracking-widest">Cupom Ativo</span>
                <span className="font-black text-sm tracking-tighter">{product.coupon}</span>
              </div>
              <i className="fa-solid fa-copy text-[#FFD700] group-hover/coupon:scale-125 transition-transform text-lg"></i>
            </button>
          )}

          <button 
            onClick={handleRedirection}
            className="w-full bg-[#0047BA] hover:bg-[#00338a] text-white font-black py-4 rounded-[20px] shadow-[0_6px_0_0_#00225d] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 group/btn"
          >
            PEGAR PROMOÇÃO
            <i className="fa-solid fa-cart-shopping text-sm group-hover/btn:translate-x-1 transition-transform"></i>
          </button>
          
          <div className="mt-4 text-center">
            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Expira em breve</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
