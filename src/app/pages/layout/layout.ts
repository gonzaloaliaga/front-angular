import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './layout.html',
  styleUrls: ['./layout.css']
})

export class LayoutComponent {
  isLoggedIn = signal<boolean>(false);
  userRole = signal<string>('');
  cartCount = signal<number>(0);
  hasUnreadAlerts = signal<boolean>(true);
  consentAccepted = signal<boolean>(false);

  acceptConsent() {
    this.consentAccepted.set(true);
  }

  loginMock() {
    this.isLoggedIn.set(true);
    this.userRole.set('CLIENTE');
  }

  logoutMock() {
    this.isLoggedIn.set(false);
    this.userRole.set('');
  }
}