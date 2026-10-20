# Guía de Integración de CO₂RK en tu Sitio Web

Esta plataforma ha sido construida como una aplicación web moderna que no depende de compilaciones complejas ni servidores Node/PHP para funcionar. Puede ser alojada en cualquier servidor web y embebida con total facilidad.

---

## Opción 1: Alojamiento en una subcarpeta de tu web (Recomendado)

Si tu web tiene acceso a cPanel, FTP o servidor web (Apache / Nginx):

1. Sube los archivos de la carpeta `Calculadora_CO2RK` a una subcarpeta pública de tu web, por ejemplo:
   ```text
   https://tudominio.com/calculadora-co2/
   ```
2. La plataforma funcionará inmediatamente al acceder a esa URL en cualquier navegador de escritorio o móvil.

---

## Opción 2: Embeber en WordPress mediante un `<iframe>`

Si tienes un sitio WordPress u otro CMS y quieres que la calculadora aparezca integrada dentro de una página o entrada de tu blog/servicio:

1. Añade un bloque **HTML Personalizado** en el editor de WordPress (Gutenberg o Elementor).
2. Pega el siguiente código HTML:

```html
<div style="position: relative; width: 100%; min-height: 900px; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
  <iframe 
    src="https://tudominio.com/calculadora-co2/" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="Calculadora de Créditos de Carbono Forestal CO2RK"
    loading="lazy">
  </iframe>
</div>
```

---

## Opción 3: Alojamiento Gratuito en Vercel, Netlify o GitHub Pages

Dado que todo el motor corre en el navegador del cliente:
- Puedes conectar este repositorio o arrastrar la carpeta a **Netlify Drop** o **Vercel**.
- Obtendrás una URL segura HTTPS de alta velocidad de forma 100% gratuita con disponibilidad global.

---

## Probando en Local en tu Ordenador

Para ver y probar la calculadora en tu equipo antes de subirla a tu web:

1. Abre una terminal de PowerShell en esta carpeta.
2. Ejecuta:
   ```powershell
   py server/dev_server.py
   ```
3. Se abrirá automáticamente tu navegador en `http://localhost:8000`.
