// services/simulation.service.ts
import { Injectable } from '@angular/core';
import { Observable, interval, BehaviorSubject, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Vehicle, VehicleStatus } from '../models/vehicle.model';

@Injectable({
    providedIn: 'root'
})
export class TrackingSimulationService {
    private vehiclesSubject = new BehaviorSubject<Vehicle[]>(this.generateMockVehicles());
    private updatesSubject = new BehaviorSubject<VehicleStatus[]>([]);
    
    vehicles$ = this.vehiclesSubject.asObservable();
    updates$ = this.updatesSubject.asObservable();

    constructor() {
        // Démarrer la simulation
        this.startSimulation();
    }

    // Générer des véhicules fictifs au Cameroun
    private generateMockVehicles(): Vehicle[] {
        const cities = [
            { name: 'Yaoundé', lat: 3.8480, lng: 11.5021 },
            { name: 'Douala', lat: 4.0511, lng: 9.7679 },
            { name: 'Bafoussam', lat: 5.4667, lng: 10.4167 },
            { name: 'Bamenda', lat: 5.9333, lng: 10.1667 },
            { name: 'Garoua', lat: 9.3000, lng: 13.4000 }
        ];

        const drivers = [
            'Jean Mbarga', 'Paul Atangana', 'Marie Ngo', 'Pierre Djoumessi',
            'Alice Nkeng', 'David Fotso', 'Sarah Tchaptchet', 'Marc Nana'
        ];

        const statuses: Vehicle['status'][] = ['available', 'on_route', 'delivering', 'returning'];
        const types: Vehicle['type'][] = ['truck', 'van', 'motorcycle', 'car'];

        return Array.from({ length: 15 }, (_, i) => {
            const city = cities[Math.floor(Math.random() * cities.length)];
            const speed = Math.random() * 60 + 20; // 20-80 km/h
            const battery = Math.floor(Math.random() * 100);
            
            return {
                id: i + 1,
                licensePlate: `CM-${String(i+1).padStart(3, '0')}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                driverName: drivers[Math.floor(Math.random() * drivers.length)],
                driverPhone: `+237 6${Math.floor(Math.random() * 9000000) + 1000000}`,
                type: types[Math.floor(Math.random() * types.length)],
                status: statuses[Math.floor(Math.random() * statuses.length)],
                currentLocation: {
                    lat: city.lat + (Math.random() * 0.05 - 0.025), // Variation autour de la ville
                    lng: city.lng + (Math.random() * 0.05 - 0.025),
                    address: `Rue ${Math.floor(Math.random() * 100)}, ${city.name}`,
                    timestamp: new Date().toISOString()
                },
                speed: Math.round(speed),
                battery: battery > 20 ? battery : null, // Pas de batterie pour les véhicules à essence
                temperature: Math.random() > 0.7 ? Math.round(Math.random() * 10 + 2) : null, // 2-12°C pour les réfrigérés
                lastUpdate: new Date().toISOString(),
                route: Math.random() > 0.5 ? {
                    origin: cities[Math.floor(Math.random() * cities.length)].name,
                    destination: cities[Math.floor(Math.random() * cities.length)].name,
                    estimatedArrival: new Date(Date.now() + Math.random() * 3600000).toISOString(),
                    distanceRemaining: Math.round(Math.random() * 100)
                } : undefined
            };
        });
    }

    // Simuler le mouvement des véhicules
    private startSimulation() {
        interval(3000).subscribe(() => {
            const currentVehicles = this.vehiclesSubject.value;
            const updatedVehicles = currentVehicles.map(vehicle => {
                // Déplacer légèrement le véhicule
                const latChange = (Math.random() - 0.5) * 0.001;
                const lngChange = (Math.random() - 0.5) * 0.001;
                
                // Changer occasionnellement de statut
                let newStatus = vehicle.status;
                if (Math.random() < 0.1) { // 10% de chance de changer de statut
                    const statuses: Vehicle['status'][] = ['available', 'on_route', 'delivering', 'returning'];
                    newStatus = statuses[Math.floor(Math.random() * statuses.length)];
                }

                // Mettre à jour les autres données
                const newSpeed = Math.max(0, (vehicle.speed || 0) + (Math.random() - 0.5) * 10);
                const newBattery = vehicle.battery ? Math.max(0, vehicle.battery - Math.random() * 2) : null;

                return {
                    ...vehicle,
                    status: newStatus,
                    currentLocation: {
                        ...vehicle.currentLocation,
                        lat: vehicle.currentLocation.lat + latChange,
                        lng: vehicle.currentLocation.lng + lngChange,
                        timestamp: new Date().toISOString()
                    },
                    speed: Math.round(newSpeed),
                    battery: newBattery,
                    lastUpdate: new Date().toISOString()
                };
            });

            this.vehiclesSubject.next(updatedVehicles);
            
            // Émettre les mises à jour
            const updates: VehicleStatus[] = updatedVehicles.map(v => ({
                vehicleId: v.id,
                status: v.status,
                location: v.currentLocation,
                timestamp: v.lastUpdate,
                additionalData: {
                    speed: v.speed,
                    battery: v.battery,
                    temperature: v.temperature
                }
            }));
            
            this.updatesSubject.next(updates);
        });
    }

    // Obtenir les véhicules (simulé)
    getVehicles(): Observable<Vehicle[]> {
        return this.vehicles$;
    }

    // Obtenir les mises à jour en temps réel
    getRealTimeUpdates(): Observable<VehicleStatus[]> {
        return interval(3000).pipe(
            switchMap(() => this.updates$)
        );
    }

    // Envoyer une commande (simulée)
    sendCommand(vehicleId: string | number, command: string, data?: any): Observable<{success: boolean, message: string}> {
        console.log(`Command sent to vehicle ${vehicleId}:`, command, data);
        
        // Simulation de réponse
        return of({
            success: true,
            message: `Command '${command}' executed successfully on vehicle ${vehicleId}`
        });
    }

    // Obtenir l'historique (simulé)
    getVehicleHistory(vehicleId: string | number): Observable<VehicleStatus[]> {
        const now = new Date();
        const history: VehicleStatus[] = [];
        
        // Générer 24 points d'historique (une par heure)
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 3600000);
            history.push({
                vehicleId,
                status: Math.random() > 0.7 ? 'on_route' : 'delivering',
                location: {
                    lat: 3.8480 + (Math.random() * 0.1 - 0.05),
                    lng: 11.5021 + (Math.random() * 0.1 - 0.05),
                    timestamp: time.toISOString()
                },
                timestamp: time.toISOString(),
                additionalData: {
                    speed: Math.round(Math.random() * 80 + 20),
                    battery: Math.random() > 0.3 ? Math.round(Math.random() * 100) : null
                }
            });
        }
        
        return of(history);
    }

    // Rechercher un véhicule par plaque ou conducteur
    searchVehicles(query: string): Observable<Vehicle[]> {
        return this.vehicles$.pipe(
            map(vehicles => vehicles.filter(v => 
                v.licensePlate.toLowerCase().includes(query.toLowerCase()) ||
                v.driverName.toLowerCase().includes(query.toLowerCase())
            ))
        );
    }

    // Filtrer par statut/type
    filterVehicles(status?: string, type?: string): Observable<Vehicle[]> {
        return this.vehicles$.pipe(
            map(vehicles => vehicles.filter(v => {
                let match = true;
                if (status && status !== 'all') match = match && v.status === status;
                if (type && type !== 'all') match = match && v.type === type;
                return match;
            }))
        );
    }
}