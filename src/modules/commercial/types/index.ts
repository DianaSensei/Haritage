export type StoreCategory = 'fashion' | 'electronics' | 'home' | 'beauty' | 'grocery' | 'lifestyle';

export type CommercialSection = 'forYou' | 'topSale' | 'newArrivals' | 'buyAgain' | 'suggestions';

export interface CommercialProduct {
  id: string;
  name: string;
  price: string;
  highlight?: string;
  description?: string;
}

export interface StoreProductCategory {
  id: string;
  title: string;
  items: CommercialProduct[];
}

export interface CommercialSectionItem {
  id: string;
  name: string;
  price: string;
  storeId: string;
  storeName: string;
  storeBadge: string;
  accentColor: string;
  badge?: string;
  subtitle?: string;
  tags?: string[];
}

export interface StoreFront {
  id: string;
  name: string;
  category: StoreCategory;
  accentColor: string;
  initials: string;
  rating: number;
  followers: number;
  productCount: number;
  tags: string[];
  products: CommercialProduct[];
  promoMessage?: string;
  ownerName: string;
  address: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  categories: StoreProductCategory[];
}
