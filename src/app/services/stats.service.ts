// stats.service.ts - Version complète corrigée
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

// Taux de conversion € → CFA (taux fixe)
const EUR_TO_CFA = 655.957;

export interface DashboardKPIs {
  total_revenue: number;
  total_orders: number;
  new_orders_today: number;
  active_users: number;
  delivery_rate: number;
  delivered_orders: number;
  orders_ready_to_ship: number;
  deliveries_in_progress: number;
  deliveries_successful: number;
  deliveries_failed: number;
}

export interface SalesOverTime {
  label: string;
  revenue: number;
  order_count: number;
}

export interface TopProduct {
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface OrderStatusDistribution {
  PENDING?: number;
  PENDING_PAYMENT?: number;
  DELIVERED?: number;
  IN_PROGRESS?: number;
  EN_ROUTE?: number;
  CANCELLED?: number;
  READY_TO_SHIP?: number;
  [key: string]: number | undefined; // Signature d'index pour flexibilité
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    yAxisID?: string;
    borderWidth?: number;
    pointRadius?: number;
    pointBackgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api/dashboard';

  constructor(private http: HttpClient) {
    console.log('Service StatsService initialisé avec URL:', this.apiUrl);
  }

  // Méthode pour se connecter
  login(credentials: {email: string, password: string}): Observable<any> {
    const url = this.apiUrl.replace('/dashboard', '') + '/login';
    return this.http.post(url, credentials);
  }

  // Récupérer les headers d'authentification
  private getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    console.error('❌ Aucun token d\'authentification trouvé');
    // Retourner des headers basiques sans auth
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  }
  
  console.log('🔐 Utilisation du token:', {
    length: token.length,
    startsWith: token.substring(0, 20)
  });
  
