import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

interface AIAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number;
  alerts: Array<{
    type: 'warning' | 'danger' | 'info';
    title: string;
    description: string;
  }>;
  patterns: Array<{
    pattern: string;
    frequency: string;
    recommendation: string;
  }>;
  recommendations: Array<{
    category: string;
    action: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  trends: Array<{
    metric: string;
    trend: 'improving' | 'stable' | 'worsening';
    description: string;
  }>;
}

@Component({
  selector: 'app-patient-analysis',
  templateUrl: './patient-analysis.component.html',
  styleUrls: ['./patient-analysis.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PatientAnalysisComponent implements OnInit {
  patientId!: string;
  patient: Patient | null = null;
  analysis: AIAnalysis | null = null;
  loading = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['id'];
      this.loadData();
    });
  }
  
  loadData(): void {
    this.loading = true;
    
    // Load patient details
    this.patientService.getPatientById(this.patientId)
      .subscribe({
        next: (patient) => {
          this.patient = patient || null;
          this.loadAnalysis();
        },
        error: (error) => {
          console.error('Error fetching patient:', error);
          this.loading = false;
        }
      });
  }
  
  loadAnalysis(): void {
    this.patientService.getPatientAnalysis(this.patientId)
      .subscribe({
        next: (analysis) => {
          this.analysis = analysis;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching analysis:', error);
          this.loading = false;
        }
      });
  }
  
  navigateToHistory(): void {
    this.router.navigate(['/patient', this.patientId, 'history']);
  }

  getRiskLevelClass(level: string): string {
    switch (level) {
      case 'high':
        return 'risk-high';
      case 'medium':
        return 'risk-medium';
      case 'low':
        return 'risk-low';
      default:
        return 'risk-low';
    }
  }

  getRiskLevelText(level: string): string {
    switch (level) {
      case 'high':
        return 'Alto Risco';
      case 'medium':
        return 'Risco Moderado';
      case 'low':
        return 'Baixo Risco';
      default:
        return 'Baixo Risco';
    }
  }

  getAlertIcon(type: string): string {
    switch (type) {
      case 'danger':
        return 'dangerous';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'trending_up';
      case 'worsening':
        return 'trending_down';
      case 'stable':
        return 'trending_flat';
      default:
        return 'trending_flat';
    }
  }

  getTrendClass(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'trend-improving';
      case 'worsening':
        return 'trend-worsening';
      case 'stable':
        return 'trend-stable';
      default:
        return 'trend-stable';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-low';
    }
  }

  public getAge(birthDate: string): number {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  }
}