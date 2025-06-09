import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { User } from '../auth/auth.service';

export interface DashboardStats {
  triagesCount: number;
  completedAttendances: number;
  averageWaitTime: number;
  mostCommonPriority: string;
  professionalStats: ProfessionalStats[];
}

export interface ProfessionalStats {
  id: number;
  name: string;
  role: string;
  attendances: number;
  avatar?: string;
}

export interface AIAlert {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  patientId?: number;
}

export interface DiseasePattern {
  disease: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

export interface ActivityLog {
  id: number;
  userId: number;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface SystemUser {
  id: number;
  name: string;
  email: string;
  role: 'medico' | 'enfermeiro';
  active: boolean;
  lastLogin: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private mockUsers: SystemUser[] = [
    {
      id: 1,
      name: 'Dr. Ana Souza',
      email: 'ana.souza@example.com',
      role: 'medico',
      active: true,
      lastLogin: '2024-11-25 14:30',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 2,
      name: 'Dr. João Souza',
      email: 'joao.souza@example.com',
      role: 'medico',
      active: true,
      lastLogin: '2024-11-25 13:45',
      avatar: 'https://i.pravatar.cc/150?img=8'
    },
    {
      id: 3,
      name: 'Enf. Carlos Lima',
      email: 'carlos.lima@example.com',
      role: 'enfermeiro',
      active: true,
      lastLogin: '2024-11-25 15:20',
      avatar: 'https://i.pravatar.cc/150?img=11'
    },
    {
      id: 4,
      name: 'Enf. Maria Silva',
      email: 'maria.silva@example.com',
      role: 'enfermeiro',
      active: false,
      lastLogin: '2024-11-20 09:15',
      avatar: 'https://i.pravatar.cc/150?img=9'
    }
  ];

  constructor() {}

  getDashboardStats(): Observable<DashboardStats> {
    const stats: DashboardStats = {
      triagesCount: 24,
      completedAttendances: 18,
      averageWaitTime: 45,
      mostCommonPriority: 'Média',
      professionalStats: [
        {
          id: 1,
          name: 'Dr. Ana Souza',
          role: 'Médico',
          attendances: 8,
          avatar: 'https://i.pravatar.cc/150?img=5'
        },
        {
          id: 2,
          name: 'Dr. João Souza',
          role: 'Médico',
          attendances: 6,
          avatar: 'https://i.pravatar.cc/150?img=8'
        },
        {
          id: 3,
          name: 'Enf. Carlos Lima',
          role: 'Enfermeiro',
          attendances: 12,
          avatar: 'https://i.pravatar.cc/150?img=11'
        },
        {
          id: 4,
          name: 'Enf. Maria Silva',
          role: 'Enfermeiro',
          attendances: 8,
          avatar: 'https://i.pravatar.cc/150?img=9'
        }
      ]
    };
    
    return of(stats).pipe(delay(500));
  }

  getAIAlerts(): Observable<AIAlert[]> {
    const alerts: AIAlert[] = [
      {
        id: 1,
        type: 'critical',
        title: 'Paciente com Sintomas Críticos',
        description: 'Maria Clara Lopes apresenta sintomas compatíveis com dengue hemorrágica',
        timestamp: '2024-11-25 15:30',
        patientId: 1
      },
      {
        id: 2,
        type: 'warning',
        title: 'Pico de Sintomas Gripais',
        description: 'Aumento de 40% nos casos de síndrome gripal nas últimas 24h',
        timestamp: '2024-11-25 14:15'
      },
      {
        id: 3,
        type: 'warning',
        title: 'Sobrecarga de Atendimentos',
        description: 'Dr. Ana Souza com 12 atendimentos hoje, acima da média',
        timestamp: '2024-11-25 13:45'
      },
      {
        id: 4,
        type: 'info',
        title: 'Padrão Sazonal Identificado',
        description: 'IA detectou padrão sazonal de doenças respiratórias',
        timestamp: '2024-11-25 12:00'
      }
    ];
    
    return of(alerts).pipe(delay(300));
  }

  getDiseasePatterns(): Observable<DiseasePattern[]> {
    const patterns: DiseasePattern[] = [
      {
        disease: 'Síndrome Gripal',
        count: 15,
        trend: 'up',
        percentage: 35
      },
      {
        disease: 'Hipertensão',
        count: 8,
        trend: 'stable',
        percentage: 18
      },
      {
        disease: 'Diabetes',
        count: 6,
        trend: 'down',
        percentage: 14
      },
      {
        disease: 'Doenças Respiratórias',
        count: 10,
        trend: 'up',
        percentage: 23
      },
      {
        disease: 'Gastrite',
        count: 4,
        trend: 'stable',
        percentage: 10
      }
    ];
    
    return of(patterns).pipe(delay(400));
  }

  getSystemUsers(): Observable<SystemUser[]> {
    return of(this.mockUsers).pipe(delay(500));
  }

  toggleUserStatus(userId: number): Observable<boolean> {
    const user = this.mockUsers.find(u => u.id === userId);
    if (user) {
      user.active = !user.active;
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  getActivityLogs(): Observable<ActivityLog[]> {
    const logs: ActivityLog[] = [
      {
        id: 1,
        userId: 1,
        userName: 'Dr. Ana Souza',
        action: 'Completou atendimento',
        timestamp: '2024-11-25 15:30',
        details: 'Paciente: Maria Clara Lopes'
      },
      {
        id: 2,
        userId: 3,
        userName: 'Enf. Carlos Lima',
        action: 'Realizou triagem',
        timestamp: '2024-11-25 15:15',
        details: 'Paciente: João Gabriel Souza - Prioridade Alta'
      },
      {
        id: 3,
        userId: 2,
        userName: 'Dr. João Souza',
        action: 'Visualizou histórico',
        timestamp: '2024-11-25 14:45',
        details: 'Paciente: Carlos Henrique Ramos'
      },
      {
        id: 4,
        userId: 4,
        userName: 'Enf. Maria Silva',
        action: 'Editou triagem',
        timestamp: '2024-11-25 14:20',
        details: 'Paciente: Ana Paula Ferreira'
      },
      {
        id: 5,
        userId: 1,
        userName: 'Dr. Ana Souza',
        action: 'Login no sistema',
        timestamp: '2024-11-25 14:00',
        details: 'Acesso via web'
      }
    ];
    
    return of(logs).pipe(delay(600));
  }

  generateReport(type: 'daily' | 'weekly' | 'monthly'): Observable<any> {
    // Simulate report generation
    const report = {
      type,
      generatedAt: new Date().toISOString(),
      data: {
        triages: 24,
        attendances: 18,
        professionals: 4,
        averageWaitTime: 45
      }
    };
    
    return of(report).pipe(delay(1000));
  }
}