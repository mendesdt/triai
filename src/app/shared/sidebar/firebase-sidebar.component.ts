import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseAuthService, AuthUser } from '../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-firebase-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <span class="material-icons">medical_services</span>
          </div>
          <span class="logo-text">Painel Profissional Saúde</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <ul>
          <ng-container *ngFor="let item of menuItems">
            <li *ngIf="isRouteAllowed(item.role)">
              <a [routerLink]="item.route" [class.active]="isActive(item.route)">
                <span class="material-icons">{{ item.icon }}</span>
                <span>{{ item.title }}</span>
              </a>
            </li>
          </ng-container>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <img src="https://i.pravatar.cc/150?img=1" alt="Avatar">
          </div>
          <div class="user-details">
            <p class="user-name">{{ currentUser?.displayName || currentUser?.email }}</p>
            <p class="user-role">{{ getRoleDisplayName() }}</p>
          </div>
        </div>
        <button (click)="logout()" class="logout-btn">
          <span class="material-icons">logout</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  `,
  styleUrls: ['../sidebar/sidebar.component.css']
})
export class FirebaseSidebarComponent implements OnInit {
  currentUser: AuthUser | null = null;
  
  menuItems = [
    {
      title: 'Triagens Pendentes',
      icon: 'assignment_ind',
      route: '/triage-pending',
      role: 'enfermeiro'
    },
    {
      title: 'Triagens Realizadas',
      icon: 'health_and_safety',
      route: '/triage-completed',
      role: 'enfermeiro'
    },
    {
      title: 'Pacientes em Espera',
      icon: 'people',
      route: '/patients',
      role: 'medico'
    },
    {
      title: 'Pacientes Atendidos',
      icon: 'check_circle',
      route: '/completed-patients',
      role: 'medico'
    },
    {
      title: 'Dashboard',
      icon: 'dashboard',
      route: '/admin/dashboard',
      role: 'admin'
    },
    {
      title: 'Fila de Triagem',
      icon: 'people_alt',
      route: '/reception/queue',
      role: 'recepcao'
    }
  ];

  constructor(
    private authService: FirebaseAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, false);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  isRouteAllowed(role: string): boolean {
    return this.currentUser?.role === role;
  }

  getRoleDisplayName(): string {
    switch (this.currentUser?.role) {
      case 'medico':
        return 'Médico';
      case 'enfermeiro':
        return 'Enfermeiro';
      case 'admin':
        return 'Administrador';
      case 'recepcao':
        return 'Recepção';
      default:
        return '';
    }
  }
}