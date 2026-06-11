export type ProductStyleCategory =
  | 'Wide-legged'
  | 'Palazzo'
  | 'Asymmetrical'
  | 'Cargo'
  | 'Baggy'
  | 'Streetwear'
  | 'Vintage'
  | 'Korean'
  | 'Luxury Casual';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number | null;
  image: string;
  hoverImage: string;
  sourceSite: string; // e.g., 'Ashluxe', 'Orange Culture', 'WafflesnCream', 'Instagram Vendor'
  sourceUrl: string;
  sizes: string[];
  colors: string[];
  category: ProductStyleCategory;
  brand: string;
  fabric: string;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  rating: number;
  reviewsCount: number;
  description: string;
  gender: 'Unisex' | 'Men' | 'Women';
  trendCategory: 'Streetwear Essentials' | 'Luxury Pants' | 'Trending in Nigeria' | 'Limited Drop';
  launchDate: string; // ISO string or simple date
  isDuplicate?: boolean;
}

export interface CartItem {
  id: string; // unique cart item ID: productId + selectedSize + selectedColor
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface AIResponse {
  answer: string;
  recommendedProductIds: string[];
  stylingTips: string[];
  suggestedAesthetic: string;
}

export interface CheckoutDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: 'Lagos' | 'Abuja' | 'Port Harcourt' | 'Benin' | 'Other';
  deliveryMethod: 'Express' | 'Standard';
  paymentGateway: 'Paystack' | 'Flutterwave';
}

export interface OrderTrackInfo {
  orderId: string;
  status: 'Received' | 'Sorted' | 'In Transit' | 'Out for Delivery' | 'Delivered';
  estimatedDelivery: string;
  trackerLogs: Array<{ time: string; statusDescription: string }>;
  products: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
}
