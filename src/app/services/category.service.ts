import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category, CategoryTree } from '../models/category.model';
import { API_CONFIG } from './api/api-config';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api${API_CONFIG.endpoints.categories}`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getTree(): Observable<CategoryTree[]> {
    return this.http.get<CategoryTree[]>(`${this.apiUrl}/tree`);
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/slug/${slug}`);
  }

  create(category: FormData): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  update(id: number, category: FormData): Observable<Category> {
    category.append('_method', 'PUT');
    return this.http.post<Category>(`${this.apiUrl}/${id}`, category);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProducts(categoryId: number, params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${categoryId}/products`, { params });
  }
}