  return {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };
}

  // Récupérer les KPIs
  getKPIs(): Observable<ApiResponse<DashboardKPIs>> {
    console.log('📡 Appel API: getKPIs');
    
    return this.http.get<ApiResponse<DashboardKPIs>>(
      `${this.apiUrl}/kpis`, 
      this.getAuthHeaders()
    ).pipe(
      tap(response => {
        console.log('✅ KPIs reçus:', response.data);
      }),
      catchError(error => {
        console.error('❌ Erreur getKPIs:', error);
        return this.handleError<DashboardKPIs>(error);
      })
    );
  }

  // Récupérer les ventes dans le temps
  getSalesOverTime(period: 'day' | 'week' | 'month' = 'day', days: number = 7): Observable<ApiResponse<SalesOverTime[]>> {
  console.log('📡 Appel API: getSalesOverTime', { period, days });
  
  let params = new HttpParams()
    .set('period', period)
    .set('days', days.toString());
  
  const options = {
    params: params,
    ...this.getAuthHeaders()
  };
  
  return this.http.get<ApiResponse<SalesOverTime[]>>(
    `${this.apiUrl}/sales-over-time`, 
    options
  ).pipe(
    tap(response => {
      console.log('📊 Réponse sales-over-time:', {
        message: response.message,
        hasData: !!response.data,
        isServerError: response.message === 'Server Error'
      });
    }),
    catchError(error => {
      console.error('❌ Erreur getSalesOverTime:', {
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        error: error.error
      });
      
      // Retourner une réponse structurée même en cas d'erreur
      if (error.status === 500) {
        return of({
          message: 'Server Error',
          data: [] as SalesOverTime[]
        });
      }
      
      return of({
        message: error.status === 401 ? 'Session expirée' : 'Erreur API',
        data: [] as SalesOverTime[]
      });
    })
  );
}

  // Récupérer les produits les plus vendus
  getTopProducts(limit: number = 5): Observable<ApiResponse<TopProduct[]>> {
    console.log('📡 Appel API: getTopProducts');
    
    let params = new HttpParams().set('limit', limit.toString());
    
    const options = {
      params: params,
      ...this.getAuthHeaders()
    };
    
    return this.http.get<ApiResponse<TopProduct[]>>(
      `${this.apiUrl}/top-products`, 
      options
    ).pipe(
      tap(response => {
        console.log('✅ TopProducts reçus:', response.data?.length || 0, 'produits');
      }),
      catchError(error => {
        console.error('❌ Erreur getTopProducts:', error);
        return this.handleError<TopProduct[]>(error);
      })
    );
  }

  // Récupérer la distribution des statuts
  getOrderStatusDistribution(): Observable<ApiResponse<OrderStatusDistribution>> {
    console.log('📡 Appel API: getOrderStatusDistribution');
    
    return this.http.get<ApiResponse<OrderStatusDistribution>>(
      `${this.apiUrl}/order-status-distribution`,
      this.getAuthHeaders()
    ).pipe(
      tap(response => {
        console.log('✅ OrderStatusDistribution reçue:', response.data);
      }),
      catchError(error => {
        console.error('❌ Erreur getOrderStatusDistribution:', error);
        return this.handleError<OrderStatusDistribution>(error);
      })
    );
  }

  // Convertir les données de vente pour Chart.js - OPTIMISÉ POUR CFA
  getDeliveryTrends(): Observable<ChartData> {
  console.log('📡 Début getDeliveryTrends');
  
  return new Observable<ChartData>(subscriber => {
   this.getSalesOverTime('day', 7).subscribe({
      next: (response) => {
        try {
          // VÉRIFIER SI C'EST UNE ERREUR SERVEUR
          if (response.message === 'Server Error') {
            console.warn('⚠️ API sales-over-time retourne une erreur serveur');
            console.log('Utilisation des données de démonstration...');
            subscriber.next(this.getFallbackChartData());
            subscriber.complete();
            return;
          }
          
          let data = response.data;
          
          if (!data || data.length === 0) {
            console.warn('⚠️ Aucune donnée disponible pour le graphique');
            subscriber.next(this.getFallbackChartData());
            subscriber.complete();
            return;
          }

          // Vérifier si on a des données réelles
          const hasRealData = data.some(item => 
            (item.order_count && item.order_count > 0) || 
            (item.revenue && item.revenue > 0)
          );
          
          if (!hasRealData) {
            console.warn('⚠️ Données toutes à zéro');
            subscriber.next(this.getFallbackChartData());
            subscriber.complete();
            return;
          }

          // Formatage des dates pour les labels
          const labels = data.map(item => {
            try {
              const [year, month, day] = item.label.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString('fr-FR', { 
                weekday: 'short', 
                day: 'numeric' 
              });
            } catch (e) {
              return item.label;
            }
          });

          const deliveriesData = data.map(item => item.order_count || 0);
          
          // CONVERSION € → CFA et normalisation en milliers
          const revenueData = data.map(item => {
            const revenue = item.revenue || 0;
            return (revenue * EUR_TO_CFA) / 1000; // Milliers de CFA
          });

          // Création des données de graphique
          const chartData: ChartData = {
            labels: labels,
            datasets: [
              {
                label: 'Livraisons',
                data: deliveriesData,
                borderColor: 'rgb(59, 130, 246)', // Bleu
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                yAxisID: 'y',
                pointRadius: 4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                tension: 0.4,
                fill: false
              },
              {
                label: 'Revenu (Mille FCFA)',
                data: revenueData,
                borderColor: 'rgb(255, 193, 7)', // Or pour CFA
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                borderWidth: 2,
                yAxisID: 'y1',
                pointRadius: 4,
                pointBackgroundColor: 'rgb(255, 193, 7)',
                tension: 0.4,
                fill: false
              }
            ]
          };

          console.log('✅ Graphique formaté (CFA):', {
            labels: labels,
            deliveriesData: deliveriesData,
            revenueDataCFA: revenueData
          });
          
          subscriber.next(chartData);
          subscriber.complete();
          
        } catch (error) {
          console.error('❌ Erreur lors du formatage:', error);
          subscriber.next(this.getFallbackChartData());
          subscriber.complete();
        }
      },
      error: (error) => {
        console.error('❌ Erreur API sales-over-time:', error);
        subscriber.next(this.getFallbackChartData());
        subscriber.complete();
      }
    });
  });
}
private getFallbackChartData(): ChartData {
  const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Données exemple pour CFA
  const deliveriesData = [12, 19, 8, 15, 22, 18, 14];
  const revenueData = [3.2, 4.1, 2.8, 3.5, 4.8, 3.9, 3.2]; // en milliers de CFA
  
  return {
    labels: labels,
    datasets: [
      {
        label: 'Livraisons (exemple)',
        data: deliveriesData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        yAxisID: 'y',
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Revenu (Mille FCFA) - Exemple',
        data: revenueData,
        borderColor: 'rgb(255, 193, 7)',
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderWidth: 2,
        yAxisID: 'y1',
        pointRadius: 4,
        pointBackgroundColor: 'rgb(255, 193, 7)',
        tension: 0.4,
        fill: false
      }
    ]
  };
}

  // NOUVELLE MÉTHODE : Charger toutes les données du dashboard en une fois
  getDashboardData(): Observable<{
    kpis: ApiResponse<DashboardKPIs>;
    distribution: ApiResponse<OrderStatusDistribution>;
    topProducts: ApiResponse<TopProduct[]>;
    chartData: ChartData;
  }> {
    console.log('📡 Chargement des données complètes du dashboard...');
    
    return new Observable(subscriber => {
      forkJoin({
        kpis: this.getKPIs(),
        distribution: this.getOrderStatusDistribution(),
        topProducts: this.getTopProducts(5),
        chartData: this.getDeliveryTrends()
      }).subscribe({
        next: (results) => {
          console.log('✅ Toutes les données chargées avec succès');
          subscriber.next(results);
          subscriber.complete();
        },
        error: (error) => {
          console.error('❌ Erreur lors du chargement des données:', error);
          subscriber.error(error);
        }
      });
    });
  }

  // Méthode auxiliaire pour données vides
 private getEmptyChartData(): ChartData {
  return {
    labels: ['Pas de données'],
    datasets: [
      {
        label: 'Livraisons',
        data: [0],
        borderColor: 'rgb(200, 200, 200)',
        backgroundColor: 'rgba(200, 200, 200, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(200, 200, 200)',
        tension: 0.4,
        fill: false
      },
      {
        label: 'Revenu (Mille FCFA)',
        data: [0],
        borderColor: 'rgb(200, 200, 200)',
        backgroundColor: 'rgba(200, 200, 200, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(200, 200, 200)',
        yAxisID: 'y1',
        tension: 0.4,
        fill: false
      }
    ]
  };
}

  // Gestionnaire d'erreur générique
  private handleError<T>(error: any): Observable<ApiResponse<T>> {
    console.error('🔴 Erreur API détaillée:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url
    });
    
    let errorMessage = 'Erreur inconnue';
    if (error.status === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
    } else if (error.status === 404) {
      errorMessage = 'API non disponible. Veuillez réessayer plus tard.';
    } else if (error.status === 0) {
      errorMessage = 'Pas de connexion internet. Vérifiez votre connexion.';
    }
    
    // Retourner une réponse vide au lieu de throw
    return of({
      message: errorMessage,
      data: {} as T
    });
  }

  // Méthode utilitaire pour convertir les revenus en CFA
  convertToCFA(eurAmount: number): number {
    return eurAmount * EUR_TO_CFA;
  }

  // Méthode pour formater les montants CFA
  formatCFA(amount: number): string {
    if (!amount && amount !== 0) return '0 FCFA';
    
    const amountCFA = this.convertToCFA(amount);
    
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

  // Méthode pour vérifier l'authentification
  checkAuth(): boolean {
    const token = localStorage.getItem('auth_token');
    const hasToken = !!token;
    console.log('🔐 État authentification:', { hasToken, tokenLength: token?.length });
    return hasToken;
  }

  // Méthode pour tester la connexion API
  testConnection(): Observable<boolean> {
    return new Observable(subscriber => {
      this.getKPIs().subscribe({
        next: () => {
          console.log('✅ Connexion API réussie');
          subscriber.next(true);
          subscriber.complete();
        },
        error: (error) => {
          console.error('❌ Connexion API échouée:', error);
          subscriber.next(false);
          subscriber.complete();
        }
      });
    });
  }
}