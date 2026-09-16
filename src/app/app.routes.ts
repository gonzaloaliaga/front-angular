import { Routes, Router } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { inject } from '@angular/core';
import { LoginComponent } from './pages/login/login';
import { LayoutComponent } from './pages/layout/layout';
import { CocinaComponent } from './pages/cocina/cocina';
import { DespachoComponent } from './pages/despacho/despacho';
import { AuditoriaComponent } from './pages/auditoria/auditoria';
import { ClienteComponent } from './pages/cliente/cliente';
import { roleGuard } from './core/guards/role.guard';
import { AuthService } from './core/auth/auth';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { 
    path: 'layout', 
    component: LayoutComponent, 
    canActivate: [MsalGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ClienteComponent,
        canActivate: [
          () => {
            const authService = inject(AuthService);
            const router = inject(Router);
            if (authService.tieneRol('auditoria')) return router.createUrlTree(['/layout/auditoria']);
            if (authService.tieneRol('cocina')) return router.createUrlTree(['/layout/cocina']);
            if (authService.tieneRol('despacho')) return router.createUrlTree(['/layout/despacho']);
            if (authService.tieneRol('cliente')) return router.createUrlTree(['/layout/cliente']);
            return router.createUrlTree(['/login']);
          }
        ]
      },
      { path: 'cocina', component: CocinaComponent, canActivate: [roleGuard], data: { rolEsperado: 'cocina' } },
      { path: 'despacho', component: DespachoComponent, canActivate: [roleGuard], data: { rolEsperado: 'despacho' } },
      { path: 'auditoria', component: AuditoriaComponent, canActivate: [roleGuard], data: { rolEsperado: 'auditoria' } },
      { path: 'cliente', component: ClienteComponent, canActivate: [roleGuard], data: { rolEsperado: 'cliente' } },
    ]
  } 
];