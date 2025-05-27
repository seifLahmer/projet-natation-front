import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { LicenceService } from '../../../services/licence/licence.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-create-licence',
  templateUrl: './create-licence.component.html',
  styleUrls: ['./create-licence.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  providers: [DatePipe]
})
export class CreateLicenceComponent implements OnInit {
  licenceForm: FormGroup;
  categories = ['Junior', 'Senior', 'Vétéran'];
  niveaux = ['Débutant', 'Intermédiaire', 'Avancé'];
  minDate = new Date();
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private licenceService: LicenceService,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<CreateLicenceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log('Data reçue dans le constructeur:', data);
    this.isEdit = data?.isEdit || false;
    this.licenceForm = this.fb.group({
      nomJoueur: [{value: '', disabled: true}],
      prenomJoueur: [{value: '', disabled: true}],
      email: [{value: '', disabled: true}],
      telephone: [{value: '', disabled: true}],
      club: [{value: '', disabled: true}],
      categorie: ['', Validators.required],
      niveau: ['', Validators.required],
      dateExpiration: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit - isEdit:', this.isEdit);
    console.log('ngOnInit - data:', this.data);

    if (this.data) {
      if (this.isEdit) {
        // Mode modification
        console.log('Mode modification - données de la licence:', this.data.licence);
        this.licenceForm.patchValue({
          nomJoueur: this.data.licence.nomJoueur,
          prenomJoueur: this.data.licence.prenomJoueur,
          email: this.data.licence.email,
          telephone: this.data.licence.telephone,
          club: this.data.licence.club,
          categorie: this.data.licence.categorie,
          niveau: this.data.licence.niveau,
          dateExpiration: new Date(this.data.licence.dateExpiration)
        });
      } else {
        // Mode création
        console.log('Mode création - données du joueur:', this.data.joueur);
        this.licenceForm.patchValue({
          nomJoueur: this.data.joueur.nom,
          prenomJoueur: this.data.joueur.prenom,
          email: this.data.joueur.email,
          telephone: this.data.joueur.telephone,
          club: this.data.joueur.nomClub
        });
      }
    }
  }

  onSubmit(): void {
    console.log('onSubmit appelé - form valide:', this.licenceForm.valid);
    console.log('Valeurs du formulaire:', this.licenceForm.getRawValue());

    if (this.licenceForm.valid) {
      const licenceData = {
        ...this.licenceForm.getRawValue(),
        email: this.isEdit ? this.data.licence.email : this.data.joueur.email
      };

      console.log('Données à envoyer:', licenceData);

      if (this.isEdit) {
        // Mise à jour de la licence
        console.log('Tentative de mise à jour de la licence:', this.data.licence.numLicence);
        this.licenceService.updateLicence(this.data.licence.numLicence, licenceData).subscribe({
          next: (updatedLicence) => {
            console.log('Licence mise à jour avec succès:', updatedLicence);
            this.dialogRef.close(updatedLicence);
          },
          error: (err) => {
            console.error('Erreur détaillée lors de la mise à jour de la licence:', err);
            if (err.status === 403) {
              alert('Vous n\'avez pas les droits nécessaires pour modifier cette licence');
            } else {
              alert('Erreur lors de la mise à jour de la licence: ' + (err.error?.message || err.message));
            }
          }
        });
      } else {
        // Création d'une nouvelle licence
        console.log('Tentative de création d\'une nouvelle licence');
        this.licenceService.createLicence(licenceData).subscribe({
          next: (newLicence) => {
            console.log('Nouvelle licence créée avec succès:', newLicence);
            this.dialogRef.close(newLicence);
          },
          error: (err) => {
            console.error('Erreur détaillée lors de la création de la licence:', err);
            if (err.status === 403) {
              alert('Vous n\'avez pas les droits nécessaires pour créer une licence');
            } else {
              alert('Erreur lors de la création de la licence: ' + (err.error?.message || err.message));
            }
          }
        });
      }
    } else {
      console.log('Formulaire invalide - erreurs:', this.licenceForm.errors);
      alert('Veuillez remplir tous les champs obligatoires');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 