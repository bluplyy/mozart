export type Category = "Men" | "Women";

export interface Product {
  id: string;
  title: string;
  category: Category;
  price: number;
  image_url: string;
  secondary_image_url?: string;
  images?: string[];
  description: string;
  details?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}
