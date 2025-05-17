import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { ChefEquipeComponent } from './chef-equipe/chef-equipe.component';
import { JoueurComponent } from './joueur/joueur.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'register', 
    component: RegisterComponent
  },
  { 
    path: 'admin', 
    component: AdminComponent
  },
  { 
    path: 'chef-equipe', 
    component: ChefEquipeComponent
  },
  { 
    path: 'joueur', 
    component: JoueurComponent
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
   { 
    path: 'reset-password', 
    component: ResetPasswordComponent 
  },
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/dahsboard' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }