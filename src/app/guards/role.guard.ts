import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as UserRole[];
  if (requiredRoles && requiredRoles.length > 0) {
    const hasAccess = authService.hasRole(requiredRoles);
    
    if (!hasAccess) {
      console.warn('Accès refusé : rôle insuffisant');
      router.navigate(['/dashboard']);
      return false;
    }
  }
  
  return true;
};