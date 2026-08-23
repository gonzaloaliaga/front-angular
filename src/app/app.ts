import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router} from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App implements OnInit {
  
  constructor(private msalService: MsalService, private router: Router) {}

  ngOnInit(): void {
    this.msalService.instance.initialize().then(() => {
      
      this.msalService.handleRedirectObservable().subscribe({
        next: (respuesta: any) => {
          // 1. Si Microsoft nos devuelve un login exitoso en este instante
          if (respuesta && respuesta.account) {
            this.msalService.instance.setActiveAccount(respuesta.account);
            this.router.navigate(['/dashboard']);
          } 
          // 2. Si recargamos la página pero ya estábamos logueados de antes
          else {
            const cuentas = this.msalService.instance.getAllAccounts();
            if (cuentas.length > 0) {
              this.msalService.instance.setActiveAccount(cuentas[0]);
              
              // Si el usuario logueado intenta ir al login por error, lo mandamos al dashboard
              if (this.router.url.includes('/login')) {
                this.router.navigate(['/dashboard']);
              }
            }
          }
        }
      });
      
    });
  }
}