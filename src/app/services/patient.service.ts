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
  private patientHistories: { [key: number]: PatientHistory[] } = {
    1: [
      {
        id: '1',
        date: '15/11/2024 - 14:20',
        type: 'Consulta Clínica Geral',
        diagnosis: 'Síndrome gripal',
        medications: 'Dipirona 500mg, Paracetamol 750mg',
        evolution: 'Paciente apresentou melhora dos sintomas após 3 dias de tratamento.',
        status: 'Finalizado'
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
    
    // Calcular prioridade baseada nos sintomas e sinais vitais
    const priority = this.calculatePriority(triageData);
    
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
      priority: priority,
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
    
    const priority = this.calculatePriority(triageData);
    
    const updateData = {
      ...triageData,
      priority: priority,
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

  // Calcular prioridade baseada nos sintomas e sinais vitais
  private calculatePriority(triageData: Partial<Patient>): 'Alta' | 'Média' | 'Baixa' {
    let score = 0;
    
    // Verificar sintomas críticos
    const criticalSymptoms = ['Falta de ar', 'Dor no peito', 'Convulsão', 'Perda de consciência'];
    const symptoms = triageData.symptoms || [];
    
    if (symptoms.some(symptom => criticalSymptoms.includes(symptom))) {
      score += 3;
    }
    
    // Verificar intensidade
    if (triageData.intensity === 'Alta') {
      score += 2;
    } else if (triageData.intensity === 'Moderada') {
      score += 1;
    }
    
    // Verificar sinais vitais
    const vitals = triageData.vitalSigns;
    if (vitals) {
      // Temperatura alta
      if (vitals.temperature && vitals.temperature > 38.5) {
        score += 2;
      }
      
      // Pressão arterial alta
      if (vitals.bloodPressureSystolic && vitals.bloodPressureSystolic > 160) {
        score += 1;
      }
      
      // Saturação baixa
      if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) {
        score += 3;
      }
      
      // Frequência cardíaca alterada
      if (vitals.heartRate && (vitals.heartRate > 100 || vitals.heartRate < 60)) {
        score += 1;
      }
    }
    
    // Determinar prioridade
    if (score >= 4) {
      return 'Alta';
    } else if (score >= 2) {
      return 'Média';
    } else {
      return 'Baixa';
    }
  }

  // Métodos mock para compatibilidade (serão implementados posteriormente)
  getPatientById(id: string): Observable<Patient | undefined> {
    return this.getTriageById(id);
  }

  getPatientHistory(patientId: string): Observable<PatientHistory[]> {
    // Convert string ID to number for accessing mock data
    const numericId = parseInt(patientId, 10);
    return of(this.patientHistories[numericId] || []);
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