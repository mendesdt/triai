import { Injectable } from '@angular/core';
import { Observable, from, BehaviorSubject } from 'rxjs';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { FirebasePatient, CreatePatientData, UpdatePatientData } from '../models/firebase-patient.model';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebasePatientService {
  private patientsSubject = new BehaviorSubject<FirebasePatient[]>([]);
  public patients$ = this.patientsSubject.asObservable();

  private readonly COLLECTION_NAME = 'patients';

  constructor() {
    this.loadPatients();
  }

  private loadPatients(): void {
    this.getPatients().subscribe({
      next: (patients) => {
        this.patientsSubject.next(patients);
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });
  }

  getPatients(): Observable<FirebasePatient[]> {
    const patientsRef = collection(db, this.COLLECTION_NAME);
    const q = query(
      patientsRef, 
      where('status', 'in', ['waiting', 'in-triage']),
      orderBy('position', 'asc')
    );

    return from(getDocs(q)).pipe(
      map((querySnapshot) => {
        const patients: FirebasePatient[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          patients.push({
            id: doc.id,
            name: data['name'],
            cpf: data['cpf'],
            position: data['position'],
            status: data['status'],
            arrivalTime: data['arrivalTime'],
            entryDate: data['entryDate'],
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          });
        });
        return patients;
      }),
      catchError((error) => {
        console.error('Error fetching patients:', error);
        throw error;
      })
    );
  }

  addPatient(patientData: CreatePatientData): Observable<FirebasePatient> {
    const currentPatients = this.patientsSubject.value;
    const nextPosition = currentPatients.length > 0 
      ? Math.max(...currentPatients.map(p => p.position)) + 1 
      : 1;

    const now = new Date();
    const newPatient = {
      name: patientData.name,
      cpf: patientData.cpf,
      position: nextPosition,
      status: 'waiting' as const,
      arrivalTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      entryDate: now.toISOString().split('T')[0],
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now)
    };

    const patientsRef = collection(db, this.COLLECTION_NAME);
    
    return from(addDoc(patientsRef, newPatient)).pipe(
      map((docRef) => {
        const patient: FirebasePatient = {
          id: docRef.id,
          ...newPatient,
          createdAt: now,
          updatedAt: now
        };
        
        // Update local state
        const updatedPatients = [...currentPatients, patient];
        this.patientsSubject.next(updatedPatients);
        
        return patient;
      }),
      catchError((error) => {
        console.error('Error adding patient:', error);
        throw error;
      })
    );
  }

  updatePatient(patientId: string, updateData: UpdatePatientData): Observable<void> {
    const patientRef = doc(db, this.COLLECTION_NAME, patientId);
    const updatePayload = {
      ...updateData,
      updatedAt: Timestamp.fromDate(new Date())
    };

    return from(updateDoc(patientRef, updatePayload)).pipe(
      map(() => {
        // Update local state
        const currentPatients = this.patientsSubject.value;
        const updatedPatients = currentPatients.map(patient => 
          patient.id === patientId 
            ? { ...patient, ...updateData, updatedAt: new Date() }
            : patient
        );
        this.patientsSubject.next(updatedPatients);
      }),
      catchError((error) => {
        console.error('Error updating patient:', error);
        throw error;
      })
    );
  }

  deletePatient(patientId: string): Observable<void> {
    const patientRef = doc(db, this.COLLECTION_NAME, patientId);
    
    return from(deleteDoc(patientRef)).pipe(
      map(() => {
        // Update local state
        const currentPatients = this.patientsSubject.value;
        const updatedPatients = currentPatients.filter(patient => patient.id !== patientId);
        
        // Reorder positions
        const reorderedPatients = updatedPatients.map((patient, index) => ({
          ...patient,
          position: index + 1
        }));
        
        this.patientsSubject.next(reorderedPatients);
        
        // Update positions in Firestore
        this.updatePositions(reorderedPatients);
      }),
      catchError((error) => {
        console.error('Error deleting patient:', error);
        throw error;
      })
    );
  }

  private updatePositions(patients: FirebasePatient[]): void {
    patients.forEach((patient, index) => {
      if (patient.id && patient.position !== index + 1) {
        this.updatePatient(patient.id, { position: index + 1 }).subscribe();
      }
    });
  }

  refreshPatients(): void {
    this.loadPatients();
  }
}