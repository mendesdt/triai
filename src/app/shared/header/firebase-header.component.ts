import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService, AuthUser } from '../../services/firebase-auth.service';

@Component({
  selector: 'app-firebase-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <div class="current-date">
            {{ currentDate | date:'EEEE, d MMMM, yyyy' }}
          </div>
        </div>
        
        <div class="header-right">
          <div class="user-profile">
            <span class="user-greeting">Olá, {{ getUserFirstName() }}</span>
            <div class="user-avatar">
              <img src="https://i.pravatar.cc/150?img=1" alt="Avatar">
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['../header/header.component.css']
})
export class FirebaseHeaderComponent implements OnInit {
  currentDate = new Date();
  currentUser: AuthUser | null = null;

  constructor(private authService: FirebaseAuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserFirstName(): string {
    if (this.currentUser?.displayName) {
      return this.currentUser.displayName.split(' ')[0];
    }
    if (this.currentUser?.email) {
      return this.currentUser.email.split('@')[0];
    }
    return 'Usuário';
  }
}