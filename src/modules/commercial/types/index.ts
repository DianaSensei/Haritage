export type StoreCategory = 'fashion' | 'electronics' | 'home' | 'beauty' | 'grocery' | 'lifestyle';

export type CommercialSection = 'forYou' | 'topSale' | 'newArrivals' | 'buyAgain' | 'suggestions';

export interface CommercialProduct {
  id: string;
  name: string;
  price: string;
  highlight?: string;
  description?: string;
  imageUrl?: string;
}

export interface StoreProductCategory {
  id: string;
  title: string;
  items: CommercialProduct[];
  coverImageUrl?: string;
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
  imageUrl?: string;
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
  galleryImages: string[];
}

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLineSummary {
  id: string;
  name: string;
  quantity: number;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  storeId: string;
  storeName: string;
  storeLogoUrl?: string;
  amountCents: number;
  currency: string;
  createdAt: string;
  status: OrderStatus;
  itemCount: number;
  totalQuantity: number;
  items: OrderLineSummary[];
}

export type FulfillmentMethod = 'delivery' | 'pickup' | 'dine_in';

export interface CheckoutOptionChoice {
  label: string;
  value: string;
}

export interface CheckoutItem {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
  options?: CheckoutOptionChoice[];
  imageUrl?: string;
}

export interface CheckoutPricing {
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents?: number;
  totalCents: number;
}

export interface CheckoutContact {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutContext {
  id: string;
  storeId: string;
  storeName: string;
  storeLogoUrl?: string;
  deliveryAddress: {
    label: string;
    detail: string;
  };
  pickupAddress: string;
  expectedDeliveryMinutes: number;
  expectedPickupMinutes: number;
  expectedDineInMinutes: number;
  user: CheckoutContact;
  items: CheckoutItem[];
  pricing: CheckoutPricing;
}

export interface CartItem {
  id: string;
  name: string;
  priceLabel: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string;
  storeId?: string;
  storeName?: string;
  accentColor?: string;
}

export interface CartItemInput extends Omit<CartItem, 'quantity'> {
  quantity?: number;
}
