import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Patient, PatientHistory, ClinicalHypothesis, ClinicalAlert } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  // Mock data for demonstration
  private patients: Patient[] = [
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
    },
    {
      id: 2,
      name: 'João Gabriel Souza',
      photo: 'https://i.pravatar.cc/150?img=12',
      cpf: '987.654.321-09',
      birthDate: '1985-10-20',
      arrivalTime: '09:10',
      priority: 'Média',
      symptoms: ['Tosse', 'Falta de ar'],
      duration: '5 dias',
      intensity: 'Moderada',
      medications: 'Xarope para tosse (8/8h)'
    },
    {
      id: 3,
      name: 'Carlos Henrique Ramos',
      photo: 'https://i.pravatar.cc/150?img=11',
      cpf: '456.789.123-45',
      birthDate: '1978-03-25',
      arrivalTime: '09:04',
      priority: 'Baixa',
      symptoms: ['Dor de garganta', 'Coriza'],
      duration: '2 dias',
      intensity: 'Leve',
      medications: 'Nenhum'
    },
    {
      id: 4,
      name: 'Ana Paula Ferreira',
      photo: 'https://i.pravatar.cc/150?img=9',
      cpf: '789.123.456-78',
      birthDate: '1990-07-12',
      arrivalTime: '08:57',
      priority: 'Não triado',
      symptoms: [],
      duration: '',
      intensity: 'Leve',
      medications: ''
    },
    {
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
    }
  ];

  private triages: Patient[] = [...this.patients];

  private completedPatients: Patient[] = [
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
    },
    {
      id: 7,
      name: 'Fernanda Costa Lima',
      photo: 'https://i.pravatar.cc/150?img=15',
      cpf: '555.666.777-88',
      birthDate: '1988-07-22',
      arrivalTime: '09:15',
      completedTime: '15:45',
      priority: 'Baixa',
      symptoms: ['Dor de garganta', 'Febre baixa'],
      duration: '2 dias',
      intensity: 'Leve',
      medications: 'Paracetamol',
      diagnosis: 'Faringite viral'
    }
  ];

  private patientHistories: { [key: number]: PatientHistory[] } = {
    1: [
      {
        id: 1,
        date: '15/11/2024 - 14:20',
        type: 'Consulta Clínica Geral',
        diagnosis: 'Síndrome gripal',
        medications: 'Dipirona 500mg, Paracetamol 750mg',
        evolution: 'Paciente apresentou melhora dos sintomas após 3 dias de tratamento.',
        status: 'Finalizado'
      },
      {
        id: 2,
        date: '02/10/2024 - 09:30',
        type: 'Consulta Cardiologia',
        diagnosis: 'Hipertensão arterial leve',
        medications: 'Losartana 50mg 1x/dia',
        evolution: 'Pressão arterial controlada, paciente aderente ao tratamento.',
        status: 'Acompanhamento'
      },
      {
        id: 3,
        date: '18/08/2024 - 16:45',
        type: 'Atendimento Enfermagem',
        diagnosis: 'Vacinação de rotina',
        medications: 'Vacina da gripe',
        evolution: 'Vacinação realizada sem intercorrências.',
        status: 'Finalizado'
      }
    ],
    2: [
      {
        id: 4,
        date: '20/11/2024 - 11:15',
        type: 'Consulta Pneumologia',
        diagnosis: 'Bronquite aguda',
        medications: 'Prednisolona 20mg, Salbutamol spray',
        evolution: 'Melhora significativa da tosse e dispneia após tratamento.',
        status: 'Finalizado'
      },
      {
        id: 5,
        date: '05/09/2024 - 08:00',
        type: 'Consulta Clínica Geral',
        diagnosis: 'Rinite alérgica',
        medications: 'Loratadina 10mg, Spray nasal',
        evolution: 'Controle adequado dos sintomas alérgicos.',
        status: 'Acompanhamento'
      }
    ],
    3: [
      {
        id: 6,
        date: '25/10/2024 - 13:30',
        type: 'Consulta Otorrinolaringologia',
        diagnosis: 'Faringite bacteriana',
        medications: 'Amoxicilina 500mg, Ibuprofeno 400mg',
        evolution: 'Resolução completa do quadro infeccioso.',
        status: 'Finalizado'
      }
    ],
    5: [
      {
        id: 7,
        date: '22/04/2024 - 10:30',
        type: 'Consulta Clínica Geral',
        diagnosis: 'Hipertensão arterial',
        medications: 'Losartana 50mg 1x/dia',
        evolution: 'Pressão controlada, sem efeitos colaterais.',
        status: 'Finalizado'
      },
      {
        id: 8,
        date: '13/02/2024 - 15:00',
        type: 'Consulta Cardiologia',
        diagnosis: 'Arritmia leve',
        medications: 'Atenolol 25mg 1x/dia',
        evolution: 'Sintomas esporádicos, acompanhamento solicitado.',
        status: 'Acompanhamento'
      },
      {
        id: 9,
        date: '07/11/2023 - 09:50',
        type: 'Atendimento Enfermagem',
        diagnosis: 'Glicemia alterada',
        medications: 'Metformina 500mg 2x/dia',
        evolution: 'Orientado dieta, retorno em 2 meses.',
        status: 'Evolução'
      },
      {
        id: 10,
        date: '15/08/2023 - 14:20',
        type: 'Consulta Endocrinologia',
        diagnosis: 'Diabetes mellitus tipo 2',
        medications: 'Metformina 850mg, Glicazida 30mg',
        evolution: 'Controle glicêmico adequado com medicação.',
        status: 'Acompanhamento'
      },
      {
        id: 11,
        date: '03/05/2023 - 11:00',
        type: 'Consulta Oftalmologia',
        diagnosis: 'Retinopatia diabética inicial',
        medications: 'Colírio lubrificante',
        evolution: 'Acompanhamento oftalmológico semestral recomendado.',
        status: 'Acompanhamento'
      }
    ],
    6: [
      {
        id: 12,
        date: '10/11/2024 - 16:30',
        type: 'Consulta Gastroenterologia',
        diagnosis: 'Gastrite crônica',
        medications: 'Omeprazol 40mg, Domperidona 10mg',
        evolution: 'Melhora dos sintomas dispépticos com tratamento.',
        status: 'Acompanhamento'
      },
      {
        id: 13,
        date: '28/09/2024 - 09:45',
        type: 'Endoscopia digestiva alta',
        diagnosis: 'Gastrite erosiva leve',
        medications: 'Omeprazol 20mg',
        evolution: 'Exame confirma gastrite, sem sinais de malignidade.',
        status: 'Finalizado'
      }
    ],
    7: [
      {
        id: 14,
        date: '12/10/2024 - 08:15',
        type: 'Consulta Clínica Geral',
        diagnosis: 'Infecção viral das vias aéreas superiores',
        medications: 'Paracetamol 750mg, Vitamina C',
        evolution: 'Recuperação completa em 7 dias.',
        status: 'Finalizado'
      }
    ]
  };

  constructor() {}

  getPatients(): Observable<Patient[]> {
    return of(this.patients).pipe(delay(500));
  }

  getTriages(): Observable<Patient[]> {
    return of(this.triages).pipe(delay(500));
  }

  getTriageById(id: number): Observable<Patient | undefined> {
    const triage = this.triages.find(t => t.id === id);
    return of(triage).pipe(delay(300));
  }

  updateTriage(id: number, triageData: Partial<Patient>): Observable<Patient> {
    const index = this.triages.findIndex(t => t.id === id);
    if (index !== -1) {
      this.triages[index] = { ...this.triages[index], ...triageData };
      return of(this.triages[index]).pipe(delay(700));
    }
    throw new Error('Triage not found');
  }

  deleteTriage(id: number): Observable<boolean> {
    const index = this.triages.findIndex(t => t.id === id);
    if (index !== -1) {
      this.triages.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  getCompletedPatients(date: string): Observable<Patient[]> {
    // In a real app, this would filter by date
    return of(this.completedPatients).pipe(delay(500));
  }

  getPatientById(id: number): Observable<Patient | undefined> {
    const patient = this.patients.find(p => p.id === id);
    return of(patient).pipe(delay(300));
  }

  getPatientHistory(patientId: number): Observable<PatientHistory[]> {
    return of(this.patientHistories[patientId] || []).pipe(delay(500));
  }

  getPatientAnalysis(patientId: number): Observable<any> {
    // Mock AI analysis data
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
        },
        {
          pattern: 'Pressão arterial elevada em consultas matinais',
          frequency: '70% das consultas',
          recommendation: 'Ajustar horário da medicação anti-hipertensiva'
        }
      ],
      recommendations: [
        {
          category: 'Prevenção',
          action: 'Agendar consulta de rotina com cardiologista',
          priority: 'medium'
        },
        {
          category: 'Monitoramento',
          action: 'Verificar pressão arterial semanalmente',
          priority: 'high'
        },
        {
          category: 'Estilo de vida',
          action: 'Orientar sobre atividade física regular',
          priority: 'low'
        }
      ],
      trends: [
        {
          metric: 'Pressão Arterial',
          trend: 'stable',
          description: 'Mantida dentro dos parâmetros normais com medicação'
        },
        {
          metric: 'Frequência de Consultas',
          trend: 'improving',
          description: 'Redução de 30% nas consultas de urgência'
        },
        {
          metric: 'Adesão ao Tratamento',
          trend: 'improving',
          description: 'Melhora significativa na adesão aos medicamentos'
        }
      ]
    };
    
    return of(analysis).pipe(delay(800));
  }

  getClinicalHypotheses(patientId: number): Observable<ClinicalHypothesis[]> {
    // Mock clinical hypotheses based on patient ID
    const hypotheses: ClinicalHypothesis[] = [
      { description: 'Doença viral aguda (Dengue possível)' },
      { description: 'Infecção viral inespecífica' },
      { description: 'Febre Chikungunya (menos provável)' }
    ];
    
    return of(hypotheses).pipe(delay(300));
  }

  getClinicalAlerts(patientId: number): Observable<ClinicalAlert[]> {
    // Mock clinical alerts based on patient ID
    const alerts: ClinicalAlert[] = [
      { description: 'Suspeita de Dengue', type: 'danger' },
      { description: 'Monitorar sinais de desidratação', type: 'warning' }
    ];
    
    return of(alerts).pipe(delay(300));
  }

  completeAttendance(patientId: number): Observable<boolean> {
    const patientIndex = this.patients.findIndex(p => p.id === patientId);
    if (patientIndex !== -1) {
      const patient = this.patients[patientIndex];
      // Move to completed patients
      this.completedPatients.push({
        ...patient,
        completedTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        diagnosis: 'Síndrome gripal'
      });
      // Remove from active patients
      this.patients.splice(patientIndex, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  removeAttendance(patientId: number): Observable<boolean> {
    const patientIndex = this.patients.findIndex(p => p.id === patientId);
    if (patientIndex !== -1) {
      this.patients.splice(patientIndex, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  registerTriage(patient: Partial<Patient>): Observable<Patient> {
    // In a real app, this would send data to a backend API
    const newPatient: Patient = {
      id: this.triages.length + 1,
      name: patient.name || '',
      cpf: patient.cpf || '',
      birthDate: patient.birthDate || '',
      arrivalTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      priority: 'Não triado',
      symptoms: patient.symptoms || [],
      otherSymptoms: patient.otherSymptoms,
      duration: patient.duration || '',
      intensity: patient.intensity || 'Leve',
      medications: patient.medications || ''
    };
    
    this.triages.push(newPatient);
    this.patients.push(newPatient);
    return of(newPatient).pipe(delay(700));
  }
}