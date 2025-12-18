// guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // ✅ Récupération des rôles requis depuis la route
  const requiredRoles = route.data['roles'] as UserRole[];
  
  // ✅ Vérification si l'utilisateur a l'un des rôles requis
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