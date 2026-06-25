export interface AdminUser {
  id: number;
  email: string;
  fullName: string | null;
  role: 'admin' | 'editor' | 'viewer' | 'staff';
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: number;
  email: string;
  role: AdminUser['role'];
  fullName: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: SessionUser;
}
