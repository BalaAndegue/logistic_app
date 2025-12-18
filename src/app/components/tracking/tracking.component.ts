// components/tracking/tracking.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrackingSimulationService } from '../../services/simulation.service';
import { GeolocationService } from '../../services/geolocation.service';
import { Vehicle, VehicleStatus } from '../../models/vehicle.model';
import { Subscription, interval } from 'rxjs';
import * as L from 'leaflet';
//import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/marker-icon-2x.png',
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png'
});

@Component({
    selector: 'app-tracking',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tracking.component.html',
    styleUrls: ['./tracking.component.scss']
})
export class TrackingComponent implements OnInit, OnDestroy, AfterViewInit {
    vehicles: Vehicle[] = [];
    filteredVehicles: Vehicle[] = [];
    selectedVehicle: Vehicle | null = null;
    loading = false;
    
    statusFilter = 'all';
    typeFilter = 'all';
    searchQuery = '';
    
    userPosition: {lat: number, lng: number} | null = null;
    trackingUser = false;

    private map!: L.Map;
    private markers: L.Marker[] = [];
    private userMarker: L.Marker | null = null;
    
    stats = {
        total: 0,
        available: 0,
        onRoute: 0,
        delivering: 0,
        maintenance: 0,
        returning: 0
    };
    
    private subscriptions: Subscription[] = [];

    constructor(
        private trackingService: TrackingSimulationService,
        private geolocationService: GeolocationService
    ) {}

    ngAfterViewInit() {
        this.initMap();
    }

