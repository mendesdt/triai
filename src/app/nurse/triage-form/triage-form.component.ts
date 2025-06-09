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
  triageId: string | null = null;
  pendingPatientId: string | null = null;
  public noAllergiesChecked = false;
  selectedSymptoms: string[] = [];
  
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

  priorityOptions = [
    { value: 'Baixa', label: 'Baixa' },
    { value: 'Média', label: 'Média' },
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
    // Pré-popular com data de nascimento padrão (hoje menos 30 anos)
    const defaultBirthDate = new Date();
    defaultBirthDate.setFullYear(defaultBirthDate.getFullYear() - 30);
    const defaultBirthDateString = defaultBirthDate.toISOString().split('T')[0];

    this.triageForm = this.formBuilder.group({
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      name: ['', Validators.required],
      birthDate: [defaultBirthDateString, Validators.required],
      motherName: [''],
      consultReason: ['', Validators.required],
      otherSymptoms: [''],
      duration: ['', Validators.required],
      intensity: ['Leve', Validators.required],
      priority: ['Baixa', Validators.required],
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

  applyCpfMask(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    this.triageForm.patchValue({ cpf: value });
  }

  checkRouteParams(): void {
    // Check for edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.triageId = params['id'];
        this.loadTriageData();
      }
    });

    // Check for pending patient data
    this.route.queryParams.subscribe(params => {
      if (params['pendingId']) {
        this.pendingPatientId = params['pendingId'];
        this.triageForm.patchValue({
          name: params['name'] || '',
          cpf: params['cpf'] || '',
          birthDate: params['birthDate'] || this.triageForm.get('birthDate')?.value
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
                priority: triage.priority,
                medications: triage.medications,
                allergies: triage.allergies,
                heartRate: triage.vitalSigns?.heartRate,
                respiratoryRate: triage.vitalSigns?.respiratoryRate,
                temperature: triage.vitalSigns?.temperature,
                bloodPressureSystolic: triage.vitalSigns?.bloodPressureSystolic,
                bloodPressureDiastolic: triage.vitalSigns?.bloodPressureDiastolic,
                oxygenSaturation: triage.vitalSigns?.oxygenSaturation
              });
              
              // Set symptoms
              this.selectedSymptoms = triage.symptoms || [];
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
    if (event.target.checked) {
      this.selectedSymptoms.push(event.target.value);
    } else {
      const index = this.selectedSymptoms.indexOf(event.target.value);
      if (index !== -1) {
        this.selectedSymptoms.splice(index, 1);
      }
    }
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
      symptoms: this.selectedSymptoms,
      otherSymptoms: formValues.otherSymptoms,
      duration: formValues.duration,
      intensity: formValues.intensity,
      priority: formValues.priority,
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
      next: (result) => {
        console.log('Triagem salva com sucesso:', result);
        
        // Chamar API externa aqui se necessário
        this.callExternalAPI(result);
        
        // If this was from a pending patient, remove from pending list ONLY after successful triage registration
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
        alert('Erro ao salvar triagem. Tente novamente.');
      }
    });
  }

  // Método para chamar API externa
  private callExternalAPI(triageData: any): void {
    // Aqui você pode chamar sua API externa
    console.log('Dados da triagem para API externa:', triageData);
    
    // Exemplo de como seria a chamada:
    // this.http.post('https://sua-api.com/triages', triageData).subscribe({
    //   next: (response) => console.log('API externa chamada com sucesso:', response),
    //   error: (error) => console.error('Erro ao chamar API externa:', error)
    // });
  }

  completeTriageProcess(): void {
    this.loading = false;
    this.success = true;
    setTimeout(() => {
      this.router.navigate(['/triage-completed']);
    }, 1500);
  }

  cancel(): void {
    // Se veio de um paciente pendente, NÃO remove da lista, apenas volta o status para 'waiting'
    if (this.pendingPatientId) {
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