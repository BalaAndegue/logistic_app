import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.currentUserValue) {
        // Check if route has expected roles
        const expectedRoles = route.data['roles'];
        if (expectedRoles && !authService.hasRole(expectedRoles)) {
            // Role not authorized, maybe redirect to home or unauthorized page
            // For now, redirect to login or dashboard
            return router.createUrlTree(['/']);
        }
        return true;
    }

    // Not logged in
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
