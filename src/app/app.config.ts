import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { MsalModule, MsalService, MSAL_INSTANCE } from '@azure/msal-angular';
import { PublicClientApplication } from '@azure/msal-browser';

// esta funcion configura la conexion con Azure
export function MSALInstanceFactory() {
  return new PublicClientApplication({
    auth: {
      clientId: '0f50a8bc-f7a7-4dde-9e44-9f05fb077cc0',
      authority: 'https://login.microsoftonline.com/93cc35f5-cb03-4022-ad90-77cbe1ca3267',
      redirectUri: 'http://localhost:4200'
    }
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(MsalModule),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService
  ]
};