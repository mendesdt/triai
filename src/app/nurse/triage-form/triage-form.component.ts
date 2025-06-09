import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService } from '../../services/patient.service';
import { ReceptionService } from '../../services/reception.service';

@Component({
  selector: 'app-triage-form',
  templateUrl: './triage-form.component.html',
  styleUrls: ['./triage-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class TriageFormComponent implements OnInit {
  triageForm!: FormGroup;
  submitted = false;
  loading = false;
  success = false;
  isEditMode = false;
  triageId: number | null = null;
  pendingPatientId: string | null = null;
  public noAllergiesChecked = false;
  
  symptoms = [
    { id: 'fever', name: 'Febre' },
    { id: 'headache', name: 'Dor de cabeça' },
    { id: 'cough', name: 'Tosse' },
    { id: 'shortness', name: 'Falta de ar' },
    { id: 'muscle-pain', name: 'Dor muscular' },
    { id: 'nausea', name: 'Náusea/Vômito' },
    { id: 'sore-throat', name: 'Dor de garganta' },
    { id: 'runny-nose', name: 'Coriza' },
    { id: 'abdominal-pain', name: 'Dor abdominal' },
    { id: 'dizziness', name: 'Tontura' }
  ];
  
  intensityOptions = [
    { value: 'Leve', label: 'Leve' },
    { value: 'Moderada', label: 'Moderada' },
    { value: 'Alta', label: 'Alta' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private receptionService: ReceptionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkRouteParams();
  }

  initializeForm(): void {
    this.triageForm = this.formBuilder.group({
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      name: ['', Validators.required],
      birthDate: ['', Validators.required],
      motherName: [''],
      consultReason: ['', Validators.required],
      symptoms: this.formBuilder.array([]),
      otherSymptoms: [''],
      duration: ['', Validators.required],
      intensity: ['Leve', Validators.required],
      medications: [''],
      allergies: [''],
      // Vital Signs
      heartRate: [''],
      respiratoryRate: [''],
      temperature: [''],
      bloodPressureSystolic: [''],
      bloodPressureDiastolic: [''],
      oxygenSaturation: ['']
    });
  }

  checkRouteParams(): void {
    // Check for edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.triageId = +params['id'];
        this.loadTriageData();
      }
    });

    // Check for pending patient data
    this.route.queryParams.subscribe(params => {
      if (params['pendingId']) {
        this.pendingPatientId = params['pendingId'];
        this.triageForm.patchValue({
          name: params['name'] || '',
          cpf: params['cpf'] || ''
        });
      }
    });
  }

  loadTriageData(): void {
    if (this.triageId) {
      this.patientService.getTriageById(this.triageId)
        .subscribe({
          next: (triage) => {
            if (triage) {
              this.triageForm.patchValue({
                cpf: triage.cpf,
                name: triage.name,
                birthDate: triage.birthDate,
                motherName: triage.motherName,
                consultReason: triage.consultReason,
                otherSymptoms: triage.otherSymptoms,
                duration: triage.duration,
                intensity: triage.intensity,
                medications: triage.medications,
                allergies: triage.allergies,
                heartRate: triage.vitalSigns?.heartRate,
                respiratoryRate: triage.vitalSigns?.respiratoryRate,
                temperature: triage.vitalSigns?.temperature,
                bloodPressureSystolic: triage.vitalSigns?.bloodPressureSystolic,
                bloodPressureDiastolic: triage.vitalSigns?.bloodPressureDiastolic,
                oxygenSaturation: triage.vitalSigns?.oxygenSaturation
              });
              
              // Set symptoms checkboxes
              this.triageForm.get('symptoms')?.setValue(triage.symptoms);
              
              // Update checkboxes in the UI
              setTimeout(() => {
                triage.symptoms.forEach(symptom => {
                  const checkbox = document.querySelector(`input[value="${symptom}"]`) as HTMLInputElement;
                  if (checkbox) {
                    checkbox.checked = true;
                  }
                });
              });
            }
          },
          error: (error) => {
            console.error('Error loading triage:', error);
          }
        });
    }
  }

  get f() { return this.triageForm.controls; }

  onCheckboxChange(event: any): void {
    const symptomsArray = this.triageForm.get('symptoms')?.value || [];
    
    if (event.target.checked) {
      symptomsArray.push(event.target.value);
    } else {
      const index = symptomsArray.indexOf(event.target.value);
      if (index !== -1) {
        symptomsArray.splice(index, 1);
      }
    }
    
    this.triageForm.get('symptoms')?.setValue(symptomsArray);
  }

  public onNoAllergiesChange(event: any): void {
    this.noAllergiesChecked = event.target.checked;
    if (this.noAllergiesChecked) {
      this.triageForm.get('allergies')?.setValue('Nenhuma Alergia Conhecida');
    } else {
      this.triageForm.get('allergies')?.setValue('');
    }
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.triageForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    const formValues = this.triageForm.value;
    
    const triageData = {
      cpf: formValues.cpf,
      name: formValues.name,
      birthDate: formValues.birthDate,
      motherName: formValues.motherName,
      consultReason: formValues.consultReason,
      symptoms: formValues.symptoms,
      otherSymptoms: formValues.otherSymptoms,
      duration: formValues.duration,
      intensity: formValues.intensity,
      medications: formValues.medications,
      allergies: formValues.allergies,
      vitalSigns: {
        heartRate: formValues.heartRate ? +formValues.heartRate : undefined,
        respiratoryRate: formValues.respiratoryRate ? +formValues.respiratoryRate : undefined,
        temperature: formValues.temperature ? +formValues.temperature : undefined,
        bloodPressureSystolic: formValues.bloodPressureSystolic ? +formValues.bloodPressureSystolic : undefined,
        bloodPressureDiastolic: formValues.bloodPressureDiastolic ? +formValues.bloodPressureDiastolic : undefined,
        oxygenSaturation: formValues.oxygenSaturation ? +formValues.oxygenSaturation : undefined
      }
    };
    
    const operation = this.isEditMode 
      ? this.patientService.updateTriage(this.triageId!, triageData)
      : this.patientService.registerTriage(triageData);
    
    operation.subscribe({
      next: () => {
        // If this was from a pending patient, remove from pending list
        if (this.pendingPatientId) {
          this.receptionService.removePendingPatient(this.pendingPatientId)
            .subscribe({
              next: () => {
                this.completeTriageProcess();
              },
              error: (error) => {
                console.error('Error removing pending patient:', error);
                this.completeTriageProcess();
              }
            });
        } else {
          this.completeTriageProcess();
        }
      },
      error: (error) => {
        console.error('Error saving triage:', error);
        this.loading = false;
      }
    });
  }

  completeTriageProcess(): void {
    this.loading = false;
    this.success = true;
    setTimeout(() => {
      this.router.navigate(['/triage-completed']);
    }, 1500);
  }

  cancel(): void {
    if (this.pendingPatientId) {
      // Reset patient status back to waiting
      this.receptionService.updatePatientStatus(this.pendingPatientId, 'waiting')
        .subscribe({
          next: () => {
            this.router.navigate(['/triage-pending']);
          },
          error: (error) => {
            console.error('Error updating patient status:', error);
            this.router.navigate(['/triage-pending']);
          }
        });
    } else {
      this.router.navigate(['/triage-completed']);
    }
  }
}