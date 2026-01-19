
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  imageUrl: string;
  affiliateUrl: string;
  store: Store;
  category: Category;
  coupon?: string;
  updatedAt: string;
  createdAt: string; // ISO String para controle de expiração
  isFlashDeal?: boolean;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export type FilterType = 'all' | string;
export type AppView = 'home' | 'login' | 'admin';
