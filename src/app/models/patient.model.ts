export interface Patient {
  id: string;
  name: string;
  photo?: string;
  cpf: string;
  birthDate: string;
  motherName?: string;
  arrivalTime: string;
  completedTime?: string;
  priority: 'Alta' | 'Média' | 'Baixa' | 'Não triado';
  symptoms: string[];
  otherSymptoms?: string;
  duration: string;
  intensity: 'Leve' | 'Moderada' | 'Alta';
  medications: string;
  consultReason?: string;
  city?: string;
  state?: string;
  email?: string;
  phone?: string;
  lastAppointment?: string;
  diagnosis?: string;
  allergies?: string;
  vitalSigns?: VitalSigns;
  triageStatus?: 'pending' | 'in-progress' | 'completed';
  createdAt?: any;
  updatedAt?: any;
  // New fields for AI analysis
  aiHypotheses?: AIHypothesis[];
  aiAlerts?: AIAlert[];
}

export interface VitalSigns {
  heartRate?: number; // BPM
  respiratoryRate?: number; // RPM
  temperature?: number; // °C
  bloodPressureSystolic?: number; // mmHg
  bloodPressureDiastolic?: number; // mmHg
  oxygenSaturation?: number; // %
}

export interface AIHypothesis {
  probability: string;
  illness: string;
  details: string;
  medications?: string[]; // Medicamentos específicos para esta hipótese
  diagnosis?: string; // Diagnóstico específico para esta hipótese
  treatmentPlan?: string; // Plano de tratamento específico
}

export interface AIAlert {
  alert: string;
  reason: string;
}

export interface PatientHistory {
  id: string;
  date: string;
  type: string;
  diagnosis: string;
  medications: string;
  evolution: string;
  status: 'Finalizado' | 'Acompanhamento' | 'Evolução';
  consultReason?: string;
  symptoms?: string[];
  otherSymptoms?: string;
  duration?: string;
  intensity?: string;
  priority?: string;
  allergies?: string;
  vitalSigns?: VitalSigns;
  motherName?: string;
  professionalName?: string;
  professionalRole?: string;
  observations?: string;
}

export interface ClinicalHypothesis {
  description: string;
  probability?: 'alta' | 'média' | 'baixa';
}

export interface ClinicalAlert {
  description: string;
  type: 'danger' | 'warning';
}

export interface PendingPatient {
  id: string;
  name: string;
  cpf: string;
  birthDate?: string;
  motherName?: string;
  arrivalTime: string;
  entryDate: string;
  status: 'waiting' | 'in-triage';
}