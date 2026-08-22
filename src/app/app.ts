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
export class App implements OnInit {
  
  constructor(private msalService: MsalService) {}

  ngOnInit(): void {
    this.msalService.instance.initialize().then(() => {
      
      this.msalService.handleRedirectObservable().subscribe({
        next: (respuesta) => {
          if (respuesta) {
            console.log("¡Token recibido con éxito!", respuesta);
            alert("¡Login Exitoso!");
          }
        },
        error: (error) => {
          console.error("Error en la redirección:", error);
        }
      });
      
    });
  }
}