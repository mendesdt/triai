import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of, switchMap } from 'rxjs';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp,
  getDoc 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { Patient, PatientHistory, ClinicalHypothesis, ClinicalAlert } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private triagesCollection = 'triages';
  private completedTriagesCollection = 'completed-triages';

  // Mock data for demonstration (will be replaced by Firebase)
  private patientHistories: { [key: string]: PatientHistory[] } = {
    '1': [
      {
        id: '1',
        date: '15/11/2024 - 14:20',
        type: 'Consulta Clínica Geral',
        diagnosis: 'Síndrome gripal',
        medications: 'Dipirona 500mg, Paracetamol 750mg',
        evolution: 'Paciente apresentou melhora dos sintomas após 3 dias de tratamento.',
        status: 'Finalizado',
        consultReason: 'Febre alta persistente e dores no corpo há 3 dias',
        symptoms: ['Febre', 'Dor de cabeça', 'Dor muscular', 'Tosse'],
        otherSymptoms: 'Mal-estar geral e perda de apetite',
        duration: '3 dias',
        intensity: 'Moderada',
        priority: 'Média',
        allergies: 'Nenhuma Alergia Conhecida',
        vitalSigns: {
          heartRate: 85,
          respiratoryRate: 18,
          temperature: 38.2,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          oxygenSaturation: 98
        },
        motherName: 'Maria José Silva',
        professionalName: 'Dr. Ana Souza',
        professionalRole: 'Médico',
        observations: 'Paciente orientado sobre repouso e hidratação adequada. Retorno em caso de piora dos sintomas.'
      },
      {
        id: '2',
        date: '10/10/2024 - 09:15',
        type: 'Triagem de Enfermagem',
        diagnosis: 'Hipertensão arterial leve',
        medications: 'Losartana 50mg',
        evolution: 'Pressão arterial controlada com medicação.',
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
        motherName: 'Maria José Silva',
        professionalName: 'Enf. Carlos Lima',
        professionalRole: 'Enfermeiro',
        observations: 'Paciente orientado sobre dieta hipossódica e exercícios físicos regulares.'
      }
    ]
  };

  constructor() {}

  // Triagens ativas (pacientes aguardando atendimento médico)
  getPatients(): Observable<Patient[]> {
    const q = query(
      collection(db, this.triagesCollection), 
      orderBy('createdAt', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const patients: Patient[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          patients.push({
            id: doc.id,
            ...data
          } as Patient);
        });
        return patients;
      }),
      catchError(error => {
        console.error('Erro ao buscar pacientes:', error);
        return of([]);
      })
    );
  }

  // Triagens realizadas
  getTriages(): Observable<Patient[]> {
    return this.getPatients(); // Mesma collection, mas pode ser filtrada se necessário
  }

  // Buscar triagem por ID
  getTriageById(id: string): Observable<Patient | undefined> {
    const docRef = doc(db, this.triagesCollection, id);
    
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as Patient;
        }
        return undefined;
      }),
      catchError(error => {
        console.error('Erro ao buscar triagem:', error);
        return of(undefined);
      })
    );
  }

  // Registrar nova triagem
  registerTriage(triageData: Partial<Patient>): Observable<Patient> {
    const now = new Date();
    
    const newTriage = {
      name: triageData.name || '',
      cpf: triageData.cpf || '',
      birthDate: triageData.birthDate || '',
      motherName: triageData.motherName || '',
      consultReason: triageData.consultReason || '',
      symptoms: triageData.symptoms || [],
      otherSymptoms: triageData.otherSymptoms || '',
      duration: triageData.duration || '',
      intensity: triageData.intensity || 'Leve',
      medications: triageData.medications || '',
      allergies: triageData.allergies || '',
      vitalSigns: triageData.vitalSigns || {},
      priority: triageData.priority || 'Baixa', // Usar a prioridade selecionada pela enfermeira
      arrivalTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      triageStatus: 'completed',
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    };

    return from(addDoc(collection(db, this.triagesCollection), newTriage)).pipe(
      map(docRef => ({
        id: docRef.id,
        ...newTriage
      } as Patient)),
      catchError(error => {
        console.error('Erro ao registrar triagem:', error);
        throw error;
      })
    );
  }

  // Atualizar triagem
  updateTriage(id: string, triageData: Partial<Patient>): Observable<Patient> {
    const triageRef = doc(db, this.triagesCollection, id);
    
    const updateData = {
      ...triageData,
      updatedAt: Timestamp.fromDate(new Date())
    };

    return from(updateDoc(triageRef, updateData)).pipe(
      map(() => ({
        id,
        ...updateData
      } as Patient)),
      catchError(error => {
        console.error('Erro ao atualizar triagem:', error);
        throw error;
      })
    );
  }

  // Deletar triagem
  deleteTriage(id: string): Observable<boolean> {
    const triageRef = doc(db, this.triagesCollection, id);
    
    return from(deleteDoc(triageRef)).pipe(
      map(() => true),
      catchError(error => {
        console.error('Erro ao deletar triagem:', error);
        return of(false);
      })
    );
  }

  // Completar atendimento (mover para triagens concluídas)
  completeAttendance(patientId: string): Observable<boolean> {
    return from(getDoc(doc(db, this.triagesCollection, patientId))).pipe(
      switchMap(async (docSnap) => {
        if (docSnap.exists()) {
          const patientData = docSnap.data();
          
          // Adicionar à collection de triagens concluídas
          const completedData = {
            ...patientData,
            completedTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            diagnosis: 'Síndrome gripal', // Pode ser passado como parâmetro
            triageStatus: 'completed',
            completedAt: Timestamp.fromDate(new Date())
          };
          
          await addDoc(collection(db, this.completedTriagesCollection), completedData);
          
          // Remover da collection de triagens ativas
          await deleteDoc(doc(db, this.triagesCollection, patientId));
          
          return true;
        }
        return false;
      }),
      catchError(error => {
        console.error('Erro ao completar atendimento:', error);
        return of(false);
      })
    );
  }

  // Remover atendimento
  removeAttendance(patientId: string): Observable<boolean> {
    return this.deleteTriage(patientId);
  }

  // Buscar pacientes concluídos
  getCompletedPatients(date: string): Observable<Patient[]> {
    const q = query(
      collection(db, this.completedTriagesCollection), 
      orderBy('completedAt', 'desc')
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const patients: Patient[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          patients.push({
            id: doc.id,
            ...data
          } as Patient);
        });
        return patients;
      }),
      catchError(error => {
        console.error('Erro ao buscar pacientes concluídos:', error);
        return of([]);
      })
    );
  }

  // Métodos mock para compatibilidade (serão implementados posteriormente)
  getPatientById(id: string): Observable<Patient | undefined> {
    return this.getTriageById(id);
  }

  getPatientHistory(patientId: string): Observable<PatientHistory[]> {
    // Retornar histórico completo com todos os campos necessários
    return of(this.patientHistories[patientId] || []);
  }

  getPatientAnalysis(patientId: string): Observable<any> {
    const analysis = {
      riskLevel: 'medium',
      riskScore: 65,
      alerts: [
        {
          type: 'warning',
          title: 'Histórico de Hipertensão',
          description: 'Paciente possui histórico de hipertensão arterial que requer monitoramento contínuo.'
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
    
    return of(analysis);
  }

  getClinicalHypotheses(patientId: string): Observable<ClinicalHypothesis[]> {
    const hypotheses: ClinicalHypothesis[] = [
      { description: 'Doença viral aguda (Dengue possível)' },
      { description: 'Infecção viral inespecífica' },
      { description: 'Febre Chikungunya (menos provável)' }
    ];
    
    return of(hypotheses);
  }

  getClinicalAlerts(patientId: string): Observable<ClinicalAlert[]> {
    const alerts: ClinicalAlert[] = [
      { description: 'Suspeita de Dengue', type: 'danger' },
      { description: 'Monitorar sinais de desidratação', type: 'warning' }
    ];
    
    return of(alerts);
  }
}