export type Category = "Men" | "Women";
export type ProductSize = "XS" | "S" | "M" | "L" | "XL";
export const STANDARD_SIZES: ProductSize[] = ["XS", "S", "M", "L", "XL"];

export interface Product {
  id: string;
  title: string;
  category: Category;
  price: number;
  image_url: string;
  secondary_image_url?: string;
  images?: string[];
  available_sizes?: string[];
  description: string;
  details?: string;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}
