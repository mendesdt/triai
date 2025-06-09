import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-triage-list',
  templateUrl: './triage-list.component.html',
  styleUrls: ['./triage-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TriageListComponent implements OnInit {
  triages: Patient[] = [];
  filteredTriages: Patient[] = [];
  loading = true;
  searchTerm = '';
  selectedPriority = 'all';
  
  priorityOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'Alta', label: 'Alta' },
    { value: 'Média', label: 'Média' },
    { value: 'Baixa', label: 'Baixa' },
    { value: 'Não triado', label: 'Não triado' }
  ];
  
  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTriages();
  }

  loadTriages(): void {
    this.loading = true;
    this.patientService.getTriages()
      .subscribe({
        next: (data) => {
          this.triages = data;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching triages:', error);
          this.loading = false;
        }
      });
  }

  applyFilters(): void {
    let result = this.triages;
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(triage => 
        triage.name.toLowerCase().includes(term) ||
        triage.cpf.includes(term)
      );
    }
    
    // Apply priority filter
    if (this.selectedPriority !== 'all') {
      result = result.filter(triage => 
        triage.priority === this.selectedPriority
      );
    }
    
    this.filteredTriages = result;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onPriorityChange(): void {
    this.applyFilters();
  }
  
  newTriage(): void {
    this.router.navigate(['/triage/new']);
  }

  editTriage(id: number): void {
    this.router.navigate(['/triage/edit', id]);
  }

  deleteTriage(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta triagem?')) {
      this.patientService.deleteTriage(id)
        .subscribe({
          next: () => {
            this.loadTriages();
          },
          error: (error) => {
            console.error('Error deleting triage:', error);
          }
        });
    }
  }
  
  refreshList(): void {
    this.loadTriages();
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'Alta':
        return 'badge-high';
      case 'Média':
        return 'badge-medium';
      case 'Baixa':
        return 'badge-low';
      default:
        return 'badge-neutral';
    }
  }
}