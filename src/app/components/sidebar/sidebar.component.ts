
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  currentUser: User | null = null;

  menuItems: any[] = [];

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateMenu();
    });
  }

  updateMenu() {
    if (!this.currentUser) return;

    // Common items
    const dashboard = { label: 'Dashboard', icon: 'bi-grid', route: '/dashboard' };
    const tracking = { label: 'Live Tracking', icon: 'bi-map', route: '/tracking' };
    const reports = { label: 'Reports', icon: 'bi-graph-up', route: '/reports' };

    // Role specific
    const restrictedReports = { ...reports, label: 'My Stats' }; // Example diff if needed

    this.menuItems = [dashboard];

    if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'MANAGER') {
      this.menuItems.push(
        { label: 'Drivers', icon: 'bi-people', route: '/drivers' },
        { label: 'Deliveries', icon: 'bi-box-seam', route: '/deliveries' }
      );
    }

    this.menuItems.push(tracking);

    // Supervisor also validates proofs, maybe under tracking or separate? 
    // Spec says: "Preuves de Livraison : Visualiser ... Valider". 
    // Let's add a separate menu for Proofs/Validation if needed, or keep it inside Deliveries for context.
    // For Supervisor specifically, they might want a direct list of "Pending Validation"
    if (this.currentUser.role === 'SUPERVISOR') {
      this.menuItems.push({ label: 'Validations', icon: 'bi-check-circle', route: '/validations' });
    }

    this.menuItems.push(reports);

    if (this.currentUser.role === 'ADMIN') {
      this.menuItems.push(
        { label: 'Users', icon: 'bi-person-gear', route: '/users' },
        { label: 'Settings', icon: 'bi-gear', route: '/settings' }
      );
    }
  }
}
