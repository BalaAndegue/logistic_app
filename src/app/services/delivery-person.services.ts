// services/delivery-person.services.ts
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
  created_at?: string;
  updated_at?: string;
  // Propriétés calculées
  firstName?: string;
  lastName?: string;
  isAvailable?: boolean;
  vehicleType?: 'bike' | 'scooter' | 'car' | 'van';
  licensePlate?: string;
  activeDeliveries?: number;
  totalDeliveries?: number;
  rating?: number;
}

interface ApiResponse {
  message: string;
  data: DeliveryPerson[];
}

interface CreateDeliveryPersonDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  phone?: string;
  address?: string;
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

    return this.http.get<ApiResponse>(`${this.apiUrl}/users`, { params })
      .pipe(
        map(response => {
          return response.data.map(user => this.transformUser(user));
        })
      );
  }

  getById(id: number): Observable<DeliveryPerson> {
    return this.http.get<DeliveryPerson>(`${this.apiUrl}/users/${id}`)
      .pipe(
        map(user => this.transformUser(user))
      );
  }

  create(data: any): Observable<DeliveryPerson> {
    const payload: CreateDeliveryPersonDto = {
      name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      email: data.email,
      password: data.password || 'Password123!',
      password_confirmation: data.password || 'Password123!',
      role: 'DELIVERY',
      phone: data.phone,
      address: data.address
    };

    return this.http.post<{ message: string, data: DeliveryPerson }>(
      `${this.apiUrl}/users`,
      payload
    ).pipe(
      map(response => this.transformUser(response.data))
    );
  }

  update(id: number, data: any): Observable<DeliveryPerson> {
    const payload: any = {};
    
    if (data.firstName || data.lastName) {
      payload.name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
    if (data.email) payload.email = data.email;
    if (data.phone) payload.phone = data.phone;
    if (data.address) payload.address = data.address;

    return this.http.put<{ message: string, data: DeliveryPerson }>(
      `${this.apiUrl}/users/${id}`,
      payload
    ).pipe(
      map(response => this.transformUser(response.data))
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  private transformUser(user: any): DeliveryPerson {
    const nameParts = (user.name || '').split(' ');
    return {
      ...user,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      isAvailable: true,
      vehicleType: 'bike',
      licensePlate: '',
      activeDeliveries: 0,
      totalDeliveries: 0,
      rating: 5.0
    };
  }
}