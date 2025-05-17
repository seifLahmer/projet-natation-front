import { Component, OnInit } from '@angular/core';
import { PiscineService } from 'src/app/services/piscine/piscine.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Piscine } from 'src/app/models/piscine';
import { Centre } from 'src/app/models/centre';
import { CentreService } from 'src/app/services/centre/centre.service';

@Component({
  selector: 'app-ajouter-p',
  templateUrl: './ajouter-p.component.html',
  styleUrls: ['./ajouter-p.component.css']
})
export class AjouterPComponent implements OnInit {
  piscineForm: FormGroup;
  submitting = false;
  error = '';
  isEditMode = false;
  piscineId = 0;
  pageTitle = 'Ajouter une piscine';
  centres: Centre[] = [];
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private piscineService: PiscineService,
    private centreService: CentreService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.piscineForm = this.fb.group({
      nomPiscine: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(100),
        this.forbiddenNameValidator
      ]],
      nbreRows: ['', [
        Validators.required, 
        Validators.min(1), 
        Validators.max(50),
        this.wholeNumberValidator
      ]],
      centre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCentres();
    
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.piscineId = +id;
        this.pageTitle = 'Modifier une piscine';
        this.loadPiscineData(this.piscineId);
      }
    });

    // Configuration des listeners pour validation en temps réel
    this.setupFormListeners();
    
    // Charger un brouillon si disponible (seulement en mode création)
    if (!this.isEditMode) {
      this.loadDraft();
    }
  }

  // Validators personnalisés
  forbiddenNameValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const forbidden = /admin|test|demo|null|undefined/i.test(control.value);
    return forbidden ? { forbiddenName: { value: control.value } } : null;
  }

  wholeNumberValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value && !Number.isInteger(Number(control.value))) {
      return { wholeNumber: { value: control.value } };
    }
    return null;
  }

  // Validator asynchrone pour vérifier l'unicité du nom (optionnel)
  uniqueNameValidator = (control: AbstractControl): Promise<ValidationErrors | null> => {
    if (!control.value) return Promise.resolve(null);
    
    // Simulation d'une vérification asynchrone
    return new Promise((resolve) => {
      setTimeout(() => {
        // En mode édition, ignorer la vérification si c'est le même nom
        if (this.isEditMode && this.nomPiscine?.value === control.value) {
          resolve(null);
          return;
        }
        
        // Ici vous appelleriez votre service pour vérifier l'unicité
        // Pour la démo, on simule une vérification
        const isDuplicate = false; // this.piscineService.checkNameExists(control.value)
        resolve(isDuplicate ? { nameExists: { value: control.value } } : null);
      }, 500);
    });
  }

  setupFormListeners(): void {
    // Validation automatique du nombre de couloirs
    this.piscineForm.get('nbreRows')?.valueChanges.subscribe(value => {
      if (value !== null && value !== '') {
        const numValue = Number(value);
        if (numValue > 50) {
          this.piscineForm.get('nbreRows')?.setValue(50, { emitEvent: false });
        } else if (numValue < 1 && numValue !== 0) {
          this.piscineForm.get('nbreRows')?.setValue(1, { emitEvent: false });
        }
      }
    });

    // Normalisation du nom de la piscine
    this.piscineForm.get('nomPiscine')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string') {
        // Suppression des espaces multiples et trim automatique
        const normalized = value.replace(/\s+/g, ' ').trimStart();
        if (normalized !== value) {
          this.piscineForm.get('nomPiscine')?.setValue(normalized, { emitEvent: false });
        }
      }
    });

    // Sauvegarde automatique en brouillon (mode création uniquement)
    if (!this.isEditMode) {
      this.piscineForm.valueChanges.subscribe(() => {
        // Debounce pour éviter les sauvegardes trop fréquentes
        if (this.piscineForm.dirty) {
          setTimeout(() => this.saveDraft(), 1000);
        }
      });
    }

    // Validation conditionnelle basée sur le centre sélectionné
    this.piscineForm.get('centre')?.valueChanges.subscribe(centre => {
      if (centre) {
        this.validateBasedOnCentre(centre);
      }
    });
  }

  validateBasedOnCentre(centre: Centre): void {
    // Ici vous pourriez ajouter des validations spécifiques selon le centre
    // Par exemple, vérifier les contraintes du centre
    console.log('Validation basée sur le centre:', centre.nomCentre);
  }

  loadCentres(): void {
    this.loading = true;
    this.centreService.getAllCentres().subscribe({
      next: (data) => {
        // Trier les centres par nom et filtrer les centres actifs
        this.centres = data
          .filter(centre => centre.nomCentre && centre.nomCentre.trim() !== '')
          .sort((a, b) => a.nomCentre.localeCompare(b.nomCentre));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des centres:', err);
        this.error = 'Erreur lors du chargement des centres: ' + (err.message || 'Erreur inconnue');
        this.loading = false;
      }
    });
  }

  loadPiscineData(id: number): void {
    this.loading = true;
    this.piscineService.getPiscineById(id).subscribe({
      next: (piscine) => {
        this.piscineForm.patchValue({
          nomPiscine: piscine.nomPiscine,
          nbreRows: piscine.nbreRows,
          centre: piscine.centre
        });
        // Marquer le formulaire comme pristine après le chargement
        this.piscineForm.markAsPristine();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la piscine:', err);
        this.error = 'Erreur lors du chargement des données: ' + (err.message || 'Erreur inconnue');
        this.loading = false;
      }
    });
  }

  // Getters pour accéder facilement aux contrôles du formulaire
  get nomPiscine() { return this.piscineForm.get('nomPiscine'); }
  get nbreRows() { return this.piscineForm.get('nbreRows'); }
  get centre() { return this.piscineForm.get('centre'); }
  
  compareCentres(c1: Centre, c2: Centre): boolean {
    return c1 && c2 ? c1.idCentre === c2.idCentre : c1 === c2;
  }

  // Méthodes utilitaires pour le template
  getSuggestedLanes(): number[] {
    return [4, 6, 8, 10, 12];
  }

  setSuggestion(lanes: number): void {
    this.piscineForm.get('nbreRows')?.setValue(lanes);
    this.piscineForm.get('nbreRows')?.markAsTouched();
  }

  getPoolLanes(): number[] {
    const nbreRows = this.nbreRows?.value || 0;
    return Array.from({ length: Math.min(nbreRows, 50) }, (_, i) => i + 1);
  }

  getLaneColor(lane: number): string {
    const colors = [
      '#007bff', '#17a2b8', '#28a745', '#ffc107', 
      '#fd7e14', '#e83e8c', '#6f42c1', '#20c997'
    ];
    return colors[(lane - 1) % colors.length];
  }

  getEstimatedCapacity(): number {
    const nbreRows = this.nbreRows?.value || 0;
    // Estimation : environ 2-3 nageurs par couloir
    return Math.round(nbreRows * 2.5);
  }

  getFormCompletionPercentage(): number {
    const totalFields = Object.keys(this.piscineForm.controls).length;
    let filledFields = 0;
    
    Object.keys(this.piscineForm.controls).forEach(key => {
      const control = this.piscineForm.get(key);
      if (control && control.value !== null && control.value !== '' && control.valid) {
        filledFields++;
      }
    });
    
    return Math.round((filledFields / totalFields) * 100);
  }

  resetForm(): void {
    if (this.piscineForm.dirty) {
      if (!confirm('Êtes-vous sûr de vouloir réinitialiser le formulaire? Toutes les données seront perdues.')) {
        return;
      }
    }
    
    this.piscineForm.reset();
    this.error = '';
    
    // Réinitialiser avec des valeurs par défaut
    this.piscineForm.patchValue({
      nomPiscine: '',
      nbreRows: '',
      centre: ''
    });
    
    // Supprimer le brouillon
    localStorage.removeItem('piscine_draft');
  }

  onCoukloirsChange(): void {
    const value = this.nbreRows?.value;
    if (value !== null && value !== '') {
      const numValue = Number(value);
      // Validation en temps réel et ajustement
      if (numValue > 50) {
        this.piscineForm.get('nbreRows')?.setValue(50);
      } else if (numValue < 1 && numValue !== 0) {
        this.piscineForm.get('nbreRows')?.setValue(1);
      }
    }
  }

  onCentreChange(): void {
    const centre = this.centre?.value;
    if (centre) {
      console.log('Centre sélectionné:', centre.nomCentre);
      
      // Suggestions de noms basées sur le centre
      if (!this.nomPiscine?.value || this.nomPiscine.value.trim() === '') {
        this.suggestPiscineName(centre);
      }
    }
  }

  suggestPiscineName(centre: Centre): void {
    const suggestions = this.getPoolNameSuggestions();
    if (suggestions.length > 0) {
      // Proposer le premier nom suggéré
      const suggestion = suggestions[0];
      if (confirm(`Voulez-vous utiliser le nom suggéré "${suggestion}" ?`)) {
        this.piscineForm.get('nomPiscine')?.setValue(suggestion);
      }
    }
  }

  private scrollToError(): void {
    const firstErrorElement = document.querySelector('.is-invalid');
    if (firstErrorElement) {
      firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Focus sur l'élément si c'est un input
      if (firstErrorElement instanceof HTMLInputElement || firstErrorElement instanceof HTMLSelectElement) {
        setTimeout(() => firstErrorElement.focus(), 100);
      }
    }
  }

  private showSuccessMessage(message: string): void {
    // Implémentation d'un toast ou notification
    console.log(message);
    // Exemple d'implémentation basique avec alert (à remplacer par un toast)
    // alert(message);
  }

  onSubmit(): void {
    // Marquer tous les champs comme touchés pour la validation
    this.markFormGroupTouched(this.piscineForm);

    if (this.piscineForm.invalid) {
      // Scroll vers l'erreur
      this.scrollToError();
      
      // Analyser les erreurs pour un message plus détaillé
      this.error = this.getFormErrorMessage();
      return;
    }

    this.submitting = true;
    this.error = '';

    // Validation supplémentaire côté client
    const validationResult = this.validatePoolStandards();
    if (!validationResult.isValid && validationResult.warnings.length > 0) {
      const proceedAnyway = confirm(
        `Attention: ${validationResult.warnings.join('. ')}. Voulez-vous continuer?`
      );
      if (!proceedAnyway) {
        this.submitting = false;
        return;
      }
    }

    // Créer une nouvelle instance de Piscine
    const piscine = new Piscine();
    piscine.idPiscine = this.isEditMode ? this.piscineId : 0;
    piscine.nomPiscine = this.piscineForm.value.nomPiscine.trim();
    piscine.nbreRows = parseInt(this.piscineForm.value.nbreRows, 10);
    
    // Créer un centre simplifié pour éviter les références circulaires
    if (this.piscineForm.value.centre) {
      const simpleCentre = new Centre();
      simpleCentre.idCentre = this.piscineForm.value.centre.idCentre;
      simpleCentre.nomCentre = this.piscineForm.value.centre.nomCentre || '';
      simpleCentre.localisation = this.piscineForm.value.centre.localisation || '';
      piscine.centre = simpleCentre;
    }

    console.log('Formulaire soumis avec valeurs:', this.piscineForm.value);
    console.log('Piscine à envoyer:', piscine);

    // Supprimer le brouillon avant la soumission
    localStorage.removeItem('piscine_draft');

    if (this.isEditMode) {
      // Mode édition
      this.piscineService.updatePiscine(this.piscineId, piscine).subscribe({
        next: () => {
          this.submitting = false;
          this.showSuccessMessage('Piscine modifiée avec succès!');
          this.router.navigate(['/piscines']);
        },
        error: (err) => {
          this.submitting = false;
          console.error('Erreur modification:', err);
          this.error = 'Erreur lors de la modification: ' + (err.message || err.error?.message || 'Erreur inconnue');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      // Mode ajout
      this.piscineService.createPiscine(piscine).subscribe({
        next: () => {
          this.submitting = false;
          this.showSuccessMessage('Piscine créée avec succès!');
          this.router.navigate(['/piscines']);
        },
        error: (err) => {
          this.submitting = false;
          console.error('Erreur création:', err);
          this.error = 'Erreur lors de l\'ajout de la piscine: ' + (err.message || err.error?.message || 'Erreur inconnue');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getFormErrorMessage(): string {
    const errors: string[] = [];
    
    Object.keys(this.piscineForm.controls).forEach(key => {
      const control = this.piscineForm.get(key);
      if (control && control.errors && control.touched) {
        if (control.errors['required']) {
          errors.push(`${this.getFieldDisplayName(key)} est obligatoire`);
        }
        if (control.errors['minlength']) {
          errors.push(`${this.getFieldDisplayName(key)} est trop court`);
        }
        if (control.errors['maxlength']) {
          errors.push(`${this.getFieldDisplayName(key)} est trop long`);
        }
        if (control.errors['min']) {
          errors.push(`${this.getFieldDisplayName(key)} doit être supérieur à ${control.errors['min'].min}`);
        }
        if (control.errors['max']) {
          errors.push(`${this.getFieldDisplayName(key)} doit être inférieur à ${control.errors['max'].max}`);
        }
      }
    });
    
    return errors.length > 0 ? 'Erreurs de validation: ' + errors.join(', ') : '';
  }

  getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'nomPiscine': 'Le nom de la piscine',
      'nbreRows': 'Le nombre de couloirs',
      'centre': 'Le centre'
    };
    return fieldNames[fieldName] || fieldName;
  }

  annuler(): void {
    // Confirmer avant d'annuler si le formulaire a été modifié
    if (this.piscineForm.dirty) {
      if (confirm('Êtes-vous sûr de vouloir annuler? Toutes les modifications seront perdues.')) {
        this.navigateToList();
      }
    } else {
      this.navigateToList();
    }
  }

  private navigateToList(): void {
    // Supprimer le brouillon lors de l'annulation
    localStorage.removeItem('piscine_draft');
    this.router.navigate(['/piscines']);
  }

  // Méthodes utilitaires supplémentaires
  
  // Validation de la disponibilité du nom
  validateNameAvailability(name: string): void {
    // Cette méthode pourrait appeler un service pour vérifier
    // si le nom de la piscine est déjà utilisé
    console.log('Vérification de disponibilité pour:', name);
    // Exemple d'implémentation:
    // this.piscineService.checkNameAvailability(name).subscribe(...)
  }

  // Calcul des statistiques de la piscine
  getPoolStatistics(): any {
    const nbreRows = this.nbreRows?.value || 0;
    return {
      totalLanes: nbreRows,
      estimatedCapacity: this.getEstimatedCapacity(),
      competitionReady: nbreRows >= 6,
      trainingCapable: nbreRows >= 4,
      recreationalUse: nbreRows >= 2,
      olympicStandard: nbreRows >= 8,
      waterVolume: this.estimateWaterVolume(nbreRows)
    };
  }

  estimateWaterVolume(lanes: number): number {
    // Estimation basée sur des dimensions standard
    // Piscine olympique: 50m x 25m x 1.8m (profondeur moyenne)
    const laneWidth = 2.5; // mètres par couloir
    const poolLength = 50; // mètres
    const averageDepth = 1.8; // mètres
    
    const width = lanes * laneWidth;
    return Math.round(poolLength * width * averageDepth);
  }

  // Suggestions basées sur le centre sélectionné
  getPoolNameSuggestions(): string[] {
    const centre = this.centre?.value;
    if (!centre) return [];
    
    const localisation = centre.localisation || '';
    const centreName = centre.nomCentre || '';
    
    const suggestions = [
      `Piscine ${centreName}`,
      `Bassin Olympique ${centreName}`,
      `Centre Aquatique ${centreName}`,
      `Complexe Aquatique ${centreName}`
    ];
    
    if (localisation) {
      suggestions.push(`Piscine Municipale ${localisation}`);
      suggestions.push(`Centre Aquatique ${localisation}`);
    }
    
    return suggestions.filter(suggestion => 
      suggestion.trim() !== '' && 
      suggestion.length <= 100 &&
      suggestion.length >= 3
    );
  }

  // Validation avancée basée sur les standards de la piscine
  validatePoolStandards(): { isValid: boolean; warnings: string[] } {
    const nbreRows = this.nbreRows?.value || 0;
    const warnings: string[] = [];
    
    if (nbreRows < 4) {
      warnings.push('Moins de 4 couloirs peut limiter l\'usage pour l\'entraînement');
    }
    
    if (nbreRows < 6) {
      warnings.push('Les compétitions officielles nécessitent généralement 6 couloirs minimum');
    }
    
    if (nbreRows > 12) {
      warnings.push('Plus de 12 couloirs peut nécessiter une supervision supplémentaire');
    }

    if (nbreRows % 2 !== 0 && nbreRows > 4) {
      warnings.push('Un nombre pair de couloirs est recommandé pour les compétitions');
    }

    return {
      isValid: warnings.length === 0,
      warnings
    };
  }

  // Méthode pour sauvegarder en brouillon
  saveDraft(): void {
    if (!this.isEditMode && this.piscineForm.dirty) {
      const draftData = {
        ...this.piscineForm.value,
        timestamp: new Date().getTime(),
        version: '1.0'
      };
      localStorage.setItem('piscine_draft', JSON.stringify(draftData));
      console.log('Brouillon sauvegardé automatiquement');
    }
  }

  // Méthode pour charger un brouillon
  loadDraft(): void {
    const draft = localStorage.getItem('piscine_draft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        
        // Vérifier que le brouillon n'est pas trop ancien (ex: 24h)
        const maxAge = 24 * 60 * 60 * 1000; // 24 heures en millisecondes
        if (draftData.timestamp && (new Date().getTime() - draftData.timestamp) > maxAge) {
          localStorage.removeItem('piscine_draft');
          return;
        }
        
      } catch (e) {
        console.error('Erreur lors du chargement du brouillon:', e);
        localStorage.removeItem('piscine_draft');
      }
    }
  }

  // Méthode pour exporter la configuration de la piscine
  exportPoolConfiguration(): void {
    const config = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        type: 'piscine-configuration'
      },
      piscine: {
        nom: this.nomPiscine?.value || '',
        couloirs: this.nbreRows?.value || 0,
        centre: this.centre?.value ? {
          nom: this.centre.value.nomCentre,
          localisation: this.centre.value.localisation
        } : null,
        capaciteEstimee: this.getEstimatedCapacity(),
        statistiques: this.getPoolStatistics(),
        validations: this.validatePoolStandards()
      }
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const fileName = `piscine_${(this.nomPiscine?.value || 'config').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
    
    console.log('Configuration exportée:', fileName);
  }

  // Méthode pour importer une configuration
  importPoolConfiguration(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          
          if (config.piscine) {
            const confirmation = confirm(
              `Voulez-vous importer la configuration "${config.piscine.nom}" ?`
            );
            
            if (confirmation) {
              this.piscineForm.patchValue({
                nomPiscine: config.piscine.nom,
                nbreRows: config.piscine.couloirs
              });
              
              // Rechercher le centre correspondant si disponible
              if (config.piscine.centre) {
                const centre = this.centres.find(c => 
                  c.nomCentre === config.piscine.centre.nom
                );
                if (centre) {
                  this.piscineForm.patchValue({ centre });
                }
              }
              
              console.log('Configuration importée avec succès');
            }
          } else {
            alert('Format de fichier invalide');
          }
        } catch (e) {
          console.error('Erreur lors de l\'import:', e);
          alert('Erreur lors de l\'import du fichier');
        }
      };
      
      reader.readAsText(file);
    }
  }

  // Méthodes pour la gestion des événements clavier
  onKeyDown(event: KeyboardEvent): void {
    // Raccourcis clavier
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          event.preventDefault();
          if (this.piscineForm.valid) {
            this.onSubmit();
          } else {
            this.saveDraft();
          }
          break;
        case 'r':
          event.preventDefault();
          this.resetForm();
          break;
      }
    }
  }

  // Nettoyage lors de la destruction du composant
  ngOnDestroy(): void {
    // Sauvegarder automatiquement avant de quitter si en mode création
    if (!this.isEditMode && this.piscineForm.dirty) {
      this.saveDraft();
    }
  }
}