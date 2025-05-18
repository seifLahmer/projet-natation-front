import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [DatePipe]
})
export class AdminComponent implements OnInit, OnDestroy {
  chefsEnAttente: any[] = [];
  lastActivities: any[] = [];
  showEditModal = false;
  selectedChef: any = null;
  isChildRouteActive = false;
  stats: any = {
    chefsValides: 0,
    clubsEnregistres: 0
  };
  loading = false;
  
  // Déclarer la variable de souscription mais ne pas l'injecter dans le constructeur
  private routerSubscription!: Subscription;
  
  constructor(
    private http: HttpClient, 
    private router: Router,
    private datePipe: DatePipe
    // Retiré l'injection de routerSubscription
  ) {}

  ngOnInit(): void {
    // Utiliser filter avec une assertion de type pour garantir que l'événement est de type NavigationEnd
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.isChildRouteActive = event.url !== '/admin';
    });
    
    this.loadChefsEnAttente();
    this.loadStats();
    this.loadLastActivities();
  }

  loadChefsEnAttente(): void {
    this.loading = true; // Définir loading à true avant la requête
    this.http.get<any[]>('http://localhost:8082/api/admin/chefs-a-valider')
      .subscribe({
        next: (data) => {
          this.chefsEnAttente = data.map(chef => ({
            ...chef,
            documentPath: chef.documentPath ? 
                        `http://localhost:8082${chef.documentPath}` : 
                        null
          }));
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          // Gérer l'erreur plus efficacement
          this.chefsEnAttente = []; // Tableau vide en cas d'erreur
        }
      });
  }

  loadStats(): void {
    this.http.get<any>('http://localhost:8082/api/admin/stats')
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des statistiques:', err);
          // Utiliser des valeurs par défaut en cas d'erreur
          this.stats = {
            chefsValides: 0,
            clubsEnregistres: 0
          };
        }
      });
  }

  loadLastActivities(): void {
    this.http.get<any[]>('http://localhost:8082/api/admin/activities')
      .subscribe({
        next: (data) => {
          this.lastActivities = data;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des activités:', err);
          // Utiliser des données fictives en cas d'erreur
          this.lastActivities = [{ action: 'Aucune activité récente disponible' }];
        }
      });
  }

  validerChef(id: number): void {
    this.http.post(`http://localhost:8082/api/admin/valider-chef/${id}`, {})
      .subscribe({
        next: () => {
          alert('Chef validé avec succès');
          this.loadChefsEnAttente();
          this.loadStats();
          this.loadLastActivities();
        },
        error: (err) => {
          console.error('Erreur lors de la validation:', err);
          alert('Erreur lors de la validation');
        }
      });
  }

  rejeterChef(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir rejeter ce chef de club ?')) {
      this.http.delete(`http://localhost:8082/api/admin/rejeter-chef/${id}`)
        .subscribe({
          next: () => {
            alert('Chef rejeté avec succès');
            this.loadChefsEnAttente();
            this.loadStats();
            this.loadLastActivities();
          },
          error: (err) => {
            console.error('Erreur lors du rejet:', err);
            alert('Erreur lors du rejet');
          }
        });
    }
  }

  modifierChef(chef: any): void {
    this.selectedChef = {...chef};
    this.showEditModal = true;
  }

  saveModifications(): void {
    if (!this.selectedChef) {
      alert('Aucun chef sélectionné');
      return;
    }
    
    this.http.put(`http://localhost:8082/api/admin/modifier-chef/${this.selectedChef.id}`, this.selectedChef)
      .subscribe({
        next: () => {
          alert('Chef modifié avec succès');
          this.loadChefsEnAttente();
          this.showEditModal = false;
        },
        error: (err) => {
          console.error('Erreur lors de la modification:', err);
          alert('Erreur lors de la modification');
        }
      });
  }

  logout(): void {
    // Ici, vous pourriez ajouter la logique de déconnexion avant la navigation
    localStorage.removeItem('token'); // Si vous stockez un token
    this.router.navigate(['/login']);
  }
  
  ngOnDestroy() {
    // Nettoyage pour éviter les fuites de mémoire
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}