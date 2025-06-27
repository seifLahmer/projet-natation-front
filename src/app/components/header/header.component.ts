import { Component } from '@angular/core';
import { LicenceService } from '../../services/licence/licence.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(private licenceService: LicenceService) {}

  checkLicence(): void {
    const email = prompt('Veuillez entrer votre email pour vérifier votre licence :');
    if (email) {
      this.licenceService.checkUserLicence(email).subscribe({
        next: (response) => {
          if (response.hasLicence) {
            const message = `
Licence trouvée :
Numéro : ${response.numLicence}
Nom : ${response.nomJoueur}
Prénom : ${response.prenomJoueur}
Date d'expiration : ${new Date(response.dateExpiration).toLocaleDateString()}
            `;
            alert(message);
          } else {
            alert('Aucune licence n\'a été trouvée pour cet email.');
          }
        },
        error: (error) => {
          console.error('Erreur lors de la vérification de la licence:', error);
          alert('Erreur lors de la vérification de la licence.');
        }
      });
    }
  }
}
