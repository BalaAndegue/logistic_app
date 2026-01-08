import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { 
  DeliveryService, 
  Delivery, 
  DeliveryStatus 
} from '../../services/delivery.service';
import { 
  DriverService, 
  Driver 
} from '../../services/driver.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './deliveries.component.html',
  styleUrls: ['./deliveries.component.scss']
})
export class DeliveriesComponent implements OnInit {
  deliveries: Delivery[] = [];
  filteredDeliveries: Delivery[] = [];
  drivers: Driver[] = [];
  
  // Filtres
  statusFilter: string = 'all';
  driverFilter: string = 'all';
  searchQuery: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  // Modal
  showAssignModal: boolean = false;
  selectedDelivery: Delivery | null = null;
  selectedDriverId: number | null = null;
  assignmentNotes: string = '';
  
  // Loading states
  loading: boolean = true;
  assigning: boolean = false;
  
  // Status options
  statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'ASSIGNED', label: 'Assigné' },
    { value: 'PICKED_UP', label: 'Récupéré' },
    { value: 'EN_ROUTE', label: 'En cours' },
    { value: 'DELIVERED', label: 'Livré' },
    { value: 'FAILED', label: 'Échoué' }
  ];

  // Exposer Math au template
  Math = Math;

  constructor(
    private deliveryService: DeliveryService,
    private driverService: DriverService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDeliveries();
    this.loadDrivers();
  }

  loadDeliveries(): void {
    this.loading = true;
    this.deliveryService.getDeliveries().subscribe({
      next: (data) => {
        this.deliveries = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading deliveries:', error);
        this.loading = false;
        // En cas d'erreur, utiliser les données mockées
        this.deliveries = [];
        this.applyFilters();
      }
    });
  }

  loadDrivers(): void {
    this.driverService.getDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
      },
      error: (error) => {
        console.error('Error loading drivers:', error);
        this.drivers = [];
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.deliveries];

    // Filtre par statut
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(d => d.status === this.statusFilter);
    }

    // Filtre par livreur
    if (this.driverFilter !== 'all') {
      filtered = filtered.filter(d => d.driver_id?.toString() === this.driverFilter);
    }

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(d => 
        d.customer_name.toLowerCase().includes(query) ||
        d.reference.toLowerCase().includes(query) ||
        d.delivery_address.toLowerCase().includes(query) ||
        d.city.toLowerCase().includes(query)
      );
    }

    this.filteredDeliveries = filtered;
    this.totalItems = filtered.length;
    this.currentPage = 1; // Reset à la première page après filtrage
  }

  get paginatedDeliveries(): Delivery[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDeliveries.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pageNumbers(): number[] {
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  openAssignModal(delivery: Delivery): void {
    this.selectedDelivery = delivery;
    this.selectedDriverId = delivery.driver_id || null;
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedDelivery = null;
    this.selectedDriverId = null;
    this.assignmentNotes = '';
  }

  assignDelivery(): void {
    if (!this.selectedDelivery || !this.selectedDriverId) return;

    this.assigning = true;
    this.deliveryService.assignDelivery(
      this.selectedDelivery.id,
      this.selectedDriverId,
      this.assignmentNotes
    ).subscribe({
      next: (updatedDelivery) => {
        // Mettre à jour la livraison dans la liste
        const index = this.deliveries.findIndex(d => d.id === updatedDelivery.id);
        if (index !== -1) {
          this.deliveries[index] = updatedDelivery;
        }
        this.applyFilters();
        this.closeAssignModal();
        this.assigning = false;
        
        // Notification de succès
        this.showNotification('Livraison assignée avec succès !', 'success');
      },
      error: (error) => {
        console.error('Error assigning delivery:', error);
        this.assigning = false;
        this.showNotification('Erreur lors de l\'assignation: ' + (error.error?.message || 'Vérifiez votre connexion'), 'error');
      }
    });
  }

  triggerAutoAssignment(): void {
    if (confirm('Voulez-vous déclencher l\'assignation automatique des livraisons en attente ?')) {
      this.deliveryService.autoAssignDeliveries().subscribe({
        next: (result) => {
          this.loadDeliveries(); // Recharger les livraisons
          this.showNotification(`${result.assigned} livraisons assignées automatiquement`, 'success');
        },
        error: (error) => {
          console.error('Error in auto assignment:', error);
          this.showNotification('Erreur lors de l\'assignation automatique', 'error');
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'PENDING': 'badge-warning',
      'ASSIGNED': 'badge-info',
      'PICKED_UP': 'badge-primary-light',
      'EN_ROUTE': 'badge-primary',
      'DELIVERED': 'badge-success',
      'FAILED': 'badge-danger',
      'CANCELLED': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'ASSIGNED': 'Assigné',
      'PICKED_UP': 'Récupéré',
      'EN_ROUTE': 'En cours',
      'DELIVERED': 'Livré',
      'FAILED': 'Échoué',
      'CANCELLED': 'Annulé'
    };
    return labels[status] || status;
  }

  getDriverName(driverId?: number): string {
    if (!driverId) return 'Non assigné';
    const driver = this.drivers.find(d => d.id === driverId);
    return driver ? driver.full_name : 'Inconnu';
  }

  canAssign(): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'ADMIN' || user?.role === 'MANAGER';
  }

  canAutoAssign(): boolean {
    const user = this.authService.currentUserValue;
    return user?.role === 'ADMIN' || user?.role === 'MANAGER';
  }

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
  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    
    // Ajouter les animations CSS si elles n'existent pas
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}