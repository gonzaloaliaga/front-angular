import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class DashboardComponent {
  
  // Hacemos el servicio 'public' para que el HTML pueda hacerle preguntas directamente
  constructor(
    public authService: AuthService,
    private msalService: MsalService
  ) {}

  cerrarSesion() {
    console.log("Cerrando sesión de Azure...");
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:4200/login'
    });
  }
}