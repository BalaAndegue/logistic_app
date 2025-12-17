export type UserRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR';

export interface User {
    id: string;
    username: string;
    fullName: string;
    role: UserRole;
    avatarUrl?: string;
}
