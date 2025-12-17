import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DriverService, Driver } from '../../services/driver.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './drivers.component.html',
  styleUrls: ['./drivers.component.scss']
})
export class DriversComponent implements OnInit {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = [];
  
  // Filtres
  statusFilter: string = 'all';
  vehicleFilter: string = 'all';
  searchQuery: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalItems: number = 0;
  
  // Modal
  showDriverModal: boolean = false;
  showDeleteModal: boolean = false;
  editingDriver: Driver | null = null;
  deletingDriver: Driver | null = null;
  
  // Formulaire
  driverForm: any = {
    full_name: '',
    email: '',
    phone: '',
    vehicle_type: 'BIKE',
    license_plate: '',
    max_deliveries_per_day: 20
  };
  
  // Loading states
  loading: boolean = true;
  saving: boolean = false;
  deleting: boolean = false;
  
  // Filtres
  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'AVAILABLE', label: 'Disponible' },
    { value: 'BUSY', label: 'Occupé' },
    { value: 'OFFLINE', label: 'Hors ligne' }
  ];
  
  vehicleOptions = [
    { value: 'all', label: 'Tous les véhicules' },
    { value: 'BIKE', label: 'Vélo' },
    { value: 'SCOOTER', label: 'Scooter' },
    { value: 'CAR', label: 'Voiture' },
    { value: 'VAN', label: 'Camionnette' }
  ];

  Math = Math;

  constructor(
    private driverService: DriverService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading = true;
    this.driverService.getDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.loading = false;
        this.drivers = [];
        this.applyFilters();
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.drivers];

    // Filtre par statut
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === this.statusFilter);
    }

    // Filtre par véhicule
    if (this.vehicleFilter !== 'all') {
      filtered = filtered.filter(d => d.vehicle_type === this.vehicleFilter);
    }

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.full_name.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query) ||
        d.phone.includes(query)
      );
    }

    this.filteredDrivers = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1;
  }

  get paginatedDrivers(): Driver[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDrivers.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Modals
  openCreateModal(): void {
    this.editingDriver = null;
    this.driverForm = {
      full_name: '',
      email: '',
      phone: '',
      vehicle_type: 'BIKE',
      license_plate: '',
      max_deliveries_per_day: 20
    };
    this.showDriverModal = true;
  }

  openEditModal(driver: Driver): void {
    this.editingDriver = driver;
    this.driverForm = {
      full_name: driver.full_name,
      email: driver.email,
      phone: driver.phone,
      vehicle_type: driver.vehicle_type,
      license_plate: driver.license_plate || '',
      max_deliveries_per_day: driver.max_deliveries_per_day
    };
    this.showDriverModal = true;
  }

  openDeleteModal(driver: Driver): void {
    this.deletingDriver = driver;
    this.showDeleteModal = true;
  }

  closeDriverModal(): void {
    this.showDriverModal = false;
    this.editingDriver = null;
    this.driverForm = {};
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deletingDriver = null;
  }

  // CRUD Operations
  saveDriver(): void {
    if (!this.validateForm()) return;

    this.saving = true;
    const driverData = { ...this.driverForm };

    if (this.editingDriver) {
      // Mettre à jour
      this.driverService.updateDriver(this.editingDriver.id, driverData).subscribe({
        next: () => {
          this.loadDrivers();
          this.closeDriverModal();
          this.saving = false;
          this.showNotification('Livreur mis à jour avec succès', 'success');
        },
        error: (error) => {
          console.error('Error updating driver:', error);
          this.saving = false;
          this.showNotification('Erreur lors de la mise à jour', 'error');
        }
      });
    } else {
      // Créer
      this.driverService.createDriver(driverData).subscribe({
        next: () => {
          this.loadDrivers();
          this.closeDriverModal();
          this.saving = false;
          this.showNotification('Livreur créé avec succès', 'success');
        },
        error: (error) => {
          console.error('Error creating driver:', error);
          this.saving = false;
          this.showNotification('Erreur lors de la création', 'error');
        }
      });
    }
  }

  deleteDriver(): void {
    if (!this.deletingDriver) return;

    this.deleting = true;
    this.driverService.deleteDriver(this.deletingDriver.id).subscribe({
      next: () => {
        this.loadDrivers();
        this.closeDeleteModal();
        this.deleting = false;
        this.showNotification('Livreur supprimé avec succès', 'success');
      },
      error: (error) => {
        console.error('Error deleting driver:', error);
        this.deleting = false;
        this.showNotification('Erreur lors de la suppression', 'error');
      }
    });
  }

  // Validation
  validateForm(): boolean {
    if (!this.driverForm.full_name?.trim()) {
      this.showNotification('Le nom complet est requis', 'error');
      return false;
    }
    if (!this.driverForm.email?.trim()) {
      this.showNotification('L\'email est requis', 'error');
      return false;
    }
    if (!this.driverForm.phone?.trim()) {
      this.showNotification('Le téléphone est requis', 'error');
      return false;
    }
    return true;
  }

  // Utilitaires
  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'AVAILABLE': 'badge-success',
      'BUSY': 'badge-warning',
      'OFFLINE': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'AVAILABLE': 'Disponible',
      'BUSY': 'Occupé',
      'OFFLINE': 'Hors ligne'
    };
    return labels[status] || status;
  }

  getVehicleIcon(vehicleType: string): string {
    const icons: { [key: string]: string } = {
      'BIKE': 'bi-bicycle',
      'SCOOTER': 'bi-scooter',
      'CAR': 'bi-car-front',
      'VAN': 'bi-truck'
    };
    return icons[vehicleType] || 'bi-person';
  }

  getVehicleLabel(vehicleType: string): string {
    const labels: { [key: string]: string } = {
      'BIKE': 'Vélo',
      'SCOOTER': 'Scooter',
      'CAR': 'Voiture',
      'VAN': 'Camionnette'
    };
    return labels[vehicleType] || vehicleType;
  }

  canManageDrivers(): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'ADMIN' || user?.role === 'MANAGER';
  }

  // Pagination
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Méthode pour formater la date
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Méthode pour afficher des notifications
  private showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style de la notification
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
    
    // Supprimer après 3 secondes
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