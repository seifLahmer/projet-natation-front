import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/models/user';
import { Competition, TypeCompetition } from 'src/app/models/competition';
import { Resultat } from 'src/app/models/resultat';
import { ResultatService } from 'src/app/services/resultat/resultat.service';
import { CompetitionService } from 'src/app/services/competition.service'; // Nouveau service
import { Observable } from 'rxjs';
@Component({
  selector: 'app-ajout-resultat',
  templateUrl: './ajouter-resultat.component.html',
  styleUrls: ['./ajouter-resultat.component.scss']
})
export class AjoutResultatComponent implements OnInit {
  currentStep: number = 1;

  // Formulaires
  userFilterForm: FormGroup;
  competitionForm: FormGroup;
  resultatForm: FormGroup;

  // Données
  competitions: Competition[] = [];
  filteredCompetitions: Competition[] = [];
  
  // Utilisateurs inscrits à la compétition sélectionnée
  registeredUsers: User[] = [];
  filteredUsers: User[] = [];

  // Sélections
  selectedUser: User | null = null;
  selectedCompetition: Competition | null = null;

  // Filtres
  competitionTypes = Object.values(TypeCompetition);

  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private resultatService: ResultatService,
    private competitionService: CompetitionService // Injection du nouveau service
  ) {
    // Initialisation des formulaires
    this.userFilterForm = this.fb.group({
      searchTerm: [''],
      nation: [''],
      club: ['']
    });

    this.competitionForm = this.fb.group({
      type: ['']
    });

    this.resultatForm = this.fb.group({
      place: [null, [Validators.required, Validators.min(1)]],
      temps: ['', [Validators.required, Validators.pattern(/^\d{2}:\d{2}\.\d{2}$/)]],
      points: [null, [Validators.required, Validators.min(0)]],
      tempsDePassage: ['']
    });
  }

  ngOnInit(): void {
    this.loadCompetitions();

    // Filtrage des compétitions quand le type change
    this.competitionForm.valueChanges.subscribe(() => {
      this.filterCompetitions();
    });

    // Filtrage des utilisateurs quand les filtres changent
    this.userFilterForm.valueChanges.subscribe(() => {
      this.filterUsers();
    });
  }

  // Étapes
  nextStep(): void {
    if (this.currentStep === 1 && this.selectedCompetition) {
      console.log('Compétition sélectionnée:', this.selectedCompetition);
      console.log('ID de la compétition:', this.selectedCompetition.idReservation);
      
      // Charger les utilisateurs inscrits à cette compétition
      this.loadRegisteredUsers(this.selectedCompetition.idReservation);
      this.currentStep = 2;
    } else if (this.currentStep === 2 && this.selectedUser) {
      this.currentStep = 3;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Chargement des compétitions avec le service
  loadCompetitions(): void {
    this.loading = true;
    this.competitionService.getAllCompetitions().subscribe({
      next: (data) => {
        console.log('Compétitions chargées:', data);
        this.competitions = data;
        this.filteredCompetitions = [...this.competitions];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des compétitions:', error);
        this.loading = false;
      }
    });
  }
  apiUrl = 'http://localhost:8082/api/competitions'
  // Nouvelle méthode : Charger les utilisateurs inscrits à une compétition// Cette méthode va dans votre COMPOSANT (ajouter-resultat.component.ts)
// Pas dans le service !
 getUsersByCompetitionId(competitionId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${competitionId}/users`);
  }
loadRegisteredUsers(competitionId: number): void {
  this.loading = true;
  console.log('Chargement des utilisateurs pour la compétition ID:', competitionId);
  
 this.getUsersByCompetitionId(competitionId).subscribe({
    next: (data) => {
      console.log('Utilisateurs inscrits chargés:', data);
      this.registeredUsers = data;
      this.filteredUsers = [...this.registeredUsers];
      this.loading = false;
      
      if (data.length === 0) {
        console.warn('Aucun utilisateur inscrit pour cette compétition');
      }
    },
    error: (error) => {
      console.error('Erreur lors du chargement des utilisateurs inscrits:', error);
      this.registeredUsers = [];
      this.filteredUsers = [];
      this.loading = false;
    }
  });
}

  // Filtres - Modifié pour utiliser registeredUsers
  filterUsers(): void {
    const { searchTerm, nation, club } = this.userFilterForm.value;

    this.filteredUsers = this.registeredUsers.filter(user => {
      const matchSearch = !searchTerm ||
        user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchNation = !nation || user.nation === nation;
      const matchClub = !club || user.nomClub.toLowerCase().includes(club.toLowerCase());

      return matchSearch && matchNation && matchClub;
    });
  }

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

  // Sélections
  selectUser(user: User): void {
    this.selectedUser = user;
    console.log('Utilisateur sélectionné:', user);
  }

  selectCompetition(competition: Competition): void {
    this.selectedCompetition = competition;
    console.log('Compétition sélectionnée:', competition);
  }

  // Soumission
  submitForm(): void {
    if (this.resultatForm.valid && this.selectedUser && this.selectedCompetition) {
      const formData = this.resultatForm.value;
  
      // Formatter le temps (on laisse tel quel car il est de type string dans l'entité)
      const formattedTemps = this.formatChrono(formData.temps);
  
      // Formatter tempsDePassage en "HH:mm:ss.SSS"
      const formattedTempsDePassage = this.formatToLocalTime(formData.tempsDePassage);
  
      const resultat: Resultat = {
        place: formData.place,
        temps: formattedTemps,
        points: formData.points,
        tempsDePassage: formattedTempsDePassage,
        utilisateurs: this.selectedUser,
        competition: this.selectedCompetition
      };
      console.log('Résultat à soumettre:', resultat);
  
      this.loading = true;
      this.resultatService.createResultat(resultat).subscribe({
        next: (response) => {
          console.log('Résultat créé avec succès:', response);
          alert('Résultat enregistré avec succès !');
          this.resetForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la création du résultat:', error);
          alert('Erreur lors de l\'enregistrement du résultat');
          this.loading = false;
        }
      });
    }
  }
  
  // Exemple : "58.54" → "00:00:58.540"
  formatToLocalTime(input: string): string {
    // Supposons que l'utilisateur entre "58.450"
    const [secondes, millisecondes] = input.split('.');
    const paddedMillis = millisecondes?.padEnd(3, '0') ?? '000';
    
    // Retourne un format LocalTime valide : HH:mm:ss.SSS
    return `00:00:${secondes.padStart(2, '0')}.${paddedMillis}`;
  }
  
  // Facultatif : permet de forcer un format sur le champ "temps" si nécessaire
  formatChrono(input: string): string {
    return input; // ici on laisse tel quel, ex : "00:58.45"
  }

  // Réinitialisation
  resetForm(): void {
    this.currentStep = 1;
    this.selectedUser = null;
    this.selectedCompetition = null;
    this.registeredUsers = [];
    this.userFilterForm.reset();
    this.competitionForm.reset();
    this.resultatForm.reset();
    this.filteredCompetitions = [...this.competitions];
    this.filteredUsers = [];
  }

  // Helpers - Modifiés pour utiliser registeredUsers
  get uniqueNations(): string[] {
    return [...new Set(this.registeredUsers.map(user => user.nation))].filter(Boolean);
  }

  get uniqueClubs(): string[] {
    return [...new Set(this.registeredUsers.map(user => user.nomClub))].filter(Boolean);
  }
}