import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { authGuard } from './guards/auth.guard';
import { TrackingComponent } from './components/tracking/tracking.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'users', component: UsersComponent },
            {path: 'tracking',component :TrackingComponent},
            {
    path: 'categories',
    loadComponent: () => import('./components/categories/category-list/category-list.component')
      .then(m => m.CategoryListComponent),
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'categories/new',
    loadComponent: () => import('./components/categories/category-form/category-form.component')
      .then(m => m.CategoryFormComponent),
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  {
    path: 'categories/:id/edit',
    loadComponent: () => import('./components/categories/category-form/category-form.component')
      .then(m => m.CategoryFormComponent),
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER'] }
  },
  
  // Products
  {
    path: 'products',
    loadComponent: () => import('./components/products/product-list/product-list.component')
      .then(m => m.ProductListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'products/new',
    loadComponent: () => import('./components/products/product-form/product-form.component')
      .then(m => m.ProductFormComponent),
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER', 'VENDOR'] }
  },
  {
    path: 'products/:id/edit',
    loadComponent: () => import('./components/products/product-form/product-form.component')
      .then(m => m.ProductFormComponent),
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['ADMIN', 'MANAGER', 'VENDOR'] }
  },
  {
    path: 'products/:slug',
    loadComponent: () => import('./components/products/product-detail/product-detail.component')
      .then(m => m.ProductDetailComponent)
  },
  
  // Vendor routes
  {
    path: 'vendor/products',
    loadComponent: () => import('./components/products/product-list/product-list.component')
      .then(m => m.ProductListComponent),
    canActivate: [authGuard, RoleGuard],
    data: { roles: ['VENDOR'], vendorView: true }
  }
            // Other routes will go here
        ]
    },
    { path: '**', redirectTo: '' }
];
