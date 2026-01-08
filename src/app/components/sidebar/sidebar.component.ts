// components/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule,Router } from '@angular/router';
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

  constructor(private authService: AuthService,private router:Router) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateMenu();
    });
  }

  updateMenu() {
    if (!this.currentUser) return;

    // Common items
    const dashboard = { label: 'Dashboard', icon: 'bi-grid', route: '/dashboard' };
    const tracking = { label: 'Live Tracking', icon: 'bi-map', route: '/live-tracking' };
    const reports = { label: 'Reports', icon: 'bi-graph-up', route: '/reports' };

    // Role specific
    const restrictedReports = { ...reports, label: 'My Stats' }; // Example diff if needed

    // Initialisation avec le dashboard
    this.menuItems = [dashboard];

    // Menus ADMIN et MANAGER
    if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'MANAGER') {
      this.menuItems.push(
        { 
          label: 'Livreurs',
          icon: 'bi-people', 
          route: '/delivery-persons' 
        },
        { 
          label: 'Commandes',
          icon: 'bi-box-seam', 
          route: '/deliveries' 
        }
      );
    }

    // Suivi GPS (accessible à tous)
    this.menuItems.push(tracking);

    // Menu SUPERVISOR
    if (this.currentUser.role === 'SUPERVISOR') {
      this.menuItems.push({ 
        label: 'Validations', 
        icon: 'bi-check-circle', 
        route: '/validations' 
      });
    }

    // Rapports (accessible à tous)
    this.menuItems.push(reports);

    // Menus ADMIN uniquement
    if (this.currentUser.role === 'ADMIN') {
      this.menuItems.push(
        { 
          label: 'Utilisateurs',
          icon: 'bi-person-gear', 
          route: '/users' 
        },
        { 
          label: 'Paramètres',
          icon: 'bi-gear', 
          route: '/settings' 
        }
      );
    }
  }
}

  goToLiveTracking(){
    this.router.navigate(["/live-tracking"])
  }
}
