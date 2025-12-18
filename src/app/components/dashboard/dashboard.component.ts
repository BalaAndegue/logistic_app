import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  StatsService, 
  DashboardKPIs, 
  ChartData,
  OrderStatusDistribution,
  TopProduct 
} from '../../services/stats.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { Subscription, interval, catchError, of } from 'rxjs';

// Taux de conversion € → CFA (taux fixe)
const EUR_TO_CFA = 655.957;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  kpis: DashboardKPIs | null = null;
  orderStatusDistribution: OrderStatusDistribution | null = null;
  topProducts: TopProduct[] = [];
  
  loading = true;
  error: string | null = null;
  
  now = new Date();
  private nowInterval: any;
  private refreshSubscription!: Subscription;
  private readonly REFRESH_INTERVAL = 300000; // 5 minutes
  
  // Déclarer EUR_TO_CFA comme propriété publique pour le template
  public EUR_TO_CFA = EUR_TO_CFA;
  
  // Charts - INITIALISATION CORRECTE
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Chargement...'],
    datasets: [
      {
        label: 'Livraisons',
        data: [0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true
      }
    ]
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
        callbacks: {
          label: (context) => {
            if (context.dataset.label?.includes('Revenu')) {
              const value = context.raw as number;
              return `${context.dataset.label}: ${this.formatCFAChartTooltip(value)}`;
            }
            return `${context.dataset.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Nombre de commandes'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Revenu (Mille FCFA)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };
  
  public doughnutChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Chargement...'],
    datasets: [{
      data: [100],
      backgroundColor: ['rgba(200, 200, 200, 0.3)'],
      hoverBackgroundColor: ['rgba(200, 200, 200, 0.5)'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };
  
  public doughnutChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 11
          },
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };
  
  public doughnutChartType: 'doughnut' = 'doughnut';
  public lineChartType: 'line' = 'line';

  constructor(private statsService: StatsService) { 
    // Initialiser l'heure
    this.nowInterval = setInterval(() => {
      this.now = new Date();
    }, 1000);
  }

  ngOnInit() {
    this.loadAllData();
    
    this.refreshSubscription = interval(this.REFRESH_INTERVAL)
      .subscribe(() => {
        if (!this.loading) {
          this.loadKPIs();
        }
      });
  }

  loadAllData() {
    this.loading = true;
    this.error = null;
    
    // Charger les données en parallèle mais gérer la fin du chargement
    this.loadKPIs();
    this.loadOrderStatusDistribution();
    this.loadCharts();
    this.loadTopProducts();
  }

  loadKPIs() {
    this.statsService.getKPIs().subscribe({
      next: (response) => {
        this.kpis = response.data;
        console.log('✅ KPIs chargés:', this.kpis);
      },
      error: (error) => {
        console.error('❌ Erreur chargement KPIs:', error);
        this.error = 'Impossible de charger les données du tableau de bord';
        this.setFallbackKPIs();
      }
    });
  }

  loadCharts() {
    console.log('📈 Début du chargement du graphique...');
    
    this.statsService.getDeliveryTrends().subscribe({
      next: (data) => {
        console.log('📊 Données graphique reçues:', data);
        
        if (!data || data.labels?.[0] === 'Pas de données') {
          console.warn('⚠️ Pas de données pour le graphique');
          this.setEmptyChartData();
          return;
        }
        
        this.lineChartData = {
          labels: data.labels || [],
          datasets: (data.datasets || []).map(dataset => ({
            ...dataset,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: false
          }))
        };
      },
      error: (error) => {
        console.error('❌ Erreur chargement graphique:', error);
        this.setEmptyChartData();
      }
    });
  }

  loadOrderStatusDistribution() {
    console.log('🔄 Chargement de la distribution des statuts...');
    
    this.statsService.getOrderStatusDistribution()
      .pipe(
        catchError(error => {
          console.error('❌ Erreur API distribution:', error);
          return of({
            message: 'Erreur API',
            data: {} as OrderStatusDistribution
          });
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Distribution des statuts reçue:', response);
          this.orderStatusDistribution = response.data;
          
          if (!this.orderStatusDistribution || Object.keys(this.orderStatusDistribution).length === 0) {
            console.warn('⚠️ Données de distribution vides');
            this.setEmptyDoughnutChart();
            return;
          }
          
          this.updateDoughnutChart();
        },
        error: (error) => {
          console.error('❌ Erreur chargement order status:', error);
          this.setEmptyDoughnutChart();
        }
      });
  }

  loadTopProducts() {
    this.statsService.getTopProducts(5).subscribe({
      next: (response) => {
        this.topProducts = response.data || [];
        this.loading = false; // Fin du chargement principal
      },
      error: (error) => {
        console.error('Erreur chargement top produits:', error);
        this.topProducts = [];
        this.loading = false; // Fin du chargement même en cas d'erreur
      }
    });
  }

  private updateDoughnutChart() {
    if (!this.orderStatusDistribution) {
      this.setEmptyDoughnutChart();
      return;
    }

    const statusLabels = Object.keys(this.orderStatusDistribution);
    const statusValues = Object.values(this.orderStatusDistribution);
    
    const validatedValues = statusValues.map(value => {
      const num = Number(value);
      return isNaN(num) || num < 0 ? 0 : num;
    });

    const total = validatedValues.reduce((a, b) => a + b, 0);
    if (total === 0) {
      this.setEmptyDoughnutChart();
      return;
    }

    const statusColors = this.getStatusColors(statusLabels);

    this.doughnutChartData = {
      labels: statusLabels.map(label => this.formatStatusLabel(label)),
      datasets: [{
        data: validatedValues,
        backgroundColor: statusColors,
        hoverBackgroundColor: statusColors.map(color => this.lightenColor(color, 20)),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  private setEmptyDoughnutChart() {
    this.doughnutChartData = {
      labels: ['Aucune donnée disponible'],
      datasets: [{
        data: [100],
        backgroundColor: ['rgba(200, 200, 200, 0.3)'],
        hoverBackgroundColor: ['rgba(200, 200, 200, 0.5)'],
        borderWidth: 0
      }]
    };
  }

  private setEmptyChartData() {
    this.lineChartData = {
      labels: ['Pas de données'],
      datasets: [
        {
          label: 'Livraisons',
          data: [0],
          borderColor: 'rgb(200, 200, 200)',
          backgroundColor: 'rgba(200, 200, 200, 0.1)',
          borderWidth: 2,
          fill: true
        },
        {
          label: 'Revenu (Mille FCFA)',
          data: [0],
          borderColor: 'rgb(255, 193, 7)',
          backgroundColor: 'rgba(255, 193, 7, 0.1)',
          borderWidth: 2,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };
  }

  private formatStatusLabel(label: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'PENDING_PAYMENT': 'Paiement en attente',
      'DELIVERED': 'Livré',
      'IN_PROGRESS': 'En cours',
      'EN_ROUTE': 'En route',
      'CANCELLED': 'Annulé',
      'READY_TO_SHIP': 'Prêt à expédier'
    };
    return labels[label] || label;
  }

  private getStatusColors(labels: string[]): string[] {
    const colorMap: { [key: string]: string } = {
      'PENDING': 'rgb(147, 197, 253)',
      'PENDING_PAYMENT': 'rgb(147, 197, 253)',
      'DELIVERED': 'rgb(134, 239, 172)',
      'IN_PROGRESS': 'rgb(253, 224, 71)',
      'EN_ROUTE': 'rgb(253, 224, 71)',
      'CANCELLED': 'rgb(252, 165, 165)',
      'READY_TO_SHIP': 'rgb(196, 181, 253)'
    };
    
    return labels.map(label => colorMap[label] || 'rgb(209, 213, 219)');
  }

  private lightenColor(color: string, percent: number): string {
    return color.replace('rgb(', 'rgba(').replace(')', `, 0.8)`);
  }

  private setFallbackKPIs() {
    this.kpis = {
      total_revenue: 125000.5,
      total_orders: 520,
      new_orders_today: 12,
      active_users: 300,
      delivery_rate: 0.92,
      delivered_orders: 478,
      orders_ready_to_ship: 20,
      deliveries_in_progress: 5,
      deliveries_successful: 478,
      deliveries_failed: 2
    };
  }

  refreshData() {
    this.loading = true;
    this.error = null;
    this.loadAllData();
  }

  // ===== MÉTHODES PUBLIQUES POUR LE TEMPLATE =====
  
  formatNumber(num: number): string {
    return new Intl.NumberFormat('fr-FR').format(num);
  }

  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  }

  formatCurrencyShortCFA(amount: number): string {
    if (!amount) return '0 FCFA';
    
    const amountCFA = amount * this.EUR_TO_CFA;
    
    if (amountCFA >= 1000000000) {
      return (amountCFA / 1000000000).toFixed(1) + ' Md FCFA';
    }
    if (amountCFA >= 1000000) {
      return (amountCFA / 1000000).toFixed(1) + ' M FCFA';
    }
    if (amountCFA >= 1000) {
      return (amountCFA / 1000).toFixed(0) + ' K FCFA';
    }
    return Math.round(amountCFA).toLocaleString('fr-FR') + ' FCFA';
  }

  formatCFAChartTooltip(value: number): string {
    const amountCFA = value * 1000; // value est en milliers de CFA
    
    if (amountCFA >= 1000000) {
      return (amountCFA / 1000000).toFixed(1) + ' M FCFA';
    }
    if (amountCFA >= 1000) {
      return (amountCFA / 1000).toFixed(0) + ' K FCFA';
    }
    return Math.round(amountCFA).toLocaleString('fr-FR') + ' FCFA';
  }

  calculateRevenuePerUnit(product: any): number {
    return product.total_quantity > 0 ? product.total_revenue / product.total_quantity : 0;
  }

  getTotalRevenue(): number {
    if (!this.topProducts || this.topProducts.length === 0) {
      return 0;
    }
    
    return this.topProducts.reduce((total, product) => {
      return total + (product?.total_revenue || 0);
    }, 0);
  }

  getOrderStatusSummary(): any[] {
  if (!this.orderStatusDistribution) {
    return [];
  }
  
  const colors = {
    'PENDING': '#4dabf7',
    'PENDING_PAYMENT': '#4dabf7',
    'DELIVERED': '#51cf66',
    'IN_PROGRESS': '#ffd43b',
    'EN_ROUTE': '#ffd43b',
    'CANCELLED': '#ff6b6b',
    'READY_TO_SHIP': '#cc5de8'
  };
  
  return Object.entries(this.orderStatusDistribution)
    .map(([key, value]) => ({
      label: this.formatStatusLabel(key),
      value: value !== undefined ? value : 0,
      color: colors[key as keyof typeof colors] || '#868e96'
    }));
}


  shouldShowStatusSummary(): boolean {
  if (!this.orderStatusDistribution) {
    return false;
  }
  
  // Calculer le total en évitant les undefined
  let total = 0;
  Object.values(this.orderStatusDistribution).forEach(val => {
    if (val !== undefined) {
      total += val;
    }
  });
  
  return total > 0;
}
  getStatusPercentage(value: number): string | null {
  if (!this.orderStatusDistribution) {
    return null;
  }
  
  // Calculer le total en évitant les undefined
  let total = 0;
  Object.values(this.orderStatusDistribution).forEach(val => {
    if (val !== undefined) {
      total += val;
    }
  });
  
  if (total <= 0) {
    return null;
  }
  
  const percentage = (value / total * 100);
  return percentage.toFixed(1);
}

  exportTopProducts() {
    if (this.topProducts.length === 0) {
      console.warn('Aucun produit à exporter');
      return;
    }
    
    try {
      const headers = ['Rang', 'Produit', 'Quantité', 'Revenu (FCFA)', 'Prix unitaire (FCFA)'];
      const csvData = this.topProducts.map((product, index) => [
        index + 1,
        product.product_name || 'Non spécifié',
        product.total_quantity || 0,
        this.formatCurrencyShortCFA(product.total_revenue || 0).replace(/"/g, '""'),
        `${Math.round((product.total_revenue || 0) * this.EUR_TO_CFA / (product.total_quantity || 1)).toLocaleString('fr-FR')} FCFA`
      ]);
      
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `produits-top-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      this.error = 'Erreur lors de l\'export des produits';
    }
  }

  hasAuthData(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  ngOnDestroy() {
    if (this.nowInterval) {
      clearInterval(this.nowInterval);
    }
    
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
}