// user.model.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'USER' | 'DELIVERY';

export interface User {
    id: string;
    name: string;
    fullName: string;
    email?:string;
    role: UserRole;
    avatarUrl?: string;
    token?: string; // ← Nouveau champ,
    phone?: string;
    status?: 'active' | 'inactive' | 'pending';
    created_at?: string;
    updated_at?: string;
}

// Interface pour les données de formulaire (avec mot de passe)
export interface UserFormData {
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    password?: string;
    password_confirmation?: string;
}
export interface UserStats {
    total: number;
    byRole: {
        admin: number;
        manager: number;
        supervisor: number;
        user: number;
    };
}