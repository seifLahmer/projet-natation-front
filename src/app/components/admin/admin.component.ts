import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/services/_services/auth.service';

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
  
  private routerSubscription!: Subscription;
  
  constructor(
    private http: HttpClient, 
    private router: Router,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      // Pour routes plates : vérifier si on est exactement sur /admin
      this.isChildRouteActive = event.url !== '/admin';
      
      // Charger les données seulement si on est sur la page principale admin
      if (event.url === '/admin') {
        this.loadChefsEnAttente();
        this.loadStats();
      }
    });
    
    // Chargement initial seulement si on est sur /admin
    if (this.router.url === '/admin') {
      this.loadChefsEnAttente();
      this.loadStats();
    }
  }

  loadChefsEnAttente(): void {
    this.loading = true;
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
          this.chefsEnAttente = [];
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
          this.stats = {
            chefsValides: 0,
            clubsEnregistres: 0
          };
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
    this.authService.logout();
  }
  
  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}