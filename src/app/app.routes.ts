import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { SupervisorDashboardComponent } from './components/supervisor/supervisor-dashboard.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'test-supervisor', component: SupervisorDashboardComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            // Other routes will go here
        ]
    },
    { path: '**', redirectTo: '' }
];
