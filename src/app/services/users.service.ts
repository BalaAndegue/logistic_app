// services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserStats } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private apiUrl = 'https://shopecart-web-project-tp-4-laravel-full-pyh9fx.laravel.cloud/api';

    constructor(private http: HttpClient) { }
    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        });
    }

    // Récupérer tous les utilisateurs avec pagination/filtrage
    getUsers(page = 10, limit = 20, search = '', role = ''): Observable<{data: User[], meta: any}> {
        let params = new HttpParams()
            .set('limit', limit.toString())
            .set('per_page',"10");
            

        if (search) params = params.set('search', search);
        if (role) params = params.set('role', role);

        return this.http.get<{data: User[], meta: any}>(`${this.apiUrl}/users`, 
            { 
                headers: this.getAuthHeaders(),
                params: params 
            }
        );
    }

    // Récupérer un utilisateur par ID
    getUserById(id: string | number): Observable<{data: User}> {
        return this.http.get<{data: User}>(`${this.apiUrl}/users/${id}`,{ headers: this.getAuthHeaders() });
    }

    // Créer un nouvel utilisateur
    createUser(userData: Partial<User>): Observable<{data: User}> {
        return this.http.post<{data: User}>(`${this.apiUrl}/users`, userData,{ headers: this.getAuthHeaders() });
    }

    // Mettre à jour un utilisateur
    updateUser(id: string | number, userData: Partial<User>): Observable<{data: User}> {
        return this.http.put<{data: User}>(`${this.apiUrl}/users/${id}`, userData,{ headers: this.getAuthHeaders() });
    }

    // Supprimer un utilisateur
    deleteUser(id: string | number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/users/${id}`,{ headers: this.getAuthHeaders() });
    }

    // Récupérer les statistiques des utilisateurs
    getUserStats(): Observable<{data: UserStats}> {
        return this.http.get<{data: UserStats}>(`${this.apiUrl}/users/stats`,{ headers: this.getAuthHeaders() });
    }
}