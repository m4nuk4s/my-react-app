// User-related types
export type UserRole = 'admin' | 'manager' | 'agent' | 'user';

export interface User {
  id: string;
  email: string;
  username: string;
  isAdmin: boolean;
  isApproved: boolean;
  department?: string;
  role?: UserRole;
  createdAt?: string;
}

// Ticket-related types
export type TicketStatus = 'new' | 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: string;
  assignedTo?: string;
  department?: string;
  createdAt: string;
  comments?: Comment[];
}

// Comment-related types
export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

// Department-related types
export interface Department {
  id: string;
  name: string;
  description?: string;
}

// Auth-related types
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// For caching data locally when Supabase is not available
export interface LocalStorage {
  users: User[];
  tickets: Ticket[];
  comments: Comment[];
  departments: Department[];
}