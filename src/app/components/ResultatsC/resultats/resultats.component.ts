import { Component ,OnInit } from '@angular/core';
import { ResultatService } from 'src/app/services/resultat/resultat.service';
import { Router } from '@angular/router';
import { Resultat } from 'src/app/models/resultat';
@Component({
  selector: 'app-resultats',
  templateUrl: './resultats.component.html',
  styleUrls: ['./resultats.component.css']
})

export class ResultatsComponent {
    resultats: Resultat[] = [];
    loading = false;
    error = '';
    constructor(
      private resultatService: ResultatService,
      private router: Router
    ) { }

    ngOnInit(): void {
      this.loadResultats();
    }

    loadResultats(): void {
      this.loading  = true 
      this.error = '';
      this.resultatService.getAllResultats().subscribe({
        next :(data) => {
          this.resultats = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des resultats: ' + err.message;
          this.loading = false;
        }
      })

    }
    ajouterResultat(): void {
      this.router.navigate(['/resultats/ajouter']);
    }
}
