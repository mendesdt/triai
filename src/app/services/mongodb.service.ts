import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PendingPatient } from '../models/patient.model';
import { mongoConfig } from '../config/mongodb.config';

@Injectable({
  providedIn: 'root'
})
export class MongoDBService {
  private apiUrl = 'http://localhost:3000/api'; // Backend API URL

  constructor() {}

  // Add patient to queue
  addPatientToQueue(patient: Omit<PendingPatient, 'id'>): Observable<any> {
    const patientData = {
      ...patient,
      createdAt: new Date(),
      status: 'waiting'
    };

    return from(
      fetch(`${this.apiUrl}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData)
      }).then(response => {
        if (!response.ok) {
          throw new Error('Failed to add patient');
        }
        return response.json();
      })
    ).pipe(
      catchError(error => {
        console.error('Error adding patient to queue:', error);
        return throwError(() => error);
      })
    );
  }

  // Get all patients in queue
  getPatientsInQueue(): Observable<PendingPatient[]> {
    return from(
      fetch(`${this.apiUrl}/patients`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch patients');
          }
          return response.json();
        })
    ).pipe(
      catchError(error => {
        console.error('Error getting patients from queue:', error);
        return throwError(() => error);
      })
    );
  }

  // Update patient status
  updatePatientStatus(patientId: string, status: 'waiting' | 'in-triage' | 'triaged'): Observable<any> {
    return from(
      fetch(`${this.apiUrl}/patients/${patientId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      }).then(response => {
        if (!response.ok) {
          throw new Error('Failed to update patient status');
        }
        return response.json();
      })
    ).pipe(
      catchError(error => {
        console.error('Error updating patient status:', error);
        return throwError(() => error);
      })
    );
  }

  // Update patient data
  updatePatient(patientId: string, patientData: Partial<PendingPatient>): Observable<any> {
    return from(
      fetch(`${this.apiUrl}/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData)
      }).then(response => {
        if (!response.ok) {
          throw new Error('Failed to update patient');
        }
        return response.json();
      })
    ).pipe(
      catchError(error => {
        console.error('Error updating patient:', error);
        return throwError(() => error);
      })
    );
  }

  // Remove patient from queue
  removePatientFromQueue(patientId: string): Observable<any> {
    return from(
      fetch(`${this.apiUrl}/patients/${patientId}`, {
        method: 'DELETE'
      }).then(response => {
        if (!response.ok) {
          throw new Error('Failed to remove patient');
        }
        return response.json();
      })
    ).pipe(
      catchError(error => {
        console.error('Error removing patient from queue:', error);
        return throwError(() => error);
      })
    );
  }

  // Get patients by status
  getPatientsByStatus(status: 'waiting' | 'in-triage' | 'triaged'): Observable<PendingPatient[]> {
    return from(
      fetch(`${this.apiUrl}/patients?status=${status}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch patients by status');
          }
          return response.json();
        })
    ).pipe(
      catchError(error => {
        console.error('Error getting patients by status:', error);
        return throwError(() => error);
      })
    );
  }
}