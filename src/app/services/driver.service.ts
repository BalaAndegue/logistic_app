// services/driver.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Driver {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  vehicle_type: 'BIKE' | 'SCOOTER' | 'CAR' | 'VAN';
  license_plate?: string;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  current_delivery_count: number;
  max_deliveries_per_day: number;
  rating?: number;
  total_deliveries: number;
  successful_deliveries: number;
  last_location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  created_at: string;
  updated_at: string;
}

export interface DriverStats {
  total_drivers: number;
  available_drivers: number;
  busy_drivers: number;
  offline_drivers: number;
  average_rating: number;
  total_deliveries_today: number;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api';
  
  private driversSubject = new BehaviorSubject<Driver[]>([]);
  public drivers$ = this.driversSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Récupérer tous les livreurs
   * Note: L'API n'a pas d'endpoint pour les livreurs, nous allons simuler
   */
  getDrivers(): Observable<Driver[]> {
    // Pour l'instant, nous allons retourner des données mock
    // Quand l'API aura un endpoint pour les livreurs, nous l'utiliserons
    const mockDrivers = this.generateMockDrivers();
    return new Observable<Driver[]>(observer => {
      observer.next(mockDrivers);
      observer.complete();
    }).pipe(
      tap(drivers => this.driversSubject.next(drivers))
    );
  }

  /**
   * Récupérer un livreur par ID
   */
  getDriverById(id: number): Observable<Driver> {
    return this.drivers$.pipe(
      map(drivers => {
        const driver = drivers.find(d => d.id === id);
        if (!driver) {
          throw new Error(`Driver with id ${id} not found`);
        }
        return driver;
      })
    );
  }

  /**
   * Créer un nouveau livreur
   */
  createDriver(driverData: Partial<Driver>): Observable<Driver> {
    const newDriver: Driver = {
      id: Math.floor(Math.random() * 1000) + 100,
      user_id: Math.floor(Math.random() * 1000),
      full_name: driverData.full_name || '',
      email: driverData.email || '',
      phone: driverData.phone || '',
      vehicle_type: driverData.vehicle_type || 'BIKE',
      license_plate: driverData.license_plate,
      status: 'AVAILABLE',
      current_delivery_count: 0,
      max_deliveries_per_day: 20,
      total_deliveries: 0,
      successful_deliveries: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return new Observable<Driver>(observer => {
      setTimeout(() => {
        const currentDrivers = this.driversSubject.value;
        this.driversSubject.next([...currentDrivers, newDriver]);
        observer.next(newDriver);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Mettre à jour un livreur
   */
  updateDriver(id: number, updates: Partial<Driver>): Observable<Driver> {
    return new Observable<Driver>(observer => {
      setTimeout(() => {
        const currentDrivers = this.driversSubject.value;
        const index = currentDrivers.findIndex(d => d.id === id);
        
        if (index === -1) {
          observer.error(new Error(`Driver with id ${id} not found`));
          return;
        }

        const updatedDriver = {
          ...currentDrivers[index],
          ...updates,
          updated_at: new Date().toISOString()
        };

        currentDrivers[index] = updatedDriver;
        this.driversSubject.next([...currentDrivers]);
        
        observer.next(updatedDriver);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Supprimer un livreur
   */
  deleteDriver(id: number): Observable<boolean> {
    return new Observable<boolean>(observer => {
      setTimeout(() => {
        const currentDrivers = this.driversSubject.value;
        const filteredDrivers = currentDrivers.filter(d => d.id !== id);
        
        if (filteredDrivers.length === currentDrivers.length) {
          observer.error(new Error(`Driver with id ${id} not found`));
          return;
        }

        this.driversSubject.next(filteredDrivers);
        observer.next(true);
        observer.complete();
      }, 500);
    });
  }

  /**
   * Récupérer les statistiques des livreurs
   */
  getDriverStats(): Observable<DriverStats> {
    return this.drivers$.pipe(
      map(drivers => {
        const totalDrivers = drivers.length;
        const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE').length;
        const busyDrivers = drivers.filter(d => d.status === 'BUSY').length;
        const offlineDrivers = drivers.filter(d => d.status === 'OFFLINE').length;
        
        const ratings = drivers.filter(d => d.rating).map(d => d.rating!);
        const averageRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;
        
        const totalDeliveriesToday = drivers.reduce(
          (sum, driver) => sum + driver.current_delivery_count, 
          0
        );

        return {
          total_drivers: totalDrivers,
          available_drivers: availableDrivers,
          busy_drivers: busyDrivers,
          offline_drivers: offlineDrivers,
          average_rating: averageRating,
          total_deliveries_today: totalDeliveriesToday
        };
      })
    );
  }

  /**
   * Générer des données mock pour les livreurs
   */
  private generateMockDrivers(): Driver[] {
    const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Julie', 'Nicolas', 'Emilie'];
    const lastNames = ['Dupont', 'Martin', 'Bernard', 'Petit', 'Dubois', 'Moreau', 'Lefebvre', 'Garcia'];
    const vehicleTypes: ('BIKE' | 'SCOOTER' | 'CAR' | 'VAN')[] = ['BIKE', 'SCOOTER', 'CAR', 'VAN'];
    const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nice', 'Nantes'];

    const drivers: Driver[] = [];

    for (let i = 1; i <= 15; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const vehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      const status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' = 
        Math.random() > 0.7 ? 'BUSY' : Math.random() > 0.5 ? 'AVAILABLE' : 'OFFLINE';

      const driver: Driver = {
        id: i,
        user_id: 1000 + i,
        full_name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `06${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
        vehicle_type: vehicleType,
        license_plate: vehicleType === 'BIKE' ? undefined : `AB-${String(100 + i).padStart(3, '0')}-CD`,
        status: status,
        current_delivery_count: Math.floor(Math.random() * 5),
        max_deliveries_per_day: vehicleType === 'VAN' ? 30 : vehicleType === 'CAR' ? 25 : 20,
        rating: Math.random() > 0.3 ? Number((3.5 + Math.random() * 1.5).toFixed(1)) : undefined,
        total_deliveries: Math.floor(Math.random() * 500) + 50,
        successful_deliveries: Math.floor(Math.random() * 450) + 40,
        last_location: Math.random() > 0.2 ? {
          latitude: 48.8566 + (Math.random() - 0.5) * 0.2,
          longitude: 2.3522 + (Math.random() - 0.5) * 0.2,
          timestamp: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString()
        } : undefined,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      drivers.push(driver);
    }

    return drivers;
  }
}