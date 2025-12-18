import { Category } from "./category.model";
import { ProductVariant } from "./product-variant.model";

export interface Product {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: number;
  vendor_id?: number;
  images?: (File | string)[];
  specifications?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  
  // Relations
  category?: Category;
  variants?: ProductVariant[];
}

export interface ProductFilters {
  category_id?: number;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: 'name' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  vendor_id?: number;
}

export interface ProductStats {
  total_products: number;
  active_products: number;
  out_of_stock: number;
  low_stock: number;
  total_value: number;
}