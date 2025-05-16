import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Ajouté

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { CommonModule } from '@angular/common';
import { AdminModule } from './admin/admin.module';
import { ChefEquipeComponent } from './chef-equipe/chef-equipe.component';
import { JoueurComponent } from './joueur/joueur.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    RegisterComponent,
    ChefEquipeComponent,
    JoueurComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule, // Nécessaire pour formGroup
    RouterModule, // Nécessaire pour routerLink
    AppRoutingModule,
     CommonModule,
     AdminModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }