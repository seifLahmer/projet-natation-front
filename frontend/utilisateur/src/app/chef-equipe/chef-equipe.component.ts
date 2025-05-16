import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-chef-equipe',
  templateUrl: './chef-equipe.component.html',
  styleUrls: ['./chef-equipe.component.css']
})
export class ChefEquipeComponent implements OnInit {
  joueurs: any[] = [];
  showAddForm = false;
  addMode: 'email' | 'details' = 'email';
  joueurForm: FormGroup;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.joueurForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadJoueurs();
    // Charger les détails complets de l'utilisateur pour avoir le nomClub
    this.loadCurrentUserDetails();
  }

  loadCurrentUserDetails(): void {
    this.http.get<any>(`http://localhost:8080/api/auth/user-details?email=${this.currentUser.email}`)
      .subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (err) => console.error('Erreur lors du chargement des détails utilisateur', err)
      });
  }

  loadJoueurs(): void {
    this.http.get<any[]>('http://localhost:8080/api/joueurs/sans-club').subscribe({
      next: (joueurs) => this.joueurs = joueurs,
      error: (err) => console.error('Erreur lors du chargement des joueurs', err)
    });
  }

  ajouterJoueur(): void {
    if (this.joueurForm.valid) {
      const joueurData = {
        ...this.joueurForm.value,
        nomClub: this.currentUser.nomClub
      };

      const endpoint = this.addMode === 'email' 
        ? 'http://localhost:8080/api/joueurs/ajouter-par-email' 
        : 'http://localhost:8080/api/joueurs/ajouter-par-details';

      this.http.post(endpoint, joueurData).subscribe({
        next: () => {
          this.loadJoueurs();
          this.showAddForm = false;
          this.joueurForm.reset();
          alert('Joueur ajouté avec succès!');
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du joueur', err);
          let errorMessage = 'Erreur lors de l\'ajout du joueur';
          if (err.error && typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error?.message) {
            errorMessage = err.error.message;
          }
          alert(errorMessage);
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
} 