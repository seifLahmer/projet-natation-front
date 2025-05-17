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
const routes: Routes = [
{ path: '', redirectTo: 'piscines', pathMatch: 'full' }, // route par défaut
  { path: 'piscines', component: PiscineComponent },
  { path: 'piscines/ajouter', component: AjouterPComponent },
  { path: 'piscines/modifier/:id', component: AjouterPComponent },
  { path: 'competitions', component: CompetitionComponent },
  { path: 'competitions/ajouter', component: AjouterCComponent },
  { path: 'competitions/modifier/:id', component: AjouterCComponent },
  { path: 'competitions/cartes', component: CompetitionCardsComponent },
  { path: 'inscriptions/user', component: InscriptionComponent },
  { path: 'resultats/ajouter', component: AjoutResultatComponent },
  { path: '**', component: PageNotFoundComponent }, // route pour lien non trouvé
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }