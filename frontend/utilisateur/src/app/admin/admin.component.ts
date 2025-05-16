import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [DatePipe]
})
export class AdminComponent implements OnInit {
  chefsEnAttente: any[] = [];
  loading = true;
  stats: any = {};
  lastActivities: any[] = [];
  showEditModal = false;
  selectedChef: any = null;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadChefsEnAttente();
    this.loadStats();
    this.loadLastActivities();
  }

  loadChefsEnAttente(): void {
    this.http.get<any[]>('http://localhost:8080/api/admin/chefs-a-valider')
      .subscribe({
        next: (data) => {
          this.chefsEnAttente = data.map(chef => ({
            ...chef,
            documentPath: chef.documentPath ? 
                        `http://localhost:8080${chef.documentPath}` : 
                        null
          }));
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.loading = false;
        }
      });
  }

  loadStats(): void {
    this.http.get<any>('http://localhost:8080/api/admin/stats')
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => {
          console.error('Erreur:', err);
        }
      });
  }

  loadLastActivities(): void {
    this.http.get<any[]>('http://localhost:8080/api/admin/activities')
      .subscribe({
        next: (data) => {
          this.lastActivities = data;
        },
        error: (err) => {
          console.error('Erreur:', err);
        }
      });
  }

  validerChef(id: number): void {
    this.http.post(`http://localhost:8080/api/admin/valider-chef/${id}`, {})
      .subscribe({
        next: () => {
          alert('Chef validé avec succès');
          this.loadChefsEnAttente();
          this.loadStats();
          this.loadLastActivities();
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de la validation');
        }
      });
  }

  rejeterChef(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir rejeter ce chef de club ?')) {
      this.http.delete(`http://localhost:8080/api/admin/rejeter-chef/${id}`)
        .subscribe({
          next: () => {
            alert('Chef rejeté avec succès');
            this.loadChefsEnAttente();
            this.loadStats();
            this.loadLastActivities();
          },
          error: (err) => {
            console.error('Erreur:', err);
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
    this.http.put(`http://localhost:8080/api/admin/modifier-chef/${this.selectedChef.id}`, this.selectedChef)
      .subscribe({
        next: () => {
          alert('Chef modifié avec succès');
          this.loadChefsEnAttente();
          this.showEditModal = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          alert('Erreur lors de la modification');
        }
      });
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}