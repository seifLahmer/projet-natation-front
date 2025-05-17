import { Component, OnInit, OnDestroy } from '@angular/core';
import { TypeCompetition } from 'src/app/models/competition';
import { WikiService } from 'src/app/services/wiki/wiki.service';
import { Router } from '@angular/router';
import { RelevanceAiService } from 'src/app/services/relevance/relevance-ai.service';

interface CompetitionCard {
  type: TypeCompetition;
  imageUrl: string;
  description: string;
}

@Component({
  selector: 'app-competition-cards',
  templateUrl: './competition-cards.component.html',
  styleUrls: ['./competition-cards.component.css']
})
export class CompetitionCardsComponent implements OnInit, OnDestroy {
  // Propriétés existantes conservées
  competitionCards: CompetitionCard[] = [];
  imageUrls: string[] = [];
  currentImageUrl: string = 'https://via.placeholder.com/1200x500';
  imageIndex = 0; // Changé de private à public pour l'accès depuis le template
  private intervalId: any;

  // Propriétés de filtrage existantes conservées
  currentPage: number = 1;
  itemsPerPage: number = 5; 
  selectedGender: string = '';
  selectedStyle: string = '';
  selectedDistance: string = '';
  filtersApplied = false;
  filterMessageShown: boolean = false;

  // Nouvelles propriétés pour les filtres avancés
  searchTerm: string = '';
  selectedLevel: string = '';
  sortBy: string = 'name-asc';
  isCardView: boolean = true;

  constructor(private wikiService: WikiService, private router: Router, private relevanceService: RelevanceAiService) {}

  ngOnInit(): void {
    // Logique existante conservée exactement
    const allTypes = Object.values(TypeCompetition);
  
    this.competitionCards = allTypes.map(type => ({
      type,
      imageUrl: '',
      description: 'Chargement de la description...'
    }));
  
    // Générer la description pour chaque type de compétition
    this.competitionCards.forEach(card => this.genererDescription(card));
  
    // Récupère plusieurs images de natation
    this.wikiService.getSwimmingImages(10).subscribe({
      next: (images) => {
        this.imageUrls = images;
        if (this.imageUrls.length > 0) {
          this.currentImageUrl = this.imageUrls[0];
          this.startImageRotation();
        }
      },
      error: () => {
        console.error('Erreur lors de la récupération des images');
      }
    });
  }

