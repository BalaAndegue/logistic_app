// services/delivery.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Delivery {
  id: number;
  order_id: number;
  reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  city: string;
  postal_code: string;
  status: DeliveryStatus;
  driver_id?: number;
  driver_name?: string;
  assigned_at?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  proof_url?: string;
  proof_type?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type DeliveryStatus = 
  | 'PENDING'      // En attente
  | 'ASSIGNED'     // Assigné à un livreur
  | 'PICKED_UP'    // Récupéré
  | 'EN_ROUTE'     // En cours de livraison
  | 'DELIVERED'    // Livré
  | 'FAILED'       // Échoué
  | 'CANCELLED';   // Annulé

export interface DeliveryStats {
  pending: number;
  assigned: number;
  in_transit: number;
  delivered: number;
  failed: number;
  total: number;
}

export interface AutoAssignResponse {
  assigned: number;
  message: string;
}

export interface DeliveryProof {
  proof_url: string;
  proof_type: 'signature' | 'photo' | 'qr_code';
  uploaded_at: string;
}

export interface LiveLocation {
  driver_id: number;
  driver_name: string;
  latitude: number;
  longitude: number;
  last_update: string;
  delivery_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api';
  
  private deliveriesSubject = new BehaviorSubject<Delivery[]>([]);
  public deliveries$ = this.deliveriesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Récupérer toutes les livraisons (pour Admin/Manager)
   */
  getDeliveries(params?: {
    status?: string;
    driver_id?: number;
    start_date?: string;
    end_date?: string;
    page?: number;
    per_page?: number;
  }): Observable<Delivery[]> {
    // Pour l'instant, nous utiliserons les livraisons en attente comme point de départ
    // et nous ajouterons des données mock pour les autres statuts
    return this.http.get<Delivery[]>(`${this.apiUrl}/deliveries/pending`, {
      headers: this.authService.getAuthHeaders()
    }).pipe(
      map(pendingDeliveries => {
        // Simuler d'autres livraisons pour les différents statuts
        const mockDeliveries = this.generateMockDeliveries();
        const allDeliveries = [...pendingDeliveries, ...mockDeliveries];
        
        // Filtrer si des paramètres sont fournis
        if (params) {
          let filtered = allDeliveries;
          
          if (params.status) {
            filtered = filtered.filter(d => d.status === params.status);
          }
          
          if (params.driver_id) {
            filtered = filtered.filter(d => d.driver_id === params.driver_id);
          }
          
          return filtered;
        }
        
        return allDeliveries;
      }),
      tap(deliveries => this.deliveriesSubject.next(deliveries))
    );
  }

  /**
   * Récupérer les livraisons en attente (pour assignation)
   */
  getPendingDeliveries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.apiUrl}/deliveries/pending`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Assigner une livraison à un livreur
   */
  assignDelivery(orderId: number, driverId: number, notes?: string): Observable<Delivery> {
    return this.http.post<Delivery>(
      `${this.apiUrl}/deliveries/${orderId}/assign`,
      {
        delivery_user_id: driverId,
        notes: notes
      },
      {
        headers: this.authService.getAuthHeaders()
      }
    ).pipe(
      tap(updatedDelivery => {
        // Mettre à jour la liste locale
        const currentDeliveries = this.deliveriesSubject.value;
        const index = currentDeliveries.findIndex(d => d.id === orderId);
        if (index !== -1) {
          currentDeliveries[index] = updatedDelivery;
          this.deliveriesSubject.next([...currentDeliveries]);
        }
      })
    );
  }

  /**
   * Déclencher l'assignation automatique des livraisons
   */
  autoAssignDeliveries(): Observable<AutoAssignResponse> {
    // Note: Cet endpoint n'existe pas dans la documentation
    // Nous allons simuler le comportement
    return new Observable<AutoAssignResponse>(observer => {
      setTimeout(() => {
        const response: AutoAssignResponse = {
          assigned: Math.floor(Math.random() * 5) + 1, // 1-5 assignations
          message: 'Assignation automatique terminée avec succès'
        };
        observer.next(response);
        observer.complete();
      }, 1500);
    });
  }

  /**
   * Récupérer les statistiques des livraisons
   */
  getDeliveryStats(): Observable<DeliveryStats> {
    return this.getDeliveries().pipe(
      map(deliveries => {
        const stats: DeliveryStats = {
          pending: deliveries.filter(d => d.status === 'PENDING').length,
          assigned: deliveries.filter(d => d.status === 'ASSIGNED').length,
          in_transit: deliveries.filter(d => 
            d.status === 'PICKED_UP' || d.status === 'EN_ROUTE'
          ).length,
          delivered: deliveries.filter(d => d.status === 'DELIVERED').length,
          failed: deliveries.filter(d => d.status === 'FAILED').length,
          total: deliveries.length
        };
        return stats;
      })
    );
  }

  /**
   * Récupérer les positions GPS en temps réel des livreurs
   */
  getLiveLocations(): Observable<LiveLocation[]> {
    return this.http.get<LiveLocation[]>(`${this.apiUrl}/deliveries/live/map`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  /**
   * Mettre à jour le statut d'une livraison
   */
  updateDeliveryStatus(orderId: number, status: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/deliveries/${orderId}/status`,
      { status: status },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  /**
   * Récupérer la preuve de livraison
   */
  getDeliveryProof(orderId: number): Observable<DeliveryProof> {
    return this.http.get<DeliveryProof>(
      `${this.apiUrl}/deliveries/${orderId}/proof`,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  /**
   * Uploader une preuve de livraison
   */
  uploadDeliveryProof(orderId: number, proofImage: File, proofType: string): Observable<any> {
    const formData = new FormData();
    formData.append('proof_image', proofImage);
    formData.append('proof_type', proofType);

    return this.http.post(
      `${this.apiUrl}/deliveries/${orderId}/proof`,
      formData,
      {
        headers: {
          ...this.authService.getAuthHeaders(),
          // Note: Ne pas définir Content-Type pour FormData
        }
      }
    );
  }

  /**
   * Générer des données mock pour les démos
   */
  private generateMockDeliveries(): Delivery[] {
    const statuses: DeliveryStatus[] = ['ASSIGNED', 'PICKED_UP', 'EN_ROUTE', 'DELIVERED', 'FAILED'];
    const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux'];
    const drivers = [
      { id: 1, name: 'Jean Dupont' },
      { id: 2, name: 'Marie Martin' },
      { id: 3, name: 'Pierre Bernard' },
      { id: 4, name: 'Sophie Petit' }
    ];

    const mockDeliveries: Delivery[] = [];

    for (let i = 1; i <= 50; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const driver = drivers[Math.floor(Math.random() * drivers.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      
      const delivery: Delivery = {
        id: 1000 + i,
        order_id: 2000 + i,
        reference: `CMD-${2024}${String(i).padStart(4, '0')}`,
        customer_name: `Client ${i}`,
        customer_phone: `06${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        delivery_address: `${Math.floor(Math.random() * 100)} Rue de la Livraison`,
        city: city,
        postal_code: '75000',
        status: status,
        driver_id: driver.id,
        driver_name: driver.name,
        assigned_at: status !== 'PENDING' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        estimated_delivery_time: new Date(Date.now() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      if (status === 'DELIVERED' || status === 'FAILED') {
        delivery.actual_delivery_time = new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString();
      }

      if (status === 'DELIVERED') {
        delivery.proof_url = 'https://example.com/proof.jpg';
        delivery.proof_type = ['signature', 'photo', 'qr_code'][Math.floor(Math.random() * 3)] as any;
      }

      mockDeliveries.push(delivery);
    }

    return mockDeliveries;
  }
}