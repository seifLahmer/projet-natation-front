import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { ChefEquipeComponent } from './chef-equipe/chef-equipe.component';
import { JoueurComponent } from './joueur/joueur.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegisterComponent } from './register/register.component';

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
  { 
    path: '', 
    redirectTo: '/login', 
    pathMatch: 'full' 
  },
  { 
    path: '**', 
    redirectTo: '/login' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }