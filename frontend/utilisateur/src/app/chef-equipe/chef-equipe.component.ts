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
  filteredJoueurs: any[] = [];
  searchTerm: string = '';
  showAddForm = false;
  addMode: 'email' | 'details' = 'email';
  joueurForm: FormGroup;
  currentUser: any;
  
  showEditModal = false;
  editForm: FormGroup;
  selectedJoueur: any;
  
  showDeleteModal = false;
  joueurToDelete: any;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.joueurForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ '-]*$/)]],
      prenom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ '-]*$/)]],
      telephone: ['', [Validators.pattern(/^[0-9]*$/)]]
    });
    
    this.editForm = this.fb.group({
      nom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ '-]*$/)]],
      prenom: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ '-]*$/)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^[0-9]*$/)]]
    });
  }

  // Getters pour accéder facilement aux contrôles du formulaire
  get nom() { return this.joueurForm.get('nom'); }
  get prenom() { return this.joueurForm.get('prenom'); }
  get email() { return this.joueurForm.get('email'); }
  get telephone() { return this.joueurForm.get('telephone'); }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadCurrentUserDetails();
    this.loadJoueurs();
  }

  loadCurrentUserDetails(): void {
    this.http.get<any>(`http://localhost:8082/api/auth/user-details?email=${this.currentUser.email}`)
      .subscribe({
        next: (user) => {
          this.currentUser = user;
          this.loadJoueurs();
        },
        error: (err) => console.error('Erreur lors du chargement des détails utilisateur', err)
      });
  }

  loadJoueurs(): void {
    if (!this.currentUser?.nomClub) {
      console.log('Nom du club non disponible, attente des détails utilisateur...');
      return;
    }

    this.http.get<any[]>(`http://localhost:8082/api/joueurs/par-club?nomClub=${this.currentUser.nomClub}`).subscribe({
      next: (joueursClub) => {
        this.joueurs = joueursClub;
        this.filteredJoueurs = [...joueursClub];
        console.log('Joueurs chargés:', this.joueurs);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des joueurs du club', err);
        this.joueurs = [];
        this.filteredJoueurs = [];
      }
    });
  }

  filterJoueurs(): void {
    if (!this.searchTerm) {
      this.filteredJoueurs = [...this.joueurs];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredJoueurs = this.joueurs.filter(joueur => 
      joueur.nom?.toLowerCase().includes(term) || 
      joueur.prenom?.toLowerCase().includes(term)
    );
  }

  ajouterJoueur(): void {
    if (this.joueurForm.valid) {
      const joueurData = {
        ...this.joueurForm.value,
        chefEmail: this.currentUser.email
      };

      const endpoint = this.addMode === 'email' 
        ? 'http://localhost:8082/api/joueurs/ajouter-par-email' 
        : 'http://localhost:8082/api/joueurs/ajouter-par-details';

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

  editJoueur(joueur: any): void {
    this.selectedJoueur = joueur;
    this.editForm.patchValue({
      nom: joueur.nom,
      prenom: joueur.prenom,
      email: joueur.email,
      telephone: joueur.telephone
    });
    this.showEditModal = true;
  }

  updateJoueur(): void {
    if (this.editForm.valid) {
      const updatedData = {
        ...this.editForm.value,
        id: this.selectedJoueur.id
      };

      this.http.put('http://localhost:8082/api/joueurs/modifier', updatedData)
        .subscribe({
          next: () => {
            this.loadJoueurs();
            this.showEditModal = false;
            alert('Joueur modifié avec succès!');
          },
          error: (err) => {
            console.error('Erreur lors de la modification', err);
            alert('Erreur lors de la modification: ' + (err.error?.message || err.message));
          }
        });
    }
  }

  confirmDelete(joueur: any): void {
    this.joueurToDelete = joueur;
    this.showDeleteModal = true;
  }

  deleteJoueur(): void {
    this.http.post('http://localhost:8082/api/joueurs/supprimer', { 
      id: this.joueurToDelete.id,
      email: this.joueurToDelete.email 
    }).subscribe({
      next: () => {
        this.loadJoueurs();
        this.showDeleteModal = false;
        alert('Joueur supprimé avec succès!');
      },
      error: (err) => {
        console.error('Erreur lors de la suppression', err);
        alert('Erreur lors de la suppression: ' + (err.error?.message || err.message));
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}