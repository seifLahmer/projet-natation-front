import { Component } from '@angular/core';

@Component({
  selector: 'app-joueur',
  templateUrl: './joueur.component.html',
  styleUrls: ['./joueur.component.css']
})
export class JoueurComponent {
  showProfile() {
    // Logique pour afficher le profil
    console.log('Profil cliqué');
    // Vous pouvez implémenter une modal ou une navigation ici
  }
}