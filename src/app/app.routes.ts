import { Routes } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { LoginComponent } from './pages/login/login';
import { LayoutComponent } from './pages/layout/layout';
import { Cocina } from './pages/cocina/cocina';
import { Despacho } from './pages/despacho/despacho';
import { Auditoria } from './pages/auditoria/auditoria';
import { Cliente } from './pages/cliente/cliente';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  
  { 
    path: 'layout', 
    component: LayoutComponent, 
    canActivate: [MsalGuard],
    children: [
      { path: 'cocina', component: Cocina },
      { path: 'despacho', component: Despacho },
      { path: 'auditoria', component: Auditoria },
      { path: 'cliente', component: Cliente },
      // Redirección por defecto si entran a /layout a secas
      { path: '', redirectTo: 'auditoria', pathMatch: 'full' }
    ]
  } 
];