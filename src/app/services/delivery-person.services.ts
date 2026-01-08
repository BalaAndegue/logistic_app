import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface DeliveryPerson {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  isAvailable?: boolean;
  rating?: number;
  activeDeliveries?: number;
  totalDeliveries?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryPersonsService {
  private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api';
  
  constructor(private http: HttpClient) {}

  getAll(perPage = 50): Observable<DeliveryPerson[]> {
    const params = new HttpParams()
      .set('role', 'DELIVERY')
      .set('per_page', perPage.toString());

    return this.http.get<any>(`${this.apiUrl}/users`, { params })
      .pipe(
        map(response => {
          const data = response.data || response;
          return Array.isArray(data) ? data.map(user => this.transformUser(user)) : [];
        })
      );
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  private transformUser(user: any): DeliveryPerson {
    return {
      ...user,
      isAvailable: user.isAvailable ?? true,
      rating: user.rating ?? 5.0,
      activeDeliveries: user.activeDeliveries ?? 0,
      totalDeliveries: user.totalDeliveries ?? 0
    };
  }
}