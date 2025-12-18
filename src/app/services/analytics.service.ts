import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api';

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  // GET /api/dashboard/kpis
  getDashboardKpis(): Observable<{data: any}> {
    return this.http.get<{data: any}>(`${this.apiUrl}/dashboard/kpis`, { 
      headers: this.getAuthHeaders() 
    });
  }

  // GET /api/dashboard/sales-over-time
  getSalesTrends(period: string = 'day', days: number = 30): Observable<{data: any[]}> {
    return this.http.get<{data: any[]}>(`${this.apiUrl}/dashboard/sales-over-time`, {
      headers: this.getAuthHeaders(),
      params: { period, days: days.toString() }
    });
  }
}