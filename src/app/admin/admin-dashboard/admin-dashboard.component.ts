import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService, DashboardStats, AIAlert, DiseasePattern, SystemUser, ActivityLog } from '../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminDashboardComponent implements OnInit {
  dashboardStats: DashboardStats | null = null;
  aiAlerts: AIAlert[] = [];
  diseasePatterns: DiseasePattern[] = [];
  systemUsers: SystemUser[] = [];
  activityLogs: ActivityLog[] = [];
  loading = true;
  selectedTab = 'overview';
  generatingReport = false;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load dashboard stats
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });

    // Load AI alerts
    this.adminService.getAIAlerts().subscribe({
      next: (alerts) => {
        this.aiAlerts = alerts;
      },
      error: (error) => {
        console.error('Error loading AI alerts:', error);
      }
    });

    // Load disease patterns
    this.adminService.getDiseasePatterns().subscribe({
      next: (patterns) => {
        this.diseasePatterns = patterns;
      },
      error: (error) => {
        console.error('Error loading disease patterns:', error);
      }
    });

    // Load system users
    this.adminService.getSystemUsers().subscribe({
      next: (users) => {
        this.systemUsers = users;
      },
      error: (error) => {
        console.error('Error loading system users:', error);
      }
    });

    // Load activity logs
    this.adminService.getActivityLogs().subscribe({
      next: (logs) => {
        this.activityLogs = logs;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading activity logs:', error);
        this.loading = false;
      }
    });
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  toggleUserStatus(userId: number): void {
    this.adminService.toggleUserStatus(userId).subscribe({
      next: (success) => {
        if (success) {
          // Reload users to reflect changes
          this.adminService.getSystemUsers().subscribe({
            next: (users) => {
              this.systemUsers = users;
            }
          });
        }
      },
      error: (error) => {
        console.error('Error toggling user status:', error);
      }
    });
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'critical':
        return 'dangerous';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'critical':
        return 'alert-critical';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up':
        return 'trending_up';
      case 'down':
        return 'trending_down';
      case 'stable':
        return 'trending_flat';
      default:
        return 'trending_flat';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'up':
        return 'trend-up';
      case 'down':
        return 'trend-down';
      case 'stable':
        return 'trend-stable';
      default:
        return 'trend-stable';
    }
  }

  generateReport(type: 'daily' | 'weekly' | 'monthly'): void {
    this.generatingReport = true;
    
    this.adminService.generateReport(type).subscribe({
      next: (report) => {
        // Simulate file download
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.generatingReport = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.generatingReport = false;
      }
    });
  }

  refresh(): void {
    this.loadDashboardData();
  }
}