import { Routes } from '@angular/router';
import { FirebaseLoginComponent } from './auth/login/firebase-login.component';
import { TriagePendingComponent } from './nurse/triage-pending/triage-pending.component';
import { TriageListComponent } from './nurse/triage-list/triage-list.component';
import { TriageFormComponent } from './nurse/triage-form/triage-form.component';
import { PatientListComponent } from './doctor/patient-list/patient-list.component';
import { PatientSummaryComponent } from './doctor/patient-summary/patient-summary.component';
import { PatientHistoryComponent } from './patient/patient-history/patient-history.component';
import { PatientAnalysisComponent } from './patient/patient-analysis/patient-analysis.component';
import { CompletedPatientsComponent } from './doctor/completed-patients/completed-patients.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { FirebasePatientQueueComponent } from './reception/patient-queue/firebase-patient-queue.component';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { FirebaseRoleGuard } from './auth/firebase-role.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: FirebaseLoginComponent },
  
  // Nurse routes
  { 
    path: 'triage-pending', 
    component: TriagePendingComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['enfermeiro'] }
  },
  { 
    path: 'triage-completed', 
    component: TriageListComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['enfermeiro'] }
  },
  { 
    path: 'triage/new', 
    component: TriageFormComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['enfermeiro'] }
  },
  { 
    path: 'triage/edit/:id', 
    component: TriageFormComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['enfermeiro'] }
  },
  
  // Doctor routes
  { 
    path: 'patients', 
    component: PatientListComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['medico'] }
  },
  { 
    path: 'completed-patients', 
    component: CompletedPatientsComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['medico'] }
  },
  { 
    path: 'patient/:id', 
    component: PatientSummaryComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['medico'] }
  },
  
  // Patient routes (accessible by doctors and nurses)
  { 
    path: 'patient/:id/history', 
    component: PatientHistoryComponent, 
    canActivate: [FirebaseAuthGuard]
  },
  { 
    path: 'patient/:id/analysis', 
    component: PatientAnalysisComponent, 
    canActivate: [FirebaseAuthGuard]
  },
  
  // Admin routes
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['admin'] }
  },
  
  // Reception routes - Updated to use Firebase component
  { 
    path: 'reception/queue', 
    component: FirebasePatientQueueComponent, 
    canActivate: [FirebaseAuthGuard, FirebaseRoleGuard],
    data: { roles: ['recepcao'] }
  },
  
  // Legacy routes for backward compatibility
  { 
    path: 'triage', 
    redirectTo: '/triage-completed', 
    pathMatch: 'full' 
  },
  
  { path: '**', redirectTo: '/login' }
];