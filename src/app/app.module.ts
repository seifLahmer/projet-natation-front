import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { AppRoutingModule } from './app-routing.module';

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
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { HasRoleDirective } from './directives/has-role.directive';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { CreateLicenceComponent } from './components/licence/create-licence/create-licence.component';
import { AuthInterceptor } from './auth.interceptor';
import { ChefEquipeComponent } from './components/chef-equipe/chef-equipe.component';

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
    ForgotPasswordComponent,
    ResetPasswordComponent,
    HasRoleDirective,
    UnauthorizedComponent
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ChefEquipeComponent,
    CreateLicenceComponent
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
