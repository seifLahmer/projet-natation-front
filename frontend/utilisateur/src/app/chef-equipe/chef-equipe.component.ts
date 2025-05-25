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
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['']
    });
    
    this.editForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.loadJoueurs();
    this.loadCurrentUserDetails();
  }

  loadCurrentUserDetails(): void {
    this.http.get<any>(`http://localhost:8082/api/auth/user-details?email=${this.currentUser.email}`)
      .subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (err) => console.error('Erreur lors du chargement des détails utilisateur', err)
      });
  }

  loadJoueurs(): void {
    this.http.get<any[]>('http://localhost:8082/api/joueurs/sans-club').subscribe({
      next: (joueursSansClub) => {
        this.http.get<any[]>(`http://localhost:8082/api/joueurs/par-club?nomClub=${this.currentUser.nomClub}`).subscribe({
          next: (joueursClub) => {
            const allJoueurs = [...joueursSansClub, ...joueursClub];
            const uniqueJoueurs = allJoueurs.filter((joueur, index, self) =>
              index === self.findIndex(j => j.id === joueur.id)
            );
            
            this.joueurs = uniqueJoueurs;
            this.filteredJoueurs = [...uniqueJoueurs];
          },
          error: (err) => console.error('Erreur lors du chargement des joueurs du club', err)
        });
      },
      error: (err) => console.error('Erreur lors du chargement des joueurs sans club', err)
    });
  }

  filterJoueurs(): void {
    if (!this.searchTerm) {
      this.filteredJoueurs = [...this.joueurs];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredJoueurs = this.joueurs.filter(joueur => 
      joueur.nom.toLowerCase().includes(term) || 
      joueur.prenom.toLowerCase().includes(term)
    );
  }

  ajouterJoueur(): void {
    if (this.joueurForm.valid) {
      const joueurData = {
        ...this.joueurForm.value,
        chefEmail: this.currentUser.email // Ajout de l'email du chef d'équipe
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