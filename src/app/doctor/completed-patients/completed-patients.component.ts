import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-completed-patients',
  templateUrl: './completed-patients.component.html',
  styleUrls: ['./completed-patients.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CompletedPatientsComponent implements OnInit {
  completedPatients: Patient[] = [];
  filteredPatients: Patient[] = [];
  selectedPatient: Patient | null = null;
  loading = true;
  searchTerm = '';
  selectedDate = '';
  
  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectedDate = new Date().toISOString().split('T')[0]; // Today's date
    this.loadCompletedPatients();
  }

  loadCompletedPatients(): void {
    this.loading = true;
    this.patientService.getCompletedPatients(this.selectedDate)
      .subscribe({
        next: (data) => {
          this.completedPatients = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching completed patients:', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let result = this.completedPatients;
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(patient => 
        patient.name.toLowerCase().includes(term) ||
        patient.cpf.includes(term)
      );
    }
    
    this.filteredPatients = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onDateChange(): void {
    this.loadCompletedPatients();
  }
  
  public viewPatientDetails(patient: Patient): void {
    this.selectedPatient = patient;
  }

  public viewPatientHistory(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/patient', id, 'history']);
    }
  }

  closeDetails(): void {
    this.selectedPatient = null;
  }
  
  refreshList(): void {
    this.loadCompletedPatients();
  }

  getAge(birthDate: string): number {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age;
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Alta':
        return 'badge-high';
      case 'Média':
        return 'badge-medium';
      case 'Baixa':
        return 'badge-low';
      default:
        return 'badge-neutral';
    }
  }

  getIntensityClass(intensity: string): string {
    switch (intensity) {
      case 'Alta':
        return 'intensity-high';
      case 'Moderada':
        return 'intensity-medium';
      case 'Leve':
        return 'intensity-low';
      default:
        return 'intensity-low';
    }
  }
}