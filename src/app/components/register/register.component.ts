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
  
  // Variables pour les messages d'alerte
  showAlert = false;
  alertMessage = '';
  alertType = ''; // 'success' ou 'error'

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
      adresseClub: ['', Validators.required],
      documentJustificatif: [null, Validators.required]
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
      this.registerForm.patchValue({
        documentJustificatif: this.selectedFile
      });
      this.registerForm.get('documentJustificatif')?.updateValueAndValidity();
    }
  }

  showAlertMessage(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    
    // Masquer l'alerte après 5 secondes
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  onSubmit(): void {
    if (this.registerForm.invalid || !this.selectedFile) {
      this.registerForm.markAllAsTouched();
      const errorMessage = !this.selectedFile 
        ? 'Veuillez télécharger un document justificatif' 
        : 'Veuillez remplir correctement tous les champs requis';
      this.showAlertMessage(errorMessage, 'error');
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
    formData.append('documentJustificatif', this.selectedFile);

    this.http.post('http://localhost:8082/api/auth/register', formData)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.showAlertMessage(response.message || 'Inscription réussie! En attente de validation.', 'success');
          
          // Redirection après 3 secondes
          setTimeout(() => {
            this.router.navigate(['/login'], {
              state: { 
                registrationSuccess: true,
                message: response.message || 'Votre compte est en attente de validation' 
              }
            });
          }, 3000);
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
          this.showAlertMessage('Erreur: ' + errorMessage, 'error');
        }
      });
  }
}