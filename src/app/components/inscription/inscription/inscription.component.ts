import { Component } from '@angular/core';
import { Inscription } from 'src/app/models/inscription';
import { InscriptionService } from 'src/app/services/inscription/inscriptions.service';
import { StatutInscription } from 'src/app/models/inscription';
import { Competition } from 'src/app/models/competition';
declare var bootstrap: any;

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent {
  
  inscriptions: Inscription[] = [];
  StatutInscription = StatutInscription;
  userId: number = 3; // À récupérer dynamiquement selon l'utilisateur connecté
  role: string = 'ADMIN'; // À récupérer dynamiquement aussi
  filteredInscriptions: any[] = [];
  
  // Variables de filtrage
  selectedStatut: string = 'TOUS';
  selectedTypeCompetition: string = 'TOUS';
  selectedPeriode: string = 'TOUS';
  searchTerm: string = '';
  
  // Options de recherche avancée
  searchOptions = {
    id: true,
    typeCompetition: true,
    dateInscription: true,
    dateCompetition: true
  };
  
  // Variables de tri
  selectedTriCritere: string = 'DATE_DESC';
  
  // Données pour les listes déroulantes
  typesCompetition: string[] = [];
  
  selectedCompetition: Competition | null = null;
  
  constructor(private inscriptionService: InscriptionService) {}

  ngOnInit(): void {
    this.inscriptionService.getInscriptions(this.userId, this.role).subscribe({
      next: (data) => {
        // Ajout dynamique de la propriété `nouveauStatut` uniquement pour les inscriptions en attente
        this.inscriptions = data.map(ins => ({
          ...ins,
          nouveauStatut: ins.statut === StatutInscription.EN_ATTENTE ? ins.statut : undefined
        }));
        
        // Extraire les types de compétition uniques
        this.extractTypesCompetition();
        
        // Appliquer les filtres et tris
        this.appliquerFiltresEtTris();
      },
      error: (err) => console.error('Erreur lors de la récupération des inscriptions :', err)
    });
  }
  
  extractTypesCompetition(): void {
    const typesSet = new Set<string>();
    this.inscriptions.forEach(ins => {
      if (ins.competition && ins.competition.typeC) {
        typesSet.add(ins.competition.typeC);
      }
    });
    this.typesCompetition = Array.from(typesSet).sort();
  }
  
  appliquerFiltresEtTris(): void {
    let resultats = [...this.inscriptions];
    
    // Filtre par statut
    if (this.selectedStatut !== 'TOUS') {
      resultats = resultats.filter(ins => ins.statut === this.selectedStatut);
    }
    
    // Filtre par type de compétition
    if (this.selectedTypeCompetition !== 'TOUS') {
      resultats = resultats.filter(ins => 
        ins.competition && ins.competition.typeC === this.selectedTypeCompetition
      );
    }
    
    // Filtre par période
    if (this.selectedPeriode !== 'TOUS') {
      resultats = this.filtrerParPeriode(resultats);
    }
    
    // Recherche textuelle avancée
    if (this.searchTerm) {
      resultats = this.rechercheAvancee(resultats);
    }
    
    // Tri
    resultats = this.trierInscriptions(resultats);
    
    this.filteredInscriptions = resultats;
  }
  
  rechercheAvancee(inscriptions: any[]): any[] {
    const searchLower = this.searchTerm.toLowerCase();
    
    return inscriptions.filter(ins => {
      let matches = false;
      
      // Recherche par ID si activée
      if (this.searchOptions.id) {
        if (ins.idInscription.toString().includes(searchLower) || 
            searchLower.startsWith('#') && ins.idInscription.toString().includes(searchLower.substring(1))) {
          matches = true;
        }
      }
      
      // Recherche par type de compétition si activée
      if (this.searchOptions.typeCompetition && ins.competition) {
        if (ins.competition.typeC.toLowerCase().includes(searchLower)) {
          matches = true;
        }
      }
      
      // Recherche par date d'inscription si activée
      if (this.searchOptions.dateInscription) {
        const dateInscStr = this.formatDateForSearch(new Date(ins.dateInscription));
        if (dateInscStr.includes(searchLower)) {
          matches = true;
        }
      }
      
      // Recherche par date de compétition si activée
      if (this.searchOptions.dateCompetition && ins.competition) {
        const dateCompStr = this.formatDateForSearch(new Date(ins.competition.dateDebut));
        if (dateCompStr.includes(searchLower)) {
          matches = true;
        }
      }
      
      return matches;
    });
  }
  
  formatDateForSearch(date: Date): string {
    const options: any = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      locale: 'fr-FR'
    };
    return date.toLocaleDateString('fr-FR', options).toLowerCase();
  }
  
  filtrerParPeriode(inscriptions: any[]): any[] {
    const maintenant = new Date();
    const today = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    
    switch (this.selectedPeriode) {
      case 'AUJOURD_HUI':
        return inscriptions.filter(ins => {
          const dateInsc = new Date(ins.dateInscription);
          const dateInscDay = new Date(dateInsc.getFullYear(), dateInsc.getMonth(), dateInsc.getDate());
          return dateInscDay.getTime() === today.getTime();
        });
        
      case 'CETTE_SEMAINE':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return inscriptions.filter(ins => {
          const dateInsc = new Date(ins.dateInscription);
          return dateInsc >= startOfWeek && dateInsc <= endOfWeek;
        });
        
      case 'CE_MOIS':
        const startOfMonth = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
        const endOfMonth = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0);
        
        return inscriptions.filter(ins => {
          const dateInsc = new Date(ins.dateInscription);
          return dateInsc >= startOfMonth && dateInsc <= endOfMonth;
        });
        
      case 'MOIS_DERNIER':
        const startOfLastMonth = new Date(maintenant.getFullYear(), maintenant.getMonth() - 1, 1);
        const endOfLastMonth = new Date(maintenant.getFullYear(), maintenant.getMonth(), 0);
        
        return inscriptions.filter(ins => {
          const dateInsc = new Date(ins.dateInscription);
          return dateInsc >= startOfLastMonth && dateInsc <= endOfLastMonth;
        });
        
      default:
        return inscriptions;
    }
  }
  
  trierInscriptions(inscriptions: any[]): any[] {
    return inscriptions.sort((a, b) => {
      switch (this.selectedTriCritere) {
        case 'DATE_DESC':
          return new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime();
          
        case 'DATE_ASC':
          return new Date(a.dateInscription).getTime() - new Date(b.dateInscription).getTime();
          
        case 'STATUT':
          const getStatutOrder = (statut: any): number => {
            switch (statut) {
              case StatutInscription.EN_ATTENTE: return 1;
              case StatutInscription.CONFIRMEE: return 2;
              case StatutInscription.REJETEE: return 3;
              default: return 999; // Pour les statuts inconnus
            }
          };
          return getStatutOrder(a.statut) - getStatutOrder(b.statut);
          
        case 'TYPE_COMPETITION':
          if (!a.competition || !b.competition) return 0;
          return a.competition.typeC.localeCompare(b.competition.typeC);
          
        case 'DATE_COMPETITION':
          if (!a.competition || !b.competition) return 0;
          return new Date(a.competition.dateDebut).getTime() - new Date(b.competition.dateDebut).getTime();
          
        default:
          return 0;
      }
    });
  }
  
  clearSearch(): void {
    this.searchTerm = '';
    this.appliquerFiltresEtTris();
  }
  
  toggleAllSearch(): void {
    const allChecked = Object.values(this.searchOptions).every(val => val);
    Object.keys(this.searchOptions).forEach(key => {
      (this.searchOptions as any)[key] = !allChecked;
    });
    this.appliquerFiltresEtTris();
  }
  
  // Recherches rapides prédéfinies
  rechercheRapide(type: string): void {
    this.resetFilters();
    
    switch (type) {
      case 'en_attente':
        this.selectedStatut = StatutInscription.EN_ATTENTE;
        break;
      case 'validees':
        this.selectedStatut = StatutInscription.CONFIRMEE;
        break;
      case 'rejetees':
        this.selectedStatut = StatutInscription.REJETEE;
        break;
      case 'cette_semaine':
        this.selectedPeriode = 'CETTE_SEMAINE';
        break;
      case 'competitions_bientot':
        this.selectedTriCritere = 'DATE_COMPETITION';
        // Filtrer les compétitions dans les 7 prochains jours
        const dans7jours = new Date();
        dans7jours.setDate(dans7jours.getDate() + 7);
        this.searchTerm = dans7jours.getFullYear().toString();
        break;
    }
    
    this.appliquerFiltresEtTris();
  }
  
  resetFilters(): void {
    this.selectedStatut = 'TOUS';
    this.selectedTypeCompetition = 'TOUS';
    this.selectedPeriode = 'TOUS';
    this.searchTerm = '';
  }
  
  resetAllFilters(): void {
    this.resetFilters();
    this.selectedTriCritere = 'DATE_DESC';
    this.searchOptions = {
      id: true,
      typeCompetition: true,
      dateInscription: true,
      dateCompetition: true
    };
    this.appliquerFiltresEtTris();
  }
  
  getCountByStatut(statut: string): number {
    return this.inscriptions.filter(ins => ins.statut === statut).length;
  }
  
  // Ancienne méthode conservée pour compatibilité
  filtrerParStatut(): void {
    this.appliquerFiltresEtTris();
  }
  
  ouvrirModal(idInscription: number): void {
    this.inscriptionService.getCompetitionParInscriptionId(idInscription).subscribe({
      next: (competition) => {
        this.selectedCompetition = competition;
        setTimeout(() => {
          const modalEl = document.getElementById('competitionModal');
          if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            modal.show();
          }
        }, 100);
      },
      error: (err) => console.error('Erreur récupération compétition :', err)
    });
  }
  
  mettreAJourStatut(inscription: any): void {
    if (inscription.statut !== StatutInscription.EN_ATTENTE) {
      alert("❌ Cette inscription ne peut plus être modifiée car elle a déjà été traitée.");
      return;
    }
    
    if (!inscription.nouveauStatut || inscription.nouveauStatut === inscription.statut) {
      alert("Veuillez sélectionner un statut différent.");
      return;
    }
  
    this.inscriptionService.changerStatut(inscription.idInscription, inscription.nouveauStatut)
      .subscribe({
        next: (msg) => {
          alert("✅ " + msg);
          inscription.statut = inscription.nouveauStatut;
          delete inscription.nouveauStatut;
          this.appliquerFiltresEtTris();
        },
        error: (err) => {
          console.error(err);
          alert("❌ Erreur lors de la mise à jour du statut.");
        }
      });
  }
}