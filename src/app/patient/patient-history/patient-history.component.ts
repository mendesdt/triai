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
    
    // First try to get patient from completed patients
    this.patientService.getCompletedPatients('').subscribe({
      next: (completedPatients) => {
        this.patient = completedPatients.find(p => p.id === this.patientId) || null;
        
        // If not found in completed, try regular patients
        if (!this.patient) {
          this.patientService.getPatientById(this.patientId).subscribe({
            next: (patient) => {
              this.patient = patient || null;
              this.loadHistory();
            },
            error: (error) => {
              console.error('Error fetching patient:', error);
              this.loadHistory();
            }
          });
        } else {
          this.loadHistory();
        }
      },
      error: (error) => {
        console.error('Error fetching completed patients:', error);
        // Try regular patients as fallback
        this.patientService.getPatientById(this.patientId).subscribe({
          next: (patient) => {
            this.patient = patient || null;
            this.loadHistory();
          },
          error: (error) => {
            console.error('Error fetching patient:', error);
            this.loadHistory();
          }
        });
      }
    });
  }
  
  loadHistory(): void {
    // Generate comprehensive history based on patient data
    if (this.patient) {
      this.patientHistory = this.generatePatientHistory(this.patient);
    } else {
      // Load from service as fallback
      this.patientService.getPatientHistory(this.patientId).subscribe({
        next: (history) => {
          this.patientHistory = history;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching history:', error);
          this.patientHistory = [];
          this.loading = false;
        }
      });
      return;
    }
    
    this.loading = false;
  }

  generatePatientHistory(patient: Patient): PatientHistory[] {
    const history: PatientHistory[] = [];
    
    // Current consultation record
    const currentRecord: PatientHistory = {
      id: patient.id || '1',
      date: this.formatDateTime(patient.completedTime || patient.arrivalTime || ''),
      type: 'Consulta Médica',
      diagnosis: patient.diagnosis || 'Síndrome gripal',
      medications: patient.medications || 'Dipirona 500mg, Paracetamol 750mg',
      evolution: this.generateEvolution(patient),
      status: 'Finalizado',
      consultReason: patient.consultReason || `Febre alta persistente e dores no corpo há ${patient.duration}`,
      symptoms: patient.symptoms || [],
      otherSymptoms: patient.otherSymptoms || '',
      duration: patient.duration || '',
      intensity: patient.intensity || 'Moderada',
      priority: patient.priority || 'Média',
      allergies: patient.allergies || 'Nenhuma Alergia Conhecida',
      vitalSigns: patient.vitalSigns || {},
      motherName: patient.motherName || '',
      professionalName: 'Dr. Ana Souza',
      professionalRole: 'Médico',
      observations: this.generateObservations(patient)
    };
    
    history.push(currentRecord);

    // Add triage record if available
    const triageRecord: PatientHistory = {
      id: (patient.id || '1') + '_triage',
      date: this.formatDateTime(patient.arrivalTime || ''),
      type: 'Triagem de Enfermagem',
      diagnosis: `Triagem realizada - Prioridade ${patient.priority}`,
      medications: patient.medications || 'Nenhum medicamento em uso',
      evolution: 'Paciente triado e encaminhado para atendimento médico',
      status: 'Finalizado',
      consultReason: patient.consultReason || '',
      symptoms: patient.symptoms || [],
      otherSymptoms: patient.otherSymptoms || '',
      duration: patient.duration || '',
      intensity: patient.intensity || '',
      priority: patient.priority || '',
      allergies: patient.allergies || '',
      vitalSigns: patient.vitalSigns || {},
      motherName: patient.motherName || '',
      professionalName: 'Enf. Carlos Lima',
      professionalRole: 'Enfermeiro',
      observations: 'Triagem inicial realizada conforme protocolo institucional'
    };
    
    history.push(triageRecord);

    // Add some mock historical records for demonstration
    if (patient.cpf && patient.cpf.includes('123')) {
      const previousRecord: PatientHistory = {
        id: (patient.id || '1') + '_prev',
        date: '10/10/2024 - 09:15',
        type: 'Consulta de Rotina',
        diagnosis: 'Hipertensão arterial leve',
        medications: 'Losartana 50mg',
        evolution: 'Pressão arterial controlada com medicação',
        status: 'Acompanhamento',
        consultReason: 'Consulta de rotina para controle da pressão arterial',
        symptoms: ['Dor de cabeça'],
        duration: '1 semana',
        intensity: 'Leve',
        priority: 'Baixa',
        allergies: 'Alergia a dipirona',
        vitalSigns: {
          heartRate: 72,
          respiratoryRate: 16,
          temperature: 36.5,
          bloodPressureSystolic: 140,
          bloodPressureDiastolic: 90,
          oxygenSaturation: 99
        },
        motherName: patient.motherName || '',
        professionalName: 'Dr. João Souza',
        professionalRole: 'Médico',
        observations: 'Paciente orientado sobre dieta hipossódica e exercícios físicos regulares'
      };
      
      history.push(previousRecord);
    }

    return history.sort((a, b) => {
      // Sort by date, most recent first
      const dateA = this.parseDate(a.date);
      const dateB = this.parseDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }

  private formatDateTime(time: string): string {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    return `${formattedDate} - ${time}`;
  }

  private generateEvolution(patient: Patient): string {
    const symptoms = patient.symptoms?.join(', ').toLowerCase() || 'sintomas';
    const intensity = patient.intensity?.toLowerCase() || 'moderada';
    
    if (patient.priority === 'Alta') {
      return `Paciente apresentou ${symptoms} de intensidade ${intensity}. Tratamento iniciado imediatamente com melhora significativa dos sintomas.`;
    } else if (patient.priority === 'Média') {
      return `Paciente com ${symptoms} de intensidade ${intensity}. Respondeu bem ao tratamento proposto com evolução satisfatória.`;
    } else {
      return `Paciente apresentou ${symptoms} de intensidade ${intensity}. Evolução favorável com tratamento sintomático.`;
    }
  }

  private generateObservations(patient: Patient): string {
    const observations = [];
    
    if (patient.intensity === 'Alta') {
      observations.push('Paciente orientado sobre sinais de alarme');
    }
    
    if (patient.symptoms?.includes('Febre')) {
      observations.push('Orientado sobre hidratação adequada e repouso');
    }
    
    if (patient.medications && patient.medications !== 'Nenhum medicamento relatado') {
      observations.push('Orientado sobre posologia e efeitos colaterais dos medicamentos prescritos');
    }
    
    observations.push('Retorno em caso de piora dos sintomas ou surgimento de novos sinais');
    
    return observations.join('. ') + '.';
  }

  private parseDate(dateStr: string): Date {
    // Parse date string in format "DD/MM/YYYY - HH:MM"
    const [datePart, timePart] = dateStr.split(' - ');
    const [day, month, year] = datePart.split('/').map(Number);
    const [hour, minute] = (timePart || '00:00').split(':').map(Number);
    
    return new Date(year, month - 1, day, hour, minute);
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
    if (!birthDate) return 0;
    
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