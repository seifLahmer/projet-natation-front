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
  emailExistsError = false;
  
  // Variables pour les messages d'alerte
  showAlert = false;
  alertMessage = '';
  alertType = '';

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

    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      this.emailExistsError = false;
      if (this.registerForm.get('email')?.hasError('emailExists')) {
        this.registerForm.get('email')?.setErrors(null);
      }
    });
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
    
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }

  onSubmit(): void {
    this.emailExistsError = false;

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
    formData.append('documentJustificatif', this.selectedFile as File);

    this.http.post('http://localhost:8082/api/auth/register', formData)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.showAlertMessage(response.message || 'Inscription réussie! En attente de validation.', 'success');
          
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
          console.error('Erreur complète:', err); // Gardez ce log pour le débogage
          
          // Essayez d'accéder au message d'erreur de différentes manières
          const errorResponse = err.error;
          let errorMessage = 'Une erreur est survenue lors de l\'inscription';
          
          if (typeof errorResponse === 'string') {
            // Si la réponse est une chaîne simple
            errorMessage = errorResponse;
          } else if (errorResponse?.message) {
            // Si la réponse est un objet avec une propriété message
            errorMessage = errorResponse.message;
          } else if (Array.isArray(errorResponse)) {
            // Si la réponse est un tableau
            errorMessage = errorResponse.join(', ');
          }

          // Vérification spécifique pour les emails existants
          if (errorMessage.toLowerCase().includes('email') || 
              errorMessage.toLowerCase().includes('existe')) {
            this.emailExistsError = true;
            this.registerForm.get('email')?.setErrors({ emailExists: true });
            errorMessage = 'Cet email est déjà utilisé. Veuillez utiliser un autre email.';
          }

          this.showAlertMessage(errorMessage, 'error');
        }
      });
  }
}