import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/_services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-joueur',
  templateUrl: './joueur.component.html',
  styleUrls: ['./joueur.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class JoueurComponent implements OnInit {
  showProfileModal = false;
  showEditModal = false;
  userDetails: any;
  editForm: FormGroup;

constructor(
  private authService: AuthService,
  private fb: FormBuilder
) {
   this.editForm = this.fb.group({
    id: [''],
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    dateCreation: [{value: '', disabled: true}]
  });
}
  ngOnInit(): void {
    this.loadUserDetails();
  }

  showProfile() {
    this.showProfileModal = true;
  }

  loadUserDetails() {
  const currentUser = this.authService.currentUserValue;
  if (currentUser && currentUser.email) {
    this.authService.getUserDetails(currentUser.email).subscribe({
      next: (details) => {
        this.userDetails = details;
        this.editForm.patchValue({
          id: details.id,
          nom: details.nom,
          prenom: details.prenom,
          email: details.email,
          telephone: details.telephone,
          dateCreation: details.dateCreation
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails', err);
      }
    });
  }
}


  openEditModal() {
    this.showEditModal = true;
    this.showProfileModal = false;
  }

   updateProfile() {
  if (this.editForm.valid) {
    const updatedUser = {
      id: this.editForm.value.id,
      nom: this.editForm.value.nom,
      prenom: this.editForm.value.prenom,
      email: this.editForm.value.email,
      telephone: this.editForm.value.telephone,
      nomClub: this.userDetails.nomClub, // On garde la valeur originale
      adresseClub: this.userDetails.adresseClub, // Ajout de l'adresse du club
    };

    this.authService.updateProfile(updatedUser).subscribe({
      next: () => {
        this.userDetails = { ...this.userDetails, ...updatedUser };
        
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          const updatedCurrentUser = { 
            ...currentUser,
            nom: updatedUser.nom,
            prenom: updatedUser.prenom,
            email: updatedUser.email
          };
          sessionStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
          this.authService['currentUserSubject'].next(updatedCurrentUser);
        }
        
        this.showEditModal = false;
        this.showProfileModal = true;
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil', err);
      }
    });
  }
}

  logout() {
    this.authService.logout();
  }
}