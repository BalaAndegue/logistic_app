export interface Category {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  image?: File | string;
  parent_id?: number;
  is_active: boolean;
  order?: number;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export interface CategoryFormData {
  name: string;
  description?: string;
  image?: File;
  parent_id?: number;
  is_active: boolean;
  order?: number;
}