import { Component, OnInit } from '@angular/core';
import { ResultatService } from 'src/app/services/resultat/resultat.service';
import { Router } from '@angular/router';
import { Resultat } from 'src/app/models/resultat';

@Component({
  selector: 'app-resultats',
  templateUrl: './resultats.component.html',
  styleUrls: ['./resultats.component.css']
})
export class ResultatsComponent implements OnInit {
  resultats: Resultat[] = [];
  filteredResultats: Resultat[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedCompetition = '';
  competitions: string[] = [];
  sortBy = 'place';
  sortDirection = 'asc';

  constructor(
    private resultatService: ResultatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadResultats();
  }

  loadResultats(): void {
    this.loading = true;
    this.error = '';
    
    this.resultatService.getAllResultats().subscribe({
      next: (data) => {
        this.resultats = data;
        this.filteredResultats = [...data];
        this.extractCompetitions();
        this.sortResultats();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des résultats: ' + err.message;
        this.loading = false;
        console.error('Erreur chargement résultats:', err);
      }
    });
  }

  extractCompetitions(): void {
    const competitionsSet = new Set<string>();
    this.resultats.forEach(resultat => {
      if (resultat.competition?.typeC) {
        competitionsSet.add(resultat.competition.typeC);
      }
    });
    this.competitions = Array.from(competitionsSet).sort();
  }

  filterResultats(): void {
    let filtered = [...this.resultats];

    // Filtrer par terme de recherche (nom du participant)
    if (this.searchTerm.trim()) {
      filtered = filtered.filter(resultat =>
        resultat.utilisateurs?.nom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        resultat.utilisateurs?.prenom?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        `${resultat.utilisateurs?.prenom} ${resultat.utilisateurs?.nom}`.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Filtrer par compétition
    if (this.selectedCompetition) {
      filtered = filtered.filter(resultat =>
        resultat.competition?.typeC === this.selectedCompetition
      );
    }

    this.filteredResultats = filtered;
    this.sortResultats();
  }

  sortResultats(): void {
    this.filteredResultats.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'place':
          valueA = a.place;
          valueB = b.place;
          break;
        case 'temps':
          valueA = this.convertTimeToSeconds(a.temps);
          valueB = this.convertTimeToSeconds(b.temps);
          break;
        case 'points':
          valueA = a.points;
          valueB = b.points;
          break;
        case 'participant':
          valueA = `${a.utilisateurs?.prenom} ${a.utilisateurs?.nom}`.toLowerCase();
          valueB = `${b.utilisateurs?.prenom} ${b.utilisateurs?.nom}`.toLowerCase();
          break;
        case 'competition':
          valueA = a.competition?.typeC?.toLowerCase() || '';
          valueB = b.competition?.typeC?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  convertTimeToSeconds(timeString: string): number {
    if (!timeString) return 0;
    
    // Format attendu: "mm:ss.ms" ou "mm:ss"
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const secondsParts = parts[1].split('.');
      const seconds = parseInt(secondsParts[0], 10);
      const milliseconds = secondsParts.length > 1 ? parseInt(secondsParts[1], 10) : 0;
      
      return minutes * 60 + seconds + milliseconds / 1000;
    }
    return 0;
  }

  onSort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.sortResultats();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) {
      return 'fa-sort';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  getRankClass(place: number): string {
    switch (place) {
      case 1: return 'rank-gold';
      case 2: return 'rank-silver';
      case 3: return 'rank-bronze';
      default: return '';
    }
  }

  ajouterResultat(): void {
    this.router.navigate(['/admin/resultats/ajouter']);
  }

  modifierResultat(id: number): void {
    this.router.navigate(['/admin/resultats/modifier', id]);
  }

  supprimerResultat(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce résultat ?')) {
      this.resultatService.deleteResultat(id).subscribe({
        next: () => {
          this.loadResultats();
          // Optionnel: afficher un message de succès
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression: ' + err.message;
          console.error('Erreur suppression:', err);
        }
      });
    }
  }

  exportToCsv(): void {
    const csvContent = this.generateCsvContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'resultats.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  private generateCsvContent(): string {
    const headers = ['Place', 'Participant', 'Compétition', 'Temps', 'Points', 'Temps de passage'];
    const csvData = [headers.join(',')];

    this.filteredResultats.forEach(resultat => {
      const row = [
        resultat.place,
        `"${resultat.utilisateurs?.prenom} ${resultat.utilisateurs?.nom}"`,
        `"${resultat.competition?.typeC || 'N/A'}"`,
        resultat.temps,
        resultat.points,
        resultat.tempsDePassage
      ];
      csvData.push(row.join(','));
    });

    return csvData.join('\n');
  }

  refreshData(): void {
    this.loadResultats();
  }

  trackByResultat(index: number, resultat: Resultat): number {
    return resultat.idResultat || index;
  }

  getBestTime(): string {
    if (this.filteredResultats.length === 0) return 'N/A';
    
    const bestResult = this.filteredResultats
      .filter(r => r.temps)
      .sort((a, b) => this.convertTimeToSeconds(a.temps) - this.convertTimeToSeconds(b.temps))[0];
    
    return bestResult ? bestResult.temps : 'N/A';
  }

  getMaxPoints(): number {
    if (this.filteredResultats.length === 0) return 0;
    return Math.max(...this.filteredResultats.map(r => r.points));
  }
}