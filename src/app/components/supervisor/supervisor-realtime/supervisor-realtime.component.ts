import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { SupervisorMockService } from '../../../services/supervisor-mock.service';

@Component({
  selector: 'app-supervisor-realtime',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supervisor-realtime.component.html',
  styleUrls: ['./supervisor-realtime.component.scss']
})
export class SupervisorRealtimeComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private markers: L.Marker[] = [];

  constructor(private supervisorService: SupervisorMockService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadLiveDrivers();
  }

  private initMap(): void {
    // Initializing map centered on a default location (e.g., Douala/Yaoundé or generic)
    this.map = L.map('map').setView([4.05, 9.7], 13); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private loadLiveDrivers(): void {
    // We will add mock driver positions from the service in the next sub-step
    const mockDrivers = [
      { id: 1, name: 'Driver A', lat: 4.05, lng: 9.7, status: 'In Transit' },
      { id: 2, name: 'Driver B', lat: 4.06, lng: 9.71, status: 'Delivering' }
    ];

    mockDrivers.forEach(driver => {
      const marker = L.marker([driver.lat, driver.lng])
        .addTo(this.map)
        .bindPopup(`<b>${driver.name}</b><br>Status: ${driver.status}`);
      this.markers.push(marker);
    });
  }
}