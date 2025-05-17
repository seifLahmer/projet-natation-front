// ajout-resultat.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/models/user';
import { Competition } from 'src/app/models/competition';
import { Resultat } from 'src/app/models/resultat';
import { ResultatService } from 'src/app/services/resultat/resultat.service';
import { TypeCompetition } from 'src/app/models/competition';

@Component({
  selector: 'app-ajout-resultat',
  templateUrl: './ajouter-resultat.component.html',
  styleUrls: ['./ajouter-resultat.component.scss']
})
export class AjoutResultatComponent implements OnInit {
  // Étape actuelle (1, 2, 3)
  currentStep: number = 1;
  
  // Formulaires pour chaque étape
  userFilterForm: FormGroup;
  competitionForm: FormGroup;
  resultatForm: FormGroup;
  
  // Données
  users: User[] = [];
  competitions: Competition[] = [];
  filteredUsers: User[] = [];
  filteredCompetitions: Competition[] = [];
  
  // Sélections
  selectedUser: User | null = null;
  selectedCompetition: Competition | null = null;
  
  // Filtre utilisateurs
  searchTerm: string = '';
  filterNation: string = '';
  filterClub: string = '';
  
  // Filtre compétitions
  competitionTypes = Object.values(TypeCompetition);
  selectedType: string = '';
  
  // État de chargement
  loading = false;
  
  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private resultatService: ResultatService
  ) {
    // Initialisation des formulaires
    this.userFilterForm = this.fb.group({
      searchTerm: [''],
      nation: [''],
      club: ['']
    });
    
    this.competitionForm = this.fb.group({
      type: ['', Validators.required]
    });
    
    this.resultatForm = this.fb.group({
      place: [null, [Validators.required, Validators.min(1)]],
      temps: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}\.\d{2}$/)]],
      points: [null, [Validators.required, Validators.min(0)]],
      tempsDePassage: ['']
    });
  }
  
  ngOnInit(): void {
    // Chargement initial des utilisateurs
    this.loadUsers();
    
    // Chargement initial des compétitions
    this.loadCompetitions();
    
    // Abonnement aux changements de filtre utilisateur
    this.userFilterForm.valueChanges.subscribe(() => {
      this.filterUsers();
    });
  }
  
  // Fonction pour charger les utilisateurs
  loadUsers(): void {
    this.loading = true;
    this.http.get<User[]>('http://localhost:8082/api/users').subscribe(
      (data) => {
        this.users = data;
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      (error) => {
        console.error('Error loading users', error);
        this.loading = false;
      }
    );
  }
  
  // Fonction pour charger les compétitions
  loadCompetitions(): void {
    this.loading = true;
    this.http.get<Competition[]>('http://localhost:8082/api/competitions').subscribe(
      (data) => {
        this.competitions = data;
        this.filteredCompetitions = [...this.competitions];
        this.loading = false;
      },
      (error) => {
        console.error('Error loading competitions', error);
        this.loading = false;
      }
    );
  }
  
  // Filtrer les utilisateurs selon les critères
  filterUsers(): void {
    const { searchTerm, nation, club } = this.userFilterForm.value;
    
    this.filteredUsers = this.users.filter(user => {
      // Filtre de recherche (nom, prénom, email)
      const matchSearch = !searchTerm || 
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par nationalité
      const matchNation = !nation || user.nation === nation;
      
      // Filtre par club
      const matchClub = !club || user.nomClub.toLowerCase().includes(club.toLowerCase());
      
      return matchSearch && matchNation && matchClub;
    });
  }
  
  // Filtrer les compétitions par type
  filterCompetitions(): void {
    const type = this.competitionForm.get('type')?.value;
    
    if (!type) {
      this.filteredCompetitions = [...this.competitions];
      return;
    }
    
    this.filteredCompetitions = this.competitions.filter(comp => 
      comp.typeC === type
    );
  }
  
  // Sélection d'un utilisateur
  selectUser(user: User): void {
    this.selectedUser = user;
  }
  
  // Sélection d'une compétition
  selectCompetition(competition: Competition): void {
    this.selectedCompetition = competition;
  }
  
  // Passer à l'étape suivante
  nextStep(): void {
    if (this.currentStep === 1 && this.selectedUser) {
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.selectedCompetition) {
      this.currentStep = 3;
    }
  }
  
  // Retour à l'étape précédente
  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  // Extraction des nationalités uniques pour le filtre
  get uniqueNations(): string[] {
    return [...new Set(this.users.map(user => user.nation))].filter(Boolean);
  }
  
  // Extraction des clubs uniques pour le filtre
  get uniqueClubs(): string[] {
    return [...new Set(this.users.map(user => user.nomClub))].filter(Boolean);
  }
  
  // Soumission du formulaire
  submitForm(): void {
    if (this.resultatForm.valid && this.selectedUser && this.selectedCompetition) {
      const formData = this.resultatForm.value;
      
      const resultat: Resultat = {
        place: formData.place,
        temps: formData.temps,
        points: formData.points,
        tempsDePassage: formData.tempsDePassage,
        user: this.selectedUser,
        competition: this.selectedCompetition
      };
      
      this.loading = true;
      this.resultatService.createResultat(resultat).subscribe(
        (response) => {
          alert('Résultat enregistré avec succès !');
          this.resetForm();
          this.loading = false;
        },
        (error) => {
          console.error('Erreur lors de la création du résultat', error);
          alert('Erreur lors de l\'enregistrement du résultat');
          this.loading = false;
        }
      );
    }
  }
  
  // Réinitialisation du formulaire
  resetForm(): void {
    this.currentStep = 1;
    this.selectedUser = null;
    this.selectedCompetition = null;
    this.userFilterForm.reset();
    this.competitionForm.reset();
    this.resultatForm.reset();
  }
}