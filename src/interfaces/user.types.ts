import { session, user } from '@prisma/client';

export enum administrativeRoles {
  ADMIN = 'ADMIN', // Admin
  ACCOUNTING = 'ACCOUNTING', // Moderator
  CLIENT = 'CLIENT',
}

export enum typeOfPerson {
  JURIDIC = 'JURIDIC',
  NATURAL = 'NATURAL',
}

export interface UserData {
  id: number;
  name?: string | null;
  lastName: string | null;
  email?: string | null;
  role?: string | null;
  is_authenticated: boolean;
  password?: string;
  last_login?: Date | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export type SessionValidationResult =
  | { session: session; user: user }
  | { session: null; user: null };
