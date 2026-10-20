/**
 * MÓDULO DE AUTENTICACIÓN GOOGLE IDENTITY SERVICES (GIS)
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 */

import { CONFIG } from '../config.js';

export class AuthManager {
  static STORAGE_KEY = 'idaf_auth_user';

  /**
   * Obtiene el usuario autenticado actualmente
   */
  static getUser() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error("Error al leer sesión de usuario:", e);
      return null;
    }
  }

  /**
   * Indica si hay una sesión activa
   */
  static isAuthenticated() {
    const user = this.getUser();
    return user !== null && !!user.email;
  }

  /**
   * Guarda los datos del usuario en almacenamiento local
   */
  static setUser(userData) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      ...userData,
      loginTimestamp: Date.now()
    }));
  }

  /**
   * Decodifica el token JWT devuelto por Google Identity Services
   */
  static decodeJwtResponse(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error al decodificar JWT de Google:", e);
      return null;
    }
  }

  /**
   * Manejador de respuesta tras login exitoso con Google
   */
  static handleGoogleCredentialResponse(response) {
    if (!response || !response.credential) {
      alert("Error: No se recibió la credencial de autenticación de Google.");
      return;
    }

    const payload = this.decodeJwtResponse(response.credential);
    if (payload) {
      const user = {
        name: payload.name || payload.given_name || "Usuario Google",
        email: payload.email,
        picture: payload.picture || "assets/logo_idaf_isotipo.png",
        googleId: payload.sub,
        authProvider: 'google'
      };

      this.setUser(user);
      window.location.href = 'index.html';
    } else {
      alert("No se pudo procesar el perfil de Google.");
    }
  }

  /**
   * Inicia sesión en modo demostración/técnico IDAF (para pruebas sin configurar Google Cloud)
   */
  static loginDemo() {
    this.setUser({
      ...CONFIG.AUTH.DEMO_USER,
      authProvider: 'demo'
    });
    window.location.href = 'index.html';
  }

  /**
   * Cierra sesión y redirige a la página de login
   */
  static logout() {
    localStorage.removeItem(this.STORAGE_KEY);
    /* global google */
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      try {
        google.accounts.id.disableAutoSelect();
      } catch (e) {
        // Ignorar si no está inicializado
      }
    }
    window.location.href = 'login.html';
  }

  /**
   * Inicializa el botón oficial de Google en la página de login
   */
  static initGoogleSignIn(buttonContainerId) {
    /* global google */
    const clientId = CONFIG.AUTH.GOOGLE_CLIENT_ID;

    const setupGoogle = () => {
      if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
        console.warn("Google Identity Services SDK aún no disponible.");
        return;
      }

      // Si aún tiene el Client ID de ejemplo, mostrar advertencia en consola
      const isPlaceholder = clientId.includes("YOUR_GOOGLE_CLIENT_ID");

      if (!isPlaceholder) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => AuthManager.handleGoogleCredentialResponse(res)
        });

        const btnContainer = document.getElementById(buttonContainerId);
        if (btnContainer) {
          google.accounts.id.renderButton(btnContainer, {
            theme: "filled_blue",
            size: "large",
            shape: "rectangular",
            text: "signin_with",
            logo_alignment: "left",
            width: "320"
          });
        }
      }
    };

    if (document.readyState === 'complete') {
      setupGoogle();
    } else {
      window.addEventListener('load', setupGoogle);
    }
  }

  /**
   * Protege una página: si el usuario no está logueado, redirige a login.html
   */
  static requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
}
