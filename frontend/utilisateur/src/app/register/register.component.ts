import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  showPassword = false;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('[0-9]{8}')]],
      nomClub: ['', Validators.required],
      adresseClub: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    
    const formData = new FormData();
    formData.append('nom', this.registerForm.value.nom);
    formData.append('prenom', this.registerForm.value.prenom);
    formData.append('email', this.registerForm.value.email);
    formData.append('password', this.registerForm.value.password);
    formData.append('confirmPassword', this.registerForm.value.confirmPassword);
    formData.append('nomClub', this.registerForm.value.nomClub);
    formData.append('adresseClub', this.registerForm.value.adresseClub);
    formData.append('telephone', this.registerForm.value.telephone);

    if (this.selectedFile) {
      formData.append('documentJustificatif', this.selectedFile);
    }

    this.http.post('http://localhost:8080/api/auth/register', formData)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          alert(response.message || 'Inscription réussie! En attente de validation.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Erreur:', err);
          let errorMessage = 'Une erreur est survenue lors de l\'inscription';
          if (err.error?.error) {
            errorMessage = err.error.error;
          } else if (err.status === 400) {
            errorMessage = 'Données invalides. Veuillez vérifier les informations saisies.';
          }
          alert('Erreur: ' + errorMessage);
        }
      });
  }
}