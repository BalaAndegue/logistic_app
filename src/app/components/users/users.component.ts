// components/users/users.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { AuthService } from '../../services/auth.service';
import { User, UserStats } from '../../models/user.model';
import { UserFormComponent } from './user-form/user-form.component';
import { UserListComponent } from './user-list/user-list.component';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule, UserFormComponent, UserListComponent],
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
    users: User[] = [];
    stats: UserStats | null = null;
    loading = true;
    searchQuery = '';
    selectedRole = '';
    currentPage = 1;
    itemsPerPage = 10;
    totalPages = 10;
    totalItems = 0;
    showForm = false;
    selectedUser: User | null = null;
    isEditing = false;

    @ViewChild(UserListComponent) userListComponent!: UserListComponent;

    constructor(
        private usersService: UsersService,
        public authService: AuthService
    ) { }

    ngOnInit() {
        this.loadUsers();
        this.loadStats();
    }

    loadUsers() {
        this.loading = true;
        this.usersService.getUsers(
            this.currentPage,
            this.itemsPerPage,
            this.searchQuery,
            this.selectedRole
        ).pipe(
            finalize(() => this.loading = false)
        ).subscribe({
            next: (response) => {
                this.users = response.data;
                this.totalItems = response.meta?.total || response.data.length;
                this.totalPages = response.meta?.last_page || 1;
            },
            error: (error) => {
                console.error('Error loading users:', error);
            }
        });
    }

    loadStats() {
        this.usersService.getUserStats().subscribe({
            next: (response) => {
                this.stats = response.data;
            },
            error: (error) => {
                console.error('Error loading stats:', error);
            }
        });
    }

    onSearch() {
        this.currentPage = 1;
        this.loadUsers();
    }

    onFilterByRole(role: string) {
        this.selectedRole = role;
        this.currentPage = 1;
        this.loadUsers();
    }

    onChangePage(page: number) {
        this.currentPage = page;
        this.loadUsers();
    }

    onAddUser() {
        this.selectedUser = null;
        this.isEditing = false;
        this.showForm = true;
    }

    onEditUser(user: User) {
        this.selectedUser = { ...user };
        this.isEditing = true;
        this.showForm = true;
    }

    onDeleteUser(id: string | number) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.usersService.deleteUser(id).subscribe({
                next: () => {
                    this.loadUsers();
                    this.loadStats();
                },
                error: (error) => {
                    console.error('Error deleting user:', error);
                    alert('Failed to delete user');
                }
            });
        }
    }

        // CORRIGEZ la méthode onFormSubmit()
    onFormSubmit(userData: any) {
        console.log('Data from form:', userData); // Debug
        
        // Format Laravel standard - CHAMPS REQUIS
        const apiData : any = {
            name: userData.name,      // requis
            email: userData.email,    // requis  
            role: userData.role,      // requis
            phone: userData.phone || null  // optionnel
        };
        
        // Ajouter le mot de passe seulement s'il est fourni
        if (userData.password && userData.password.trim() !== '') {
            apiData['password'] = userData.password;
            apiData['password_confirmation'] = userData.password_confirmation;
        }
        
        console.log('Sending to API:', apiData); // Debug
        
        if (this.isEditing && this.selectedUser?.id) {
            this.usersService.updateUser(this.selectedUser.id, apiData).subscribe({
                next: (response) => {
                    console.log('API Response:', response);
                    this.showForm = false;
                    this.loadUsers();
                    this.loadStats();
                    alert('User updated successfully!');
                },
                error: (error) => {
                    console.error('Error updating user:', error);
                    // Afficher les erreurs spécifiques
                    if (error.error?.errors) {
                        let errorMessage = 'Validation errors:\n';
                        Object.entries(error.error.errors).forEach(([field, messages]) => {
                            errorMessage += `${field}: ${(messages as string[]).join(', ')}\n`;
                        });
                        alert(errorMessage);
                    } else {
                        alert(error.error?.message || 'Failed to update user');
                    }
                }
            });
        } else {
            // Pour la création, le mot de passe est requis
            if (!userData.password || userData.password.trim() === '') {
                alert('Password is required for new users');
                return;
            }
            
            this.usersService.createUser(apiData).subscribe({
                next: (response) => {
                    console.log('API Response:', response);
                    this.showForm = false;
                    this.loadUsers();
                    this.loadStats();
                    alert('User created successfully!');
                },
                error: (error) => {
                    console.error('Error creating user:', error);
                    if (error.error?.errors) {
                        let errorMessage = 'Validation errors:\n';
                        Object.entries(error.error.errors).forEach(([field, messages]) => {
                            errorMessage += `${field}: ${(messages as string[]).join(', ')}\n`;
                        });
                        alert(errorMessage);
                    } else {
                        alert(error.error?.message || 'Failed to create user');
                    }
                }
            });
        }
    }

    onFormCancel() {
        this.showForm = false;
        this.selectedUser = null;
    }

    // Vérifie si l'utilisateur courant peut gérer les utilisateurs
    canManageUsers(): boolean {
        const user = this.authService.currentUserValue;
        return !!user && ['admin', 'manager', 'supervisor'].includes(user.role);
    }

    getRoleCount(role: string): number {
        if (!this.stats) return 0;
        
        // Utilisez un type assertion pour éviter l'erreur TypeScript
        const roleKey = role as keyof typeof this.stats.byRole;
        return this.stats.byRole[roleKey] || 0;
    }
}