import { PostgrestError } from '@supabase/supabase-js';
import { User as AppUser, Ticket, Comment, Department } from '../utils/types';

// Error types
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Response types
export interface AuthResponse {
  user: import('@supabase/supabase-js').User | null;
  error: SupabaseError | PostgrestError | null;
}

export interface UserResponse {
  users: AppUser[];
  error: SupabaseError | PostgrestError | null;
}

export interface SuccessResponse {
  success: boolean;
  error: SupabaseError | PostgrestError | null;
}

export interface TicketResponse {
  tickets: Ticket[];
  error: SupabaseError | PostgrestError | null;
}

export interface SingleTicketResponse {
  ticket: Ticket | null;
  error: SupabaseError | PostgrestError | null;
}

export interface CommentResponse {
  comment: Comment | null;
  error: SupabaseError | PostgrestError | null;
}

export interface DepartmentResponse {
  departments: Department[];
  error: SupabaseError | PostgrestError | null;
}

export interface SingleDepartmentResponse {
  department: Department | null;
  error: SupabaseError | PostgrestError | null;
}

// Payload types for real-time subscriptions
export interface TicketPayload {
  new: Ticket;
  old: Ticket | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
}

export interface CommentPayload {
  new: Comment;
  old: Comment | null;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
}