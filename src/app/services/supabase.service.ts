import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  role: 'medico' | 'enfermeiro' | 'admin' | 'recepcao';
  avatar?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<DatabaseUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.loadUserProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
      }
    });

    // Check if user is already logged in
    this.checkCurrentUser();
  }

  private async checkCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (user) {
      await this.loadUserProfile(user.id);
    }
  }

  private async loadUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      this.currentUserSubject.next(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  get client() {
    return this.supabase;
  }

  // Auth methods
  async signIn(email: string, password: string): Promise<{ user: DatabaseUser | null; error: any }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error };
      }

      if (data.user) {
        await this.loadUserProfile(data.user.id);
        return { user: this.currentUserSubject.value, error: null };
      }

      return { user: null, error: 'No user data' };
    } catch (error) {
      return { user: null, error };
    }
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    this.currentUserSubject.next(null);
    return { error };
  }

  getCurrentUser(): DatabaseUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    return !!user && roles.includes(user.role);
  }

  // Database methods
  async select(table: string, columns = '*', filters?: any) {
    let query = this.supabase.from(table).select(columns);
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        query = query.eq(key, filters[key]);
      });
    }
    
    return await query;
  }

  async insert(table: string, data: any) {
    return await this.supabase.from(table).insert(data).select();
  }

  async update(table: string, id: string, data: any) {
    return await this.supabase.from(table).update(data).eq('id', id).select();
  }

  async delete(table: string, id: string) {
    return await this.supabase.from(table).delete().eq('id', id);
  }

  // Patients Queue methods
  async getPatientsQueue() {
    return await this.supabase
      .from('patients_queue')
      .select('*')
      .order('created_at', { ascending: true });
  }

  async addPatientToQueue(patient: { name: string; cpf: string }) {
    const now = new Date();
    const arrivalTime = now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return await this.supabase
      .from('patients_queue')
      .insert({
        name: patient.name,
        cpf: patient.cpf,
        arrival_time: arrivalTime,
        status: 'waiting'
      })
      .select();
  }

  async updatePatientStatus(id: string, status: string) {
    return await this.supabase
      .from('patients_queue')
      .update({ status })
      .eq('id', id)
      .select();
  }

  async updatePatientInQueue(id: string, data: any) {
    return await this.supabase
      .from('patients_queue')
      .update(data)
      .eq('id', id)
      .select();
  }

  async removePatientFromQueue(id: string) {
    return await this.supabase
      .from('patients_queue')
      .delete()
      .eq('id', id);
  }

  // Triages methods
  async getTriages() {
    return await this.supabase
      .from('triages')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async createTriage(triageData: any) {
    const currentUser = this.getCurrentUser();
    
    return await this.supabase
      .from('triages')
      .insert({
        ...triageData,
        nurse_id: currentUser?.id
      })
      .select();
  }

  async updateTriage(id: string, triageData: any) {
    return await this.supabase
      .from('triages')
      .update(triageData)
      .eq('id', id)
      .select();
  }

  async deleteTriage(id: string) {
    return await this.supabase
      .from('triages')
      .delete()
      .eq('id', id);
  }

  async getTriageById(id: string) {
    return await this.supabase
      .from('triages')
      .select('*')
      .eq('id', id)
      .single();
  }
}