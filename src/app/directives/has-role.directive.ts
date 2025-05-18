// src/app/directives/has-role.directive.ts
import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { AuthService } from '../services/_services/auth.service';

@Directive({
  selector: '[appHasRole]'
})
export class HasRoleDirective implements OnInit {
  // Accepter un ou plusieurs rôles
  @Input('appHasRole') roles: string[] = [];
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) { }
  
  ngOnInit() {
    // Vérifier si l'utilisateur a au moins un des rôles spécifiés
    const hasRole = this.roles.some(role => {
      if (role === 'ADMIN') {
        return this.authService.isAdmin();
      } else if (role === 'CHEF_EQUIPE') {
        return this.authService.isChefEquipe();
      } else if (role === 'JOUEUR') {
        return this.authService.isJoueur();
      }
      return false;
    });
    
    if (hasRole) {
      // Si l'utilisateur a un rôle autorisé, afficher l'élément
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      // Sinon, supprimer l'élément du DOM
      this.viewContainer.clear();
    }
  }
}