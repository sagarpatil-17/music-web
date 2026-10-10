
export type UserRole = 'USER' | 'ADMIN';

export type UserStatus =
  | 'ACTIVE'
  | 'BLOCKED'
  | 'DELETED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
