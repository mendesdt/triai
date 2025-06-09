import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { PendingPatient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class ReceptionService {
  private pendingPatients: PendingPatient[] = [
    {
      id: 1,
      name: 'Carlos Eduardo Santos',
      cpf: '123.456.789-01',
      arrivalTime: '08:30',
      entryDate: '2024-11-25',
      status: 'waiting'
    },
    {
      id: 2,
      name: 'Fernanda Silva Costa',
      cpf: '987.654.321-09',
      arrivalTime: '08:45',
      entryDate: '2024-11-25',
      status: 'waiting'
    },
    {
      id: 3,
      name: 'Roberto Oliveira Lima',
      cpf: '456.789.123-45',
      arrivalTime: '09:00',
      entryDate: '2024-11-25',
      status: 'in-triage'
    }
  ];

  constructor() {}

  getPendingPatients(): Observable<PendingPatient[]> {
    return of(this.pendingPatients).pipe(delay(500));
  }

  addPendingPatient(patientData: Partial<PendingPatient>): Observable<PendingPatient> {
    const newPatient: PendingPatient = {
      id: this.pendingPatients.length + 1,
      name: patientData.name || '',
      cpf: patientData.cpf || '',
      arrivalTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      entryDate: new Date().toISOString().split('T')[0],
      status: 'waiting'
    };
    
    this.pendingPatients.push(newPatient);
    return of(newPatient).pipe(delay(500));
  }

  updatePendingPatient(id: number, patientData: Partial<PendingPatient>): Observable<PendingPatient> {
    const index = this.pendingPatients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.pendingPatients[index] = { ...this.pendingPatients[index], ...patientData };
      return of(this.pendingPatients[index]).pipe(delay(500));
    }
    throw new Error('Patient not found');
  }

  removePendingPatient(id: number): Observable<boolean> {
    const index = this.pendingPatients.findIndex(p => p.id === id);
    if (index !== -1) {
      this.pendingPatients.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }

  updatePatientStatus(id: number, status: 'waiting' | 'in-triage'): Observable<boolean> {
    const patient = this.pendingPatients.find(p => p.id === id);
    if (patient) {
      patient.status = status;
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }
}