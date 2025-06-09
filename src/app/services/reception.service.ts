import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { PendingPatient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class ReceptionService {
  private collectionName = 'pending-patients';

  constructor() {}

  getPendingPatients(): Observable<PendingPatient[]> {
    const q = query(
      collection(db, this.collectionName), 
      orderBy('createdAt', 'asc')
    );
    
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        const patients: PendingPatient[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          patients.push({
            id: doc.id,
            name: data['name'],
            cpf: data['cpf'],
            birthDate: data['birthDate'],
            arrivalTime: data['arrivalTime'],
            entryDate: data['entryDate'],
            status: data['status'] || 'waiting'
          } as PendingPatient);
        });
        return patients;
      }),
      catchError(error => {
        console.error('Erro ao buscar pacientes:', error);
        return of([]);
      })
    );
  }

  addPendingPatient(patientData: Partial<PendingPatient>): Observable<PendingPatient> {
    const now = new Date();
    const newPatient = {
      name: patientData.name || '',
      cpf: patientData.cpf || '',
      birthDate: patientData.birthDate || '',
      arrivalTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      entryDate: now.toISOString().split('T')[0],
      status: 'waiting',
      createdAt: Timestamp.fromDate(now)
    };

    return from(addDoc(collection(db, this.collectionName), newPatient)).pipe(
      map(docRef => ({
        id: docRef.id,
        name: newPatient.name,
        cpf: newPatient.cpf,
        birthDate: newPatient.birthDate,
        arrivalTime: newPatient.arrivalTime,
        entryDate: newPatient.entryDate,
        status: newPatient.status
      } as PendingPatient)),
      catchError(error => {
        console.error('Erro ao adicionar paciente:', error);
        throw error;
      })
    );
  }

  updatePendingPatient(id: string, patientData: Partial<PendingPatient>): Observable<PendingPatient> {
    const patientRef = doc(db, this.collectionName, id);
    
    return from(updateDoc(patientRef, {
      name: patientData.name,
      cpf: patientData.cpf,
      birthDate: patientData.birthDate,
      updatedAt: Timestamp.fromDate(new Date())
    })).pipe(
      map(() => ({
        id,
        name: patientData.name || '',
        cpf: patientData.cpf || '',
        birthDate: patientData.birthDate || '',
        arrivalTime: patientData.arrivalTime || '',
        entryDate: patientData.entryDate || '',
        status: patientData.status || 'waiting'
      } as PendingPatient)),
      catchError(error => {
        console.error('Erro ao atualizar paciente:', error);
        throw error;
      })
    );
  }

  removePendingPatient(id: string): Observable<boolean> {
    const patientRef = doc(db, this.collectionName, id);
    
    return from(deleteDoc(patientRef)).pipe(
      map(() => true),
      catchError(error => {
        console.error('Erro ao remover paciente:', error);
        return of(false);
      })
    );
  }

  updatePatientStatus(id: string, status: 'waiting' | 'in-triage'): Observable<boolean> {
    const patientRef = doc(db, this.collectionName, id);
    
    return from(updateDoc(patientRef, {
      status,
      updatedAt: Timestamp.fromDate(new Date())
    })).pipe(
      map(() => true),
      catchError(error => {
        console.error('Erro ao atualizar status do paciente:', error);
        return of(false);
      })
    );
  }
}