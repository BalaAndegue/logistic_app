export interface ProductVariant {
  id?: number;
  product_id: number;
  sku: string;
  name: string;
  price: number;
  compare_price?: number;
  cost?: number;
  quantity: number;
  is_active: boolean;
  attributes: Record<string, string>; // Ex: { size: 'M', color: 'Red' }
  image?: File | string;
  created_at?: string;
  updated_at?: string;
}

export interface VariantAttribute {
  name: string;
  values: string[];
}