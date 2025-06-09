import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../config/firebase.config';
import { map, catchError } from 'rxjs/operators';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'recepcao' | 'enfermeiro' | 'medico' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock users for demo - in production, this would come from Firestore
  private mockUsers: { [key: string]: AuthUser } = {
    'recepcao@example.com': {
      uid: 'recepcao-uid',
      email: 'recepcao@example.com',
      displayName: 'Recepção',
      role: 'recepcao'
    },
    'enfermeiro@example.com': {
      uid: 'enfermeiro-uid',
      email: 'enfermeiro@example.com',
      displayName: 'Enfermeiro',
      role: 'enfermeiro'
    },
    'medico@example.com': {
      uid: 'medico-uid',
      email: 'medico@example.com',
      displayName: 'Médico',
      role: 'medico'
    },
    'admin@example.com': {
      uid: 'admin-uid',
      email: 'admin@example.com',
      displayName: 'Administrador',
      role: 'admin'
    }
  };

  constructor() {
    // Check for existing auth state
    auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        const mockUser = this.mockUsers[firebaseUser.email];
        if (mockUser) {
          this.currentUserSubject.next(mockUser);
          localStorage.setItem('currentUser', JSON.stringify(mockUser));
        }
      } else {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
      }
    });

    // Check for saved user in localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<AuthUser> {
    return from(signInWithEmailAndPassword(auth, email, password)).pipe(
      map((userCredential) => {
        const firebaseUser = userCredential.user;
        const mockUser = this.mockUsers[email];
        
        if (!mockUser) {
          throw new Error('Usuário não autorizado');
        }

        this.currentUserSubject.next(mockUser);
        localStorage.setItem('currentUser', JSON.stringify(mockUser));
        return mockUser;
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw new Error('Credenciais inválidas');
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(auth)).pipe(
      map(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
      })
    );
  }

  get currentUser(): AuthUser | null {
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