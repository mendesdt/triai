export interface FirebasePatient {
  id?: string;
  name: string;
  cpf: string;
  position: number;
  status: 'waiting' | 'in-triage' | 'completed';
  arrivalTime: string;
  entryDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientData {
  name: string;
  cpf: string;
}

export interface UpdatePatientData {
  name?: string;
  cpf?: string;
  status?: 'waiting' | 'in-triage' | 'completed';
  position?: number;
}