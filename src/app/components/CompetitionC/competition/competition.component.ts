import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { Competition } from 'src/app/models/competition';
import { CompetitionService } from 'src/app/services/competition/competition.service';
import { Router } from '@angular/router';
import { Piscine } from 'src/app/models/piscine';
import { HttpClient } from '@angular/common/http';
import { InscriptionService } from 'src/app/services/inscription/inscriptions.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from 'src/app/services/_services/auth.service';
@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.css']
})
export class CompetitionComponent implements OnInit, OnDestroy, AfterViewInit {

  // Données principales
  competitions: Competition[] = [];
  filteredCompetitions: Competition[] = [];
  loading = false;
  error = '';
  
  // Propriétés pour les filtres
  searchTerm: string = '';
  selectedType: string = '';
  selectedPiscine: string = '';
  selectedPeriod: string = '';
  selectedStatus: string = '';
  
  // Subject pour le debounce de la recherche
  private searchSubject = new Subject<string>();
  
  // Propriétés pour la vue
  isCardView: boolean = false;
  
  constructor(
    private competitionService: CompetitionService,
    private router: Router,
    private inscriptionService: InscriptionService,
    public authService: AuthService
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
    this.loadCompetitions();
  }

  ngAfterViewInit(): void {
    this.checkCompetitionHealth();
    this.setupStickyFilters();
    this.initializeTooltips();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  // Méthodes de chargement des données
  loadCompetitions(): void {
    this.loading = true;
    this.error = '';
    this.competitionService.getAllCompetitions().subscribe({
      next: (data) => {
        this.competitions = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des compétitions: ' + (err.message || 'Erreur inconnue');
        this.loading = false;
        console.error('Erreur lors du chargement:', err);
      }
    });
  }

  // Méthodes de filtrage et recherche
  applyFilters(): void {
    let filtered = [...this.competitions];

    // Filtre par terme de recherche
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(competition => 
        competition.typeC.toLowerCase().includes(searchLower) ||
        (competition.piscine?.nomPiscine?.toLowerCase().includes(searchLower)) ||
        competition.idReservation.toString().includes(searchLower) ||
        competition.nbrParticipants.toString().includes(searchLower)
      );
    }

    // Filtre par type de compétition
    if (this.selectedType) {
      filtered = filtered.filter(competition => 
        competition.typeC.toLowerCase().includes(this.selectedType.toLowerCase())
      );
    }

    // Filtre par piscine
    if (this.selectedPiscine) {
      filtered = filtered.filter(competition => 
        competition.piscine && competition.piscine.idPiscine.toString() === this.selectedPiscine
      );
    }

    // Filtre par période
    if (this.selectedPeriod) {
      filtered = this.filterByPeriod(filtered);
    }

    // Filtre par statut (basé sur les dates)
    if (this.selectedStatus) {
      filtered = this.filterByStatus(filtered);
    }

    this.filteredCompetitions = filtered;
    this.updateTooltips();
  }

  filterByPeriod(competitions: Competition[]): Competition[] {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (this.selectedPeriod) {
      case 'today':
        return competitions.filter(comp => {
          const dateDebut = new Date(comp.dateDebut);
          const dateDay = new Date(dateDebut.getFullYear(), dateDebut.getMonth(), dateDebut.getDate());
          return dateDay.getTime() === today.getTime();
        });
      case 'week':
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        return competitions.filter(comp => {
          const dateDebut = new Date(comp.dateDebut);
          return dateDebut >= today && dateDebut <= endOfWeek;
        });
      case 'month':
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return competitions.filter(comp => {
          const dateDebut = new Date(comp.dateDebut);
          return dateDebut >= today && dateDebut <= endOfMonth;
        });
      default:
        return competitions;
    }
  }

