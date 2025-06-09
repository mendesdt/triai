import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading = true;
  searchTerm = '';
  selectedPriority = 'all';
  
  priorityOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Média', label: 'Média' },
    { value: 'Baixa', label: 'Baixa' },
    { value: 'Não triado', label: 'Não triado' }
  ];
  
  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getPatients()
      .subscribe({
        next: (data) => {
          this.patients = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching patients:', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let result = this.patients;
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(patient => 
        patient.name.toLowerCase().includes(term)
      );
    }
    
    // Apply priority filter
    if (this.selectedPriority !== 'all') {
      result = result.filter(patient => 
        patient.priority === this.selectedPriority
      );
    }
    
    this.filteredPatients = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onPriorityChange(): void {
    this.applyFilters();
  }
  
  viewPatient(id: string): void {
    this.router.navigate(['/patient', id]);
  }
  
  refreshList(): void {
    this.loadPatients();
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
}