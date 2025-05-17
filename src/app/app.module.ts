import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

 // Importez HttpClientModule ici
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PiscineComponent } from './components/PiscineC/piscine/piscine.component';
import { AjouterPComponent } from './components/PiscineC/ajouter-p/ajouter-p.component';
import { CompetitionComponent } from './components/CompetitionC/competition/competition.component';
import { AjouterCComponent } from './components/CompetitionC/ajouter-c/ajouter-c.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { CompetitionCardsComponent } from './components/CompetitionC/competition-cards/competition-cards.component';
import { InscriptionComponent } from './components/inscription/inscription/inscription.component';
import { HeaderComponent } from './components/header/header.component';
import { ResultatsComponent } from './components/ResultatsC/resultats/resultats.component';
import { AjoutResultatComponent } from './components/ResultatsC/ajouter-resultat/ajouter-resultat.component';

@NgModule({
  declarations: [
    AppComponent,
    PiscineComponent,
    AjouterPComponent,
    CompetitionComponent,
    AjouterCComponent,
    PageNotFoundComponent,
    CompetitionCardsComponent,
    InscriptionComponent,
    HeaderComponent,
    ResultatsComponent,
    AjoutResultatComponent
    
     // Ajoutez le composant ici
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule // Ajoutez HttpClientModule ici
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
