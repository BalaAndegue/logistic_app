import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface DashboardStats {
    readyToShip: number;
    inProgress: number;
    delivered: number;
    failed: number;
}

export interface ChartData {
    labels: string[];
    datasets: { label: string; data: number[]; backgroundColor?: string; borderColor?: string; fill?: boolean }[];
}

@Injectable({
    providedIn: 'root'
})
export class StatsService {

    getDashboardStats(): Observable<DashboardStats> {
        // Mock data
        return of({
            readyToShip: 12,
            inProgress: 5,
            delivered: 145,
            failed: 3
        }).pipe(delay(500));
    }

    getDeliveryTrends(): Observable<ChartData> {
        return of({
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                { label: 'Delivered', data: [65, 59, 80, 81, 56, 55, 40], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.2)', fill: true },
                { label: 'Failed', data: [2, 1, 3, 0, 2, 5, 1], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', fill: true }
            ]
        }).pipe(delay(600));
    }
}
