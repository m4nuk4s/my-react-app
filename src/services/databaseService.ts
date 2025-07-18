import supabaseService from './supabaseService';
import { User, Ticket, Comment, Department, TicketStatus, TicketPriority } from '../utils/types';

// Helper function to get data from localStorage
function getLocalData<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Helper function to save data to localStorage
function saveLocalData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Function to determine if Supabase should be used
async function shouldUseSupabase(): Promise<boolean> {
  return await supabaseService.isSupabaseConfigured();
}

// User Management
export async function getUsers(): Promise<User[]> {
  const useSupabase = await shouldUseSupabase();
  
  if (useSupabase) {
    const { users, error } = await supabaseService.getUsers();
    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return getLocalData<User>('users').filter((user) => {
        const userWithPassword = user as User & { password?: string };
        delete userWithPassword.password;
        return user;
      });
    }
    return users;
  } else {
    return getLocalData<User>('users').map((user) => {
      const { password, ...userWithoutPassword } = user as { password: string } & User;
      return userWithoutPassword;
    });
  }
}

export async function getPendingUsers(): Promise<User[]> {
  const useSupabase = await shouldUseSupabase();
  
  if (useSupabase) {
    const { users, error } = await supabaseService.getPendingUsers();
    if (error) {
      console.error('Error fetching pending users from Supabase:', error);
      return getLocalData<User>('users')
        .filter((user) => !user.isApproved)
        .map((user) => {
          const { password, ...userWithoutPassword } = user as { password: string } & User;
          return userWithoutPassword;
        });
    }
    return users;
  } else {
    return getLocalData<User>('users')
      .filter((user) => !user.isApproved)
      .map((user) => {
        const { password, ...userWithoutPassword } = user as { password: string } & User;
        return userWithoutPassword;
      });
  }
}

export async function approveUser(userId: string): Promise<boolean> {
  const useSupabase = await shouldUseSupabase();
  
  if (useSupabase) {
    const { success, error } = await supabaseService.approveUser(userId);
    if (error) {
      console.error('Error approving user in Supabase:', error);
      return false;
    }
    return success;
  } else {
    const users = getLocalData<User>('users');
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, isApproved: true };
      }
      return user;
    });
    saveLocalData<User>('users', updatedUsers);
    return true;
  }
}

// Ticket Management
export async function getTickets(): Promise<Ticket[]> {
  const useSupabase = await shouldUseSupabase();
  
  if (useSupabase) {
    const { tickets, error } = await supabaseService.getTickets();
    if (error) {
      console.error('Error fetching tickets from Supabase:', error);
      return getLocalData<Ticket>('tickets') || [];
    }
    return tickets;
  } else {
    return getLocalData<Ticket>('tickets') || [];
  }
}

export async function getTicketById(id: string): Promise<Ticket | null> {
  const useSupabase = await shouldUseSupabase();
  
  if (useSupabase) {
    const { ticket, error } = await supabaseService.getTicket(id);
    if (error) {
      console.error(`Error fetching ticket ${id} from Supabase:`, error);
      const tickets = getLocalData<Ticket>('tickets') || [];
      return tickets.find((ticket) => ticket.id === id) || null;
    }
    return ticket;
  } else {
    const tickets = getLocalData<Ticket>('tickets') || [];
    return tickets.find((ticket) => ticket.id === id) || null;
  }
}

export async function createTicket(
  title: string,
  description: string,
  priority: TicketPriority,
  userId: string,
  department?: string
): Promise<Ticket | null> {
  const useSupabase = await shouldUseSupabase();
  
  const newTicket: Omit<Ticket, 'id' | 'createdAt'> = {
    title,
    description,
    status: 'new',
    priority,
    createdBy: userId,
    department,
  };
  
  if (useSupabase) {
    const { ticket, error } = await supabaseService.createTicket(newTicket);
    if (error) {
      console.error('Error creating ticket in Supabase:', error);
      return createTicketLocal(newTicket);
    }
    return ticket;
  } else {
    return createTicketLocal(newTicket);
  }
}

