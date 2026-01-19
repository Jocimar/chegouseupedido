
import { Category, Product, Store } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Eletrônicos', icon: 'fa-laptop', slug: 'eletronicos' },
  { id: '2', name: 'Smartphone', icon: 'fa-mobile-screen', slug: 'smartphone' },
  { id: '3', name: 'Casa', icon: 'fa-house', slug: 'casa' },
  { id: '4', name: 'Moda', icon: 'fa-shirt', slug: 'moda' },
  { id: '5', name: 'Beleza', icon: 'fa-sparkles', slug: 'beleza' },
  { id: '6', name: 'Games', icon: 'fa-gamepad', slug: 'games' },
];

export const STORES: Store[] = [
  { id: 's1', name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com' },
  { id: 's2', name: 'Mercado Livre', logo: 'https://logo.clearbit.com/mercadolivre.com.br' },
  { id: 's3', name: 'Shopee', logo: 'https://logo.clearbit.com/shopee.com.br' },
  { id: 's4', name: 'Magalu', logo: 'https://logo.clearbit.com/magazineluiza.com.br' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    title: 'iPhone 15 Apple (128GB) Preto, Tela Super Retina XDR 6,1"',
    description: 'O iPhone 15 traz a Dynamic Island, uma câmera de 48 MP e USB-C, tudo em um design resistente de vidro colorido e alumínio.',
    price: 4899.00,
    originalPrice: 7299.00,
    discountPercentage: 32,
    imageUrl: 'https://picsum.photos/seed/iphone15/400/400',
    affiliateUrl: 'https://amzn.to/example',
    store: STORES[0],
    category: CATEGORIES[1],
    updatedAt: '10 min atrás',
    // Fix: Added missing createdAt property to comply with Product type
    createdAt: new Date().toISOString(),
    isFlashDeal: true
  },
  {
    id: 'p2',
    title: 'Smart TV Samsung 50" Crystal UHD 4K 50CU7700',
    description: 'Processador Crystal 4K, Gaming Hub, Alexa built-in, Controle Remoto Único.',
    price: 2199.00,
    originalPrice: 2899.00,
    discountPercentage: 24,
    imageUrl: 'https://picsum.photos/seed/samsungtv/400/400',
    affiliateUrl: 'https://bit.ly/example-tv',
    store: STORES[3],
    category: CATEGORIES[0],
    updatedAt: '25 min atrás',
    // Fix: Added missing createdAt property to comply with Product type
    createdAt: new Date().toISOString()
  },
  {
    id: 'p3',
    title: 'Air Fryer Mondial Family Inox-IV 4L',
    description: 'Prepare suas receitas favoritas com pouco ou nenhum óleo. Cesto removível e antiaderente.',
    price: 349.90,
    originalPrice: 499.00,
    discountPercentage: 30,
    imageUrl: 'https://picsum.photos/seed/airfryer/400/400',
    affiliateUrl: 'https://mercadolivre.com/example',
    store: STORES[1],
    category: CATEGORIES[2],
    coupon: 'COZINHA10',
    updatedAt: '1 hora atrás',
    // Fix: Added missing createdAt property to comply with Product type
    createdAt: new Date().toISOString()
  },
  {
    id: 'p4',
    title: 'Tênis Nike Air Force 1 07 Masculino',
    description: 'O brilho perdura no Nike Air Force 1 07, o ícone do basquete que dá um toque de frescor.',
    price: 599.90,
    originalPrice: 799.90,
    discountPercentage: 25,
    imageUrl: 'https://picsum.photos/seed/nike/400/400',
    affiliateUrl: 'https://nike.com/example',
    store: STORES[2],
    category: CATEGORIES[3],
    updatedAt: '2 horas atrás',
    // Fix: Added missing createdAt property to comply with Product type
    createdAt: new Date().toISOString()
  },
  {
    id: 'p5',
    title: 'PlayStation 5 Console - Edição Digital',
    description: 'Experimente o carregamento ultrarrápido com um SSD de altíssima velocidade.',
    price: 3699.00,
    originalPrice: 3999.00,
    discountPercentage: 7,
    imageUrl: 'https://picsum.photos/seed/ps5/400/400',
    affiliateUrl: 'https://amzn.to/ps5',
    store: STORES[0],
    category: CATEGORIES[5],
    updatedAt: '5 min atrás',
    // Fix: Added missing createdAt property to comply with Product type
    createdAt: new Date().toISOString(),
    isFlashDeal: true
  },
  {
    id: 'p6',
    title: 'Echo Dot (5ª Geração) com Alexa',
    description: 'O Echo Dot com o melhor som já lançado. Curta uma experiência de áudio superior.',
    price: 269.00,
    originalPrice: 429.00,
    discountPercentage: 37,
    imageUrl: 'https://picsum.photos/seed/echo/400/400',
    affiliateUrl: 'https://amzn.to/echo',
    store: STORES[0],
    category: CATEGORIES[0],
    updatedAt: '30 min atrás',
    // Fix: Added missing createdAt property to comply with Product type
    createdAt: new Date().toISOString()
  },
];
