import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface SupervisorStats {
  readyToShip: number;
  inProgress: number;
  pendingValidation: number;
  delivered: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupervisorMockService {
  constructor() {}

  // Simulates fetching dashboard statistics
  getDashboardStats(): Observable<SupervisorStats> {
    return of({
      readyToShip: 15,
      inProgress: 8,
      pendingValidation: 5,
      delivered: 42
    }).pipe(delay(800)); // Simulate network latency
  }

  // Simulates fetching chart data
  getPerformanceTrends(): Observable<any> {
    return of({
      labels: ['8am', '10am', '12pm', '2pm', '4pm', '6pm'],
      datasets: [
        {
          label: 'Deliveries Validated',
          data: [5, 12, 18, 10, 15, 20],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    }).pipe(delay(1000));
  }
}