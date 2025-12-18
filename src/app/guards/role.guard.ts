// src/app/guards/role.guard.ts

import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router 
} from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Récupérer les rôles requis depuis les données de la route
    const requiredRoles = route.data['roles'] as string[];
    const vendorView = route.data['vendorView'] as boolean;
    
    // Si aucun rôle n'est spécifié, autoriser l'accès
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          // Utilisateur non connecté, rediriger vers login
          this.router.navigate(['/login'], { 
            queryParams: { returnUrl: state.url } 
          });
          return false;
        }

        // Vérifier si l'utilisateur a l'un des rôles requis
        const hasRequiredRole = requiredRoles.includes(user.role);
        
        // Si l'utilisateur n'a pas le rôle requis
        if (!hasRequiredRole) {
          // Rediriger vers la page d'accueil ou page non autorisée
          this.router.navigate(['/dashboard']);
          return false;
        }

        // Vérification spécifique pour la vue vendeur
        if (vendorView && user.role === 'VENDOR') {
          return true;
        }

        return hasRequiredRole;
      })
    );
  }
}