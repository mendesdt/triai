import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FirebasePatient, CreatePatientData } from '../../models/firebase-patient.model';
import { FirebasePatientService } from '../../services/firebase-patient.service';

@Component({
  selector: 'app-firebase-patient-queue',
  templateUrl: '../patient-queue/patient-queue.component.html',
  styleUrls: ['../patient-queue/patient-queue.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class FirebasePatientQueueComponent implements OnInit {
  pendingPatients: FirebasePatient[] = [];
  filteredPatients: FirebasePatient[] = [];
  loading = true;
  searchTerm = '';
  showAddPatientModal = false;
  editingPatient: FirebasePatient | null = null;
  patientForm!: FormGroup;
  submitted = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private patientService: FirebasePatientService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadPendingPatients();
  }

  initializeForm(): void {
    this.patientForm = this.formBuilder.group({
      name: ['', Validators.required],
      cpf: ['', Validators.required]
    });
  }

  get f() { return this.patientForm.controls; }

  loadPendingPatients(): void {
    this.loading = true;
    this.patientService.patients$.subscribe({
      next: (data) => {
        this.pendingPatients = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching pending patients:', error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let result = this.pendingPatients;
    
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

  editPatient(patient: FirebasePatient): void {
    this.editingPatient = patient;
    this.patientForm.patchValue({
      name: patient.name,
      cpf: patient.cpf
    });
    this.showAddPatientModal = true;
  }

  removePatient(id: string): void {
    if (confirm('Tem certeza que deseja remover este paciente da fila?')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          console.log('Patient removed successfully');
        },
        error: (error) => {
          console.error('Error removing patient:', error);
          alert('Erro ao remover paciente');
        }
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.patientForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const patientData: CreatePatientData = {
      name: this.f['name'].value,
      cpf: this.f['cpf'].value
    };
    
    if (this.editingPatient) {
      // Update existing patient
      this.patientService.updatePatient(this.editingPatient.id!, patientData).subscribe({
        next: () => {
          this.loading = false;
          this.closeAddPatientModal();
        },
        error: (error) => {
          console.error('Error updating patient:', error);
          this.loading = false;
          alert('Erro ao atualizar paciente');
        }
      });
    } else {
      // Add new patient
      this.patientService.addPatient(patientData).subscribe({
        next: () => {
          this.loading = false;
          this.closeAddPatientModal();
        },
        error: (error) => {
          console.error('Error adding patient:', error);
          this.loading = false;
          alert('Erro ao adicionar paciente');
        }
      });
    }
  }

  closeAddPatientModal(): void {
    this.showAddPatientModal = false;
    this.editingPatient = null;
    this.submitted = false;
    this.patientForm.reset();
  }

  refreshQueue(): void {
    this.patientService.refreshPatients();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'waiting':
        return 'status-waiting';
      case 'in-triage':
        return 'status-in-triage';
      default:
        return 'status-waiting';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'in-triage':
        return 'Em Triagem';
      default:
        return 'Aguardando';
    }
  }
}