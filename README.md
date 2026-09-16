# Pedidos 360 — Frontend

Frontend Angular 22 de la plataforma Pedidos 360: login con Azure AD (MSAL), catálogo, carrito, y un dashboard distinto por rol (Cliente, Cocina, Despacho, Auditoría).

Este proyecto **depende del repo `backend`** — sin los microservicios corriendo, el catálogo y los pedidos no van a cargar (vas a ver un mensaje de error de conexión, es normal).

## Requisitos

- **Node.js LTS** — https://nodejs.org/en/download
- **Angular CLI**: `npm install -g @angular/cli`
- El repo **`backend`** clonado y corriendo (ver su propio README) — Postgres + los 2 microservicios deben estar arriba **antes** de levantar el frontend.

## Cómo levantarlo

```bash
npm install
ng serve
```

Abre `http://localhost:4200`.

`ng serve` usa automáticamente `src/environments/environment.development.ts`, que ya apunta a `http://localhost:8081` (Inventario) y `http://localhost:8082` (Pedidos) — no hay que tocar nada para desarrollo local. El archivo `environment.ts` (sin `.development`) es el que se usa en producción, apuntando al dominio público; ese sí no se toca a mano, lo intercambia Angular solo según el comando (`ng serve` vs `ng build --configuration production`).

## Iniciar sesión

El login es con Azure AD (botón "Iniciar sesión con Microsoft"). Usa la cuenta de prueba del equipo — pide las credenciales por el canal del grupo, no están en este repo a propósito.

El rol de la cuenta (Cliente / Cocina / Despacho / Auditoría) se asigna desde el **App Registration en Azure Portal** (Roles de aplicación → asignar al usuario). Para ver un dashboard distinto, hay que cambiarle el rol a la cuenta de prueba ahí, cerrar sesión, y volver a entrar.

> `http://localhost:4200` ya está registrado como Redirect URI válido en el App Registration de Azure AD, así que esto funciona en cualquier PC sin configuración adicional de Azure.

## Estructura relevante

```
src/app/
├── core/
│   ├── auth/          # AuthService: lee roles del token de Azure AD
│   ├── api/           # Servicios HTTP hacia Inventario y Pedidos
│   └── carrito/        # Estado del carrito (signals)
└── pages/
    ├── login/          # Landing pública + botón de login
    ├── layout/          # Header autenticado + navegación por rol
    ├── cliente/         # Catálogo, carrito, mis pedidos
    ├── cocina/          # Kanban Pendiente → En preparación → Hecho
    ├── despacho/        # Entrega de pedidos
    └── auditoria/       # KPIs y log de trazabilidad
```

## Solución de problemas conocidos

- **"No se pudo cargar el catálogo"**: el microservicio de Inventario (puerto 8081) no está corriendo, o `ng serve` está usando el `environment.ts` de producción en vez del de desarrollo. Revisa que `angular.json` → `architect.build.configurations.development` tenga un bloque `fileReplacements` (ver este mismo archivo en el repo, ya viene configurado).
- **Error de CORS en la consola**: confirma que el backend tenga `http://localhost:4200` habilitado en su `CorsConfig.java` (ver README del repo `backend`).
- **Al iniciar sesión te redirige a `pedidos360.duckdns.org` en vez de `localhost`**: el `redirectUri` de MSAL usa `window.location.origin`, así que se ajusta solo — si esto pasa, probablemente estás abriendo la app manualmente en esa URL en vez de `localhost:4200`.
- **`window is not defined` al correr `ng serve`**: el proyecto no usa Server-Side Rendering (se sacó a propósito porque el despliegue real es una SPA estática servida por Nginx). Si ves este error, revisa que `angular.json` no tenga de nuevo las claves `server`/`outputMode`/`ssr`.

## Build de producción

```bash
ng build --configuration production
```

El resultado queda en `dist/front-angular/browser/`, listo para copiar tal cual a un servidor estático (así lo hace el pipeline de `.github/workflows/deploy.yml`).

## Próximos pasos (no incluidos todavía)

- Enviar el token de Azure AD en cada request al backend (hoy los microservicios no validan nada, así que el frontend tampoco lo envía).
- Actualizaciones en tiempo real (WebSockets/Kafka) en vez del botón "Actualizar" manual en Cocina/Despacho/Auditoría.
