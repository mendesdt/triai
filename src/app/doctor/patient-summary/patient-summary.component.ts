import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient, ClinicalHypothesis, ClinicalAlert } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.component.html',
  styleUrls: ['./patient-summary.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PatientSummaryComponent implements OnInit {
  patientId!: number;
  patient: Patient | null = null;
  clinicalHypotheses: ClinicalHypothesis[] = [];
  clinicalAlerts: ClinicalAlert[] = [];
  loading = true;
  notFound = false;
  medicalNotes = '';
  copied = false;
  hasPatientHistory = false;
  
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = +params['id'];
      this.loadPatientData();
    });
  }

  loadPatientData(): void {
    this.loading = true;
    
    this.patientService.getPatientById(this.patientId)
      .subscribe({
        next: (patient) => {
          if (patient) {
            this.patient = patient;
            this.loadClinicalData();
            this.checkPatientHistory();
            
            // Generate medical notes
            this.generateMedicalNotes();
          } else {
            this.notFound = true;
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('Error fetching patient:', error);
          this.loading = false;
          this.notFound = true;
        }
      });
  }

  checkPatientHistory(): void {
    this.patientService.getPatientHistory(this.patientId)
      .subscribe({
        next: (history) => {
          this.hasPatientHistory = history.length > 0;
        },
        error: (error) => {
          console.error('Error checking patient history:', error);
          this.hasPatientHistory = false;
        }
      });
  }

  loadClinicalData(): void {
    // Load clinical hypotheses
    this.patientService.getClinicalHypotheses(this.patientId)
      .subscribe({
        next: (hypotheses) => {
          this.clinicalHypotheses = hypotheses;
        },
        error: (error) => {
          console.error('Error fetching clinical hypotheses:', error);
        }
      });
    
    // Load clinical alerts
    this.patientService.getClinicalAlerts(this.patientId)
      .subscribe({
        next: (alerts) => {
          this.clinicalAlerts = alerts;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching clinical alerts:', error);
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/patients']);
  }

  viewPatientHistory(): void {
    if (this.hasPatientHistory) {
      this.router.navigate(['/patient', this.patientId, 'history']);
    }
  }

  completeAttendance(): void {
    if (confirm('Tem certeza que deseja completar este atendimento?')) {
      this.patientService.completeAttendance(this.patientId)
        .subscribe({
          next: () => {
            alert('Atendimento completado com sucesso!');
            this.router.navigate(['/patients']);
          },
          error: (error) => {
            console.error('Error completing attendance:', error);
            alert('Erro ao completar atendimento');
          }
        });
    }
  }

  removeAttendance(): void {
    if (confirm('Tem certeza que deseja remover este atendimento? Esta ação não pode ser desfeita.')) {
      this.patientService.removeAttendance(this.patientId)
        .subscribe({
          next: () => {
            alert('Atendimento removido com sucesso!');
            this.router.navigate(['/patients']);
          },
          error: (error) => {
            console.error('Error removing attendance:', error);
            alert('Erro ao remover atendimento');
          }
        });
    }
  }

  copyMedicalNotes(): void {
    navigator.clipboard.writeText(this.medicalNotes).then(() => {
      this.copied = true;
      setTimeout(() => {
        this.copied = false;
      }, 2000);
    });
  }

  private generateMedicalNotes(): void {
    if (!this.patient) return;
    
    this.medicalNotes = `Paciente: ${this.patient.name}, ${this.getAge(this.patient.birthDate as string)} anos, CPF ${this.patient.cpf}
Motivo da consulta: ${this.patient.consultReason || 'Febre alta persistente e dores no corpo há ' + this.patient.duration}.
Sintomas: ${this.patient.symptoms.join(', ')}${this.patient.otherSymptoms ? ', ' + this.patient.otherSymptoms : ''}.
Início: ${this.patient.duration} atrás. Intensidade: ${this.patient.intensity.toLowerCase()}. Evolução: piora progressiva.
Medicamentos: ${this.patient.medications || 'Nenhum medicamento relatado'}.
Hipóteses clínicas sugeridas: ${this.clinicalHypotheses.map(h => h.description).join(', ')}.
Alertas: ${this.clinicalAlerts.map(a => a.description).join(', ')}.`;
  }

  public getAge(birthDate: string | undefined): number {
    if (!birthDate) {
      return 0;
    }
    
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