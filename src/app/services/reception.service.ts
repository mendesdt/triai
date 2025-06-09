import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PendingPatient } from '../models/patient.model';
import { SupabaseService, SupabasePendingPatientRaw } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class ReceptionService {

  constructor(private supabaseService: SupabaseService) {}

  getPendingPatients(): Observable<PendingPatient[]> {
    return from(this.supabaseService.getPatientsQueue()).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error fetching patients:', error);
          throw error;
        }
        
        return (data || []).map((patient: SupabasePendingPatientRaw) => ({
          id: parseInt(patient.id.substring(0, 8), 16), // Convert UUID to number for compatibility
          name: patient.name,
          cpf: patient.cpf,
          arrivalTime: patient.arrival_time,
          entryDate: patient.entry_date,
          status: patient.status as 'waiting' | 'in-triage'
        }));
      }),
      catchError(error => {
        console.error('Error in getPendingPatients:', error);
        throw error;
      })
    );
  }

  addPendingPatient(patientData: { name: string; cpf: string }): Observable<PendingPatient> {
    return from(this.supabaseService.addPatientToQueue(patientData)).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error adding patient:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error('No data returned from insert');
        }

        const patient = data[0];
        return {
          id: parseInt(patient.id.substring(0, 8), 16), // Convert UUID to number for compatibility
          name: patient.name,
          cpf: patient.cpf,
          arrivalTime: patient.arrival_time,
          entryDate: patient.entry_date,
          status: patient.status as 'waiting' | 'in-triage'
        };
      }),
      catchError(error => {
        console.error('Error in addPendingPatient:', error);
        throw error;
      })
    );
  }

  updatePendingPatient(id: number, patientData: Partial<PendingPatient>): Observable<PendingPatient> {
    const updateData: any = {};
    if (patientData.name) updateData.name = patientData.name;
    if (patientData.cpf) updateData.cpf = patientData.cpf;

    return from(this.supabaseService.updatePatientInQueue(id.toString(), updateData)).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('Error updating patient:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error('No data returned from update');
        }

        const patient = data[0];
        return {
          id: parseInt(patient.id.substring(0, 8), 16), // Convert UUID to number for compatibility
          name: patient.name,
          cpf: patient.cpf,
          arrivalTime: patient.arrival_time,
          entryDate: patient.entry_date,
          status: patient.status as 'waiting' | 'in-triage'
        };
      }),
      catchError(error => {
        console.error('Error in updatePendingPatient:', error);
        throw error;
      })
    );
  }

  removePendingPatient(id: number): Observable<boolean> {
    return from(this.supabaseService.removePatientFromQueue(id.toString())).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error removing patient:', error);
          throw error;
        }
        return true;
      }),
      catchError(error => {
        console.error('Error in removePendingPatient:', error);
        throw error;
      })
    );
  }

  updatePatientStatus(id: number, status: 'waiting' | 'in-triage'): Observable<boolean> {
    return from(this.supabaseService.updatePatientStatus(id.toString(), status)).pipe(
      map(({ error }) => {
        if (error) {
          console.error('Error updating patient status:', error);
          throw error;
        }
        return true;
      }),
      catchError(error => {
        console.error('Error in updatePatientStatus:', error);
        throw error;
      })
    );
  }
}