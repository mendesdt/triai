import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PendingPatient } from '../../models/patient.model';
import { ReceptionService } from '../../services/reception.service';

@Component({
  selector: 'app-triage-pending',
  templateUrl: './triage-pending.component.html',
  styleUrls: ['./triage-pending.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TriagePendingComponent implements OnInit {
  pendingPatients: PendingPatient[] = [];
  filteredPatients: PendingPatient[] = [];
  loading = true;
  searchTerm = '';
  
  constructor(
    private receptionService: ReceptionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPendingPatients();
  }

  loadPendingPatients(): void {
    this.loading = true;
    // Get only patients that are waiting (not in triage or already triaged)
    this.receptionService.getPatientsByStatus('waiting')
      .subscribe({
        next: (data) => {
          this.pendingPatients = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching pending patients:', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let result = this.pendingPatients;
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(patient => 
        patient.name.toLowerCase().includes(term) ||
        patient.cpf.includes(term)
      );
    }
    
    this.filteredPatients = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  startTriage(patient: PendingPatient): void {
    // Update patient status to in-triage
    this.receptionService.updatePatientStatus(patient.id!, 'in-triage')
      .subscribe({
        next: () => {
          // Navigate to triage form with patient data
          this.router.navigate(['/triage/new'], { 
            queryParams: { 
              pendingId: patient.id,
              name: patient.name,
              cpf: patient.cpf,
              arrivalTime: patient.arrivalTime
            }
          });
        },
        error: (error) => {
          console.error('Error updating patient status:', error);
          alert('Erro ao iniciar triagem');
        }
      });
  }

  refreshList(): void {
    this.loadPendingPatients();
  }

  getWaitTime(arrivalTime: string): string {
    const now = new Date();
    const arrival = new Date();
    const [hours, minutes] = arrivalTime.split(':');
    arrival.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const diffMs = now.getTime() - arrival.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} min`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}min`;
    }
  }
}