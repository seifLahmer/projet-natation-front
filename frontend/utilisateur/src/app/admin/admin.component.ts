import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgForm } from '@angular/forms';

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
  searchTerm: string = '';

  // Propriétés pour les alertes
  alertMessage: string = '';
  alertType: string = 'success';
  alertTimeout: any;

  // Propriétés pour le rejet
  showRejectConfirm = false;
  chefToReject: number | null = null;
  rejectMessage = '';

  @ViewChild('editForm') editForm!: NgForm;

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

  get filteredChefs(): any[] {
    if (!this.searchTerm) return this.chefsEnAttente;
    return this.chefsEnAttente.filter(chef =>
      chef.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      chef.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (chef.nomClub && chef.nomClub.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  loadChefsEnAttente(): void {
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
          this.showAlert('Erreur lors du chargement des chefs', 'error');
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
          console.error('Erreur:', err);
          this.showAlert('Erreur lors du chargement des statistiques', 'error');
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
          console.error('Erreur:', err);
          this.showAlert('Erreur lors du chargement des activités', 'error');
        }
      });
  }

  validerChef(id: number): void {
    this.http.post(`http://localhost:8082/api/admin/valider-chef/${id}`, {})
      .subscribe({
        next: () => {
          this.showAlert('Chef validé avec succès', 'success');
          this.loadChefsEnAttente();
          this.loadStats();
          this.loadLastActivities();
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.showAlert('Erreur lors de la validation', 'error');
        }
      });
  }

  rejeterChef(id: number): void {
    this.chefToReject = id;
    this.showRejectConfirm = true;
  }

  confirmReject(): void {
    if (this.chefToReject) {
      const body = this.rejectMessage ? { message: this.rejectMessage } : {};
      
      this.http.delete(`http://localhost:8082/api/admin/rejeter-chef/${this.chefToReject}`, { body })
        .subscribe({
          next: () => {
            this.showAlert('Chef rejeté avec succès', 'error');
            this.loadChefsEnAttente();
            this.loadStats();
            this.loadLastActivities();
          },
          error: (err) => {
            console.error('Erreur:', err);
            this.showAlert('Erreur lors du rejet', 'error');
          },
          complete: () => {
            this.cancelReject();
          }
        });
    }
  }

  cancelReject(): void {
    this.showRejectConfirm = false;
    this.chefToReject = null;
    this.rejectMessage = '';
  }

  modifierChef(chef: any): void {
    this.selectedChef = { ...chef };
    this.showEditModal = true;
  }

  saveModifications(): void {
    if (this.editForm.invalid) {
      this.showAlert('Veuillez corriger les erreurs dans le formulaire', 'error');
      return;
    }

    if (!this.isValidText(this.selectedChef.nom)) {
      this.showAlert('Le nom ne doit contenir que des lettres', 'error');
      return;
    }

    if (!this.isValidText(this.selectedChef.prenom)) {
      this.showAlert('Le prénom ne doit contenir que des lettres', 'error');
      return;
    }

    if (this.selectedChef.nomClub && !this.isValidClubName(this.selectedChef.nomClub)) {
      this.showAlert('Le nom du club contient des caractères invalides', 'error');
      return;
    }

    this.http.put(`http://localhost:8082/api/admin/modifier-chef/${this.selectedChef.id}`, this.selectedChef)
      .subscribe({
        next: () => {
          this.showAlert('Chef modifié avec succès', 'success');
          this.loadChefsEnAttente();
          this.loadStats();
          this.loadLastActivities();
          this.showEditModal = false;
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.showAlert('Erreur lors de la modification', 'error');
        }
      });
  }

  private isValidText(text: string): boolean {
    return /^[a-zA-ZÀ-ÿ\s\-']+$/.test(text);
  }

  private isValidClubName(name: string): boolean {
    return /^[a-zA-ZÀ-ÿ0-9\s\-']+$/.test(name);
  }

  showAlert(message: string, type: string = 'success', duration: number = 5000): void {
    this.alertMessage = message;
    this.alertType = type;
    
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    
    this.alertTimeout = setTimeout(() => {
      this.dismissAlert();
    }, duration);
  }

  dismissAlert(): void {
    this.alertMessage = '';
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
      this.alertTimeout = null;
    }
  }

  logout(): void {
    this.router.navigate(['/login']);
  }
}