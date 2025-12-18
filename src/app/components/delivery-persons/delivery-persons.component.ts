// services/delivery-person.services.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// components/delivery-persons/delivery-persons.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeliveryPersonsService, DeliveryPerson } from '../../services/delivery-person.services';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-delivery-persons',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delivery-persons.component.html',
  styleUrls: ['./delivery-persons.component.scss']
})
export class DeliveryPersonsComponent implements OnInit {
  drivers: DeliveryPerson[] = [];
  filteredDrivers: DeliveryPerson[] = [];
  selectedDriver: DeliveryPerson | null = null;
  isModalOpen = false;
  isEditMode = false;
  loading = true;

  formData: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: 'Password123!',
    address: '',
    vehicleType: 'bike',
    licensePlate: '',
    isAvailable: true
  };

  searchTerm = '';
  statusFilter: 'all' | 'available' | 'busy' = 'all';

  canCreate = false;
  canEdit = false;
  canDelete = false;

  constructor(
    private deliveryPersonService: DeliveryPersonsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkPermissions();
    this.loadDrivers();
  }

  checkPermissions(): void {
    const isManagerOrAdmin = this.authService.hasRole(['ADMIN', 'MANAGER'] as UserRole[]);
    this.canCreate = isManagerOrAdmin;
    this.canEdit = isManagerOrAdmin;
    this.canDelete = isManagerOrAdmin;
  }

  loadDrivers(): void {
    this.loading = true;
    this.deliveryPersonService.getAll().subscribe({
      next: (drivers) => {
        console.log('✅ Livreurs chargés:', drivers);
        this.drivers = drivers;
        this.filterDrivers();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement:', error);
        this.loading = false;
        alert('Erreur lors du chargement des livreurs');
      }
    });
  }

  filterDrivers(): void {
    this.filteredDrivers = this.drivers.filter(driver => {
      const matchSearch = this.searchTerm === '' || 
        driver.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.phone?.includes(this.searchTerm);

      const matchStatus = this.statusFilter === 'all' ||
        (this.statusFilter === 'available' && driver.isAvailable) ||
        (this.statusFilter === 'busy' && !driver.isAvailable);

      return matchSearch && matchStatus;
    });
  }

  setStatusFilter(filter: 'all' | 'available' | 'busy'): void {
    this.statusFilter = filter;
    this.filterDrivers();
  }

  openCreateModal(): void {
    if (!this.canCreate) return;
    
    this.isEditMode = false;
    this.selectedDriver = null;
    this.resetForm();
    this.isModalOpen = true;
  }

  openEditModal(driver: DeliveryPerson): void {
    if (!this.canEdit) return;
    
    this.isEditMode = true;
    this.selectedDriver = { ...driver };
    this.formData = {
      firstName: driver.firstName || '',
      lastName: driver.lastName || '',
      email: driver.email,
      phone: driver.phone,
      address: driver.address,
      vehicleType: driver.vehicleType || 'bike',
      licensePlate: driver.licensePlate || '',
      isAvailable: driver.isAvailable
    };
    this.isModalOpen = true;
  }

  onSubmit(form: any): void {
    if (!form.valid) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.isEditMode && this.selectedDriver && this.selectedDriver.id) {
      // Mise à jour
      this.deliveryPersonService.update(this.selectedDriver.id, this.formData)
        .subscribe({
          next: () => {
            console.log('✅ Livreur modifié');
            this.loadDrivers();
            this.closeModal();
            alert('Livreur modifié avec succès !');
          },
          error: (err) => {
            console.error('❌ Erreur update:', err);
            alert('Erreur lors de la modification: ' + (err.error?.message || 'Erreur inconnue'));
          }
        });
    } else {
      // Création
      this.deliveryPersonService.create(this.formData)
        .subscribe({
          next: () => {
            console.log('✅ Livreur créé');
            this.loadDrivers();
            this.closeModal();
            alert('Livreur créé avec succès !');
          },
          error: (err) => {
            console.error('❌ Erreur create:', err);
            alert('Erreur lors de la création: ' + (err.error?.message || 'Erreur inconnue'));
          }
        });
    }
  }

  deleteDriver(driver: DeliveryPerson): void {
    if (!this.canDelete || !driver.id) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${driver.name} ?`)) {
      this.deliveryPersonService.delete(driver.id)
        .subscribe({
          next: () => {
            console.log('✅ Livreur supprimé');
            this.loadDrivers();
            alert('Livreur supprimé avec succès !');
          },
          error: (err) => {
            console.error('❌ Erreur delete:', err);
            alert('Erreur lors de la suppression');
          }
        });
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedDriver = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: 'Password123!',
      address: '',
      vehicleType: 'bike',
      licensePlate: '',
      isAvailable: true
    };
  }

  getInitialsFromName(fullName: string): string {
    if (!fullName) return 'NN';
    
    const parts = fullName.trim().split(' ');
    
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    
    return fullName.substring(0, 2).toUpperCase();
  }

  getVehicleIcon(vehicleType: string): string {
    const icons: { [key: string]: string } = {
      bike: 'bi bi-bicycle',
      scooter: 'bi bi-scooter',
      car: 'bi bi-car-front',
      van: 'bi bi-truck'
    };
    return icons[vehicleType] || 'bi bi-truck';
  }

  getAvailableCount(): number {
    return this.drivers.filter(d => d.isAvailable).length;
  }

  getBusyCount(): number {
    return this.drivers.filter(d => !d.isAvailable).length;
  }

  getAverageRating(): string {
    if (this.drivers.length === 0) return '0.0';
    const sum = this.drivers.reduce((acc, driver) => acc + (driver.rating || 0), 0);
    return (sum / this.drivers.length).toFixed(1);
  }
}