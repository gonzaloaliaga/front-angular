import { Routes, Router } from '@angular/router';
import { MsalGuard } from '@azure/msal-angular';
import { inject } from '@angular/core';

import { LoginComponent } from './pages/login/login';
import { LayoutComponent } from './pages/layout/layout';
import { Cocina } from './pages/cocina/cocina';
import { Despacho } from './pages/despacho/despacho';
import { Auditoria } from './pages/auditoria/auditoria';
import { Cliente } from './pages/cliente/cliente';
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
      // ✅ NUEVO: El Guardián Semáforo para la ruta por defecto
      {
        path: '',
        pathMatch: 'full',
        canActivate: [
          () => {
            const authService = inject(AuthService);
            const router = inject(Router);
            
            // Evaluamos y redirigimos automáticamente a la pantalla correcta
            if (authService.tieneRol('auditoria')) return router.createUrlTree(['/layout/auditoria']);
            if (authService.tieneRol('cocina')) return router.createUrlTree(['/layout/cocina']);
            if (authService.tieneRol('despacho')) return router.createUrlTree(['/layout/despacho']);
            if (authService.tieneRol('cliente')) return router.createUrlTree(['/layout/cliente']);
            
            // Si por algún motivo no tiene rol o el token está dañado, lo devolvemos al login
            return router.createUrlTree(['/login']);
          }
        ]
      },
      { path: 'cocina', component: Cocina, canActivate: [roleGuard], data: { rolEsperado: 'cocina' } },
      { path: 'despacho', component: Despacho, canActivate: [roleGuard], data: { rolEsperado: 'despacho' } },
      { path: 'auditoria', component: Auditoria, canActivate: [roleGuard], data: { rolEsperado: 'auditoria' } },
      { path: 'cliente', component: Cliente, canActivate: [roleGuard], data: { rolEsperado: 'cliente' } },
    ]
  } 
];