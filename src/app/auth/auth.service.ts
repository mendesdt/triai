import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap, map } from 'rxjs/operators';

export interface User {
  id: number;
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
  
  // Mock users for demo
  private users: User[] = [
    { 
      id: 1, 
      name: 'Dr. Ana Souza', 
      email: 'ana.souza@example.com', 
      role: 'medico',
      avatar: 'https://i.pravatar.cc/150?img=5' 
    },
    { 
      id: 2, 
      name: 'Dr. João Souza', 
      email: 'joao.souza@example.com', 
      role: 'medico',
      avatar: 'https://i.pravatar.cc/150?img=8'
    },
    { 
      id: 3, 
      name: 'Enf. Carlos Lima', 
      email: 'carlos.lima@example.com', 
      role: 'enfermeiro',
      avatar: 'https://i.pravatar.cc/150?img=11'
    },
    { 
      id: 4, 
      name: 'Enf. Maria Silva', 
      email: 'maria.silva@example.com', 
      role: 'enfermeiro',
      avatar: 'https://i.pravatar.cc/150?img=9'
    },
    { 
      id: 5, 
      name: 'Admin. Roberto Santos', 
      email: 'admin@example.com', 
      role: 'admin',
      avatar: 'https://i.pravatar.cc/150?img=7'
    },
    { 
      id: 6, 
      name: 'Recep. Paula Costa', 
      email: 'recepcao@example.com', 
      role: 'recepcao',
      avatar: 'https://i.pravatar.cc/150?img=10'
    }
  ];

  constructor() {
    // Check for saved user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    // Simulate API call with delay
    return of(this.users.find(user => 
      user.email === email || 
      // Allow CPF login (in a real app, would validate CPF format)
      email.replace(/[^\d]/g, '').length === 11
    )).pipe(
      delay(800),
      map(user => {
        if (!user) {
          throw new Error('User not found');
        }
        return user;
      }),
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  hasRole(roles: string[]): boolean {
    return this.isAuthenticated() && 
           roles.includes(this.currentUser!.role);
  }
}