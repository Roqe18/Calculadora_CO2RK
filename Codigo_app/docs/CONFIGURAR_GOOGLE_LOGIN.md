# Guía de Configuración: Inicio de Sesión con Google (Google Sign-In)

La **Plataforma Digital para Proyectos de Absorción de Carbono** cuenta con un módulo de autenticación basado en **Google Identity Services (GIS)**, el estándar oficial y moderno de Google (OAuth 2.0 / JWT).

---

## ⚡ 1. Acceso de Prueba Rápido (Modo Demo)

Para probar la plataforma en tu ordenador local sin esperar a dar de alta credenciales en Google:
1. Al abrir la página de inicio de sesión (`login.html`), haz clic en:
   ```text
   [ Entrar como Técnico IDAF (Demo) ]
   ```
2. Accederás de inmediato al panel de cálculo con perfil técnico asignado.
3. En la esquina superior derecha verás tu avatar y el botón para **Cerrar sesión**.

---

## 🔑 2. Pasos para Configurar Google OAuth en Producción

Para que tus clientes o técnicos inicien sesión con sus cuentas reales de Google (`@idaf.es` o correos autorizados):

### Paso 2.1: Crear o acceder a tu proyecto en Google Cloud
1. Entra en [Google Cloud Console](https://console.cloud.google.com/).
2. Inicia sesión con la cuenta corporativa de IDAF y crea un nuevo proyecto (ej. `IDAF-Plataforma-Carbono`).

### Paso 2.2: Configurar la Pantalla de Consentimiento OAuth
1. En el menú lateral, dirígete a **APIs y servicios > Pantalla de consentimiento de OAuth**.
2. Selecciona **Externo** (o **Interno** si tienes Google Workspace IDAF).
3. Rellena los datos básicos:
   - **Nombre de la aplicación**: *Plataforma Digital para Proyectos de Absorción de Carbono*
   - **Correo electrónico de soporte**: tu email corporativo (ej. `social@idaf.es`).
   - **Dominio de la aplicación**: `https://www.idaf.es` (o la URL donde alojes la plataforma).
4. Guarda y continúa (no es necesario solicitar alcances/scopes especiales adicionales a `profile` y `email`).

### Paso 2.3: Crear las Credenciales OAuth 2.0
1. Ve a **APIs y servicios > Credenciales**.
2. Haz clic en **Crear credenciales > ID de cliente de OAuth**.
3. Selecciona tipo de aplicación: **Aplicación web**.
4. En **Orígenes de JavaScript autorizados**, añade las URLs desde donde se ejecutará la app:
   - Para desarrollo local: `http://localhost:8000` y `http://127.0.0.1:8000`
   - Para producción en tu web: `https://www.idaf.es` (y/o el subdominio o carpeta donde esté instalada).
5. Haz clic en **Crear**.
6. Copia el **ID de cliente** generado (tendrá un formato similar a `123456789-abcdefghijklmnop.apps.googleusercontent.com`).

### Paso 2.4: Pegar tu Client ID en el código
Abre el archivo [`Codigo_app/js/config.js`](file:///r:/OneDrive/OneDrive%20-%20centro%20de%20investigaciones%20aplicadas%20al%20desarrollo%20agroforestal%20SL/Antigravity/Calculadora_CO2RK/Codigo_app/js/config.js) y reemplaza la línea correspondiente:

```javascript
export const CONFIG = {
  AUTH: {
    GOOGLE_CLIENT_ID: "PEGA_AQUI_TU_CLIENT_ID.apps.googleusercontent.com",
    // ...
  },
  // ...
};
```

¡Listo! A partir de ese momento, el botón oficial **«Iniciar sesión con Google»** estará 100% activo y validará las identidades en tiempo real.
