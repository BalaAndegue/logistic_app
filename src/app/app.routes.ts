import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UsersComponent } from './components/users/users.component';
import { authGuard } from './guards/auth.guard';
import { SupervisorDashboardComponent } from './components/supervisor/supervisor-dashboard.component';
import { SupervisorRealtimeComponent } from './components/supervisor/supervisor-realtime/supervisor-realtime.component';
import { ValidationComponent } from './components/supervisor/validation/validation.component';
import { ReportsComponent } from './components/supervisor/reports/reports.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    // Inside your app.routes.ts children array:
    { 
    path: 'supervisor', 
    component: MainLayoutComponent,
    children: [
        { path: 'dashboard', component: SupervisorDashboardComponent },
        { path: 'realtime', component: SupervisorRealtimeComponent }, // Next step
        { path: 'validation', component: ValidationComponent }, // Next step
        { path: 'reports', component: ReportsComponent }
    ]
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'users', component: UsersComponent },
            // Other routes will go here
        ]
    },
    { path: '**', redirectTo: '' }
];
