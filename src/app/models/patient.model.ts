export interface Patient {
  id: string;
  name: string;
  photo?: string;
  cpf: string;
  birthDate: string;
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
  motherName?: string;
  allergies?: string;
  vitalSigns?: VitalSigns;
  triageStatus?: 'pending' | 'in-progress' | 'completed';
  createdAt?: any;
  updatedAt?: any;
}

export interface VitalSigns {
  heartRate?: number; // BPM
  respiratoryRate?: number; // RPM
  temperature?: number; // °C
  bloodPressureSystolic?: number; // mmHg
  bloodPressureDiastolic?: number; // mmHg
  oxygenSaturation?: number; // %
}

export interface PatientHistory {
  id: string;
  date: string;
  type: string;
  diagnosis: string;
  medications: string;
  evolution: string;
  status: 'Finalizado' | 'Acompanhamento' | 'Evolução';
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
  arrivalTime: string;
  entryDate: string;
  status: 'waiting' | 'in-triage';
}