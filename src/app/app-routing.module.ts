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
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { ChefEquipeComponent } from './components/chef-equipe/chef-equipe.component';
import { JoueurComponent } from './components/joueur/joueur.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

const routes: Routes = [
  // Route par défaut - redirection vers dashboard
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  
  // Routes principales
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent 
  },
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent 
  },
  { 
    path: 'chef-equipe', 
    component: ChefEquipeComponent
  },
  
  // Routes admin
  { 
    path: 'admin', 
    component: AdminComponent,
    children: [
      // Route par défaut pour admin - affiche le composant parent
       // Ceci est important
      
      // Routes enfants d'admin
      { path: 'piscines', component: PiscineComponent },
      { path: 'piscines/ajouter', component: AjouterPComponent },
      { path: 'piscines/modifier/:id', component: AjouterPComponent },
      { path: 'competitions', component: CompetitionComponent },
      { path: 'competitions/ajouter', component: AjouterCComponent },
      { path: 'competitions/modifier/:id', component: AjouterCComponent },
      { path: 'competitions/cartes', component: CompetitionCardsComponent },
      { path: 'inscriptions/user', component: InscriptionComponent },
      { path: 'resultats/ajouter', component: AjoutResultatComponent },
    ]
  },
  
  // Routes joueur
  { 
    path: 'joueur', 
    component: JoueurComponent,
    children: [
      // Route par défaut pour joueur
      { path: '', redirectTo: 'competitions', pathMatch: 'full' },
      
      // Routes enfants de joueur
      { path: 'competitions', component: CompetitionComponent },
      
      { path: 'inscriptions/user', component: InscriptionComponent },
    ]
  },
  
  // Route 404 - doit être la dernière
  { 
    path: '**', 
    redirectTo: '/dashboard'  // Correction de l'orthographe
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }