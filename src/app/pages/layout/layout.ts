import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth';
import { MsalService } from '@azure/msal-angular';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})

export class LayoutComponent {
  
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