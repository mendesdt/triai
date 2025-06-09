import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient, PatientHistory } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-history',
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe]
})
export class PatientHistoryComponent implements OnInit {
  patientId!: string;
  patient: Patient | null = null;
  patientHistory: PatientHistory[] = [];
  selectedRecord: PatientHistory | null = null;
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
          this.loadHistory();
        },
        error: (error) => {
          console.error('Error fetching patient:', error);
          this.loading = false;
        }
      });
  }
  
  loadHistory(): void {
    this.patientService.getPatientHistory(this.patientId)
      .subscribe({
        next: (history) => {
          this.patientHistory = history;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching history:', error);
          this.loading = false;
        }
      });
  }
  
  refresh(): void {
    this.loadData();
  }
  
  navigateToAnalysis(): void {
    this.router.navigate(['/patient', this.patientId, 'analysis']);
  }

  viewDetails(record: PatientHistory): void {
    this.selectedRecord = record;
  }

  closeDetails(): void {
    this.selectedRecord = null;
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