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
  patientId!: string;
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
      this.patientId = params['id'];
      this.loadPatientData();
    });
  }

  loadPatientData(): void {
    this.loading = true;
    
    this.patientService.getTriageById(this.patientId)
      .subscribe({
        next: (patient) => {
          if (patient) {
            this.patient = this.enhancePatientWithAIData(patient);
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

  private enhancePatientWithAIData(patient: Patient): Patient {
    // Se não há dados da IA, gerar dados mock mais realistas
    if (!patient.aiHypotheses || patient.aiHypotheses.length === 0) {
      patient.aiHypotheses = this.generateRealisticAIHypotheses(patient);
    }

    if (!patient.aiAlerts || patient.aiAlerts.length === 0) {
      patient.aiAlerts = this.generateRealisticAIAlerts(patient);
    }

    return patient;
  }

  private generateRealisticAIHypotheses(patient: Patient): any[] {
    const symptoms = patient.symptoms || [];
    const intensity = patient.intensity || 'Leve';
    const age = this.getAge(patient.birthDate || '');
    
    const hypotheses = [];

    // Hipótese baseada em sintomas respiratórios
    if (symptoms.includes('Febre') && symptoms.includes('Tosse')) {
      hypotheses.push({
        probability: 'Provável',
        illness: 'COVID-19',
        diagnosis: 'Infecção viral por SARS-CoV-2 com comprometimento respiratório leve a moderado',
        details: 'Quadro clínico compatível com COVID-19, apresentando febre persistente e tosse seca. Paciente em fase aguda da infecção.',
        medications: [
          'Paracetamol 750mg - 8/8h',
          'Dipirona 500mg - 6/6h se febre',
          'Vitamina D 2000UI - 1x/dia',
          'Vitamina C 1g - 1x/dia',
          'Zinco 15mg - 1x/dia'
        ],
        treatmentPlan: 'Isolamento domiciliar por 10 dias, hidratação abundante, repouso absoluto. Monitoramento de saturação de oxigênio. Retorno imediato se dispneia ou saturação < 95%.'
      });
    }

    // Hipótese baseada em sintomas gripais
    if (symptoms.includes('Febre') && symptoms.includes('Dor de cabeça') && symptoms.includes('Dor muscular')) {
      hypotheses.push({
        probability: 'Possível',
        illness: 'Influenza A (H1N1)',
        diagnosis: 'Síndrome gripal por vírus Influenza A com manifestações sistêmicas',
        details: 'Quadro típico de influenza com início súbito, febre alta, mialgia e cefaleia. Evolução esperada de 5-7 dias.',
        medications: [
          'Oseltamivir 75mg - 12/12h por 5 dias',
          'Paracetamol 750mg - 6/6h',
          'Ibuprofeno 400mg - 8/8h',
          'Loratadina 10mg - 1x/dia'
        ],
        treatmentPlan: 'Tratamento antiviral precoce, sintomáticos, repouso por 7 dias. Isolamento até 24h sem febre. Vacinação anual preventiva.'
      });
    }

    // Hipótese para pacientes idosos ou com sintomas intensos
    if (age > 60 || intensity === 'Alta') {
      hypotheses.push({
        probability: 'Menos Provável',
        illness: 'Pneumonia Bacteriana',
        diagnosis: 'Pneumonia adquirida na comunidade por provável agente bacteriano',
        details: 'Suspeita de pneumonia bacteriana devido à idade avançada e intensidade dos sintomas. Necessária investigação radiológica.',
        medications: [
          'Amoxicilina + Clavulanato 875mg - 12/12h por 7 dias',
          'Azitromicina 500mg - 1x/dia por 3 dias',
          'Prednisolona 20mg - 1x/dia por 5 dias',
          'Salbutamol spray - 2 jatos 6/6h'
        ],
        treatmentPlan: 'Antibioticoterapia empírica, corticoterapia de curta duração, broncodilatador. Radiografia de tórax, hemograma e PCR. Reavaliação em 48-72h.'
      });
    }

    // Se nenhuma hipótese específica, adicionar síndrome gripal genérica
    if (hypotheses.length === 0) {
      hypotheses.push({
        probability: 'Provável',
        illness: 'Síndrome Gripal Viral',
        diagnosis: 'Infecção viral das vias aéreas superiores com manifestações sistêmicas',
        details: 'Quadro viral autolimitado com sintomas típicos de síndrome gripal. Evolução benigna esperada.',
        medications: [
          'Paracetamol 750mg - 6/6h',
          'Dipirona 500mg - se febre',
          'Soro fisiológico nasal - 3x/dia',
          'Mel com própolis - 1 colher 3x/dia'
        ],
        treatmentPlan: 'Tratamento sintomático, hidratação oral abundante, repouso relativo. Retorno se piora ou persistência após 7 dias.'
      });
    }

    return hypotheses;
  }

  private generateRealisticAIAlerts(patient: Patient): any[] {
    const alerts = [];
    const vitalSigns = patient.vitalSigns;
    const age = this.getAge(patient.birthDate || '');

    // Alertas baseados em sinais vitais
    if (vitalSigns?.oxygenSaturation && vitalSigns.oxygenSaturation < 95) {
      alerts.push({
        alert: 'Hipoxemia Detectada',
        reason: `Saturação de oxigênio de ${vitalSigns.oxygenSaturation}% está abaixo do normal (>95%). Indica comprometimento da oxigenação e necessidade de suporte respiratório.`
      });
    }

    if (vitalSigns?.temperature && vitalSigns.temperature > 39) {
      alerts.push({
        alert: 'Febre Alta Persistente',
        reason: `Temperatura de ${vitalSigns.temperature}°C indica processo infeccioso significativo. Requer controle térmico agressivo e investigação da causa.`
      });
    }

    if (vitalSigns?.heartRate && vitalSigns.heartRate > 100) {
      alerts.push({
        alert: 'Taquicardia Compensatória',
        reason: `Frequência cardíaca de ${vitalSigns.heartRate} bpm pode indicar compensação fisiológica à febre, desidratação ou comprometimento respiratório.`
      });
    }

    // Alertas baseados em idade
    if (age > 65) {
      alerts.push({
        alert: 'Paciente Grupo de Risco',
        reason: 'Idade avançada (>65 anos) aumenta significativamente o risco de complicações em infecções respiratórias. Monitoramento intensivo recomendado.'
      });
    }

    // Alertas baseados em sintomas
    if (patient.symptoms?.includes('Falta de ar')) {
      alerts.push({
        alert: 'Dispneia Presente',
        reason: 'Presença de falta de ar pode indicar comprometimento respiratório. Necessária avaliação da função pulmonar e oxigenação.'
      });
    }

    return alerts;
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
    // Load clinical hypotheses (fallback if no AI data)
    if (!this.patient?.aiHypotheses || this.patient.aiHypotheses.length === 0) {
      this.patientService.getClinicalHypotheses(this.patientId)
        .subscribe({
          next: (hypotheses) => {
            this.clinicalHypotheses = hypotheses;
          },
          error: (error) => {
            console.error('Error fetching clinical hypotheses:', error);
          }
        });
    }
    
    // Load clinical alerts (fallback if no AI data)
    if (!this.patient?.aiAlerts || this.patient.aiAlerts.length === 0) {
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
    } else {
      this.loading = false;
    }
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
          next: (success) => {
            if (success) {
              alert('Atendimento completado com sucesso!');
              this.router.navigate(['/patients']);
            } else {
              alert('Erro ao completar atendimento');
            }
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
          next: (success) => {
            if (success) {
              alert('Atendimento removido com sucesso!');
              this.router.navigate(['/patients']);
            } else {
              alert('Erro ao remover atendimento');
            }
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

  getProbabilityClass(probability: string): string {
    switch (probability.toLowerCase()) {
      case 'provável':
        return 'probability-provavel';
      case 'possível':
        return 'probability-possivel';
      case 'menos provável':
        return 'probability-menos-provavel';
      default:
        return 'probability-possivel';
    }
  }

  private generateMedicalNotes(): void {
    if (!this.patient) return;
    
    let notes = `Paciente: ${this.patient.name}, ${this.getAge(this.patient.birthDate)} anos, CPF ${this.patient.cpf}
Motivo da consulta: ${this.patient.consultReason || 'Febre alta persistente e dores no corpo há ' + this.patient.duration}.
Sintomas: ${this.patient.symptoms.join(', ')}${this.patient.otherSymptoms ? ', ' + this.patient.otherSymptoms : ''}.
Início: ${this.patient.duration} atrás. Intensidade: ${this.patient.intensity.toLowerCase()}. Evolução: piora progressiva.
Medicamentos em uso: ${this.patient.medications || 'Nenhum medicamento relatado'}.`;

    // Add AI hypotheses if available
    if (this.patient.aiHypotheses && this.patient.aiHypotheses.length > 0) {
      notes += `\n\nHipóteses diagnósticas (IA):`;
      this.patient.aiHypotheses.forEach((h, index) => {
        notes += `\n${index + 1}. ${h.illness} (${h.probability})`;
        if (h.diagnosis) {
          notes += `\n   Diagnóstico: ${h.diagnosis}`;
        }
        if (h.medications && h.medications.length > 0) {
          notes += `\n   Medicamentos: ${h.medications.join(', ')}`;
        }
        if (h.treatmentPlan) {
          notes += `\n   Plano: ${h.treatmentPlan}`;
        }
      });
    } else if (this.clinicalHypotheses.length > 0) {
      notes += `\nHipóteses clínicas sugeridas: ${this.clinicalHypotheses.map(h => h.description).join(', ')}.`;
    }

    // Add AI alerts if available
    if (this.patient.aiAlerts && this.patient.aiAlerts.length > 0) {
      notes += `\n\nAlertas clínicos: ${this.patient.aiAlerts.map(a => a.alert).join(', ')}.`;
    } else if (this.clinicalAlerts.length > 0) {
      notes += `\nAlertas: ${this.clinicalAlerts.map(a => a.description).join(', ')}.`;
    }

    this.medicalNotes = notes;
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