function createTicketLocal(newTicket: Omit<Ticket, 'id' | 'createdAt'>): Ticket {
  const tickets = getLocalData<Ticket>('tickets') || [];
  const ticket: Ticket = {
    ...newTicket,
    id: `ticket-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    comments: [],
  };
  
  tickets.push(ticket);
  saveLocalData<Ticket>('tickets', tickets);
  return ticket;
}

export async function updateTicket(ticket: Ticket): Promise<boolean> {
  const useSupabase = await shouldUseSupabase();
  
  if (useSupabase) {
    const { success, error } = await supabaseService.updateTicket(ticket);
    if (error) {
      console.error(`Error updating ticket ${ticket.id} in Supabase:`, error);
      return updateTicketLocal(ticket);
    }
    return success;
  } else {
    return updateTicketLocal(ticket);
  }
}

function updateTicketLocal(ticket: Ticket): boolean {
  const tickets = getLocalData<Ticket>('tickets') || [];
  const updatedTickets = tickets.map((t) => {
    if (t.id === ticket.id) {
      return ticket;
    }
    return t;
  });
  
  saveLocalData<Ticket>('tickets', updatedTickets);
  return true;
}

// Comment Management
export async function createComment(
  ticketId: string,
  userId: string,
  username: string,
  content: string
): Promise<Comment | null> {
  const useSupabase = await shouldUseSupabase();
  
  const newComment: Omit<Comment, 'id' | 'createdAt'> = {
    ticketId,
    userId,
    username,
    content,
  };
  
  if (useSupabase) {
    const { comment, error } = await supabaseService.createComment(newComment);
    if (error) {
      console.error('Error creating comment in Supabase:', error);
      return createCommentLocal(newComment);
    }
    return comment;
  } else {
    return createCommentLocal(newComment);
  }
}

function createCommentLocal(newComment: Omit<Comment, 'id' | 'createdAt'>): Comment {
  const tickets = getLocalData<Ticket>('tickets') || [];
  const comment: Comment = {
    ...newComment,
    id: `comment-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  
  // Find the ticket and add comment
  const updatedTickets = tickets.map((ticket) => {
    if (ticket.id === newComment.ticketId) {
      return {
        ...ticket,
        comments: [...(ticket.comments || []), comment],
      };
    }
    return ticket;
  });
  
  saveLocalData<Ticket>('tickets', updatedTickets);
  return comment;
}

// Department Management
export async function getDepartments(): Promise<Department[]> {
  const useSupabase = await shouldUseSupabase();
  
  if (useSupabase) {
    const { departments, error } = await supabaseService.getDepartments();
    if (error) {
      console.error('Error fetching departments from Supabase:', error);
      return getLocalData<Department>('departments') || [];
    }
    return departments;
  } else {
    return getLocalData<Department>('departments') || [];
  }
}

export async function createDepartment(name: string, description?: string): Promise<Department | null> {
  const useSupabase = await shouldUseSupabase();
  
  const newDepartment: Omit<Department, 'id'> = {
    name,
    description,
  };
  
  if (useSupabase) {
    const { department, error } = await supabaseService.createDepartment(newDepartment);
    if (error) {
      console.error('Error creating department in Supabase:', error);
      return createDepartmentLocal(newDepartment);
    }
    return department;
  } else {
    return createDepartmentLocal(newDepartment);
  }
}

function createDepartmentLocal(newDepartment: Omit<Department, 'id'>): Department {
  const departments = getLocalData<Department>('departments') || [];
  const department: Department = {
    ...newDepartment,
    id: `dept-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
  };
  
  departments.push(department);
  saveLocalData<Department>('departments', departments);
  return department;
}

// Define payload types
export interface TicketPayload {
  id: string;
  ticket: Ticket;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface CommentPayload {
  id: string;
  comment: Comment;
  ticketId: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
}

// Subscriptions
export function subscribeToTickets(callback: (payload: TicketPayload) => void): () => void {
  return supabaseService.subscribeToTickets(callback);
}

export function subscribeToComments(ticketId: string, callback: (payload: CommentPayload) => void): () => void {
  return supabaseService.subscribeToComments(ticketId, callback);
}

export default {
  getUsers,
  getPendingUsers,
  approveUser,
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  createComment,
  getDepartments,
  createDepartment,
  subscribeToTickets,
  subscribeToComments,
};