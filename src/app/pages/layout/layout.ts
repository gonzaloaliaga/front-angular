import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})

export class LayoutComponent {
  router = inject(Router);
  isLoggedIn = signal<boolean>(false);
  userRole = signal<string>(''); 
  cartCount = signal<number>(0);
  hasUnreadAlerts = signal<boolean>(true);
  consentAccepted = signal<boolean>(false);
  perfil = signal({
    correo: 'm4tykrsty@pedidos360.cl',
    nombreUsuario: '',
    alias: 'MatyCrsty',
    ubicacion: 'La Florida, Santiago'
  });

  acceptConsent() {
    this.consentAccepted.set(true);
  }

  loginMock() {
    const rolDeAzure: string = 'cliente'; 
    this.isLoggedIn.set(true);
    this.userRole.set(rolDeAzure);
    const extraido = this.perfil().correo.split('@')[0];
    this.perfil.update(p => ({ ...p, nombreUsuario: extraido }));
    if (rolDeAzure === 'cocina') {
      this.router.navigate(['/layout/cocina']);
    } else if (rolDeAzure === 'auditoria') {
      this.router.navigate(['/layout/auditoria']);
    } else if (rolDeAzure === 'despacho') {
      this.router.navigate(['/layout/despacho']);
    } else {
      this.router.navigate(['/layout/cliente']);
    }
  }

  logoutMock() {
    this.isLoggedIn.set(false);
    this.userRole.set('');
    this.router.navigate(['/layout/cliente']); 
  }
}