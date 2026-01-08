import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective as NgChartsModule} from 'ng2-charts';
import { AuthService } from '../../services/auth.service';
import { ReportsService, ReportData, DriverPerformance, TimeSeriesData, ExportOptions } from '../../services/reports.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgChartsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  @ViewChild('reportContent') reportContent!: ElementRef;

  // Données
  reportData: ReportData | null = null;
  driverPerformance: DriverPerformance[] = [];
  timeSeriesData: TimeSeriesData | null = null;
  
  // Filtres
  periodOptions = [
    { value: 'day', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ];
  selectedPeriod: string = 'week';
  
  // Options d'export
  exportFormats = [
    { value: 'pdf', label: 'PDF', icon: 'bi-file-earmark-pdf' },
    { value: 'excel', label: 'Excel', icon: 'bi-file-earmark-excel' },
    { value: 'csv', label: 'CSV', icon: 'bi-file-earmark-text' }
  ];
  exportOptions: ExportOptions = {
    format: 'pdf',
    period: 'week',
    includeCharts: true,
    includeDetails: true
  };
  
  // Graphiques
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: []
  };
  
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de livraisons'
        }
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Taux de succès (%)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };
  
  public lineChartType: 'line' = 'line';
  
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };
  
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'top'
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Livreurs'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre de livraisons'
        }
      }
    }
  };
  
  public barChartType: 'bar' = 'bar';
  
  // Loading states
  loading = true;
  exporting = false;
  
  // Méthodes utilitaires exposées
  Math = Math;
  getExportIcon = () => this.exportFormats.find(f => f.value === this.exportOptions.format)?.icon || 'bi-file-earmark';
  getPeriodLabelText = () => this.periodOptions.find(p => p.value === this.selectedPeriod)?.label || '';

  constructor(
    private reportsService: ReportsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading = true;
    
    // Charger les données du rapport
    this.reportsService.getReportData(this.selectedPeriod).subscribe({
      next: (data) => {
        this.reportData = data;
      },
      error: (error) => {
        console.error('Error loading report data:', error);
      }
    });
    
    // Charger les performances des livreurs
    this.reportsService.getDriverPerformance().subscribe({
      next: (data) => {
        this.driverPerformance = data;
        this.updateBarChart();
      },
      error: (error) => {
        console.error('Error loading driver performance:', error);
      }
    });
    
    // Charger les données de série temporelle
    this.reportsService.getTimeSeriesData(this.selectedPeriod).subscribe({
      next: (data) => {
        this.timeSeriesData = data;
        this.updateLineChart(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading time series data:', error);
        this.loading = false;
      }
    });
  }

  updateLineChart(data: TimeSeriesData): void {
    this.lineChartData = {
      labels: data.labels,
      datasets: data.datasets.map((dataset, index) => ({
        ...dataset,
        yAxisID: index === 0 ? 'y' : 'y1',
        tension: 0.4
      }))
    };
  }

  updateBarChart(): void {
    const topDrivers = this.driverPerformance
      .sort((a, b) => b.successful_deliveries - a.successful_deliveries)
      .slice(0, 8);

    this.barChartData = {
      labels: topDrivers.map(d => d.driver_name.split(' ')[0]),
      datasets: [
        {
          label: 'Livraisons réussies',
          data: topDrivers.map(d => d.successful_deliveries),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        },
        {
          label: 'Livraisons échouées',
          data: topDrivers.map(d => d.failed_deliveries),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
        }
      ]
    };
  }

  onPeriodChange(): void {
    this.loadReports();
    this.exportOptions.period = this.selectedPeriod;
  }

  exportReport(): void {
    this.exporting = true;
    
    this.reportsService.exportReport(this.exportOptions).subscribe({
      next: (response) => {
        this.exporting = false;
        this.showNotification(response.message, 'success');
        
        // Si une URL est fournie, ouvrir dans un nouvel onglet
        if (response.url) {
          window.open(response.url, '_blank');
        }
      },
      error: (error) => {
        console.error('Error exporting report:', error);
        this.exporting = false;
        this.showNotification('Erreur lors de l\'exportation du rapport', 'error');
      }
    });
  }

  getSuccessColor(rate: number): string {
    if (rate >= 95) return 'var(--success-color)';
    if (rate >= 85) return 'var(--warning-color)';
    return 'var(--danger-color)';
  }

  getTimeColor(time: number): string {
    if (time <= 45) return 'var(--success-color)';
    if (time <= 60) return 'var(--warning-color)';
    return 'var(--danger-color)';
  }

  getPerformanceClass(rate: number): string {
    if (rate >= 95) return 'performance-excellent';
    if (rate >= 85) return 'performance-good';
    if (rate >= 70) return 'performance-average';
    return 'performance-poor';
  }

  canExport(): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'ADMIN' || user?.role === 'MANAGER';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins} min`;
  }

  // Méthode pour gérer le changement de format d'export
setExportFormat(format: string): void {
  // Validation du type
  if (format === 'pdf' || format === 'excel' || format === 'csv') {
    this.exportOptions.format = format;
  } else {
    console.warn(`Format d'export non valide: ${format}`);
  }
}
  // Méthode pour obtenir le label de période sélectionnée
  getSelectedPeriodLabel(): string {
    const period = this.periodOptions.find(p => p.value === this.selectedPeriod);
    return period ? period.label : '';
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: var(--border-radius);
      color: white;
      font-weight: 500;
      z-index: 1001;
      box-shadow: var(--box-shadow);
      animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'success') {
      notification.style.backgroundColor = 'var(--success-color)';
    } else if (type === 'error') {
      notification.style.backgroundColor = 'var(--danger-color)';
    } else {
      notification.style.backgroundColor = 'var(--primary-color)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}