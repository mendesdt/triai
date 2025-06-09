import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PendingPatient } from '../models/patient.model';
import { SupabaseService } from './supabase.service';

export interface NewPatientInput {
  name: string;
  cpf: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReceptionService {
  constructor(private supabase: SupabaseService) {}

  getPendingPatients(): Observable<PendingPatient[]> {
    return from(
      this.supabase.select('pending_patients', '*')
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error fetching pending patients:', error);
        throw error;
      })
    );
  }

  addPendingPatient(patientData: NewPatientInput): Observable<any> {
    const newPatient = {
      name: patientData.name,
      cpf: patientData.cpf,
      arrival_time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      entry_date: new Date().toISOString().split('T')[0],
      status: 'waiting',
      created_at: new Date().toISOString()
    };
    
    return from(
      this.supabase.insert('pending_patients', newPatient)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      catchError(error => {
        console.error('Error adding patient:', error);
        throw error;
      })
    );
  }

  updatePendingPatient(id: string, patientData: Partial<PendingPatient>): Observable<any> {
    return from(
      this.supabase.update('pending_patients', id, patientData)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      catchError(error => {
        console.error('Error updating patient:', error);
        throw error;
      })
    );
  }

  removePendingPatient(id: string): Observable<any> {
    return from(
      this.supabase.delete('pending_patients', id)
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      catchError(error => {
        console.error('Error removing patient:', error);
        throw error;
      })
    );
  }

  updatePatientStatus(id: string, status: 'waiting' | 'in-triage' | 'triaged'): Observable<any> {
    return from(
      this.supabase.update('pending_patients', id, { status })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data;
      }),
      catchError(error => {
        console.error('Error updating patient status:', error);
        throw error;
      })
    );
  }

  getPatientsByStatus(status: 'waiting' | 'in-triage' | 'triaged'): Observable<PendingPatient[]> {
    return from(
      this.supabase.select('pending_patients', '*', { status })
    ).pipe(
      map(response => {
        if (response.error) throw response.error;
        return response.data || [];
      }),
      catchError(error => {
        console.error('Error fetching patients by status:', error);
        throw error;
      })
    );
  }
}