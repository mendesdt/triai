import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import { Patient, PatientHistory, ClinicalHypothesis, ClinicalAlert } from '../models/patient.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(private supabase: SupabaseService) {}

  getPatients(): Observable<Patient[]> {
    return from(
      this.supabase.select('patients', '*')
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error fetching patients:', error);
        // Return mock data as fallback
        return this.getMockPatients();
      })
    );
  }

  getTriages(): Observable<Patient[]> {
    return from(
      this.supabase.select('triages', '*')
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error fetching triages:', error);
        // Return mock data as fallback
        return this.getMockTriages();
      })
    );
  }

  getTriageById(id: number): Observable<Patient | undefined> {
    return from(
      this.supabase.select('triages', '*', { id })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data?.[0];
      }),
      catchError(error => {
        console.error('Error fetching triage:', error);
        return of(undefined);
      })
    );
  }

  updateTriage(id: number, triageData: Partial<Patient>): Observable<Patient> {
    return from(
      this.supabase.update('triages', id.toString(), triageData)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      delay(700),
      catchError(error => {
        console.error('Error updating triage:', error);
        throw error;
      })
    );
  }

  deleteTriage(id: number): Observable<boolean> {
    return from(
      this.supabase.delete('triages', id.toString())
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return true;
      }),
      delay(500),
      catchError(error => {
        console.error('Error deleting triage:', error);
        return of(false);
      })
    );
  }

  getCompletedPatients(date: string): Observable<Patient[]> {
    return from(
      this.supabase.select('completed_patients', '*', { completion_date: date })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error fetching completed patients:', error);
        // Return mock data as fallback
        return this.getMockCompletedPatients();
      })
    );
  }

  getPatientById(id: number): Observable<Patient | undefined> {
    return from(
      this.supabase.select('patients', '*', { id })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data?.[0];
      }),
      catchError(error => {
        console.error('Error fetching patient:', error);
        // Return mock data as fallback
        return this.getMockPatientById(id);
      })
    );
  }

  getPatientHistory(patientId: number): Observable<PatientHistory[]> {
    return from(
      this.supabase.select('patient_history', '*', { patient_id: patientId })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error fetching patient history:', error);
        // Return mock data as fallback
        return this.getMockPatientHistory(patientId);
      })
    );
  }

  getPatientAnalysis(patientId: number): Observable<any> {
    // Mock AI analysis data - in real implementation, this would call Supabase Edge Functions
    const analysis = {
      riskLevel: 'medium',
      riskScore: 65,
      alerts: [
        {
          type: 'warning',
          title: 'Histórico de Hipertensão',
          description: 'Paciente possui histórico de hipertensão arterial que requer monitoramento contínuo.'
        },
        {
          type: 'info',
          title: 'Adesão ao Tratamento',
          description: 'Boa adesão aos medicamentos prescritos nos últimos 6 meses.'
        }
      ],
      patterns: [
        {
          pattern: 'Consultas frequentes por sintomas respiratórios',
          frequency: '3x nos últimos 6 meses',
          recommendation: 'Considerar avaliação pneumológica preventiva'
        }
      ],
      recommendations: [
        {
          category: 'Prevenção',
          action: 'Agendar consulta de rotina com cardiologista',
          priority: 'medium'
        }
      ],
      trends: [
        {
          metric: 'Pressão Arterial',
          trend: 'stable',
          description: 'Mantida dentro dos parâmetros normais com medicação'
        }
      ]
    };
    
    return of(analysis).pipe(delay(800));
  }

  getClinicalHypotheses(patientId: number): Observable<ClinicalHypothesis[]> {
    const hypotheses: ClinicalHypothesis[] = [
      { description: 'Doença viral aguda (Dengue possível)' },
      { description: 'Infecção viral inespecífica' },
      { description: 'Febre Chikungunya (menos provável)' }
    ];
    
    return of(hypotheses).pipe(delay(300));
  }

  getClinicalAlerts(patientId: number): Observable<ClinicalAlert[]> {
    const alerts: ClinicalAlert[] = [
      { description: 'Suspeita de Dengue', type: 'danger' },
      { description: 'Monitorar sinais de desidratação', type: 'warning' }
    ];
    
    return of(alerts).pipe(delay(300));
  }

  completeAttendance(patientId: number): Observable<boolean> {
    return from(
      this.supabase.update('patients', patientId.toString(), { 
        status: 'completed',
        completed_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return true;
      }),
      delay(500),
      catchError(error => {
        console.error('Error completing attendance:', error);
        return of(false);
      })
    );
  }

  removeAttendance(patientId: number): Observable<boolean> {
    return from(
      this.supabase.delete('patients', patientId.toString())
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return true;
      }),
      delay(500),
      catchError(error => {
        console.error('Error removing attendance:', error);
        return of(false);
      })
    );
  }

  registerTriage(patient: Partial<Patient>): Observable<Patient> {
    const newPatient = {
      name: patient.name || '',
      cpf: patient.cpf || '',
      birth_date: patient.birthDate || '',
      arrival_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      priority: 'Não triado',
      symptoms: patient.symptoms || [],
      other_symptoms: patient.otherSymptoms,
      duration: patient.duration || '',
      intensity: patient.intensity || 'Leve',
      medications: patient.medications || '',
      created_at: new Date().toISOString()
    };
    
    return from(
      this.supabase.insert('triages', newPatient)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      delay(700),
      catchError(error => {
        console.error('Error registering triage:', error);
        throw error;
      })
    );
  }

  // Mock data methods for fallback
  private getMockPatients(): Observable<Patient[]> {
    const patients: Patient[] = [
      {
        id: 1,
        name: 'Maria Clara Lopes',
        photo: 'https://i.pravatar.cc/150?img=5',
        cpf: '123.456.789-01',
        birthDate: '1992-05-15',
        arrivalTime: '09:12',
        priority: 'Alta',
        symptoms: ['Febre', 'Dor de cabeça', 'Dor muscular'],
        duration: '3 dias',
        intensity: 'Alta',
        medications: 'Dipirona 500mg (a cada 6h), Paracetamol 750mg (2x ao dia)'
      }
    ];
    return of(patients).pipe(delay(500));
  }

  private getMockTriages(): Observable<Patient[]> {
    return this.getMockPatients();
  }

  private getMockCompletedPatients(): Observable<Patient[]> {
    const completedPatients: Patient[] = [
      {
        id: 6,
        name: 'Roberto Silva Santos',
        photo: 'https://i.pravatar.cc/150?img=14',
        cpf: '111.222.333-44',
        birthDate: '1980-03-15',
        arrivalTime: '08:30',
        completedTime: '14:30',
        priority: 'Média',
        symptoms: ['Dor abdominal', 'Náusea'],
        duration: '1 dia',
        intensity: 'Moderada',
        medications: 'Buscopan, Omeprazol',
        diagnosis: 'Gastrite aguda'
      }
    ];
    return of(completedPatients).pipe(delay(500));
  }

  private getMockPatientById(id: number): Observable<Patient | undefined> {
    const patient: Patient = {
      id: 5,
      name: 'Lucas Pereira',
      photo: 'https://i.pravatar.cc/150?img=13',
      cpf: '123.456.789-00',
      birthDate: '1995-08-12',
      arrivalTime: '08:45',
      priority: 'Alta',
      symptoms: ['Febre', 'Dor no corpo', 'Dor de cabeça', 'Mal-estar'],
      otherSymptoms: 'Sensação de cansaço intenso à tarde.',
      duration: '3 dias',
      intensity: 'Alta',
      medications: 'Dipirona 500mg (a cada 6h), Paracetamol 750mg (2x ao dia)',
      consultReason: 'Febre alta persistente e dores no corpo há 3 dias.',
      city: 'São Paulo',
      state: 'SP',
      email: 'lucas.pereira@gmail.com',
      phone: '(11) 91234-5678',
      lastAppointment: '12/05/2024'
    };
    return of(patient).pipe(delay(300));
  }

  private getMockPatientHistory(patientId: number): Observable<PatientHistory[]> {
    const history: PatientHistory[] = [
      {
        id: 1,
        date: '15/11/2024 - 14:20',
        type: 'Consulta Clínica Geral',
        diagnosis: 'Síndrome gripal',
        medications: 'Dipirona 500mg, Paracetamol 750mg',
        evolution: 'Paciente apresentou melhora dos sintomas após 3 dias de tratamento.',
        status: 'Finalizado'
      }
    ];
    return of(history).pipe(delay(500));
  }
}