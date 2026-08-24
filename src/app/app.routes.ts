import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LoginComponent } from './pages/login/login';
import { LayoutComponent } from './pages/layout/layout';
import { CocinaComponent } from './pages/cocina/cocina';
import { DespachoComponent } from './pages/despacho/despacho';
import { AuditoriaComponent } from './pages/auditoria/auditoria';
import { ClienteComponent } from './pages/cliente/cliente';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  
  { 
    path: 'layout', 
    component: LayoutComponent, 
    canActivate: [MsalGuard],
    children: [
      { path: 'cocina', component: CocinaComponent },
      { path: 'despacho', component: DespachoComponent },
      { path: 'auditoria', component: AuditoriaComponent },
      { path: 'cliente', component: ClienteComponent },
      // Redirección por defecto si entran a /layout a secas
      { path: '', redirectTo: 'auditoria', pathMatch: 'full' }
    ]
  } 
];