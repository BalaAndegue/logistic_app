import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

// auth.guard.ts (extrait modifié)
export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.currentUserValue) {
        // Vérifier aussi la présence du token
        const token = localStorage.getItem('auth_token');
        if (!token) {
            authService.clearSession();
            return router.createUrlTree(['/login']);
        }

        const expectedRoles = route.data['roles'];
        if (expectedRoles && !authService.hasRole(expectedRoles)) {
            return router.createUrlTree(['/unauthorized']);
        }
        return true;
    }

    return router.createUrlTree(['/login'], { 
        queryParams: { returnUrl: state.url } 
    });
};
