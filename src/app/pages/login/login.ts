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

  locales = [
    'Pan Artesanal', 'Café Central', 'Dulce Trigo', 'La Espiga',
    'Horno de Barrio', 'Aroma & Miga', 'Mesón del Café', 'Trigal Norte'
  ];

  categorias = [
    { nombre: 'Panadería', emoji: '🥖' },
    { nombre: 'Pastelería', emoji: '🎂' },
    { nombre: 'Cafetería', emoji: '☕' }
  ];

  constructor(private msalService: MsalService) {}

  iniciarSesion() {
    this.msalService.loginRedirect();
  }
}
