import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/_services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { email } = this.forgotPasswordForm.value;

    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Un email de réinitialisation a été envoyé à votre adresse.';
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err;
      }
    });
  }

  get f() { return this.forgotPasswordForm.controls; }
}