import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.registerForm = this.fb.group({
      // Informations générales
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      adresse: [''],
      telephone: [''],
      dateNaissance: [''],
      sexe: [''],

      // Rôle
      idRole: ['', Validators.required],

      // Nageur
      numLicence: [''],
      niveau: [''],

      // Entraîneur
      anneeExp: ['']
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onRoleChange(): void {
    const role = this.registerForm.get('idRole')?.value;
    
    // Réinitialiser les champs conditionnels
    this.registerForm.get('numLicence')?.reset();
    this.registerForm.get('niveau')?.reset();
    this.registerForm.get('anneeExp')?.reset();
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    
    // Préparer les données pour l'API
    const formData = this.registerForm.value;
    delete formData.confirmPassword; // Ne pas envoyer la confirmation

    // Ici vous ajouteriez votre appel API
    console.log('Données du formulaire:', formData);
    
    // Simuler un appel API
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/login']);
    }, 2000);
  }
} 