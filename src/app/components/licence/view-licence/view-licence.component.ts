import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CreateLicenceComponent } from '../create-licence/create-licence.component';
import { LicenceService } from '../../../services/licence/licence.service';
import { AuthService } from '../../../services/_services/auth.service';

@Component({
  selector: 'app-view-licence',
  templateUrl: './view-licence.component.html',
  styleUrls: ['./view-licence.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltipModule
  ]
})
export class ViewLicenceComponent {
  isChefEquipe: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<ViewLicenceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private licenceService: LicenceService,
    private authService: AuthService
  ) {
    this.isChefEquipe = this.authService.getUserRole() === 'CHEF_EQUIPE';
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    if (!this.isChefEquipe) {
      alert('Seuls les chefs d\'équipe peuvent modifier les licences');
      return;
    }

    const dialogRef = this.dialog.open(CreateLicenceComponent, {
      width: '600px',
      data: {
        joueur: {
          nom: this.data.licence.nomJoueur,
          prenom: this.data.licence.prenomJoueur,
          email: this.data.licence.email,
          telephone: this.data.licence.telephone,
          nomClub: this.data.licence.club
        },
        isEdit: true,
        licence: this.data.licence
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Rafraîchir la vue actuelle avec les nouvelles données
        this.data.licence = result;
      }
    });
  }

  onDelete(): void {
    if (!this.isChefEquipe) {
      alert('Seuls les chefs d\'équipe peuvent supprimer les licences');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer cette licence ? Cette action est irréversible.')) {
      console.log('Tentative de suppression de la licence:', this.data.licence.numLicence);
      
      this.licenceService.deleteLicence(this.data.licence.numLicence).subscribe({
        next: () => {
          console.log('Licence supprimée avec succès');
          this.dialogRef.close({ action: 'deleted', licenceNumber: this.data.licence.numLicence });
        },
        error: (err) => {
          console.error('Erreur détaillée lors de la suppression:', err);
          if (err.status === 403) {
            alert('Vous n\'avez pas les droits nécessaires pour supprimer cette licence');
          } else {
            alert('Erreur lors de la suppression de la licence: ' + (err.error?.message || err.message));
          }
        }
      });
    }
  }
} 