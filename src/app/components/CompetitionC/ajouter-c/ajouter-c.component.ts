import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompetitionService } from 'src/app/services/competition/competition.service';
import { Competition } from 'src/app/models/competition';
import { Piscine } from 'src/app/models/piscine';
import { PiscineService } from 'src/app/services/piscine/piscine.service';

@Component({
  selector: 'app-ajouter-c',
  templateUrl: './ajouter-c.component.html',
  styleUrls: ['./ajouter-c.component.css']
})
export class AjouterCComponent implements OnInit {

  competitionForm: FormGroup;
  submitting = false;
  error = '';
  isEditMode = false;
  competitionId = 0;
  pageTitle = 'Planifier une compétition';
  competitions: Competition[] = [];
  loading = false;
  piscines: Piscine[] = [];

  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
    private router: Router,
    private route: ActivatedRoute,
    private piscineService: PiscineService
  ) {
    this.competitionForm = this.fb.group({
      typeCompetition: [
        {value: '', disabled: false}, 
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)]
      ],
      dateDebut: ['', [Validators.required, this.futureDateValidator]],
      dateFin: ['', [Validators.required, this.futureDateValidator, this.endDateValidator]],
      heure: ['', Validators.required],
      nbrParticipants: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
      piscine: ['', Validators.required]
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    console.log("type competition", this.typeCompetition);
    this.loadPiscines();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.competitionId = +id;
        this.pageTitle = 'Modifier une compétition';
        this.loadCompetitionData(this.competitionId);
      }
    });
    
    this.route.queryParams.subscribe(params => {
      const type = params['type'];
      if (type) {
        // Désactiver le champ et définir la valeur
        this.competitionForm.get('typeCompetition')?.setValue(type);
        this.competitionForm.get('typeCompetition')?.disable();
      }
      console.log("type competition", this.typeCompetition);
    });

    this.setupFormListeners();
  }

  // Validators personnalisés
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const inputDate = new Date(control.value);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      
      if (inputDate < today) {
        return { min: true };
      }
      if (inputDate > maxDate) {
        return { max: true };
      }
    }
    return null;
  }

  // Validator spécifique pour la date de fin
  endDateValidator = (control: AbstractControl): ValidationErrors | null => {
    if (control.value && this.competitionForm) {
      const dateDebut = this.competitionForm.get('dateDebut')?.value;
      if (dateDebut) {
        const startDate = new Date(dateDebut);
        const endDate = new Date(control.value);
        
        if (endDate < startDate) {
          return { min: true };
        }
      }
    }
    return null;
  }

  dateRangeValidator(formGroup: FormGroup): ValidationErrors | null {
    const dateDebut = formGroup.get('dateDebut')?.value;
    const dateFin = formGroup.get('dateFin')?.value;
    
    if (dateDebut && dateFin) {
      return new Date(dateFin) >= new Date(dateDebut) ? null : { dateRange: true };
    }
    return null;
  }

  setupFormListeners(): void {
    // Mise à jour automatique de dateFin quand dateDebut change
    this.competitionForm.get('dateDebut')?.valueChanges.subscribe(dateDebut => {
      const dateFin = this.competitionForm.get('dateFin')?.value;
      
      if (dateDebut) {
        // Mettre à jour la validation de dateFin
        this.competitionForm.get('dateFin')?.updateValueAndValidity();
        
        // Si dateFin est antérieure à dateDebut, la mettre à jour
        if (dateFin && new Date(dateFin) < new Date(dateDebut)) {
          this.competitionForm.get('dateFin')?.setValue(dateDebut);
        }
      }
    });

    // Validation automatique des participants
    this.competitionForm.get('nbrParticipants')?.valueChanges.subscribe(participants => {
      if (participants) {
        if (participants > 50) {
          this.competitionForm.get('nbrParticipants')?.setValue(50);
        } else if (participants < 1) {
          this.competitionForm.get('nbrParticipants')?.setValue(1);
        }
      }
    });
  }

  loadPiscines(): void {
    this.loading = true;
    this.piscineService.getAllPiscines().subscribe({
      next: (data) => {
        this.piscines = data.sort((a, b) => a.nomPiscine.localeCompare(b.nomPiscine));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des piscines', err);
        this.loading = false;
        this.error = 'Impossible de charger la liste des piscines';
      }
    });
  }

  loadCompetitionData(id: number): void {
    this.loading = true;
    this.competitionService.getCompetition(id).subscribe({
      next: (data) => {
        const dateDebut = data.dateDebut ? new Date(data.dateDebut).toISOString().split('T')[0] : '';
        const dateFin = data.dateFin ? new Date(data.dateFin).toISOString().split('T')[0] : '';
        
        let heureFormatee = '';
        if (data.heure) {
          if (typeof data.heure === 'string' && data.heure.includes(':')) {
            heureFormatee = data.heure.split(':').slice(0, 2).join(':');
          }
        }
        
        this.competitionForm.patchValue({
          dateDebut: dateDebut,
          dateFin: dateFin,
          heure: heureFormatee,
          nbrParticipants: data.nbrParticipants,
          typeCompetition: data.typeC,
          piscine: data.piscine
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données de la compétition', err);
        this.loading = false;
        this.error = 'Erreur lors du chargement des données';
      }
    });
  }

  // Getters pour faciliter l'accès aux contrôles du formulaire
  get dateDebut() { return this.competitionForm.get('dateDebut'); }
  get dateFin() { return this.competitionForm.get('dateFin'); }
  get heure() { return this.competitionForm.get('heure'); }
  get nbrParticipants() { return this.competitionForm.get('nbrParticipants'); }
  get typeCompetition() { return this.competitionForm.get('typeCompetition'); }
  get piscine() { return this.competitionForm.get('piscine'); }

  comparePiscines(p1: Piscine, p2: Piscine): boolean {
    return p1 && p2 ? p1.idPiscine === p2.idPiscine : p1 === p2;
  }

  // Méthodes utilitaires pour le template
  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getMinDateForEnd(): string {
    const dateDebut = this.competitionForm.get('dateDebut')?.value;
    if (dateDebut) {
      return dateDebut;
    }
    return this.getMinDate();
  }

  getMaxDate(): string {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getFormCompletionPercentage(): number {
    const totalFields = Object.keys(this.competitionForm.controls).length;

    let filledFields = 0
    if(!this.isEditMode) { filledFields = 1;}
    
    Object.keys(this.competitionForm.controls).forEach(key => {
      const control = this.competitionForm.get(key);
      if (control && control.value && control.valid) {
        filledFields++;
      }
    });
    
    return Math.round((filledFields / totalFields) * 100);
  }

  resetForm(): void {
    const typeCompetition = this.competitionForm.get('typeCompetition')?.value;

  // Réinitialiser tout le formulaire
  this.competitionForm.reset();

  // Réassigner la valeur du champ "typeCompetition"
  this.competitionForm.get('typeCompetition')?.setValue(typeCompetition);
  }

  onSubmit(): void {
    // Réactiver le champ type de compétition pour la soumission si il était désactivé
    const typeCompetitionControl = this.competitionForm.get('typeCompetition');
    if (typeCompetitionControl?.disabled) {
      typeCompetitionControl.enable();
    }

    if (this.competitionForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.competitionForm.controls).forEach(field => {
        const control = this.competitionForm.get(field);
        control?.markAsTouched({ onlySelf: true });
      });

      // Scroll vers le premier champ en erreur
      this.scrollToFirstError();
      
      // Désactiver à nouveau le type de compétition si il était désactivé
      if (this.route.snapshot.queryParams['type']) {
        typeCompetitionControl?.disable();
      }
      return;
    }

    this.submitting = true;
    this.error = '';
    
    const competition = new Competition();
    competition.dateDebut = this.competitionForm.value.dateDebut;
    competition.dateFin = this.competitionForm.value.dateFin;
    competition.heure = this.competitionForm.value.heure;
    competition.nbrParticipants = this.competitionForm.value.nbrParticipants;
    // Récupérer la valeur même si le contrôle est désactivé
    competition.typeC = this.competitionForm.get('typeCompetition')?.value || this.competitionForm.value.typeCompetition;
    competition.piscine = this.competitionForm.value.piscine;
    competition.resultats = [];
    competition.inscriptions = [];

    if (this.isEditMode) {
      competition.idReservation = this.competitionId;
      this.competitionService.updateCompetition(competition).subscribe({
        next: () => {
          this.submitting = false;
          this.showSuccessMessage('Compétition mise à jour avec succès!');
          this.router.navigate(['/admin/competitions']);
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour de la compétition: ' + err.message;
          this.submitting = false;
          // Désactiver à nouveau le type de compétition si il était désactivé
          if (this.route.snapshot.queryParams['type']) {
            typeCompetitionControl?.disable();
          }
        }
      });
    } else {
      this.competitionService.addCompetition(competition).subscribe({
        next: () => {
          this.submitting = false;
          this.showSuccessMessage('Compétition créée avec succès!');
          this.router.navigate(['/admin/competitions']);
        },
        error: (err) => {
          this.error = 'Erreur lors de l\'ajout de la compétition: ' + err.message;
          this.submitting = false;
          this.scrollToTop();
          // Désactiver à nouveau le type de compétition si il était désactivé
          if (this.route.snapshot.queryParams['type']) {
            typeCompetitionControl?.disable();
          }
        }
      });
    }
  }

  private scrollToFirstError(): void {
    const firstErrorElement = document.querySelector('.is-invalid');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private showSuccessMessage(message: string): void {
    // Vous pouvez implémenter un toast ou une notification ici
    console.log(message);
  }

  annuler(): void {
    // Confirmer avant d'annuler si le formulaire a été modifié
    if (this.competitionForm.dirty) {
      if (confirm('Êtes-vous sûr de vouloir annuler? Toutes les modifications seront perdues.')) {
        this.navigateToList();
      }
    } else {
      this.navigateToList();
    }
  }

  private navigateToList(): void {
    if (this.isEditMode) {
      this.router.navigate(['/admin/competitions']);
     
      this.isEditMode = true;
    }else {
    this.router.navigate(['/competitions']);
    this.resetForm();
    this.isEditMode = false;
    this.competitionId = 0;
    this.pageTitle = 'Planifier une compétition';}
  }

  // Méthodes utilitaires pour améliorer l'UX
  onDateDebutChange(): void {
    const dateDebut = this.competitionForm.get('dateDebut')?.value;
    const dateFin = this.competitionForm.get('dateFin')?.value;
    
    if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
      this.competitionForm.get('dateFin')?.setValue(dateDebut);
    }
  }

  onParticipantsChange(): void {
    const participants = this.competitionForm.get('nbrParticipants')?.value;
    if (participants) {
      if (participants > 50) {
        this.competitionForm.get('nbrParticipants')?.setValue(50);
      } else if (participants < 1) {
        this.competitionForm.get('nbrParticipants')?.setValue(1);
      }
    }
  }

  getSuggestedTimes(): string[] {
    return ['08:00', '10:00', '14:00', '16:00', '18:00', '20:00'];
  }

  onPiscineChange(): void {
    const piscine = this.competitionForm.get('piscine')?.value;
    if (piscine) {
      console.log('Piscine sélectionnée:', piscine.nomPiscine);
    }
  }

  getPreviewData(): any {
    const formData = this.competitionForm.value;
    return {
      type: formData.typeCompetition,
      dateDebut: this.formatDate(formData.dateDebut),
      dateFin: this.formatDate(formData.dateFin),
      heure: formData.heure,
      participants: formData.nbrParticipants,
      piscine: formData.piscine?.nomPiscine || 'Non sélectionnée'
    };
  }

  validateDataConsistency(): boolean {
    const formData = this.competitionForm.value;
    
    if (formData.dateDebut && formData.dateFin) {
      return new Date(formData.dateFin) >= new Date(formData.dateDebut);
    }
    
    return true;
  }

  saveDraft(): void {
    const draftData = this.competitionForm.value;
    localStorage.setItem('competition_draft', JSON.stringify(draftData));
    console.log('Brouillon sauvegardé');
  }

  loadDraft(): void {
    const draft = localStorage.getItem('competition_draft');
    if (draft) {
      const draftData = JSON.parse(draft);
      this.competitionForm.patchValue(draftData);
      console.log('Brouillon chargé');
    }
  }
}