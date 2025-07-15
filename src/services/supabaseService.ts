import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Ticket, Comment, User as AppUser, Department, UserRole } from '../utils/types';
import { supabaseUrl, supabaseKey } from '../lib/supabase';

export class SupabaseService {
  private supabase: SupabaseClient;
  private static instance: SupabaseService;

  private constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  // Check if Supabase is properly configured
  public async isSupabaseConfigured(): Promise<boolean> {
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://supabase-project-url.supabase.co' ||
        supabaseKey === 'your-supabase-anon-key') {
      return false;
    }
    
    try {
      // Test connection by trying to get session
      const { data, error } = await this.supabase.auth.getSession();
      if (error) {
        console.error("Supabase connection error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Supabase connection failed:", err);
      return false;
    }
  }

  // Auth methods
  public async signUp(email: string, password: string, username: string): Promise<{ user: User | null, error: any }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          isAdmin: false,
          isApproved: false
        }
      }
    });
    
    if (data?.user && !error) {
      // Insert into users table with additional info
      await this.supabase
        .from('users')
        .insert([
          { 
            id: data.user.id, 
            email: data.user.email,
            username,
            isAdmin: false,
            isApproved: false,
            department: 'general',
            role: 'user'
          }
        ]);
    }
    
    return { user: data?.user ?? null, error };
  }

  public async signIn(email: string, password: string): Promise<{ user: User | null, error: any }> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { user: data?.user ?? null, error };
  }

  public async signOut(): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  public async getUser(): Promise<{ user: User | null, error: any }> {
    const { data, error } = await this.supabase.auth.getUser();
    return { user: data?.user ?? null, error };
  }

  public async getCurrentUser(): Promise<AppUser | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    
    if (!user) return null;
    
    const { data } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    return data as AppUser;
  }

  // Users methods
  public async getUsers(): Promise<{ users: AppUser[], error: any }> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*');
    
    return { users: data as AppUser[] ?? [], error };
  }

  public async getPendingUsers(): Promise<{ users: AppUser[], error: any }> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('isApproved', false);
    
    return { users: data as AppUser[] ?? [], error };
  }

  public async approveUser(userId: string): Promise<{ success: boolean, error: any }> {
    const { error } = await this.supabase
      .from('users')
      .update({ isApproved: true })
      .eq('id', userId);
    
    return { success: !error, error };
  }

  public async updateUser(user: AppUser): Promise<{ success: boolean, error: any }> {
    const { error } = await this.supabase
      .from('users')
      .update({
        username: user.username,
        department: user.department,
        role: user.role,
        isAdmin: user.isAdmin,
        isApproved: user.isApproved
      })
      .eq('id', user.id);
    
    return { success: !error, error };
  }

  // Tickets methods
  public async getTickets(): Promise<{ tickets: Ticket[], error: any }> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select('*, comments(*)');
    
    return { tickets: data as Ticket[] ?? [], error };
  }

  public async getTicket(id: string): Promise<{ ticket: Ticket | null, error: any }> {
    const { data, error } = await this.supabase
      .from('tickets')
      .select('*, comments(*)')
      .eq('id', id)
      .single();
    
    return { ticket: data as Ticket, error };
  }

  public async createTicket(ticket: Omit<Ticket, 'id' | 'createdAt'>): Promise<{ ticket: Ticket | null, error: any }> {
    const { data, error } = await this.supabase
      .from('tickets')
      .insert([
        {
          ...ticket,
          createdAt: new Date().toISOString()
        }
      ])
      .select();
    
    return { ticket: data?.[0] as Ticket ?? null, error };
  }

  public async updateTicket(ticket: Ticket): Promise<{ success: boolean, error: any }> {
    const { error } = await this.supabase
      .from('tickets')
      .update({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        assignedTo: ticket.assignedTo,
        department: ticket.department
      })
      .eq('id', ticket.id);
    
    return { success: !error, error };
  }

  public async deleteTicket(id: string): Promise<{ success: boolean, error: any }> {
    // Delete associated comments first
    await this.supabase
      .from('comments')
      .delete()
      .eq('ticketId', id);
      
    // Then delete the ticket
    const { error } = await this.supabase
      .from('tickets')
      .delete()
      .eq('id', id);
    
    return { success: !error, error };
  }

  // Comments methods
  public async createComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<{ comment: Comment | null, error: any }> {
    const { data, error } = await this.supabase
      .from('comments')
      .insert([
        {
          ...comment,
          createdAt: new Date().toISOString()
        }
      ])
      .select();
    
    return { comment: data?.[0] as Comment ?? null, error };
  }

  // Departments methods
  public async getDepartments(): Promise<{ departments: Department[], error: any }> {
    const { data, error } = await this.supabase
      .from('departments')
      .select('*');
    
    return { departments: data as Department[] ?? [], error };
  }

  public async createDepartment(department: Omit<Department, 'id'>): Promise<{ department: Department | null, error: any }> {
    const { data, error } = await this.supabase
      .from('departments')
      .insert([department])
      .select();
    
    return { department: data?.[0] as Department ?? null, error };
  }

  // Real-time subscriptions
  public subscribeToTickets(callback: (payload: any) => void): () => void {
    const subscription = this.supabase
      .channel('tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        callback
      )
      .subscribe();
    
    return () => {
      this.supabase.removeChannel(subscription);
    };
  }

  public subscribeToComments(ticketId: string, callback: (payload: any) => void): () => void {
    const subscription = this.supabase
      .channel(`comments-${ticketId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments',
          filter: `ticketId=eq.${ticketId}` 
        },
        callback
      )
      .subscribe();
    
    return () => {
      this.supabase.removeChannel(subscription);
    };
  }
}

export default SupabaseService.getInstance();