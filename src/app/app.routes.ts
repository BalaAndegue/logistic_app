import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { DeliveriesComponent } from './components/deliveries/deliveries.component';
import { DriversComponent } from './components/drivers/drivers.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'deliveries', component: DeliveriesComponent },
            { path: 'drivers', component: DriversComponent },
            { path: 'reports', component: ReportsComponent },
            { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
            // Other routes will go here
        ]
    },
    { path: '**', redirectTo: '' }
    
];
