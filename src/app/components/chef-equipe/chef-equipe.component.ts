import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/services/_services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateLicenceComponent } from '../licence/create-licence/create-licence.component';
import { ViewLicenceComponent } from '../licence/view-licence/view-licence.component';
import { LicenceService } from '../../services/licence/licence.service';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-chef-equipe',
  templateUrl: './chef-equipe.component.html',
  styleUrls: ['./chef-equipe.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class ChefEquipeComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'prenom', 'email', 'telephone', 'dateCreation', 'licence', 'actions'];
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
    private authService: AuthService,
    private dialog: MatDialog,
    private licenceService: LicenceService
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
            
            // Pour chaque joueur, vérifier s'il a une licence
            const licenceChecks = uniqueJoueurs.map(joueur => 
              this.licenceService.checkUserLicence(joueur.email).pipe(
                map(response => ({
                  ...joueur,
                  hasLicence: response.hasLicence,
                  licenceInfo: response.hasLicence ? {
                    numLicence: response.numLicence,
                    dateExpiration: response.dateExpiration,
                    nomJoueur: response.nomJoueur,
                    prenomJoueur: response.prenomJoueur
                  } : null
                }))
              )
            );

            forkJoin(licenceChecks).subscribe(joueursWithLicence => {
              this.joueurs = joueursWithLicence;
              this.filteredJoueurs = [...joueursWithLicence];
            });
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

  createLicence(joueur: any): void {
    if (!joueur.hasLicence) {
      const dialogRef = this.dialog.open(CreateLicenceComponent, {
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: { joueur },
        disableClose: true,
        autoFocus: true,
        panelClass: 'custom-dialog-container'
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.loadJoueurs();
          alert('Licence créée avec succès !');
        }
      });
    }
  }

  viewLicence(joueur: any): void {
    if (joueur.hasLicence) {
      // Vérifier d'abord si nous avons un token valide
      const token = this.authService.getToken();
      if (!token) {
        console.error('Aucun token d\'authentification trouvé');
        this.authService.logout();
        return;
      }

      console.log('Token avant appel API:', token);
      console.log('Numéro de licence:', joueur.licenceInfo.numLicence);

      this.licenceService.getLicenceById(joueur.licenceInfo.numLicence).subscribe({
        next: (licence) => {
          const dialogRef = this.dialog.open(ViewLicenceComponent, {
            width: '700px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            data: { licence },
            panelClass: 'custom-dialog-container'
          });

          // Gérer la fermeture du dialogue
          dialogRef.afterClosed().subscribe(result => {
            if (result && result.action === 'deleted') {
              // Mettre à jour le joueur dans la liste
              const joueurIndex = this.joueurs.findIndex(j => 
                j.licenceInfo && j.licenceInfo.numLicence === result.licenceNumber
              );
              if (joueurIndex !== -1) {
                this.joueurs[joueurIndex].hasLicence = false;
                this.joueurs[joueurIndex].licenceInfo = null;
                // Mettre à jour également la liste filtrée
                const filteredIndex = this.filteredJoueurs.findIndex(j => 
                  j.licenceInfo && j.licenceInfo.numLicence === result.licenceNumber
                );
                if (filteredIndex !== -1) {
                  this.filteredJoueurs[filteredIndex].hasLicence = false;
                  this.filteredJoueurs[filteredIndex].licenceInfo = null;
                }
              }
            }
          });
        },
        error: (err) => {
          console.error('Erreur lors du chargement de la licence', err);
          if (err.status === 403) {
            alert('Vous n\'avez pas les droits nécessaires pour voir cette licence. Veuillez vous reconnecter.');
            this.authService.logout();
          } else {
            alert('Erreur lors du chargement de la licence: ' + (err.error?.message || err.message));
          }
        }
      });
    }
  }
}