  ngOnDestroy(): void {
    // Logique existante conservée
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startImageRotation(): void {
    this.intervalId = setInterval(() => {
      this.imageIndex = (this.imageIndex + 1) % this.imageUrls.length;
      this.currentImageUrl = this.imageUrls[this.imageIndex];
    }, 5000);
  }

  planifier(type: TypeCompetition): void {
    // Logique existante conservée exactement
    const typeKey = Object.keys(TypeCompetition).find(
      key => TypeCompetition[key as keyof typeof TypeCompetition] === type
    );
  
    if (typeKey) {
      this.router.navigate(['/competitions/ajouter'], {
        queryParams: { type: typeKey }
      });
    } else {
      console.error("Clé introuvable pour le type :", type);
    }
  }

  // Méthodes de filtrage existantes conservées et améliorées
  get filteredCompetitions(): CompetitionCard[] {
    return this.paginate(this.getFilteredCompetitions());
  }

  getFilteredCompetitions(): CompetitionCard[] {
    let filtered = [...this.competitionCards];

    // Recherche textuelle
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(card => 
        card.type.toLowerCase().includes(searchLower) ||
        card.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtres existants conservés
    if (this.selectedGender) {
      filtered = filtered.filter(card => 
        card.type.toUpperCase().includes(this.selectedGender.toUpperCase())
      );
    }

    if (this.selectedStyle) {
      filtered = filtered.filter(card => 
        card.type.toUpperCase().includes(this.selectedStyle.toUpperCase())
      );
    }

    if (this.selectedDistance) {
      filtered = filtered.filter(card => 
        card.type.toUpperCase().includes(this.selectedDistance.toUpperCase())
      );
    }

    // Nouveau filtre par niveau
    if (this.selectedLevel) {
      filtered = filtered.filter(card => 
        card.type.toUpperCase().includes(this.selectedLevel.toUpperCase())
      );
    }

    // Tri
    return this.sortCompetitions(filtered);
  }

  paginate(list: CompetitionCard[]): CompetitionCard[] {
    // Logique existante conservée
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return list.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    // Logique existante améliorée
    const filteredList = this.getFilteredCompetitions();
    return Math.ceil(filteredList.length / this.itemsPerPage);
  }

  applyFilters(): void {
    // Logique existante conservée
    this.filtersApplied = true;
    this.currentPage = 1;
    this.filterMessageShown = true;
    
    // Masquer le message après 3 secondes
    setTimeout(() => {
      this.filterMessageShown = false;
    }, 3000);
  }

  resetFilters(): void {
    // Logique existante étendue
    this.selectedGender = '';
    this.selectedStyle = '';
    this.selectedDistance = '';
    this.selectedLevel = '';
    this.searchTerm = '';
    this.sortBy = 'name-asc';
    this.filtersApplied = false;
    this.currentPage = 1;
    this.filterMessageShown = false;
  }

  genererDescription(card: any) {
    // Logique existante conservée exactement
    this.relevanceService.generateDescription(card.type).subscribe(
      (res) => {
        let description = res?.choices?.[0]?.message?.content;
        
        if (description) {
          description = this.formatDescription(description);
          card.description = description;
        } else {
          card.description = 'Description non disponible.';
        }
      },
      (err) => {
        console.error('Erreur Relevance AI:', err);
        card.description = 'Description non disponible.';
      }
    );
  }

  formatDescription(description: string): string {
    // Logique existante conservée exactement
    description = description.replace(/\n/g, '<br>');
    description = description.replace(/(Type de compétition:)/, '<strong>$1</strong>');
    description = description.replace(/(Distance:)/, '<strong>$1</strong>');
    description = description.replace(/(\d+ M)/g, '<ul><li>$1</li></ul>');
    
    const competitionType = "type_competition_unique";
    localStorage.setItem(competitionType, description);
    return description;
  }

  // Nouvelles méthodes pour les fonctionnalités avancées

  /**
   * Gestion des images du carousel
   */
  setCurrentImage(index: number): void {
    this.imageIndex = index;
    this.currentImageUrl = this.imageUrls[index];
  }

  /**
   * Tri des compétitions
   */
  sortCompetitions(competitions: CompetitionCard[]): CompetitionCard[] {
    return competitions.sort((a, b) => {
      switch (this.sortBy) {
        case 'name-asc':
          return a.type.localeCompare(b.type);
        case 'name-desc':
          return b.type.localeCompare(a.type);
        case 'distance-asc':
          return this.extractDistance(a.type) - this.extractDistance(b.type);
        case 'distance-desc':
          return this.extractDistance(b.type) - this.extractDistance(a.type);
        case 'style':
          return this.extractStyle(a.type).localeCompare(this.extractStyle(b.type));
        case 'gender':
          return this.extractGender(a.type).localeCompare(this.extractGender(b.type));
        default:
          return 0;
      }
    });
  }

  /**
   * Extraire la distance d'un type de compétition
   */
  extractDistance(type: string): number {
    const match = type.match(/(\d+)\s*M/);
    return match ? parseInt(match[1]) : 0;
  }

  /**
   * Extraire le style de nage
   */
  extractStyle(type: string): string {
    const styles = ['LIBRE', 'DOS', 'BRASSE', 'PAPILLON', 'NAGES','RELAIS'];
    for (const style of styles) {
      if (type.toUpperCase().includes(style)) return style;
    }
    return 'AUTRE';
  }

  /**
   * Extraire le genre
   */
  extractGender(type: string): string {
    if (type.toUpperCase().includes('DAMES')) return 'DAMES';
    if (type.toUpperCase().includes('MESSIEURS')) return 'MESSIEURS';
    if (type.toUpperCase().includes('MIXTE')) return 'MIXTE';
    return 'AUTRE';
  }

  /**
   * Événements de changement
   */
  onSearchChange(): void {
    if (this.searchTerm.length > 2 || this.searchTerm.length === 0) {
      this.currentPage = 1;
    }
  }

  onSortChange(): void {
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
  }

  /**
   * Gestion de la pagination avancée
   */
  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  getVisiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // Si total des pages <= 5, montrer toutes les pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique des ellipses
      if (this.currentPage <= 3) {
        // Début: 1 2 3 4 ... dernière
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        // Fin: 1 ... avant-avant-dernière avant-dernière dernière
        pages.push(1);
        pages.push('...');
        for (let i = this.totalPages - 3; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Milieu: 1 ... current-1 current current+1 ... dernière
        pages.push(1);
        pages.push('...');
        pages.push(this.currentPage - 1);
        pages.push(this.currentPage);
        pages.push(this.currentPage + 1);
        pages.push('...');
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

  /**
   * Gestion des options de pagination
   */
  changeItemsPerPage(items: number): void {
    this.itemsPerPage = items;
    this.currentPage = 1;
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
  }

  /**
   * Basculer entre vue cartes et vue liste
   */
  toggleViewMode(): void {
    this.isCardView = !this.isCardView;
  }

  /**
   * Exporter les compétitions en CSV
   */
  exportToCSV(): void {
    const headers = ['Type', 'Genre', 'Style', 'Distance', 'Description'];
    const csvData = this.getFilteredCompetitions().map(card => [
      this.sanitizeCSVValue(card.type),
      this.sanitizeCSVValue(this.extractGender(card.type)),
      this.sanitizeCSVValue(this.extractStyle(card.type)),
      this.extractDistance(card.type) + 'M',
      this.sanitizeCSVValue(card.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...')
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `competitions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Nettoyer les valeurs pour CSV
   */
  private sanitizeCSVValue(value: string): string {
    // Échapper les guillemets et ajouter des guillemets autour de la valeur
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  /**
   * Méthodes pour les statistiques
   */
  getFilteredCount(): number {
    return this.getFilteredCompetitions().length;
  }

  getCountByGender(gender: string): number {
    return this.competitionCards.filter(card => 
      card.type.toUpperCase().includes(gender.toUpperCase())
    ).length;
  }

  /**
   * Obtenir la couleur de carte selon le type
   */
  getCardColor(type: string): string {
    // Couleurs par distance
    if (type.includes('50') || type.includes('50M')) return '#3498db';  // Bleu
    if (type.includes('100') || type.includes('100M')) return '#9b59b6'; // Violet
    if (type.includes('200') || type.includes('200M')) return '#e74c3c';  // Rouge
    if (type.includes('400') || type.includes('400M')) return '#f39c12';  // Orange
    if (type.includes('800') || type.includes('1500')) return '#27ae60';  // Vert
    
    // Couleurs par style de nage
    if (type.toUpperCase().includes('LIBRE')) return '#17a2b8';     // Info blue
    if (type.toUpperCase().includes('DOS')) return '#6f42c1';       // Indigo
    if (type.toUpperCase().includes('BRASSE')) return '#28a745';    // Vert
    if (type.toUpperCase().includes('PAPILLON')) return '#fd7e14';  // Orange vif
    if (type.toUpperCase().includes('RELAIS')) return '#e83e8c';    // Rose
    if (type.toUpperCase().includes('NAGES')) return '#6610f2';     // Violet foncé
    
    // Couleurs par genre
    if (type.toUpperCase().includes('DAMES')) return '#e91e63';     // Rose
    if (type.toUpperCase().includes('MESSIEURS')) return '#2196f3'; // Bleu
    if (type.toUpperCase().includes('MIXTE')) return '#9c27b0';     // Violet
    
    return '#17a2b8'; // Couleur par défaut
  }

  getCardColorSecondary(type: string): string {
    // Couleurs secondaires correspondantes
    if (type.includes('50') || type.includes('50M')) return '#2980b9';
    if (type.includes('100') || type.includes('100M')) return '#8e44ad';
    if (type.includes('200') || type.includes('200M')) return '#c0392b';
    if (type.includes('400') || type.includes('400M')) return '#d68910';
    if (type.includes('800') || type.includes('1500')) return '#229954';
    
    // Couleurs secondaires par style
    if (type.toUpperCase().includes('LIBRE')) return '#138496';
    if (type.toUpperCase().includes('DOS')) return '#59359a';
    if (type.toUpperCase().includes('BRASSE')) return '#1e7e34';
    if (type.toUpperCase().includes('PAPILLON')) return '#e8590e';
    if (type.toUpperCase().includes('RELAIS')) return '#d91a72';
    if (type.toUpperCase().includes('NAGES')) return '#520dc2';
    
    // Couleurs secondaires par genre
    if (type.toUpperCase().includes('DAMES')) return '#c2185b';
    if (type.toUpperCase().includes('MESSIEURS')) return '#1976d2';
    if (type.toUpperCase().includes('MIXTE')) return '#7b1fa2';
    
    return '#138496'; // Couleur secondaire par défaut
  }

  // Support pour Math dans le template
  Math = Math;
}