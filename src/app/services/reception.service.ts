import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PendingPatient } from '../models/patient.model';
import { MongoDBService } from './mongodb.service';

export interface NewPatientInput {
  name: string;
  cpf: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceptionService {
  constructor(private mongoDBService: MongoDBService) {}

  getPendingPatients(): Observable<PendingPatient[]> {
    return this.mongoDBService.getPatientsInQueue();
  }

  addPendingPatient(patientData: NewPatientInput): Observable<any> {
    const newPatient: Omit<PendingPatient, 'id'> = {
      name: patientData.name,
      cpf: patientData.cpf,
      arrivalTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      entryDate: new Date().toISOString().split('T')[0],
      status: 'waiting'
    };
    
    return this.mongoDBService.addPatientToQueue(newPatient);
  }

  updatePendingPatient(id: string, patientData: Partial<PendingPatient>): Observable<any> {
    return this.mongoDBService.updatePatient(id, patientData);
  }

  removePendingPatient(id: string): Observable<any> {
    return this.mongoDBService.removePatientFromQueue(id);
  }

  updatePatientStatus(id: string, status: 'waiting' | 'in-triage' | 'triaged'): Observable<any> {
    return this.mongoDBService.updatePatientStatus(id, status);
  }

  getPatientsByStatus(status: 'waiting' | 'in-triage' | 'triaged'): Observable<PendingPatient[]> {
    return this.mongoDBService.getPatientsByStatus(status);
  }
}