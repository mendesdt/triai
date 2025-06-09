import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  get client() {
    return this.supabase;
  }

  // Auth methods
  async signUp(email: string, password: string) {
    return await this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
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
    return await this.supabase.from(table).insert(data);
  }

  async update(table: string, id: string, data: any) {
    return await this.supabase.from(table).update(data).eq('id', id);
  }

  async delete(table: string, id: string) {
    return await this.supabase.from(table).delete().eq('id', id);
  }
}