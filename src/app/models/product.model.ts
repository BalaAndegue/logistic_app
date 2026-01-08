// product.model.ts - Mettre à jour pour correspondre à la réponse de l'API
export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: string | number;  // L'API retourne des strings
  stock?: number;          // L'API utilise "stock" au lieu de "quantity"
  image?: string;
  is_featured: boolean;
  category_id?: number;
  vendor_id?: number;
  created_at?: string;
  updated_at?: string;
  variants?: any[];
  category?: any;
  slug?:string;
  
  // Ajouter ces propriétés pour compatibilité avec le template
  quantity?: number;  // Alias pour stock
  images?: any[];     // Alias pour image
  short_description?: string;
  compare_price?: number;
  cost?: number;
  sku?: string;
  barcode?: string;
  is_active?: boolean;
  specifications?: Record<string, any>;
}

export interface ProductFilters {
  category_id?: number;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
  sort_by?: 'created_at' | 'name' | 'price';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  vendor_id?: number;
   is_active?: boolean;        // AJOUTER CETTE LIGNE
  stock_status?: string;
}

export interface ProductStats {
  total_products?: number;
  active_products?: number;
  out_of_stock?: number;
  low_stock?: number;
  total_value?: number;
}