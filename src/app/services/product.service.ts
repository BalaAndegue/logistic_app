import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductFilters, ProductStats } from '../models/product.model';
import { ProductVariant } from '../models/product-variant.model';
import { API_CONFIG } from './api/api-config';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api${API_CONFIG.endpoints.products}`;

  constructor(private http: HttpClient) {}

  getAll(filters?: ProductFilters): Observable<Product[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof ProductFilters];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    
    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/featured`);
  }

  getBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${slug}`);
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/vendor/my-products`);
  }

  getStats(): Observable<ProductStats> {
    return this.http.get<ProductStats>(`${this.apiUrl}/vendor/stats`);
  }

  create(product: FormData): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: FormData): Observable<Product> {
    product.append('_method', 'PUT');
    return this.http.post<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Variants management
  getVariants(productId: number): Observable<ProductVariant[]> {
    return this.http.get<ProductVariant[]>(`${this.apiUrl}/${productId}/variants`);
  }

  createVariant(productId: number, variant: FormData): Observable<ProductVariant> {
    return this.http.post<ProductVariant>(`${this.apiUrl}/${productId}/variants`, variant);
  }

  updateVariant(variantId: number, variant: FormData): Observable<ProductVariant> {
    variant.append('_method', 'PUT');
    return this.http.post<ProductVariant>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.variants}/${variantId}`, variant);
  }

  deleteVariant(variantId: number): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.variants}/${variantId}`);
  }
}