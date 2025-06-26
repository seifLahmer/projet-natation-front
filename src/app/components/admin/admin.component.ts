import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Router, NavigationEnd, Event } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from 'src/app/services/_services/auth.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [DatePipe]
})
export class AdminComponent implements OnInit, OnDestroy {
  chefsEnAttente: any[] = [];
  filteredChefs: any[] = [];
  lastActivities: any[] = [];
  showEditModal = false;
  selectedChef: any = null;
  isChildRouteActive = false;
  searchTerm: string = '';
  stats: any = {
    chefsValides: 0,
    clubsEnregistres: 0,
    totalChefs: 0,
    totalClubs: 0
  };
  loading = false;
  chart: any;
  currentPage = 1;
  itemsPerPage = 10;
  sortDirection: { [key: string]: 'asc' | 'desc' } = {};
  
  private routerSubscription!: Subscription;
  
  constructor(
    private http: HttpClient, 
    private router: Router,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.isChildRouteActive = event.url !== '/admin';
      
      if (event.url === '/admin') {
        this.loadChefsEnAttente();
        this.loadStats();
      }
    });
    
    if (this.router.url === '/admin') {
      this.loadChefsEnAttente();
      this.loadStats();
    }
    this.loadLastActivities();
  }

  getActivityIcon(action: string): string {
    const iconMap: {[key: string]: string} = {
      'validation': 'fas fa-user-check',
      'creation': 'fas fa-plus-circle',
      'modification': 'fas fa-edit',
      'suppression': 'fas fa-trash-alt',
      'connexion': 'fas fa-sign-in-alt',
      'deconnexion': 'fas fa-sign-out-alt',
      'enregistrement': 'fas fa-save',
      'telechargement': 'fas fa-download',
      'upload': 'fas fa-upload'
    };

    // Par défaut, retourne une icône générique si l'action n'est pas dans la map
    return iconMap[action.toLowerCase()] || 'fas fa-info-circle';
  }

  get totalPages(): number {
    return Math.ceil(this.filteredChefs.length / this.itemsPerPage);
  }

  getChefsPercentage(): number {
    if (this.stats.totalChefs === 0) return 0;
    return Math.round((this.stats.chefsValides / this.stats.totalChefs) * 100);
  }

  getClubsPercentage(): number {
    if (this.stats.totalClubs === 0) return 0;
    return Math.round((this.stats.clubsEnregistres / this.stats.totalClubs) * 100);
  }

  getPendingPercentage(): number {
    const total = this.stats.chefsValides + this.chefsEnAttente.length;
    if (total === 0) return 0;
    return Math.round((this.chefsEnAttente.length / total) * 100);
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
          this.filteredChefs = [...this.chefsEnAttente];
          this.loading = false;
          this.createChart();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
          this.chefsEnAttente = [];
          this.filteredChefs = [];
        }
      });
  }

  createChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = document.getElementById('statsChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Chefs validés', 'Clubs enregistrés', 'Demandes en attente'],
        datasets: [{
          label: 'Statistiques',
          data: [
            this.stats.chefsValides || 0, 
            this.stats.clubsEnregistres || 0, 
            this.chefsEnAttente.length || 0
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Statistiques des chefs et clubs',
            font: {
              size: 16
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1
            }
          }
        }
      }
    });
  }

  filterChefs(): void {
    if (!this.searchTerm) {
      this.filteredChefs = [...this.chefsEnAttente];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredChefs = this.chefsEnAttente.filter(chef => 
      chef.nom.toLowerCase().includes(term) || 
      chef.prenom.toLowerCase().includes(term) ||
      (chef.nom + ' ' + chef.prenom).toLowerCase().includes(term)
    );
    this.currentPage = 1;
  }

  sortColumn(column: string): void {
    this.sortDirection[column] = this.sortDirection[column] === 'asc' ? 'desc' : 'asc';
    
    this.filteredChefs.sort((a, b) => {
      const valueA = a[column]?.toString().toLowerCase() || '';
      const valueB = b[column]?.toString().toLowerCase() || '';
      
      if (valueA < valueB) {
        return this.sortDirection[column] === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection[column] === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  loadStats(): void {
    this.http.get<any>('http://localhost:8082/api/admin/stats')
      .subscribe({
        next: (data) => {
          this.stats = {
            ...data,
            totalChefs: data.chefsValides + data.chefsEnAttente,
            totalClubs: data.clubsEnregistres + data.clubsEnAttente
          };
          if (this.chefsEnAttente.length > 0) {
            this.createChart();
          }
        },
        error: (err) => {
          console.error('Erreur lors du chargement des statistiques:', err);
          this.stats = {
            chefsValides: 0,
            clubsEnregistres: 0,
            totalChefs: 0,
            totalClubs: 0
          };
        }
      });
  }

  validerChef(id: number): void {
    this.http.post(`http://localhost:8082/api/admin/valider-chef/${id}`, {})
      .subscribe({
        next: () => {
          this.showToast('Chef validé avec succès', 'success');
          this.loadChefsEnAttente();
          this.loadStats();
        },
        error: (err) => {
          console.error('Erreur lors de la validation:', err);
          this.showToast('Erreur lors de la validation', 'error');
        }
      });
  }

  rejeterChef(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir rejeter ce chef de club ?')) {
      this.http.delete(`http://localhost:8082/api/admin/rejeter-chef/${id}`)
        .subscribe({
          next: () => {
            this.showToast('Chef rejeté avec succès', 'success');
            this.loadChefsEnAttente();
            this.loadStats();
          },
          error: (err) => {
            console.error('Erreur lors du rejet:', err);
            this.showToast('Erreur lors du rejet', 'error');
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
      this.showToast('Aucun chef sélectionné', 'warning');
      return;
    }
    
    this.http.put(`http://localhost:8082/api/admin/modifier-chef/${this.selectedChef.id}`, this.selectedChef)
      .subscribe({
        next: () => {
          this.showToast('Chef modifié avec succès', 'success');
          this.loadChefsEnAttente();
          this.showEditModal = false;
        },
        error: (err) => {
          console.error('Erreur lors de la modification:', err);
          this.showToast('Erreur lors de la modification', 'error');
        }
      });
  }

  showToast(message: string, type: 'success' | 'error' | 'warning'): void {
    // Implémentez votre système de toast ou utilisez une librairie
    alert(`${type.toUpperCase()}: ${message}`);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  logout(): void {
    this.authService.logout();
  }
  
  loadLastActivities(): void {
    this.http.get<any[]>('http://localhost:8082/api/admin/activities')
      .subscribe({
        next: (data) => {
          this.lastActivities = data;
        },
        error: (err) => {
          console.error('Erreur:', err);
        }
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.chart) {
      this.chart.destroy();
    }
  }
}