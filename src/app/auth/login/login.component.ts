import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
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

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.login(this.f['email'].value, this.f['password'].value)
      .subscribe({
        next: () => {
          this.redirectBasedOnRole();
        },
        error: err => {
          this.error = 'Credenciais inválidas';
          this.loading = false;
        }
      });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private redirectBasedOnRole() {
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