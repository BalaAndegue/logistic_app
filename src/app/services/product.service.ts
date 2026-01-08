import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
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
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => response.data || response)
    );
  }

  getFeatured(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/featured`).pipe(
      map(response => response.data || response)
    );
  }

  getBySlug(slug: string): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${slug}`).pipe(
      map(response => response.data || response)
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<any>(`${this.apiUrl}/vendor/my-products`).pipe(
      map(response => response.data || response)
    );
  }

  getStats(): Observable<ProductStats> {
    return this.http.get<any>(`${this.apiUrl}/vendor/stats`).pipe(
      map(response => response.data || response)
    );
  }

  create(product: FormData): Observable<Product> {
    return this.http.post<any>(this.apiUrl, product).pipe(
      map(response => response.data || response)
    );
  }

  update(id: number, product: FormData): Observable<Product> {
    product.append('_method', 'PUT');
    return this.http.post<any>(`${this.apiUrl}/${id}`, product).pipe(
      map(response => response.data || response)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getVariants(productId: number): Observable<ProductVariant[]> {
    return this.http.get<any>(`${this.apiUrl}/${productId}/variants`).pipe(
      map(response => response.data || response)
    );
  }

  createVariant(productId: number, variant: FormData): Observable<ProductVariant> {
    return this.http.post<any>(`${this.apiUrl}/${productId}/variants`, variant).pipe(
      map(response => response.data || response)
    );
  }

  updateVariant(variantId: number, variant: FormData): Observable<ProductVariant> {
    variant.append('_method', 'PUT');
    return this.http.post<any>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.variants}/${variantId}`, variant).pipe(
      map(response => response.data || response)
    );
  }

  deleteVariant(variantId: number): Observable<void> {
    return this.http.delete<void>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.variants}/${variantId}`);
  }
}