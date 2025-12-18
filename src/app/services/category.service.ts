import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category, CategoryTree } from '../models/category.model';
import { API_CONFIG } from './api/api-config';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api${API_CONFIG.endpoints.categories}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || response)
    );
  }

  getTree(): Observable<CategoryTree[]> {
  return this.http.get<{data: CategoryTree[]}>(`${this.apiUrl}/tree`).pipe(
    map(response => response.data || response)
  );
}
  getById(id: number): Observable<Category> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  getBySlug(slug: string): Observable<Category> {
    return this.http.get<any>(`${this.apiUrl}/slug/${slug}`).pipe(
      map(response => response.data || response)
    );
  }

  create(category: FormData): Observable<Category> {
    return this.http.post<any>(this.apiUrl, category).pipe(
      map(response => response.data || response)
    );
  }

  update(id: number, category: FormData): Observable<Category> {
    category.append('_method', 'PUT');
    return this.http.post<any>(`${this.apiUrl}/${id}`, category).pipe(
      map(response => response.data || response)
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProducts(categoryId: number, params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${categoryId}/products`, { params }).pipe(
      map(response => response.data || response)
    );
  }
}