import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { delay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private router: Router) { }

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    login(username: string): Observable<User> {
        // Mock login logic
        let user: User | null = null;

        if (username.toLowerCase().includes('admin')) {
            user = { id: '1', username: 'admin', fullName: 'System Administrator', role: 'ADMIN', avatarUrl: 'assets/admin.png' };
        } else if (username.toLowerCase().includes('manager')) {
            user = { id: '2', username: 'manager', fullName: 'Logistics Manager', role: 'MANAGER', avatarUrl: 'assets/manager.png' };
        } else if (username.toLowerCase().includes('super')) {
            user = { id: '3', username: 'supervisor', fullName: 'Field Supervisor', role: 'SUPERVISOR', avatarUrl: 'assets/supervisor.png' };
        }

        if (user) {
            return of(user).pipe(
                delay(800), // Simulate network
                tap(u => this.setSession(u))
            );
        } else {
            return throwError(() => new Error('Invalid credentials'));
        }
    }

    logout() {
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    private setSession(user: User) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }

    private getUserFromStorage(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    hasRole(allowedRoles: UserRole[]): boolean {
        const user = this.currentUserValue;
        return !!user && allowedRoles.includes(user.role);
    }
}
