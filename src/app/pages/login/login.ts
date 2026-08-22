import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  constructor(private msalService: MsalService) {}

  iniciarSesion() {
    console.log("Viajando a Azure AD...");
    this.msalService.loginRedirect(); 
  }
}