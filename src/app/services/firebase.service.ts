import { Injectable } from '@angular/core';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.config';
import { PendingPatient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly COLLECTION_NAME = 'pacientesNaFila';

  constructor() {}

  // Add patient to queue
  async addPatientToQueue(patient: Omit<PendingPatient, 'id'>): Promise<string> {
    try {
      const patientData = {
        ...patient,
        createdAt: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), patientData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding patient to queue:', error);
      throw error;
    }
  }

  // Get all patients in queue
  async getPatientsInQueue(): Promise<PendingPatient[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const patients: PendingPatient[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({
          id: doc.id,
          name: data['name'],
          cpf: data['cpf'],
          arrivalTime: data['arrivalTime'],
          entryDate: data['entryDate'],
          status: data['status'],
          createdAt: data['createdAt']?.toDate()
        });
      });
      
      return patients;
    } catch (error) {
      console.error('Error getting patients from queue:', error);
      throw error;
    }
  }

  // Update patient status
  async updatePatientStatus(patientId: string, status: 'waiting' | 'in-triage' | 'triaged'): Promise<void> {
    try {
      const patientRef = doc(db, this.COLLECTION_NAME, patientId);
      await updateDoc(patientRef, { status });
    } catch (error) {
      console.error('Error updating patient status:', error);
      throw error;
    }
  }

  // Update patient data
  async updatePatient(patientId: string, patientData: Partial<PendingPatient>): Promise<void> {
    try {
      const patientRef = doc(db, this.COLLECTION_NAME, patientId);
      await updateDoc(patientRef, patientData);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }

  // Remove patient from queue
  async removePatientFromQueue(patientId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, patientId));
    } catch (error) {
      console.error('Error removing patient from queue:', error);
      throw error;
    }
  }

  // Get patients by status
  async getPatientsByStatus(status: 'waiting' | 'in-triage' | 'triaged'): Promise<PendingPatient[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('status', '==', status),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const patients: PendingPatient[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        patients.push({
          id: doc.id,
          name: data['name'],
          cpf: data['cpf'],
          arrivalTime: data['arrivalTime'],
          entryDate: data['entryDate'],
          status: data['status'],
          createdAt: data['createdAt']?.toDate()
        });
      });
      
      return patients;
    } catch (error) {
      console.error('Error getting patients by status:', error);
      throw error;
    }
  }
}