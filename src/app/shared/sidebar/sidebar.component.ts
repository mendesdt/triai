import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  
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
    private authService: AuthService,
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
    this.authService.logout();
    this.router.navigate(['/login']);
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