import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { PendingPatient } from '../models/patient.model';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class ReceptionService {
  constructor(private firebaseService: FirebaseService) {}

  getPendingPatients(): Observable<PendingPatient[]> {
    return from(this.firebaseService.getPatientsInQueue());
  }

  addPendingPatient(patientData: Omit<PendingPatient, 'id'>): Observable<string> {
    const newPatient: Omit<PendingPatient, 'id'> = {
      name: patientData.name,
      cpf: patientData.cpf,
      arrivalTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      entryDate: new Date().toISOString().split('T')[0],
      status: 'waiting'
    };
    
    return from(this.firebaseService.addPatientToQueue(newPatient));
  }

  updatePendingPatient(id: string, patientData: Partial<PendingPatient>): Observable<void> {
    return from(this.firebaseService.updatePatient(id, patientData));
  }

  removePendingPatient(id: string): Observable<void> {
    return from(this.firebaseService.removePatientFromQueue(id));
  }

  updatePatientStatus(id: string, status: 'waiting' | 'in-triage' | 'triaged'): Observable<void> {
    return from(this.firebaseService.updatePatientStatus(id, status));
  }

  getPatientsByStatus(status: 'waiting' | 'in-triage' | 'triaged'): Observable<PendingPatient[]> {
    return from(this.firebaseService.getPatientsByStatus(status));
  }
}