    private initMap() {
        // Attendre que la carte soit disponible dans le DOM
        setTimeout(() => {
            this.map = L.map('live-tracking-map').setView([3.8480, 11.5021], 7);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);
            
            this.plotVehicles();
            
            this.subscriptions.push(
                this.trackingService.getRealTimeUpdates().subscribe(() => {
                    this.updateMap();
                })
            );
        }, 100);
    }

    private plotVehicles() {
        // Nettoyer les anciens marqueurs
        this.markers.forEach(marker => marker.remove());
        this.markers = [];

        this.vehicles.forEach(vehicle => {
            const icon = L.divIcon({
                className: `vehicle-marker ${vehicle.status}`,
                html: `<div class="marker-icon ${vehicle.status}"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            
            const marker = L.marker(
                [vehicle.currentLocation.lat, vehicle.currentLocation.lng],
                { icon }
            );
            
            marker.bindPopup(this.createVehiclePopup(vehicle));
            marker.addTo(this.map);
            
            marker.on('click', () => {
                this.onSelectVehicle(vehicle);
                this.centerOnMap(vehicle);
            });
            
            this.markers.push(marker);
        });
    }

    private updateMap() {
        // Si la carte n'est pas initialisée, attendre
        if (!this.map) return;

        this.vehicles.forEach((vehicle, index) => {
            if (this.markers[index]) {
                this.markers[index].setLatLng([
                    vehicle.currentLocation.lat, 
                    vehicle.currentLocation.lng
                ]);
            }
        });
        
        if (this.userPosition && this.trackingUser) {
            if (!this.userMarker) {
                const userIcon = L.divIcon({
                    className: 'user-marker',
                    html: '<div class="user-icon">📍</div>',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16]
                });
                
                this.userMarker = L.marker([this.userPosition.lat, this.userPosition.lng], {
                    icon: userIcon
                }).addTo(this.map);
            } else {
                this.userMarker.setLatLng([this.userPosition.lat, this.userPosition.lng]);
            }
        }
    }

    centerOnMap(vehicle: Vehicle) {
        if (this.map) {
            this.map.setView([vehicle.currentLocation.lat, vehicle.currentLocation.lng], 15);
        }
    }

    private createVehiclePopup(vehicle: Vehicle): string {
        return `
            <div class="vehicle-popup">
                <h5>${vehicle.licensePlate}</h5>
                <p><strong>${vehicle.driverName}</strong></p>
                <p>${this.getStatusLabel(vehicle.status)}</p>
                <p>${vehicle.speed} km/h</p>
                <p>${vehicle.battery !== null ? vehicle.battery + '% batterie' : 'Essence'}</p>
                <small>${vehicle.currentLocation.address}</small>
            </div>
        `;
    }

    // Méthode manquante
    getStatusLabel(status: string): string {
        const statusMap: { [key: string]: string } = {
            'available': 'Disponible',
            'on_route': 'En route',
            'delivering': 'En livraison',
            'returning': 'Retour',
            'maintenance': 'Maintenance'
        };
        return statusMap[status] || status;
    }

   now: Date = new Date();

// Dans ngOnInit() ou constructor, mettez à jour l'heure
ngOnInit() {
    this.loadVehicles();
    this.getUserLocation();
    
    // Mettre à jour l'heure toutes les secondes
    this.subscriptions.push(
        interval(1000).subscribe(() => {
            this.now = new Date();
        })
    );
}

    loadVehicles() {
        this.loading = true;
        this.trackingService.getVehicles().subscribe({
            next: (vehicles: Vehicle[]) => {
                this.vehicles = vehicles;
                this.filteredVehicles = vehicles;
                this.updateStats();
                this.loading = false;
            },
            error: (error: any) => {
                console.error('Error loading vehicles:', error);
                this.loading = false;
            }
        });
    }

    getUserLocation() {
        this.geolocationService.getCurrentPosition().subscribe({
            next: (position: GeolocationPosition) => {
                this.userPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            },
            error: (error: any) => {
                console.log('Geolocation error:', error);
                this.userPosition = { lat: 3.8480, lng: 11.5021 };
            }
        });
    }

    toggleUserTracking() {
        this.trackingUser = !this.trackingUser;
        if (this.trackingUser) {
            this.subscriptions.push(
                this.geolocationService.watchPosition().subscribe((position: GeolocationPosition) => {
                    this.userPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    this.updateMap();
                })
            );
        }
    }

    applyFilters() {
        this.filteredVehicles = this.vehicles.filter(vehicle => {
            let matches = true;
            
            if (this.statusFilter !== 'all') {
                matches = matches && vehicle.status === this.statusFilter;
            }
            
            if (this.typeFilter !== 'all') {
                matches = matches && vehicle.type === this.typeFilter;
            }
            
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                matches = matches && (
                    vehicle.licensePlate.toLowerCase().includes(query) ||
                    vehicle.driverName.toLowerCase().includes(query)
                );
            }
            
            return matches;
        });
    }

    updateStats() {
        this.stats = {
            total: this.vehicles.length,
            available: this.vehicles.filter(v => v.status === 'available').length,
            onRoute: this.vehicles.filter(v => v.status === 'on_route').length,
            delivering: this.vehicles.filter(v => v.status === 'delivering').length,
            maintenance: this.vehicles.filter(v => v.status === 'maintenance').length,
            returning: this.vehicles.filter(v => v.status === 'returning').length
        };
    }

    onSelectVehicle(vehicle: Vehicle) {
        this.selectedVehicle = vehicle;
    }

    sendAlert(vehicleId: string | number) {
        this.trackingService.sendCommand(vehicleId, 'alert').subscribe({
            next: (response: {success: boolean, message: string}) => {
                alert(response.message);
            },
            error: (error: any) => {
                alert('Error sending alert: ' + error.message);
            }
        });
    }

    calculateDistance(vehicle: Vehicle): number {
        if (!this.userPosition) return 0;
        
        return this.geolocationService.calculateDistance(
            this.userPosition.lat,
            this.userPosition.lng,
            vehicle.currentLocation.lat,
            vehicle.currentLocation.lng
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        if (this.map) {
            this.map.remove();
        }
    }


    getStatLabel(statKey: string): string {
  const statLabels: { [key: string]: string } = {
    'total': 'Total',
    'available': 'Disponibles',
    'onRoute': 'En route',
    'delivering': 'En livraison',
    'maintenance': 'Maintenance',
    'returning': 'Retour'
  };
  return statLabels[statKey] || statKey;
}

getTypeLabel(type: string): string {
  const typeLabels: { [key: string]: string } = {
    'truck': 'Camion',
    'van': 'Fourgon',
    'motorcycle': 'Moto',
    'car': 'Voiture'
  };
  return typeLabels[type] || type;
}
}