import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-firebase-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <div class="logo-icon">
              <span class="material-icons">medical_services</span>
            </div>
          </div>
          <h1 class="login-title">Painel Profissional Saúde</h1>
          <p class="login-subtitle">Acesso seguro ao sistema</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email">
              <span class="material-icons">alternate_email</span>
              E-mail
            </label>
            <input 
              type="email" 
              formControlName="email" 
              class="form-control" 
              [ngClass]="{ 'is-invalid': submitted && f['email'].errors }"
              placeholder="Digite seu e-mail" 
            />
            <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
              <div *ngIf="f['email'].errors['required']">E-mail é obrigatório</div>
              <div *ngIf="f['email'].errors['email']">E-mail deve ter um formato válido</div>
            </div>
          </div>

          <div class="form-group">
            <label for="password">
              <span class="material-icons">lock</span>
              Senha
            </label>
            <div class="password-input">
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                formControlName="password" 
                class="form-control" 
                [ngClass]="{ 'is-invalid': submitted && f['password'].errors }"
                placeholder="Digite sua senha" 
              />
              <button type="button" class="password-toggle" (click)="togglePasswordVisibility()">
                <span class="material-icons">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
              <div *ngIf="f['password'].errors['required']">Senha é obrigatória</div>
              <div *ngIf="f['password'].errors['minlength']">Senha deve ter no mínimo 6 caracteres</div>
            </div>
          </div>

          <div class="demo-credentials">
            <h4>Credenciais de Demonstração:</h4>
            <div class="credential-item">
              <strong>Recepção:</strong> recepcao@example.com / 123456
            </div>
            <div class="credential-item">
              <strong>Enfermeiro:</strong> enfermeiro@example.com / 123456
            </div>
            <div class="credential-item">
              <strong>Médico:</strong> medico@example.com / 123456
            </div>
            <div class="credential-item">
              <strong>Admin:</strong> admin@example.com / 123456
            </div>
          </div>

          <div class="form-group">
            <button [disabled]="loading" class="btn-login">
              <span *ngIf="loading" class="spinner"></span>
              <span *ngIf="!loading" class="material-icons">login</span>
              Entrar
            </button>
          </div>

          <div *ngIf="error" class="error-message">
            {{ error }}
          </div>
        </form>

        <div class="login-footer">
          <p>Acesso restrito a profissionais autorizados</p>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../login/login.component.css']
})
export class FirebaseLoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: FirebaseAuthService
  ) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole();
    }
  }

  get f() { return this.loginForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: () => {
          this.redirectBasedOnRole();
        },
        error: (err) => {
          this.error = err.message || 'Erro ao fazer login';
          this.loading = false;
        }
      });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private redirectBasedOnRole(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      // Redirect based on role
      if (this.authService.currentUser?.role === 'medico') {
        this.router.navigate(['/patients']);
      } else if (this.authService.currentUser?.role === 'enfermeiro') {
        this.router.navigate(['/triage-pending']);
      } else if (this.authService.currentUser?.role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (this.authService.currentUser?.role === 'recepcao') {
        this.router.navigate(['/reception/queue']);
      }
    }
  }
}