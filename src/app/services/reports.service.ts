// services/reports.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { DeliveryService } from './delivery.service';
import { DriverService } from './driver.service';

export interface ReportData {
  period: string;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  averageDeliveryTime: number; // en minutes
  revenue?: number; // optionnel, si applicable
}

export interface DriverPerformance {
  driver_id: number;
  driver_name: string;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  success_rate: number;
  average_delivery_time: number;
  rating?: number;
}

export interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  period: string;
  includeCharts: boolean;
  includeDetails: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private deliveryService: DeliveryService,
    private driverService: DriverService
  ) {}

  /**
   * Récupérer les données de rapport pour une période donnée
   */
  getReportData(period: string = 'week'): Observable<ReportData> {
    // Pour l'instant, nous simulons les données
    // Plus tard, nous pourrions appeler l'API
    return this.deliveryService.getDeliveries().pipe(
      map(deliveries => {
        const delivered = deliveries.filter(d => d.status === 'DELIVERED').length;
        const failed = deliveries.filter(d => d.status === 'FAILED').length;
        const total = deliveries.length;
        const successRate = total > 0 ? (delivered / total) * 100 : 0;
        
        // Simuler des temps de livraison
        const deliveryTimes = this.generateDeliveryTimes(delivered);
        const averageTime = deliveryTimes.length > 0 
          ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length 
          : 0;

        return {
          period: this.getPeriodLabel(period),
          totalDeliveries: total,
          successfulDeliveries: delivered,
          failedDeliveries: failed,
          successRate: parseFloat(successRate.toFixed(2)),
          averageDeliveryTime: parseFloat(averageTime.toFixed(1)),
          revenue: this.calculateRevenue(deliveries)
        };
      }),
      catchError(error => {
        console.error('Error generating report:', error);
        return of(this.getMockReportData(period));
      })
    );
  }

  /**
   * Récupérer les performances des livreurs
   */
  getDriverPerformance(): Observable<DriverPerformance[]> {
    return this.driverService.getDrivers().pipe(
      map(drivers => {
        // Simuler les données de performance
        return drivers.map(driver => {
          const total = Math.floor(Math.random() * 50) + 10;
          const successful = Math.floor(total * (0.8 + Math.random() * 0.15));
          const failed = total - successful;
          const successRate = parseFloat(((successful / total) * 100).toFixed(2));
          const avgTime = 45 + Math.random() * 30; // 45-75 minutes

          return {
            driver_id: driver.id,
            driver_name: driver.full_name,
            total_deliveries: total,
            successful_deliveries: successful,
            failed_deliveries: failed,
            success_rate: successRate,
            average_delivery_time: parseFloat(avgTime.toFixed(1)),
            rating: driver.rating
          };
        });
      }),
      catchError(error => {
        console.error('Error getting driver performance:', error);
        return of(this.getMockDriverPerformance());
      })
    );
  }

  /**
   * Récupérer les données de série temporelle
   */
  getTimeSeriesData(period: string = 'week'): Observable<TimeSeriesData> {
    const { labels, data } = this.generateTimeSeriesData(period);

    return of({
      labels: labels,
      datasets: [
        {
          label: 'Livraisons',
          data: data.deliveries,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)'
        },
        {
          label: 'Taux de succès (%)',
          data: data.successRates,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)'
        }
      ]
    });
  }

  /**
   * Exporter les données
   */
  exportReport(options: ExportOptions): Observable<{ message: string; url?: string }> {
  console.log('Exporting report with options:', options);
  
  // Simuler l'export sans URL externe
  return new Observable(observer => {
    setTimeout(() => {
      observer.next({
        message: `Rapport exporté en ${options.format.toUpperCase()} avec succès.`
        // Pas d'URL pour éviter l'ouverture
      });
      observer.complete();
    }, 2000);
  });
}

  /**
   * Générer des données de série temporelle
   */
  private generateTimeSeriesData(period: string): { labels: string[], data: any } {
    let labels: string[];
    let deliveries: number[];
    let successRates: number[];

    switch(period) {
      case 'day':
        labels = ['00h', '04h', '08h', '12h', '16h', '20h'];
        deliveries = [10, 25, 45, 60, 40, 20];
        successRates = [85, 88, 92, 90, 87, 89];
        break;
      case 'week':
        labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        deliveries = [120, 145, 160, 155, 180, 210, 95];
        successRates = [88, 90, 92, 91, 89, 93, 87];
        break;
      case 'month':
        labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
        deliveries = [500, 550, 600, 580];
        successRates = [89, 91, 92, 90];
        break;
      default:
        labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        deliveries = [120, 145, 160, 155, 180, 210, 95];
        successRates = [88, 90, 92, 91, 89, 93, 87];
    }

    return {
      labels,
      data: {
        deliveries,
        successRates: successRates.map(rate => rate)
      }
    };
  }

  /**
   * Générer des temps de livraison simulés
   */
  private generateDeliveryTimes(count: number): number[] {
    const times: number[] = [];
    for (let i = 0; i < count; i++) {
      times.push(30 + Math.random() * 90); // 30-120 minutes
    }
    return times;
  }

  /**
   * Calculer le revenu simulé
   */
  private calculateRevenue(deliveries: any[]): number {
    const deliveredCount = deliveries.filter(d => d.status === 'DELIVERED').length;
    return deliveredCount * 5.99; // Prix moyen par livraison
  }

  /**
   * Obtenir le libellé de la période
   */
  private getPeriodLabel(period: string): string {
    const labels: { [key: string]: string } = {
      'day': 'Aujourd\'hui',
      'week': 'Cette semaine',
      'month': 'Ce mois',
      'quarter': 'Ce trimestre',
      'year': 'Cette année'
    };
    return labels[period] || period;
  }

  /**
   * Données mockées pour les rapports
   */
  private getMockReportData(period: string): ReportData {
    const periods = ['day', 'week', 'month'];
    const periodIndex = periods.indexOf(period) >= 0 ? periods.indexOf(period) : 1;
    const multiplier = [1, 7, 30][periodIndex];

    const total = 150 * multiplier;
    const delivered = Math.floor(total * 0.9);
    const failed = total - delivered;
    const successRate = parseFloat(((delivered / total) * 100).toFixed(2));
    const avgTime = 45 + (Math.random() * 30);

    return {
      period: this.getPeriodLabel(period),
      totalDeliveries: total,
      successfulDeliveries: delivered,
      failedDeliveries: failed,
      successRate: successRate,
      averageDeliveryTime: parseFloat(avgTime.toFixed(1)),
      revenue: delivered * 5.99
    };
  }

  /**
   * Données mockées pour les performances des livreurs
   */
  private getMockDriverPerformance(): DriverPerformance[] {
    const names = [
      'Jean Dupont', 'Marie Martin', 'Pierre Bernard', 'Sophie Petit',
      'Thomas Dubois', 'Julie Moreau', 'Nicolas Lefebvre', 'Emilie Garcia'
    ];

    return names.map((name, index) => {
      const total = Math.floor(Math.random() * 50) + 10;
      const successful = Math.floor(total * (0.8 + Math.random() * 0.15));
      const failed = total - successful;
      const successRate = parseFloat(((successful / total) * 100).toFixed(2));
      const avgTime = 45 + Math.random() * 30;

      return {
        driver_id: index + 1,
        driver_name: name,
        total_deliveries: total,
        successful_deliveries: successful,
        failed_deliveries: failed,
        success_rate: successRate,
        average_delivery_time: parseFloat(avgTime.toFixed(1)),
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1))
      };
    });
  }
}