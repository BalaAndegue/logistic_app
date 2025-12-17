// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // URL de base de votre API Laravel (à adapter selon votre déploiement)
    private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api';
    
    private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) { }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Login avec l'API Laravel
     * @param username Nom d'utilisateur ou email
     * @param password Mot de passe
     */
    login(username: string, password: string): Observable<User> {
        // Documentation de l'API Laravel suggère d'utiliser JSON[citation:5]
        return this.http.post<{token: string, user: any}>(`${this.apiUrl}/login`, {
            email: username,  // ou 'username' selon votre API
            password: password
        }).pipe(
            map(response => {
                // Créer l'objet User à partir de la réponse
                const user: User = {
                    id: response.user.id.toString(),
                    username: response.user.name || response.user.email,
                    fullName: response.user.name,
                    role: this.mapRole(response.user.role || 'USER'), // Adaptez selon votre API
                    avatarUrl: response.user.avatar_url || 'assets/default-avatar.png',
                    token: response.token // Stocker le token
                };
                return user;
            }),
            tap(user => this.setSession(user)),
            catchError(error => {
                console.error('Login error:', error);
                return throwError(() => new Error(
                    error.error?.message || 'Invalid credentials'
                ));
            })
        );
    }

    /**
     * Déconnexion avec appel à l'API Laravel
     */
    logout(): Observable<any> {
        const user = this.currentUserValue;
        
        // Appeler l'endpoint logout de l'API si un token existe
        if (user?.token) {
            // Pour les requêtes authentifiées, inclure le token dans le header[citation:2]
            const headers = {
                'Authorization': `Bearer ${user.token}`
            };
            
            return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
                tap(() => {
                    this.clearSession();
                }),
                catchError(error => {
                    // Même en cas d'erreur, déconnecter localement
                    this.clearSession();
                    return throwError(() => error);
                })
            );
        } else {
            this.clearSession();
            return new Observable(observer => {
                observer.next({});
                observer.complete();
            });
        }
    }

    /**
     * Vérifie si l'utilisateur a les rôles requis
     */
    hasRole(allowedRoles: UserRole[]): boolean {
        const user = this.currentUserValue;
        return !!user && allowedRoles.includes(user.role);
    }

    // ========== MÉTHODES PRIVÉES ==========

    private setSession(user: User): void {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('auth_token', user.token || '');
        this.currentUserSubject.next(user);
    }

    public clearSession(): void {
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    private getUserFromStorage(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Mapper les rôles de l'API vers vos UserRole
     */
    private mapRole(apiRole: string): UserRole {
        const roleMap: {[key: string]: UserRole} = {
            'admin': 'ADMIN',
            'manager': 'MANAGER',
            'supervisor': 'SUPERVISOR',
            
        };
        return roleMap[apiRole.toLowerCase()] || 'USER';
    }

    /**
     * Récupère le token pour les requêtes authentifiées
     */
    getAuthHeaders(): {[header: string]: string} {
        const token = localStorage.getItem('auth_token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}