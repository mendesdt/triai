import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SupabaseService, DatabaseUser } from '../services/supabase.service';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'medico' | 'enfermeiro' | 'admin' | 'recepcao';
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
    // Subscribe to Supabase user changes
    this.supabaseService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserSubject.next({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  login(email: string, password: string): Observable<User> {
    return from(this.supabaseService.signIn(email, password)).pipe(
      map(({ user, error }) => {
        if (error) {
          throw new Error(error.message || 'Login failed');
        }
        if (!user) {
          throw new Error('User not found');
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        };
      }),
      catchError(error => {
        throw error;
      })
    );
  }

  logout(): Observable<void> {
    return from(this.supabaseService.signOut()).pipe(
      map(() => {
        this.currentUserSubject.next(null);
      })
    );
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.supabaseService.isAuthenticated();
  }

  hasRole(roles: string[]): boolean {
    return this.supabaseService.hasRole(roles);
  }
}