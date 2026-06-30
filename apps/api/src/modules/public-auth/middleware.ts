export interface PublicSessionUser {
  id: number;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface PublicAccess {
  roles: string[];
  permissions: string[];
}

declare module 'express-session' {
  interface SessionData {
    publicUser?: PublicSessionUser;
  }
}
