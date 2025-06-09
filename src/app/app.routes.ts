import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { TriagePendingComponent } from './nurse/triage-pending/triage-pending.component';
import { TriageListComponent } from './nurse/triage-list/triage-list.component';
import { TriageFormComponent } from './nurse/triage-form/triage-form.component';
import { PatientListComponent } from './doctor/patient-list/patient-list.component';
import { PatientSummaryComponent } from './doctor/patient-summary/patient-summary.component';
import { PatientHistoryComponent } from './patient/patient-history/patient-history.component';
import { PatientAnalysisComponent } from './patient/patient-analysis/patient-analysis.component';
import { CompletedPatientsComponent } from './doctor/completed-patients/completed-patients.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { PatientQueueComponent } from './reception/patient-queue/patient-queue.component';
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // Nurse routes
  { 
    path: 'triage-pending', 
    component: TriagePendingComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['enfermeiro'] }
  },
  { 
    path: 'triage-completed', 
    component: TriageListComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['enfermeiro'] }
  },
  { 
    path: 'triage/new', 
    component: TriageFormComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['enfermeiro'] }
  },
  { 
    path: 'triage/edit/:id', 
    component: TriageFormComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['enfermeiro'] }
  },
  
  // Doctor routes
  { 
    path: 'patients', 
    component: PatientListComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['medico'] }
  },
  { 
    path: 'completed-patients', 
    component: CompletedPatientsComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['medico'] }
  },
  { 
    path: 'patient/:id', 
    component: PatientSummaryComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['medico'] }
  },
  
  // Patient routes (accessible by doctors and nurses)
  { 
    path: 'patient/:id/history', 
    component: PatientHistoryComponent, 
    canActivate: [AuthGuard]
  },
  { 
    path: 'patient/:id/analysis', 
    component: PatientAnalysisComponent, 
    canActivate: [AuthGuard]
  },
  
  // Admin routes
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  
  // Reception routes
  { 
    path: 'reception/queue', 
    component: PatientQueueComponent, 
    canActivate: [AuthGuard, RoleGuard],
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