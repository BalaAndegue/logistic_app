// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DeliveryPersonsComponent } from './components/delivery-persons/delivery-persons.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '', 
        redirectTo: 'dashboard', 
        pathMatch: 'full' 
      },
      { 
        path: 'dashboard', 
        component: DashboardComponent 
      },
      // --- ROUTES DU MANAGER ET ADMIN ---
      { 
        path: 'delivery-persons', 
        component: DeliveryPersonsComponent,
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] as UserRole[] }
      },
    ]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];