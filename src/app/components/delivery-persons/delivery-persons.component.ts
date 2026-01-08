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
    name: '',
    email: '',
    phone: '',
    role: 'DELIVERY',
    password: '',
    password_confirmation: '',
    address: ''
  };

  searchTerm = '';
  statusFilter: 'all' | 'available' | 'busy' = 'all';

  canCreate = true;
  canEdit = true;
  canDelete = true;

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
      next: (response: any) => {
        console.log('Réponse API:', response);
        
        this.drivers = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
        this.filterDrivers();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement:', error);
        this.loading = false;
        alert('Erreur lors du chargement des livreurs');
      }
    });
  }

  filterDrivers(): void {
    this.filteredDrivers = this.drivers.filter(driver => {
      const matchSearch = this.searchTerm === '' || 
        driver.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.phone?.includes(this.searchTerm);

      
      const matchStatus = this.statusFilter === 'all';

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
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      role: driver.role || 'DELIVERY',
      address: driver.address || '',
      password: '',
      password_confirmation: ''
    };
    
    this.isModalOpen = true;
  }

  onSubmit(form: any): void {
    if (!form.valid) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

   
    const payload: any = {
      name: this.formData.name.trim(),
      email: this.formData.email.trim(),
      role: 'DELIVERY',
      phone: this.formData.phone?.trim() || '',
      address: this.formData.address?.trim() || ''
    };

    if (this.isEditMode && this.selectedDriver && this.selectedDriver.id) {
     
      if (this.formData.password && this.formData.password.trim() !== '') {
        if (this.formData.password !== this.formData.password_confirmation) {
          alert('Les mots de passe ne correspondent pas');
          return;
        }
        payload.password = this.formData.password;
        payload.password_confirmation = this.formData.password_confirmation;
      }

      console.log('Payload UPDATE:', payload);

      this.deliveryPersonService.update(this.selectedDriver.id, payload)
        .subscribe({
          next: (response) => {
            console.log('Livreur modifié:', response);
            this.loadDrivers();
            this.closeModal();
            alert('Livreur modifié avec succès !');
          },
          error: (err) => {
            console.error('Erreur update:', err);
            const errorMsg = err.error?.message || err.error?.error || JSON.stringify(err.error) || 'Erreur inconnue';
            alert('Erreur lors de la modification:\n' + errorMsg);
          }
        });
    } else {
     
      if (!this.formData.password || this.formData.password.trim() === '') {
        alert('Le mot de passe est obligatoire pour créer un livreur');
        return;
      }

      if (this.formData.password !== this.formData.password_confirmation) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      if (this.formData.password.length < 8) {
        alert('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }

      payload.password = this.formData.password;
      payload.password_confirmation = this.formData.password_confirmation;

      console.log('Payload CREATE:', payload);

      this.deliveryPersonService.create(payload)
        .subscribe({
          next: (response) => {
            console.log('Livreur créé:', response);
            this.loadDrivers();
            this.closeModal();
            alert('Livreur créé avec succès !');
          },
          error: (err) => {
            console.error('Erreur create:', err);
            const errorMsg = err.error?.message || err.error?.error || JSON.stringify(err.error) || 'Erreur inconnue';
            alert('Erreur lors de la création:\n' + errorMsg);
          }
        });
    }
  }

  deleteDriver(driver: DeliveryPerson): void {
    if (!this.canDelete || !driver.id) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${driver.name} ?\n\nCette action est irréversible.`)) {
      this.deliveryPersonService.delete(driver.id)
        .subscribe({
          next: (response) => { 
            console.log('Livreur supprimé:', response);
            this.loadDrivers();
            alert('Livreur supprimé avec succès !');
          },
          error: (err) => {
            console.error('Erreur delete:', err);
            const errorMsg = err.error?.message || err.error?.error || JSON.stringify(err.error) || 'Erreur inconnue';
            alert('Erreur lors de la suppression:\n' + errorMsg);
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
      name: '',
      email: '',
      phone: '',
      role: 'DELIVERY',
      password: '',
      password_confirmation: '',
      address: ''
    };
  }

  
  getInitialsFromName(fullName: string): string {
    if (!fullName || fullName.trim() === '') return 'NN';
    
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
    return 0;
  }

  getBusyCount(): number {
    return 0;
  }

  getAverageRating(): string {
    return '5.0';
  }
}