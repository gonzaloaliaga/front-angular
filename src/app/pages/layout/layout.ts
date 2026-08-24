import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router'; 
import { AuthService } from '../../core/auth/auth';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink], 
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class LayoutComponent {
  
  constructor(
    public authService: AuthService, 
    private msalService: MsalService
  ) {}

  cerrarSesion() {
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:4200/login'
    });
  }
}