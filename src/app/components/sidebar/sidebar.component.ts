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

    // 1. Set Dashboard path based on role
    const dashboardRoute = this.currentUser.role === 'SUPERVISOR' 
      ? '/dashboard' 
      : '/dashboard';
    // Common items
    const dashboard = { label: 'Dashboard', icon: 'bi-grid', route: '/dashboard' };
    const tracking = { label: 'Live Tracking', icon: 'bi-map', route: '/live-tracking' };
    const reports = { label: 'Reports', icon: 'bi-graph-up', route: '/reports' };

    this.menuItems = [
      dashboard
    ];

    // 2. Add Supervisor-specific modules
    if (this.currentUser.role === 'SUPERVISOR') {
      this.menuItems.push(
        { label: 'Live Tracking', icon: 'bi-map', route: '/tracking' },
        { 
          label: 'Validations', 
          icon: 'bi-check-circle', 
          route: '/validations' 
        },
        { label: 'Reports', icon: 'bi-graph-up', route: '/supervisor/reports' }
      );
    }

    // 3. Admin & Manager Modules
    if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'MANAGER') {
      this.menuItems.push(
        { label: 'Drivers', icon: 'bi-people', route: '/drivers' },
        { label: 'Deliveries', icon: 'bi-box-seam', route: '/deliveries' },
        { label: 'Live Tracking', icon: 'bi-map', route: '/tracking' },
        { label: 'Reports', icon: 'bi-graph-up', route: '/reports' },
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

    // 4. Admin Only
    if (this.currentUser.role === 'ADMIN') {
      this.menuItems.push(
        { label: 'Users', icon: 'bi-person-gear', route: '/users' },
        { label: 'Settings', icon: 'bi-gear', route: '/settings' },
      );

    }
    
    // Suivi GPS (accessible à tous)
    this.menuItems.push(tracking);

   // Menu SUPERVISOR
   if (this.currentUser.role === 'SUPERVISOR') {
     this.menuItems.push(
       { label: 'Validations', icon: 'bi-check-circle', route: '/validations' }
     );
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


    // Add vendor specific menu
  if (this.currentUser.role === 'VENDOR') {
    this.menuItems.push(
      { label: 'My Products', icon: 'bi-box', route: '/vendor/products' },
      { label: 'My Categories', icon: 'bi-tags', route: '/vendor/categories' }
    );
  }
  
}

  goToLiveTracking(){
    this.router.navigate(["/live-tracking"])
  }
}
