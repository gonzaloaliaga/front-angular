import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import {
  MsalModule, MsalService, MsalGuard, MsalInterceptor,
  MSAL_INSTANCE, MSAL_GUARD_CONFIG, MSAL_INTERCEPTOR_CONFIG,
  MsalGuardConfiguration, MsalInterceptorConfiguration
} from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';
import { environment } from '../environments/environment';
 
const CLIENT_ID = '0f50a8bc-f7a7-4dde-9e44-9f05fb077cc0';
const SCOPE_API = `api://${CLIENT_ID}/access_as_user`;
 
export function MSALInstanceFactory() {
  return new PublicClientApplication({
    auth: {
      clientId: CLIENT_ID,
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
 
/**
 * Le dice a MSAL: "cuando el frontend llame a estas URLs, adjunta un token
 * pedido con el scope de NUESTRA API (no el de Microsoft Graph)". Sin esto,
 * el backend rechaza el token porque el "aud" no le corresponde.
 */
export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(`${environment.apiInventarioUrl}/*`, [SCOPE_API]);
  protectedResourceMap.set(`${environment.apiPedidosUrl}/*`, [SCOPE_API]);
 
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}
 
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(MsalModule),
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalService,
    MsalGuard
  ]
};
