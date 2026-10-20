import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Evitar problemas de caché durante el desarrollo y añadir cabeceras básicas de seguridad
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'SAMEORIGIN')
        super().end_headers()

def run_server():
    os.chdir(DIRECTORY)
    # Enlazar exclusivamente a 127.0.0.1 (localhost) para evitar exposición en red local/WiFi
    with socketserver.TCPServer(("127.0.0.1", PORT), CustomHandler) as httpd:
        url = f"http://localhost:{PORT}/login.html"
        print("=" * 70)
        print("  Plataforma Digital para Proyectos de Absorción de Carbono")
        print("  IDAF - Centro de Investigaciones Agroforestales")
        print(f"  Directorio: {DIRECTORY}")
        print(f"  URL Acceso: {url}")
        print("  Presiona Ctrl + C para detener el servidor")
        print("=" * 70)
        
        # Abrir automáticamente en el navegador predeterminado
        try:
            webbrowser.open(url)
        except Exception:
            pass

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")
            sys.exit(0)

if __name__ == "__main__":
    run_server()
