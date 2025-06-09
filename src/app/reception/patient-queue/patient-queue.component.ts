import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PendingPatient } from '../../models/patient.model';
import { ReceptionService } from '../../services/reception.service';

@Component({
  selector: 'app-patient-queue',
  templateUrl: './patient-queue.component.html',
  styleUrls: ['./patient-queue.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class PatientQueueComponent implements OnInit {
  pendingPatients: PendingPatient[] = [];
  filteredPatients: PendingPatient[] = [];
  loading = true;
  searchTerm = '';
  showAddPatientModal = false;
  editingPatient: PendingPatient | null = null;
  patientForm!: FormGroup;
  submitted = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private receptionService: ReceptionService
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
    this.receptionService.getPendingPatients()
      .subscribe({
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

  editPatient(patient: PendingPatient): void {
    this.editingPatient = patient;
    this.patientForm.patchValue({
      name: patient.name,
      cpf: patient.cpf
    });
    this.showAddPatientModal = true;
  }

  removePatient(id: string): void {
    if (confirm('Tem certeza que deseja remover este paciente da fila?')) {
      this.receptionService.removePendingPatient(id)
        .subscribe({
          next: () => {
            this.loadPendingPatients();
          },
          error: (error) => {
            console.error('Error removing patient:', error);
            alert('Erro ao remover paciente da fila');
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
    
    const patientData = {
      name: this.f['name'].value,
      cpf: this.f['cpf'].value
    };
    
    const operation = this.editingPatient 
      ? this.receptionService.updatePendingPatient(this.editingPatient.id!, patientData)
      : this.receptionService.addPendingPatient(patientData);
    
    operation.subscribe({
      next: () => {
        this.loading = false;
        this.closeAddPatientModal();
        this.loadPendingPatients();
      },
      error: (error) => {
        console.error('Error saving patient:', error);
        this.loading = false;
        alert('Erro ao salvar paciente');
      }
    });
  }

  closeAddPatientModal(): void {
    this.showAddPatientModal = false;
    this.editingPatient = null;
    this.submitted = false;
    this.patientForm.reset();
  }

  refreshQueue(): void {
    this.loadPendingPatients();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'waiting':
        return 'status-waiting';
      case 'in-triage':
        return 'status-in-triage';
      case 'triaged':
        return 'status-triaged';
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
      case 'triaged':
        return 'Triado';
      default:
        return 'Aguardando';
    }
  }
}