  filterByStatus(competitions: Competition[]): Competition[] {
    const now = new Date();
    
    switch (this.selectedStatus) {
      case 'upcoming':
        return competitions.filter(comp => new Date(comp.dateDebut) > now);
      case 'ongoing':
        return competitions.filter(comp => {
          const dateDebut = new Date(comp.dateDebut);
          const dateFin = new Date(comp.dateFin);
          return dateDebut <= now && dateFin >= now;
        });
      case 'past':
        return competitions.filter(comp => new Date(comp.dateFin) < now);
      default:
        return competitions;
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedPiscine = '';
    this.selectedPeriod = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  // Méthodes utilitaires pour l'affichage
  getUniqueTypes(): string[] {
    const types = this.competitions.map(c => c.typeC).filter(Boolean);
    return [...new Set(types)].sort();
  }

  getUniquePiscines(): Piscine[] {
    const piscines = this.competitions
      .filter(c => c.piscine)
      .map(c => c.piscine!)
      .filter((piscine, index, self) => 
        index === self.findIndex(p => p.idPiscine === piscine.idPiscine)
      );
    
    return piscines.sort((a, b) => a.nomPiscine.localeCompare(b.nomPiscine));
  }

  getTotalParticipants(): number {
    return this.filteredCompetitions.reduce((total, comp) => total + comp.nbrParticipants, 0);
  }

  getCompetitionStatus(competition: Competition): string {
    const now = new Date();
    const dateDebut = new Date(competition.dateDebut);
    const dateFin = new Date(competition.dateFin);
    
    if (dateFin < now) return 'Terminée';
    if ( dateDebut > now) return 'À venir';
    return 'En cours';
  }

  getStatusBadgeClass(competition: Competition): string {
    const status = this.getCompetitionStatus(competition);
    switch (status) {
      case 'Terminée': return 'bg-secondary';
      case 'En cours': return 'bg-success';
      case 'À venir': return 'bg-primary';
      default: return 'bg-light text-dark';
    }
  }

  // CRUD Operations (logique conservée)
  ajouterCompetition(): void {
    this.router.navigate(['admin/competitions/ajouter']);
  }

  modifierCompetition(id: number): void {
    this.router.navigate(['/admin/competitions/modifier', id]);
  }

  supprimerCompetition(id: number): void {
    const competition = this.competitions.find(c => c.idReservation === id);
    const message = competition ? 
      `Êtes-vous sûr de vouloir supprimer la compétition "${competition.typeC}" ?` :
      'Êtes-vous sûr de vouloir supprimer cette compétition?';
    
    if (confirm(message)) {
      this.loading = true;
      this.competitionService.deleteCompetition(id).subscribe({
        next: () => {
          this.loadCompetitions();
          console.log(`Compétition ${id} supprimée avec succès`);
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression: ' + (err.message || 'Erreur inconnue');
          this.loading = false;
          console.error('Erreur suppression:', err);
        }
      });
    }
  }

  inscrire(idCompetition: number): void {
    this.inscriptionService.inscrireACompetition(idCompetition).subscribe({
      next: (message: string) => {
        alert("Inscription réussie: " + message);
      },
      error: (err) => {
        console.error(err);
        alert("Erreur lors de l'inscription.");
      }
    });
  }

  // Gestion des vues
  toggleView(): void {
    this.isCardView = !this.isCardView;
    localStorage.setItem('competition_view_preference', this.isCardView ? 'card' : 'table');
  }

  // Export des données
  exportToCSV(): void {
    try {
      const headers = ['ID', 'Type', 'Date Début', 'Date Fin', 'Participants', 'Heure', 'Piscine', 'Statut'];
      const csvData = this.filteredCompetitions.map(competition => [
        competition.idReservation,
        `"${competition.typeC}"`,
        new Date(competition.dateDebut).toLocaleDateString('fr-FR'),
        new Date(competition.dateFin).toLocaleDateString('fr-FR'),
        competition.nbrParticipants,
        competition.heure ? competition.heure.substring(0, 5) : 'Non définie',
        `"${competition.piscine?.nomPiscine || 'Non assigné'}"`,
        `"${this.getCompetitionStatus(competition)}"`
      ]);

      const csvContent = [headers.join(','), ...csvData.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `competitions_${new Date().getTime()}.csv`);
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

  // Méthodes utilitaires
  setupStickyFilters(): void {
    const filtersElement = document.querySelector('.sticky-filters');
    if (filtersElement) {
      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 100;
        filtersElement.classList.toggle('scrolled', scrolled);
      });
    }
  }

  initializeTooltips(): void {
    if (typeof (window as any).bootstrap !== 'undefined') {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
      });
    }
  }

  updateTooltips(): void {
    setTimeout(() => {
      this.initializeTooltips();
    }, 100);
  }

  checkCompetitionHealth(): void {
    const problemes: string[] = [];
    
    // Compétitions sans piscine
    const sansAssignation = this.competitions.filter(c => !c.piscine);
    if (sansAssignation.length > 0) {
      problemes.push(`${sansAssignation.length} compétition(s) sans piscine assignée`);
    }
    
    // Compétitions avec peu de participants
    const peuParticipants = this.competitions.filter(c => c.nbrParticipants < 5);
    if (peuParticipants.length > 0) {
      problemes.push(`${peuParticipants.length} compétition(s) avec moins de 5 participants`);
    }
    
    if (problemes.length > 0) {
      const message = 'Points d\'attention détectés:\n' + problemes.join('\n');
      console.warn(message);
    } else {
      console.log('Toutes les compétitions sont en bon état');
    }
  }

  // Raccourcis clavier
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
      event.preventDefault();
      this.loadCompetitions();
    }
  }

 
  
 
  getParticipantsBadgeClass(participants: number): string {
    if (participants < 20) return 'bg-success';
    if (participants < 50) return 'bg-warning';
    return 'bg-danger';
  }
  
  // Méthodes pour les statistiques
  
  
  
  // Navigation/actions
  
  
}