import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PiscineComponent } from './components/PiscineC/piscine/piscine.component';
import { AjouterPComponent } from './components/PiscineC/ajouter-p/ajouter-p.component';
import { CompetitionComponent } from './components/CompetitionC/competition/competition.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AjouterCComponent } from './components/CompetitionC/ajouter-c/ajouter-c.component';
import { CompetitionCardsComponent } from './components/CompetitionC/competition-cards/competition-cards.component';
import { InscriptionComponent } from './components/inscription/inscription/inscription.component';
import { AjoutResultatComponent } from './components/ResultatsC/ajouter-resultat/ajouter-resultat.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { ChefEquipeComponent } from './components/chef-equipe/chef-equipe.component';
import { JoueurComponent } from './components/joueur/joueur.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ResultatsComponent } from './components/ResultatsC/resultats/resultats.component';
import { roleGuardFn } from './services/role.guard';
import { HistoriqueComponent } from './components/ResultatsC/historique/historique.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Authentification
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  { path: 'dashboard', component: DashboardComponent },

  // Routes pour CHEF_EQUIPE
  { path: 'chef-equipe', component: ChefEquipeComponent, canActivate: [roleGuardFn(['CHEF_EQUIPE'])] },

  // Routes ADMIN sécurisées
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [roleGuardFn(['ADMIN'])],
    children: [
      // Route par défaut vide pour afficher le contenu principal d'admin
    
      { path: 'piscines', component: PiscineComponent },
      { path: 'piscines/ajouter', component: AjouterPComponent },
      { path: 'piscines/modifier/:id', component: AjouterPComponent },
      { path: 'competitions', component: CompetitionComponent },
      { path: 'competitions/ajouter', component: AjouterCComponent },
      { path: 'competitions/modifier/:id', component: AjouterCComponent },
      { path: 'competitions/cartes', component: CompetitionCardsComponent },
      { path: 'inscriptions/user', component: InscriptionComponent },
      { path: 'resultats/ajouter', component: AjoutResultatComponent },
      { path: 'resultats', component: ResultatsComponent },
       {path: 'historique',component :HistoriqueComponent}
    ]
  },

  // Routes JOUEUR sécurisées
  {
    path: 'joueur',
    component: JoueurComponent,
    canActivate: [roleGuardFn(['JOUEUR'])],
    children: [
      { path: '', redirectTo: 'competitions', pathMatch: 'full' },
      { path: 'competitions', component: CompetitionComponent },
      { path: 'inscriptions/user', component: InscriptionComponent },
   
    ]
  },

  // Route 404
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }