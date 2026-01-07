// components/users/user-list/user-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.model';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent {
    @Input() users: User[] = [];
    @Input() loading = false;
    @Input() canManage = true;
    @Output() edit = new EventEmitter<User>();
    @Output() delete = new EventEmitter<string | number>();

    getRoleBadgeClass(role: string): string {
        switch (role) {
            case 'admin': return 'badge-danger';
            case 'manager': return 'badge-warning';
            case 'supervisor': return 'badge-info';
            case 'delivery' :return 'badge-secondary'
            default: return 'badge-secondary';
        }
    }

    getRoleLabel(role: string): string {
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
}