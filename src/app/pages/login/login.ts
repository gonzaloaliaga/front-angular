import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  iniciarSesion() {
    console.log("Iniciando proceso de autenticación...");
    alert("En la proxima clase lo configuraremos");
  }

}