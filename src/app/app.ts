import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit { // <-- Aquí está el cambio vital
  
  constructor(private msalService: MsalService) {}

  ngOnInit(): void {
    // 1. Encendemos el motor de MSAL
    this.msalService.instance.initialize().then(() => {
      
      // 2. Revisamos si venimos de regreso de Microsoft
      this.msalService.handleRedirectObservable().subscribe({
        next: (respuesta) => {
          if (respuesta) {
            console.log("¡Token recibido con éxito!", respuesta);
            alert("¡Login Exitoso en la misma pestaña!");
          }
        },
        error: (error) => {
          console.error("Error en la redirección:", error);
        }
      });
      
    });
  }
}