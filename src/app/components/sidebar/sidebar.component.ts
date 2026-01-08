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

    // 1. Set Dashboard path based on role
    const dashboardRoute = this.currentUser.role === 'SUPERVISOR' 
      ? '/dashboard' 
      : '/dashboard';

    this.menuItems = [
      { label: 'Dashboard', icon: 'bi-grid', route: dashboardRoute }
    ];

    // 2. Add Supervisor-specific modules
    if (this.currentUser.role === 'SUPERVISOR') {
      this.menuItems.push(
        { label: 'Live Tracking', icon: 'bi-map', route: '/tracking' },
        //{ label: 'Validations', icon: 'bi-shield-check', route: '/supervisor/validation' },
        { label: 'Reports', icon: 'bi-graph-up', route: '/supervisor/reports' }
      );
    }

    // 3. Admin & Manager Modules
    if (this.currentUser.role === 'ADMIN' || this.currentUser.role === 'MANAGER') {
      this.menuItems.push(
        { label: 'Drivers', icon: 'bi-people', route: '/drivers' },
        { label: 'Deliveries', icon: 'bi-box-seam', route: '/deliveries' },
        { label: 'Live Tracking', icon: 'bi-map', route: '/tracking' },
        { label: 'Reports', icon: 'bi-graph-up', route: '/reports' }
      );
    }

    // 4. Admin Only
    if (this.currentUser.role === 'ADMIN') {
      this.menuItems.push(
        { label: 'Users', icon: 'bi-person-gear', route: '/users' },
        { label: 'Settings', icon: 'bi-gear', route: '/settings' },

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
}