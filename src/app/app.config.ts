import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { MsalModule, MsalService, MsalGuard, MSAL_INSTANCE, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';

export function MSALInstanceFactory() {
  return new PublicClientApplication({
    auth: {
      clientId: '0f50a8bc-f7a7-4dde-9e44-9f05fb077cc0',
      authority: 'https://login.microsoftonline.com/93cc35f5-cb03-4022-ad90-77cbe1ca3267',
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'localStorage'
    }
  });
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect, 
    authRequest: {
      scopes: ['user.read']
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(MsalModule),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    MsalService,
    MsalGuard
  ]
};