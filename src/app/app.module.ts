import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { AppComponent } from './app.component';
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
import { LoginComponent } from './components/login/login.component';
import { AdminComponent } from './components/admin/admin.component';
import { ChefEquipeComponent } from './components/chef-equipe/chef-equipe.component';
import { JoueurComponent } from './components/joueur/joueur.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { HasRoleDirective } from './directives/has-role.directive';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

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
    AjoutResultatComponent,
    LoginComponent,
    DashboardComponent,
    RegisterComponent,
    ChefEquipeComponent,
    JoueurComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    AdminComponent,
    HasRoleDirective,
    UnauthorizedComponent
     // optionnel ici si déjà déclaré dans AdminModule
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // ⚠️ Nécessaire pour certains composants UI (ex : Angular Material)
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule, // pour formGroup
    RouterModule, // pour routerLink
    AppRoutingModule,
    
    
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
