import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { Piscine } from 'src/app/models/piscine';
import { PiscineService } from 'src/app/services/piscine/piscine.service';
import { Router } from '@angular/router';
import { Centre } from 'src/app/models/centre';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-piscine',
  templateUrl: './piscine.component.html',
  styleUrls: ['./piscine.component.css']
})
export class PiscineComponent implements OnInit, OnDestroy, AfterViewInit {

  // Données principales
  piscines: Piscine[] = [];
  filteredPiscines: Piscine[] = [];
  loading = false;
  error = '';
  
  // Propriétés pour les filtres
  searchTerm: string = '';
  selectedCentre: string = '';
  selectedLaneRange: string = '';
  
  // Subject pour le debounce de la recherche
  private searchSubject = new Subject<string>();
  
  // Propriétés pour la vue
  isCardView: boolean = false;
  
  // Pour le modal
  centreModalOuvert = false;
  centreSelectionne: Centre | null = null;
  
  constructor(
    private piscineService: PiscineService,
    private router: Router
  ) {
    // Configuration du debounce pour la recherche
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadPiscines();
  }

  ngAfterViewInit(): void {
    this.checkPiscineHealth();
    this.setupStickyFilters();
    this.initializeTooltips();
  }

  // Gestion du scroll pour l'effet sticky des filtres
  setupStickyFilters(): void {
    const filtersElement = document.querySelector('.sticky-filters');
    if (filtersElement) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 100;
        filtersElement.classList.toggle('scrolled', scrolled);
      });
    }
  }

  // Initialisation des tooltips Bootstrap
  initializeTooltips(): void {
    // Vérifier si Bootstrap est disponible
    if (typeof (window as any).bootstrap !== 'undefined') {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }

  // Mettre à jour les tooltips après changement de vue ou filtrage
  updateTooltips(): void {
    setTimeout(() => {
      this.initializeTooltips();
    }, 100);
  }

  ngOnDestroy(): void {
    this.fermerModal();
    this.searchSubject.complete();
  }

  // Méthodes de chargement des données
  loadPiscines(): void {
    this.loading = true;
    this.error = '';

    this.piscineService.getAllPiscines().subscribe({
      next: (data) => {
        this.piscines = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des piscines: ' + (err.message || 'Erreur inconnue');
        this.loading = false;
        console.error('Erreur lors du chargement:', err);
      }
    });
  }

  // Méthodes de filtrage et recherche
  applyFilters(): void {
    let filtered = [...this.piscines];

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(piscine => 
        piscine.nomPiscine.toLowerCase().includes(searchLower) ||
        (piscine.centre?.nomCentre?.toLowerCase().includes(searchLower)) ||
        (piscine.centre?.localisation?.toLowerCase().includes(searchLower)) ||
        piscine.nbreRows.toString().includes(searchLower) ||
        piscine.idPiscine.toString().includes(searchLower)
      );
    }

    // Filtre par centre
    if (this.selectedCentre) {
      filtered = filtered.filter(piscine => 
        piscine.centre && piscine.centre.idCentre.toString() === this.selectedCentre
      );
    }

    // Filtre par nombre de couloirs
    if (this.selectedLaneRange) {
      filtered = filtered.filter(piscine => {
        const lanes = piscine.nbreRows;
        switch (this.selectedLaneRange) {
          case '1-4': return lanes >= 1 && lanes <= 4;
          case '5-8': return lanes >= 5 && lanes <= 8;
          case '9-12': return lanes >= 9 && lanes <= 12;
          case '13+': return lanes >= 13;
          default: return true;
        }
      });
    }

    this.filteredPiscines = filtered;
    this.updateTooltips(); // Mettre à jour les tooltips après filtrage
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedCentre = '';
    this.selectedLaneRange = '';
    this.applyFilters();
  }

  // Méthodes utilitaires pour l'affichage
  getUniqueCentres(): Centre[] {
    const centres = this.piscines
      .filter(p => p.centre)
      .map(p => p.centre!)
      .filter((centre, index, self) => 
        index === self.findIndex(c => c.idCentre === centre.idCentre)
      );
    
    return centres.sort((a, b) => a.nomCentre.localeCompare(b.nomCentre));
  }

  getActiveCentresCount(): number {
    return this.getUniqueCentres().length;
  }

  getTotalLanes(): number {
    return this.filteredPiscines.reduce((total, piscine) => total + piscine.nbreRows, 0);
  }

  getTotalCapacity(): number {
    return this.filteredPiscines.reduce((total, piscine) => total + this.getCapacity(piscine.nbreRows), 0);
  }

  getCapacity(lanes: number): number {
    // Estimation : environ 2,5 nageurs par couloir
    return Math.round(lanes * 2.5);
  }

  getPoolType(lanes: number): string {
    if (lanes <= 4) return 'Entraînement/Loisir';
    if (lanes <= 6) return 'Compétition Amateur';
    if (lanes <= 8) return 'Compétition Standard';
    if (lanes <= 10) return 'Semi-Olympique';
    return 'Olympique';
  }

  getLanesBadgeClass(lanes: number): string {
    if (lanes <= 4) return 'bg-warning text-dark';
    if (lanes <= 6) return 'bg-info';
    if (lanes <= 8) return 'bg-success';
    return 'bg-primary';
  }

  getTotalLanesForCentre(centre: any): number {
    if (!centre.piscines) return 0;
    return centre.piscines.reduce((total: number, piscine: Piscine) => total + piscine.nbreRows, 0);
  }

  // Navigation et actions CRUD
  ajouterPiscine(): void {
    this.router.navigate(['/admin/piscines/ajouter']);
  }

  modifierPiscine(id: number): void {
    this.router.navigate(['/admin/piscines/modifier', id]);
  }

  supprimerPiscine(id: number): void {
    const piscine = this.piscines.find(p => p.idPiscine === id);
    if (!piscine) return;

    const message = `Êtes-vous sûr de vouloir supprimer la piscine "${piscine.nomPiscine}" ?`;
    
    if (confirm(message)) {
      this.loading = true;
      this.piscineService.deletePiscine(id).subscribe({
        next: () => {
          this.loadPiscines();
          console.log(`Piscine "${piscine.nomPiscine}" supprimée avec succès`);
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression: ' + (err.message || 'Erreur inconnue');
          this.loading = false;
          console.error('Erreur suppression:', err);
        }
      });
    }
  }

  // Gestion des vues
  toggleView(): void {
    this.isCardView = !this.isCardView;
    localStorage.setItem('piscine_view_preference', this.isCardView ? 'card' : 'table');
  }

  // Export des données
  exportToCSV(): void {
    try {
      const headers = ['ID', 'Nom', 'Centre', 'Localisation', 'Couloirs', 'Capacité', 'Type'];
      const csvData = this.filteredPiscines.map(piscine => [
        piscine.idPiscine,
        `"${piscine.nomPiscine}"`,
        `"${piscine.centre?.nomCentre || 'Non assigné'}"`,
        `"${piscine.centre?.localisation || 'Non spécifiée'}"`,
        piscine.nbreRows,
        this.getCapacity(piscine.nbreRows),
        `"${this.getPoolType(piscine.nbreRows)}"`
      ]);

      const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `piscines_${new Date().getTime()}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Export CSV effectué');
    } catch (e) {
      console.error('Erreur lors de l\'export CSV:', e);
      this.error = 'Erreur lors de l\'export CSV';
    }
  }

  // Méthode pour afficher les détails du centre
  afficherDetailsCentre(piscine: Piscine): void {
    if (piscine.centre) {
      this.loading = true;
      
      // Récupérer toutes les piscines du centre
      this.piscineService.getPiscinesParCentre(piscine.centre.idCentre).subscribe({
        next: (data) => {
          // Créer l'objet centre avec les piscines
          this.centreSelectionne = {
            ...piscine.centre,
            piscines: data
          } as Centre & { piscines: Piscine[] };

          this.centreModalOuvert = true;
          document.body.classList.add('modal-open');
          this.loading = false;
        },
        error: (err) => {
          console.error("Erreur lors du chargement des piscines du centre", err);
          this.error = 'Erreur lors du chargement des détails du centre';
          this.loading = false;
        }
      });
    }
  }

  // Méthode pour fermer le modal
  fermerModal(): void {
    this.centreModalOuvert = false;
    this.centreSelectionne = null;

    // Nettoyage du backdrop et du body
    document.body.classList.remove('modal-open');
    
    // Supprimer tous les éléments backdrop qui pourraient rester
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
  }

  // Validation et alerte sur l'état des piscines
  checkPiscineHealth(): void {
    const problemes: string[] = [];
    
    // Piscines sans centre assigné
    const sansAssignation = this.piscines.filter(p => !p.centre);
    if (sansAssignation.length > 0) {
      problemes.push(`${sansAssignation.length} piscine(s) sans centre assigné`);
    }
    
    // Piscines avec très peu de couloirs
    const piscinesPetites = this.piscines.filter(p => p.nbreRows < 4);
    if (piscinesPetites.length > 0) {
      problemes.push(`${piscinesPetites.length} piscine(s) avec moins de 4 couloirs`);
    }
    
    if (problemes.length > 0) {
      const message = 'Points d\'attention détectés:\n' + problemes.join('\n');
      console.warn(message);
    } else {
      console.log('Toutes les piscines sont en bon état');
    }
  }

  // Gestion des erreurs
  handleError(error: any, context: string): void {
    console.error(`Erreur dans ${context}:`, error);
    
    let userMessage = 'Une erreur est survenue';
    
    if (error.status === 0) {
      userMessage = 'Erreur de connexion au serveur';
    } else if (error.status === 404) {
      userMessage = 'Ressource non trouvée';
    } else if (error.status === 500) {
      userMessage = 'Erreur interne du serveur';
    } else if (error.message) {
      userMessage = error.message;
    }
    
    this.error = `${context}: ${userMessage}`;
  }

  // Raccourcis clavier
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Ctrl/Cmd + R : Refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.loadPiscines();
    }
    
    // Escape : Fermer modal
    if (event.key === 'Escape' && this.centreModalOuvert) {
      this.fermerModal();
    }
  }
}