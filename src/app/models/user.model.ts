// user.model.ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'USER';

export interface User {
    id: string;
    username: string;
    fullName: string;
    role: UserRole;
    avatarUrl?: string;
    token?: string; // ← Nouveau champ
}