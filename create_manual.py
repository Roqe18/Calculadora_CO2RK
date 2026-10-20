# -*- coding: utf-8 -*-
"""
Generador completo del Manual de Usuario Oficial IDAF (HTML + PDF).
"""

import os
import sys
import base64
import subprocess
import shutil

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "Codigo_app", "assets")
DOCS_DIR = os.path.join(BASE_DIR, "Codigo_app", "docs")
OUTPUT_HTML = os.path.join(DOCS_DIR, "MANUAL_USUARIO_IDAF.html")
OUTPUT_PDF_DOCS = os.path.join(DOCS_DIR, "Manual_Usuario_Calculadora_IDAF.pdf")
OUTPUT_PDF_ROOT = os.path.join(BASE_DIR, "Manual_Usuario_Calculadora_IDAF.pdf")

def get_base64_image(filename):
    path = os.path.join(ASSETS_DIR, filename)
    if os.path.exists(path):
        with open(path, "rb") as f:
            data = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/png;base64,{data}"
    return ""

logo_horizontal = get_base64_image("logo_idaf_horizontal.png")
logo_isotipo = get_base64_image("logo_idaf_isotipo.png")
logo_vertical = get_base64_image("logo_idaf_vertical.png")

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manual de Usuario | Plataforma Digital de Proyectos de Absorción de Carbono - IDAF</title>
  
  <!-- Tipografía Corporativa Oficial: Poppins -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
  
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>

  <style>
    /* VARIABLES CORPORATIVAS IDAF (MANUAL DE IDENTIDAD OFICIAL) */
    :root {{
      --idaf-dark: #005027;       /* Pantone 357 C */
      --idaf-light: #76B72B;      /* Pantone 368 C */
      --idaf-dark-hover: #003b1d;
      --idaf-light-hover: #629c22;
      --idaf-bg-soft: #f7faf5;
      --idaf-tint-light: #f0fdf4;
      --idaf-border-light: rgba(118, 183, 43, 0.35);
      
      --callout-red: #dc2626;     /* Rojo técnico de atención */
      --callout-bg: #fef2f2;
      --callout-border: #f87171;
      
      --slate-900: #0f172a;
      --slate-800: #1e293b;
      --slate-700: #334155;
      --slate-600: #475569;
      --slate-500: #64748b;
      --slate-300: #cbd5e1;
      --slate-200: #e2e8f0;
      --slate-100: #f1f5f9;
      --slate-50:  #f8fafc;
      --white: #ffffff;
      
      --font-main: 'Poppins', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: var(--font-main);
      color: var(--slate-800);
      background-color: #e5e7eb;
      font-size: 13px;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }}

    /* ESTRUCTURA DE PÁGINAS A4 PARA IMPRESIÓN Y LECTURA */
    .page {{
      width: 210mm;
      min-height: 297mm;
      padding: 16mm 16mm 18mm 16mm;
      margin: 15px auto;
      background: var(--white);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }}

    @page {{
      size: A4 portrait;
      margin: 0;
    }}

    @media print {{
      body {{
        background: transparent;
      }}
      .page {{
        margin: 0 !important;
        box-shadow: none !important;
        page-break-after: always !important;
        break-after: page !important;
        height: 297mm;
        max-height: 297mm;
        width: 210mm;
      }}
      .no-print {{
        display: none !important;
      }}
    }}

    /* BOTÓN FLOTANTE EN PANTALLA */
    .screen-actions-bar {{
      position: fixed;
      top: 15px;
      right: 20px;
      z-index: 9999;
      display: flex;
      gap: 10px;
    }}
    .btn-floating {{
      background: var(--idaf-dark);
      color: white;
      border: 2px solid var(--idaf-light);
      padding: 10px 18px;
      font-family: var(--font-main);
      font-weight: 600;
      font-size: 13px;
      border-radius: 30px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 80, 39, 0.3);
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      transition: all 0.2s ease;
    }}
    .btn-floating:hover {{
      background: var(--idaf-dark-hover);
      transform: translateY(-2px);
    }}

    /* ENCABEZADOS Y PIES DE PÁGINA COMUNES */
    .page-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid var(--idaf-light);
      padding-bottom: 8px;
      margin-bottom: 14px;
    }}
    .page-header-logo {{
      height: 28px;
      width: auto;
      object-fit: contain;
    }}
    .page-header-title {{
      font-size: 11px;
      font-weight: 600;
      color: var(--idaf-dark);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: right;
    }}
    .page-header-sub {{
      font-size: 9.5px;
      color: var(--slate-500);
      font-weight: 400;
    }}

    .page-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--slate-200);
      padding-top: 8px;
      margin-top: 14px;
      font-size: 9px;
      color: var(--slate-500);
    }}
    .page-footer strong {{
      color: var(--idaf-dark);
    }}

    .page-body {{
      flex: 1;
      display: flex;
      flex-direction: column;
    }}

    /* TIPOGRAFÍA Y TÍTULOS */
    h1, h2, h3, h4 {{
      color: var(--idaf-dark);
      font-weight: 700;
      line-height: 1.25;
    }}
    .section-title {{
      font-size: 17px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1.5px solid var(--idaf-border-light);
      padding-bottom: 5px;
    }}
    .section-subtitle {{
      font-size: 11.5px;
      color: var(--slate-600);
      margin-bottom: 12px;
    }}

    /* PORTADA */
    .cover-container {{
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: left;
    }}
    .cover-top {{
      border-bottom: 4px solid var(--idaf-light);
      padding-bottom: 20px;
    }}
    .cover-logo {{
      height: 60px;
      width: auto;
      margin-bottom: 25px;
    }}
    .cover-badge {{
      display: inline-block;
      background: var(--idaf-tint-light);
      color: var(--idaf-dark);
      border: 1.5px solid var(--idaf-light);
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 14px;
    }}
    .cover-title {{
      font-size: 28px;
      font-weight: 800;
      color: var(--idaf-dark);
      line-height: 1.2;
      margin-bottom: 12px;
    }}
    .cover-title span {{
      color: var(--idaf-light);
    }}
    .cover-desc {{
      font-size: 14px;
      color: var(--slate-700);
      font-weight: 400;
      max-width: 600px;
      line-height: 1.5;
    }}

    .cover-case-box {{
      background: var(--idaf-bg-soft);
      border: 1.5px solid var(--idaf-light);
      border-left: 6px solid var(--idaf-dark);
      padding: 16px 20px;
      border-radius: 8px;
      margin: 20px 0;
    }}
    .cover-case-title {{
      font-size: 13px;
      font-weight: 700;
      color: var(--idaf-dark);
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}
    .cover-case-desc {{
      font-size: 11.5px;
      color: var(--slate-600);
      line-height: 1.5;
    }}

    .cover-meta-grid {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      padding: 14px 18px;
      border-radius: 8px;
      font-size: 11px;
    }}
    .cover-meta-item strong {{
      color: var(--idaf-dark);
      display: block;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }}

    /* STEPPER VISUAL SUPERIOR */
    .stepper-mini {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--slate-50);
      border: 1px solid var(--slate-200);
      border-radius: 8px;
      padding: 8px 14px;
      margin-bottom: 14px;
    }}
    .step-pill {{
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 600;
      color: var(--slate-500);
    }}
    .step-pill.active {{
      color: var(--idaf-dark);
    }}
    .step-pill.completed {{
      color: var(--idaf-light);
    }}
    .step-num {{
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--slate-200);
      color: var(--slate-600);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 700;
    }}
    .step-pill.active .step-num {{
      background: var(--idaf-dark);
      color: white;
    }}
    .step-pill.completed .step-num {{
      background: var(--idaf-light);
      color: white;
    }}
    .step-arrow {{
      color: var(--slate-300);
      font-size: 11px;
    }}

    /* MAQUETA DE INTERFAZ DE LA APLICACIÓN (UI CARD) */
    .ui-mockup-card {{
      background: white;
      border: 1.5px solid var(--slate-300);
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      padding: 10px 14px;
      margin-bottom: 10px;
      position: relative;
    }}
    .ui-mockup-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--slate-200);
      padding-bottom: 6px;
      margin-bottom: 8px;
    }}
    .ui-mockup-title {{
      font-size: 12px;
      font-weight: 700;
      color: var(--idaf-dark);
      display: flex;
      align-items: center;
      gap: 7px;
    }}

    /* ESTILOS DE RECUADROS DESTACADOS (CALLOUTS VISUALES) */
    .callout-box {{
      position: relative;
      border: 2px solid var(--callout-red);
      background: rgba(254, 242, 242, 0.45);
      border-radius: 6px;
      padding: 4px 8px;
      transition: all 0.2s ease;
    }}
    .callout-box.highlight-btn {{
      border: 2.5px solid #b91c1c;
      background: rgba(254, 226, 226, 0.7);
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
    }}
    .callout-box.highlight-green {{
      border: 2px solid var(--idaf-dark);
      background: rgba(240, 253, 244, 0.55);
    }}

    .callout-badge {{
      position: absolute;
      top: -9px;
      left: 8px;
      background: var(--callout-red);
      color: white;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 10px;
      letter-spacing: 0.3px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 5;
    }}
    .callout-badge.green {{
      background: var(--idaf-dark);
    }}
    .callout-badge.accent {{
      background: #0284c7;
    }}

    /* SIMULADORES DE FORMULARIOS */
    .mock-grid-3 {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 6px;
    }}
    .mock-grid-2 {{
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      margin-bottom: 6px;
    }}
    .mock-field {{
      display: flex;
      flex-direction: column;
      gap: 2px;
    }}
    .mock-label {{
      font-size: 9px;
      font-weight: 600;
      color: var(--slate-700);
    }}
    .mock-input {{
      background: white;
      border: 1px solid var(--slate-300);
      border-radius: 4px;
      padding: 4px 7px;
      font-size: 10px;
      font-weight: 600;
      color: var(--idaf-dark);
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 25px;
    }}
    .mock-input.readonly {{
      background: var(--slate-100);
      color: var(--slate-700);
    }}
    .mock-btn {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-weight: 700;
      font-size: 10.5px;
      padding: 6px 12px;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;
      height: 28px;
    }}
    .mock-btn-primary {{
      background: var(--idaf-dark);
      color: white;
      border: 1px solid var(--idaf-dark);
    }}
    .mock-btn-secondary {{
      background: var(--slate-100);
      color: var(--slate-700);
      border: 1px solid var(--slate-300);
    }}
    .mock-btn-outline {{
      background: white;
      color: var(--idaf-dark);
      border: 1.5px solid var(--idaf-light);
    }}

    /* TABLAS DE ESPECIFICACIÓN Y RECUADROS */
    .spec-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin-top: 6px;
      margin-bottom: 8px;
    }}
    .spec-table th {{
      background: var(--idaf-dark);
      color: white;
      padding: 5px 7px;
      text-align: left;
      font-weight: 600;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }}
    .spec-table td {{
      padding: 4px 7px;
      border-bottom: 1px solid var(--slate-200);
      vertical-align: middle;
    }}
    .spec-table tr:nth-child(even) {{
      background: var(--slate-50);
    }}
    .pin-circle {{
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--callout-red);
      color: white;
      font-weight: 800;
      font-size: 9.5px;
      margin-right: 4px;
    }}
    .pin-circle.green {{
      background: var(--idaf-dark);
    }}
    .pin-circle.btn {{
      background: #b91c1c;
      border-radius: 4px;
      width: auto;
      padding: 0 5px;
      height: 18px;
      font-size: 9px;
    }}

    .val-pill {{
      font-family: monospace;
      font-size: 10px;
      background: #e2e8f0;
      color: #0f172a;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      display: inline-block;
    }}

    /* ALERTAS INFORMATIVAS */
    .info-card {{
      background: var(--idaf-bg-soft);
      border-left: 4px solid var(--idaf-light);
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 10.5px;
      color: var(--slate-700);
      margin: 8px 0;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }}
    .info-card i {{
      color: var(--idaf-dark);
      font-size: 14px;
      margin-top: 1px;
    }}

    .rule-card {{
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 10.5px;
      color: #92400e;
      margin: 8px 0;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }}
    .rule-card i {{
      color: #b45309;
      font-size: 14px;
      margin-top: 1px;
    }}

    /* TARJETAS KPI DE RESULTADOS */
    .kpi-row {{
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 10px;
    }}
    .kpi-mini-card {{
      background: white;
      border: 1px solid var(--slate-200);
      border-top: 3px solid var(--idaf-dark);
      border-radius: 6px;
      padding: 6px 8px;
      text-align: center;
    }}
    .kpi-mini-card.accent {{
      border-top-color: var(--idaf-light);
    }}
    .kpi-mini-card.amber {{
      border-top-color: #f59e0b;
    }}
    .kpi-mini-title {{
      font-size: 9px;
      font-weight: 600;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }}
    .kpi-mini-val {{
      font-size: 13.5px;
      font-weight: 800;
      color: var(--idaf-dark);
      margin: 2px 0;
    }}
    .kpi-mini-sub {{
      font-size: 8.5px;
      color: var(--slate-400);
    }}
  </style>
</head>
<body>

  <!-- BARRA FLOTANTE PARA VISUALIZACIÓN EN PANTALLA -->
  <div class="screen-actions-bar no-print">
    <button class="btn-floating" onclick="window.print();" title="Imprimir o guardar como PDF">
      <i class="fa-solid fa-file-pdf"></i>
      <span>Guardar / Imprimir PDF</span>
    </button>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 1: PORTADA CORPORATIVA OFICIAL IDAF                               -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="cover-container">
      <div class="cover-top">
        <img src="{logo_horizontal}" alt="IDAF" class="cover-logo">
        <div class="cover-badge">
          <i class="fa-solid fa-tree"></i> Documento Oficial de Operación Técnica
        </div>
        <h1 class="cover-title">
          Manual de Usuario de la <span>Calculadora CO₂</span>
        </h1>
        <div style="font-size: 16px; font-weight: 600; color: var(--idaf-dark); margin-bottom: 10px;">
          Plataforma Digital para Proyectos de Absorción de Carbono Forestal (IFM / MGF)
        </div>
        <p class="cover-desc">
          Guía técnica ilustrada paso a paso con recuadros de atención visual sobre cada botón, campo y parámetro requerido para el cálculo, cuantificación y certificación de créditos de absorción.
        </p>
      </div>

      <!-- CASO PRÁCTICO DESTACADO -->
      <div class="cover-case-box">
        <div class="cover-case-title">
          <i class="fa-solid fa-bookmark" style="color: var(--idaf-dark);"></i>
          Caso Práctico Guiado: Finca "La Dehesilla y El Robledal" (Córdoba)
        </div>
        <p class="cover-case-desc">
          Este manual utiliza a lo largo de todos sus capítulos un proyecto real modelo: actuación de <strong>2. Densificaciones</strong> sobre alcornocal (<em>Quercus suber</em>) de <strong>45.20 hectáreas</strong> en Sierra Morena (Cardeña, Córdoba), con muestreo de inventario pie a pie, caracterización de matorral mediterráneo y cálculo de créditos netos a 30 años.
        </p>
      </div>

      <!-- METADATOS TÉCNICOS Y CORPORATIVOS -->
      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <strong>Entidad Emisora</strong>
          <span>Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. (IDAF)</span>
        </div>
        <div class="cover-meta-item">
          <strong>Metodología Científica</strong>
          <span>LIFE Deliverable D6.2 (Ruiz-Peinado et al., 2012 / Montero et al., 2020)</span>
        </div>
        <div class="cover-meta-item">
          <strong>Edición & Versión</strong>
          <span>Versión 2.1 • Edición Oficial 2026</span>
        </div>
        <div class="cover-meta-item">
          <strong>Sede Institucional</strong>
          <span>Campus Rabanales, Edif. Leonardo Da Vinci • Córdoba, España</span>
        </div>
      </div>

      <div style="font-size: 10px; color: var(--slate-400); text-align: center; border-top: 1px solid var(--slate-200); padding-top: 12px; margin-top: 15px;">
        Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L. &copy; 2026 • Todos los derechos reservados • www.idaf.es
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 2: RESUMEN DEL SISTEMA Y PANTALLA DE ACCESO (LOGIN)               -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 1: Acceso y Principios del Sistema</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <h2 class="section-title"><i class="fa-solid fa-shield-halved"></i> 1. Principios de la Plataforma y Privacidad</h2>
      <p class="section-subtitle">
        La plataforma opera 100% en el navegador (Client-Side). Los archivos de inventario y perímetros KML <strong>nunca se transmiten a servidores externos</strong>, garantizando secreto técnico y seguridad total.
      </p>

      <!-- FLUJO EN 3 ETAPAS -->
      <div class="stepper-mini" style="margin-bottom: 16px;">
        <div class="step-pill active">
          <div class="step-num">1</div>
          <span>Datos Proyecto & KML</span>
        </div>
        <i class="fa-solid fa-angle-right step-arrow"></i>
        <div class="step-pill">
          <div class="step-num">2</div>
          <span>Inventario Pie a Pie</span>
        </div>
        <i class="fa-solid fa-angle-right step-arrow"></i>
        <div class="step-pill">
          <div class="step-num">3</div>
          <span>Resultados & Certificación</span>
        </div>
      </div>

      <h2 class="section-title" style="margin-top: 6px;"><i class="fa-solid fa-right-to-bracket"></i> 2. Pantalla de Acceso e Inicio de Sesión</h2>
      <p class="section-subtitle">
        Al abrir la herramienta (mediante <span class="val-pill">login.html</span> o el lanzador <span class="val-pill">INICIAR_APP.bat</span>), se presenta la pantalla de acceso corporativo.
      </p>

      <!-- MAQUETA VISUAL LOGIN CON RECUADROS -->
      <div class="ui-mockup-card" style="max-width: 480px; margin: 0 auto 14px auto;">
        <div style="text-align: center; margin-bottom: 12px;">
          <img src="{logo_horizontal}" alt="IDAF" style="height: 38px;">
          <div style="font-size: 13px; font-weight: 700; color: var(--idaf-dark); margin-top: 6px;">
            Plataforma Digital de Absorción de Carbono
          </div>
          <div style="font-size: 10px; color: var(--slate-500);">Identificación de Usuarios y Técnicos</div>
        </div>

        <!-- RECUADRO 1: BOTÓN GOOGLE -->
        <div class="callout-box highlight-btn" style="margin-bottom: 12px;">
          <div class="callout-badge"><i class="fa-solid fa-arrow-pointer"></i> BOTÓN 1</div>
          <div style="background: white; border: 1px solid var(--slate-300); border-radius: 4px; padding: 7px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; font-size: 11px; color: var(--slate-700);">
            <i class="fa-brands fa-google" style="color: #4285f4; font-size: 14px;"></i> Iniciar sesión con Google
          </div>
        </div>

        <div style="text-align: center; font-size: 10px; color: var(--slate-400); margin: 6px 0;">— o bien acceso evaluador —</div>

        <!-- RECUADRO 2: BOTÓN DEMO -->
        <div class="callout-box highlight-btn">
          <div class="callout-badge"><i class="fa-solid fa-arrow-pointer"></i> BOTÓN 2</div>
          <div style="background: var(--idaf-dark); color: white; border-radius: 4px; padding: 7px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 700; font-size: 11px;">
            <i class="fa-solid fa-user-check"></i> Acceder en Modo Demo / Invitado Técnico
          </div>
        </div>
      </div>

      <!-- TABLA DE BOTONES LOGIN -->
      <table class="spec-table">
        <thead>
          <tr>
            <th style="width: 15%;">Elemento</th>
            <th style="width: 25%;">Control / Botón</th>
            <th style="width: 30%;">¿Cuándo se debe usar?</th>
            <th style="width: 30%;">Acción que ejecuta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pin-circle btn">BOTÓN 1</span></td>
            <td><strong>Iniciar sesión con Google</strong></td>
            <td>Técnicos de IDAF o clientes con cuentas corporativas autorizadas.</td>
            <td>Valida la identidad contra Google OAuth 2.0 y vincula los informes al correo del técnico.</td>
          </tr>
          <tr>
            <td><span class="pin-circle btn">BOTÓN 2</span></td>
            <td><strong>Acceder en Modo Demo</strong></td>
            <td>Evaluadores externos, propietarios forestales o demostraciones sin cuenta configurada.</td>
            <td>Otorga acceso instantáneo con perfil técnico invitado y desbloquea todas las funcionalidades.</td>
          </tr>
        </tbody>
      </table>

      <div class="info-card">
        <i class="fa-solid fa-circle-info"></i>
        <div>
          <strong>Recomendación IDAF:</strong> Para la mayoría de evaluaciones de campo o si trabajas en local sin conexión a internet activa, pulsa directamente en <strong>[BOTÓN 2] Acceder en Modo Demo</strong> para acceder al asistente de cálculo en 1 segundo.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 2</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 3: PASO 1 - DATOS GENERALES, ELEGIBILIDAD Y MEMORIA TÉCNICA       -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 2: Paso 1 - Datos Generales y Elegibilidad</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <!-- STEPPER -->
      <div class="stepper-mini">
        <div class="step-pill active"><div class="step-num">1</div><span>Datos Proyecto & KML (Activo)</span></div>
        <i class="fa-solid fa-angle-right step-arrow"></i>
        <div class="step-pill"><div class="step-num">2</div><span>Inventario Pie a Pie</span></div>
        <i class="fa-solid fa-angle-right step-arrow"></i>
        <div class="step-pill"><div class="step-num">3</div><span>Resultados & Certificación</span></div>
      </div>

      <h2 class="section-title"><i class="fa-solid fa-folder-open"></i> Formulario de Datos Generales del Proyecto</h2>
      <p class="section-subtitle">
        Introduce la información catastral y selvícola. Los campos recuadrados indican exactamente qué rellenar para el caso práctico modelo:
      </p>

      <!-- MAQUETA PASO 1 FORMULARIO -->
      <div class="ui-mockup-card">
        <div class="ui-mockup-header">
          <span class="ui-mockup-title"><i class="fa-solid fa-pen-to-square"></i> Ficha del Proyecto Forestal</span>
          <span style="font-size: 10px; color: var(--idaf-dark); font-weight: 600;">* Campos requeridos</span>
        </div>

        <!-- FILA 1 -->
        <div class="mock-grid-3">
          <div class="callout-box">
            <span class="callout-badge">CAMPO 1</span>
            <div class="mock-field">
              <span class="mock-label">Nombre del Proyecto *</span>
              <div class="mock-input">Proyecto Fijación Carbono La Dehesilla</div>
            </div>
          </div>
          <div class="callout-box">
            <span class="callout-badge">CAMPO 2</span>
            <div class="mock-field">
              <span class="mock-label">Titular / Propietario *</span>
              <div class="mock-input">Agropecuaria Sierra Morena S.L.</div>
            </div>
          </div>
          <div class="callout-box">
            <span class="callout-badge">CAMPO 3</span>
            <div class="mock-field">
              <span class="mock-label">NIF / CIF del Titular *</span>
              <div class="mock-input">B-14987654</div>
            </div>
          </div>
        </div>

        <!-- FILA 2 -->
        <div class="mock-grid-3">
          <div class="callout-box">
            <span class="callout-badge">CAMPO 4</span>
            <div class="mock-field">
              <span class="mock-label">Nombre Finca o Monte *</span>
              <div class="mock-input">Finca La Dehesilla y El Robledal</div>
            </div>
          </div>
          <div class="callout-box">
            <span class="callout-badge">CAMPO 5</span>
            <div class="mock-field">
              <span class="mock-label">Comunidad Autónoma *</span>
              <div class="mock-input">Andalucía <i class="fa-solid fa-chevron-down" style="font-size: 9px; color: #94a3b8;"></i></div>
            </div>
          </div>
          <div class="callout-box">
            <span class="callout-badge">CAMPO 6</span>
            <div class="mock-field">
              <span class="mock-label">Provincia *</span>
              <div class="mock-input">Córdoba</div>
            </div>
          </div>
        </div>

        <!-- FILA 3 -->
        <div class="mock-grid-3">
          <div class="callout-box">
            <span class="callout-badge">CAMPO 7</span>
            <div class="mock-field">
              <span class="mock-label">Término Municipal *</span>
              <div class="mock-input">Cardeña</div>
            </div>
          </div>
          <div class="callout-box">
            <span class="callout-badge">CAMPO 8</span>
            <div class="mock-field">
              <span class="mock-label">Referencia Catastral</span>
              <div class="mock-input">14016A014000250000EK</div>
            </div>
          </div>
          <div class="callout-box">
            <span class="callout-badge">CAMPO 9</span>
            <div class="mock-field">
              <span class="mock-label">Especie Principal *</span>
              <div class="mock-input">Quercus suber (Alcornoque) <i class="fa-solid fa-chevron-down" style="font-size: 9px; color: #94a3b8;"></i></div>
            </div>
          </div>
        </div>

        <!-- FILA 4: ACTUACIÓN -->
        <div class="mock-grid-2" style="margin-top: 4px;">
          <div class="callout-box">
            <span class="callout-badge">CAMPO 10</span>
            <div class="mock-field">
              <span class="mock-label">Régimen / Tratamiento Actual</span>
              <div class="mock-input">Monte alcornocal adehesado <i class="fa-solid fa-chevron-down" style="font-size: 9px; color: #94a3b8;"></i></div>
            </div>
          </div>
          <div class="callout-box highlight-btn">
            <span class="callout-badge"><i class="fa-solid fa-star"></i> CAMPO 11 (CLAVE)</span>
            <div class="mock-field">
              <span class="mock-label" style="color: #b91c1c; font-weight: 700;">Actuación / Estrategia de Créditos *</span>
              <div class="mock-input" style="border-color: #b91c1c; font-weight: 700;">2. Densificaciones <i class="fa-solid fa-chevron-down" style="font-size: 9px; color: #b91c1c;"></i></div>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL ELEGIBILIDAD Y MEMORIA PDF -->
      <div class="callout-box" style="margin-bottom: 12px; background: #f0fdf4; border-color: var(--idaf-dark);">
        <span class="callout-badge green">RECUADRO 12: ELEGIBILIDAD & SUBIDA DE MEMORIA PDF</span>
        <div style="font-size: 11px; font-weight: 700; color: var(--idaf-dark); margin-bottom: 4px;">
          <i class="fa-solid fa-clipboard-check"></i> Criterios de Elegibilidad: 2. Densificaciones
        </div>
        <div style="font-size: 10px; color: var(--slate-600); margin-bottom: 6px;">
          ✓ Masa con baja espesura o envejecida &nbsp;•&nbsp; ✓ Ausencia de regeneración suficiente &nbsp;•&nbsp; ✓ Compromiso permanencia 30 años
        </div>
        <div style="border: 1.5px dashed var(--idaf-dark); border-radius: 6px; background: white; padding: 8px; text-align: center;">
          <i class="fa-solid fa-file-pdf" style="color: #dc2626; font-size: 18px;"></i>
          <span style="font-size: 10.5px; font-weight: 600; color: var(--idaf-dark); margin-left: 6px;">
            Memoria_Tecnica_La_Dehesilla.pdf
          </span>
          <span style="font-size: 9.5px; color: #16a34a; font-weight: 600; margin-left: 8px;">
            <i class="fa-solid fa-circle-check"></i> Documento cargado y validado
          </span>
        </div>
      </div>

      <!-- TABLA DETALLADA DE CAMPOS -->
      <table class="spec-table">
        <thead>
          <tr>
            <th style="width: 14%;">Elemento</th>
            <th style="width: 26%;">Campo en la Interfaz</th>
            <th style="width: 32%;">Valor Exacto (Caso Práctico)</th>
            <th style="width: 28%;">Instrucción Técnica IDAF</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pin-circle">1</span></td>
            <td><strong>Nombre del Proyecto</strong></td>
            <td><span class="val-pill">Proyecto Fijación Carbono La Dehesilla</span></td>
            <td>Nombre comercial identificativo del expediente.</td>
          </tr>
          <tr>
            <td><span class="pin-circle">2 y 3</span></td>
            <td><strong>Titular y NIF / CIF</strong></td>
            <td><span class="val-pill">Agropecuaria Sierra Morena S.L.</span> / <span class="val-pill">B-14987654</span></td>
            <td>Propietario registral o entidad promotora del proyecto.</td>
          </tr>
          <tr>
            <td><span class="pin-circle">4 a 7</span></td>
            <td><strong>Finca, CC.AA., Prov., Municipio</strong></td>
            <td><span class="val-pill">La Dehesilla</span> • <span class="val-pill">Andalucía</span> • <span class="val-pill">Córdoba</span> • <span class="val-pill">Cardeña</span></td>
            <td>Ubicación geográfica exacta para el registro MITECO.</td>
          </tr>
          <tr>
            <td><span class="pin-circle">9 y 10</span></td>
            <td><strong>Especie Principal y Régimen</strong></td>
            <td><span class="val-pill">Quercus suber</span> / <span class="val-pill">Monte alcornocal adehesado</span></td>
            <td>Selecciona el modelo alométrico Ruiz-Peinado de referencia.</td>
          </tr>
          <tr>
            <td><span class="pin-circle btn">11</span></td>
            <td><strong>Actuación / Estrategia *</strong></td>
            <td><span class="val-pill" style="background:#fee2e2; color:#991b1b;">2. Densificaciones</span></td>
            <td><strong>CRUCIAL:</strong> Define la lógica de la Línea de Base en Paso 2 y 3.</td>
          </tr>
          <tr>
            <td><span class="pin-circle green">12</span></td>
            <td><strong>Memoria Técnica PDF *</strong></td>
            <td><span class="val-pill">Memoria_Tecnica_La_Dehesilla.pdf</span></td>
            <td>Arrastra el PDF justificativo de elegibilidad exigido por la norma.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 3</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 4: PASO 1 (CONT.) - DELIMITACIÓN CARTOGRÁFICA KML Y MAPA           -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 2: Delimitación Cartográfica KML</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <h2 class="section-title"><i class="fa-solid fa-map-location-dot"></i> Delimitación Geográfica de la Finca (Archivo .KML)</h2>
      <p class="section-subtitle">
        La plataforma procesa el polígono perimetral mediante trigonometría esférica en el navegador para obtener la superficie catastral y satelital exacta.
      </p>

      <!-- MAQUETA DELIMITACIÓN KML CON RECUADROS -->
      <div class="ui-mockup-card">
        
        <!-- RECUADRO 13: DROPZONE KML -->
        <div class="callout-box" style="margin-bottom: 12px; background: #f8fafc; border-color: var(--callout-red);">
          <span class="callout-badge">RECUADRO 13: ARRASTRE DEL ARCHIVO KML</span>
          <div style="border: 2px dashed var(--slate-300); border-radius: 6px; padding: 12px; text-align: center; background: white;">
            <i class="fa-solid fa-earth-europe" style="font-size: 24px; color: var(--idaf-dark); margin-bottom: 4px;"></i>
            <div style="font-size: 11px; font-weight: 700; color: var(--idaf-dark);">
              Archivo cargado: <span class="val-pill" style="font-size: 11px;">ejemplo_delimitacion_finca.kml</span>
            </div>
            <div style="font-size: 9.5px; color: var(--slate-500); margin-top: 2px;">
              Formato Keyhole Markup Language (.kml) • Generado en Google Earth, QGIS o SIGPAC
            </div>
          </div>
        </div>

        <!-- RECUADRO 14: MAPA SATÉLITE Y SUPERFICIE CALCULADA -->
        <div class="callout-box green" style="background: white; border-color: var(--idaf-dark); margin-bottom: 12px;">
          <span class="callout-badge green">RECUADRO 14: MAPA SATELITAL Y SUPERFICIE AUTOMÁTICA</span>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 0 4px;">
            <span style="font-size: 10px; font-weight: 700; color: var(--idaf-dark);">
              <i class="fa-solid fa-layer-group"></i> Visor Leaflet Cartografía Satélite
            </span>
            <span style="background: var(--idaf-dark); color: white; padding: 3px 10px; border-radius: 4px; font-weight: 800; font-size: 11px;">
              Superficie Calculada: 45.20 ha
            </span>
          </div>
          <!-- SIMULACIÓN MAPA -->
          <div style="height: 140px; background: linear-gradient(135deg, #1e3a1e 0%, #2e5a2e 50%, #152b15 100%); border-radius: 6px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; border: 1px solid var(--slate-300);">
            <!-- POLÍGONO VECTORIAL SIMULADO -->
            <svg width="220" height="110" viewBox="0 0 220 110" style="position: absolute;">
              <polygon points="30,20 180,15 200,90 80,95 20,60" style="fill:rgba(118, 183, 43, 0.4);stroke:#76B72B;stroke-width:2.5;stroke-dasharray:4 2" />
              <circle cx="30" cy="20" r="4" fill="#005027" />
              <circle cx="180" cy="15" r="4" fill="#005027" />
              <circle cx="200" cy="90" r="4" fill="#005027" />
              <circle cx="80" cy="95" r="4" fill="#005027" />
              <circle cx="20" cy="60" r="4" fill="#005027" />
            </svg>
            <div style="background: rgba(0,0,0,0.65); color: white; padding: 4px 10px; border-radius: 4px; font-size: 10px; z-index: 2; font-weight: 600;">
              <i class="fa-solid fa-draw-polygon" style="color: var(--idaf-light);"></i> Polígono Finca La Dehesilla (Cardeña) • 45.20 ha
            </div>
          </div>
        </div>

        <!-- RECUADRO 15: BOTÓN AVANCE A PASO 2 -->
        <div class="callout-box highlight-btn" style="text-align: right;">
          <span class="callout-badge"><i class="fa-solid fa-arrow-pointer"></i> BOTÓN 15: PULSAR PARA AVANZAR</span>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--slate-600); font-weight: 500;">
              * Requisitos completados: Datos del proyecto válidos, Memoria PDF y KML cargado.
            </span>
            <div class="mock-btn mock-btn-primary" style="background: var(--idaf-dark); font-size: 11px; padding: 8px 16px;">
              <span>Continuar a Inventario Forestal (Paso 2)</span>
              <i class="fa-solid fa-arrow-right"></i>
            </div>
          </div>
        </div>

      </div>

      <!-- ESPECIFICACIÓN DE LOS RECUADROS -->
      <table class="spec-table">
        <thead>
          <tr>
            <th style="width: 14%;">Elemento</th>
            <th style="width: 26%;">Acción Requerida</th>
            <th style="width: 32%;">Archivo / Valor en Caso Práctico</th>
            <th style="width: 28%;">Efecto en el Cálculo</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pin-circle">13</span></td>
            <td><strong>Subir Archivo .KML</strong></td>
            <td><span class="val-pill">ejemplo_delimitacion_finca.kml</span> (en <span class="val-pill">data/templates/</span>)</td>
            <td>El navegador parsea las coordenadas esféricas del polígono sin enviarlo a ningún servidor.</td>
          </tr>
          <tr>
            <td><span class="pin-circle green">14</span></td>
            <td><strong>Verificar Superficie</strong></td>
            <td><span class="val-pill" style="font-weight: 800; color: #005027;">45.20 hectáreas</span></td>
            <td>Este valor se bloquea y se traslada automáticamente al <strong>Paso 2</strong> para determinar la densidad.</td>
          </tr>
          <tr>
            <td><span class="pin-circle btn">15</span></td>
            <td><strong>Pulsar Botón de Continuar</strong></td>
            <td>Clic en <strong>[Continuar a Inventario Forestal]</strong></td>
            <td>Valida todos los campos obligatorios y desbloquea la pantalla de inventario pie a pie.</td>
          </tr>
        </tbody>
      </table>

      <div class="rule-card">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <div>
          <strong>Regla de Validación:</strong> Si el botón <strong>[Continuar a Inventario Forestal]</strong> permanece deshabilitado, revisa que no haya campos vacíos con asterisco (*) y que hayas subido tanto la memoria PDF como el archivo KML.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 4</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 5: PASO 2 - INVENTARIO FORESTAL PIE A PIE (CSV/EXCEL) Y DENSIDAD    -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 3: Paso 2 - Inventario Forestal y Densidad</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <!-- STEPPER -->
      <div class="stepper-mini">
        <div class="step-pill completed"><div class="step-num"><i class="fa-solid fa-check"></i></div><span>Datos Proyecto & KML</span></div>
        <i class="fa-solid fa-angle-right step-arrow"></i>
        <div class="step-pill active"><div class="step-num">2</div><span>Inventario Pie a Pie (Activo)</span></div>
        <i class="fa-solid fa-angle-right step-arrow"></i>
        <div class="step-pill"><div class="step-num">3</div><span>Resultados & Certificación</span></div>
      </div>

      <h2 class="section-title"><i class="fa-solid fa-tree"></i> Carga del Inventario Forestal y Parámetros del Proyecto</h2>
      <p class="section-subtitle">
        El sistema exige datos pie a pie (un árbol por fila). No se precargan datos ficticios. Ofrece descarga de plantillas oficiales:
      </p>

      <!-- MAQUETA PASO 2: PLANTILLAS Y PARÁMETROS -->
      <div class="ui-mockup-card">
        
        <!-- RECUADRO 1: BOTONES DESCARGA -->
        <div class="callout-box" style="margin-bottom: 10px; background: white; border-color: var(--callout-red);">
          <span class="callout-badge">BOTÓN 1: DESCARGA DE PLANTILLAS OFICIALES</span>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10.5px; font-weight: 600; color: var(--idaf-dark);">Descargar formatos oficiales vacíos:</span>
            <div style="display: flex; gap: 8px;">
              <span class="mock-btn mock-btn-outline" style="font-size: 10px; padding: 4px 10px; height: 26px;">
                <i class="fa-solid fa-file-csv"></i> Descargar Plantilla CSV
              </span>
              <span class="mock-btn mock-btn-outline" style="font-size: 10px; padding: 4px 10px; height: 26px;">
                <i class="fa-solid fa-file-excel" style="color: #15803d;"></i> Descargar Plantilla Excel
              </span>
            </div>
          </div>
        </div>

        <!-- RECUADRO 2: PARÁMETROS FINANCIEROS Y TEMPORALES -->
        <div class="callout-box" style="margin-bottom: 10px; background: var(--slate-50); border-color: var(--callout-red);">
          <span class="callout-badge">CAMPO 2: PARÁMETROS DEL PROYECTO DE CARBONO</span>
          <div class="mock-grid-3">
            <div class="mock-field">
              <span class="mock-label">Periodo Acreditación (Años)</span>
              <div class="mock-input">30</div>
            </div>
            <div class="mock-field">
              <span class="mock-label">Buffer de Riesgo / Permanencia (%)</span>
              <div class="mock-input">15</div>
            </div>
            <div class="mock-field">
              <span class="mock-label">Precio Orientativo (€ / t CO₂e)</span>
              <div class="mock-input">25.0</div>
            </div>
          </div>
        </div>

        <!-- RECUADRO 3: DROPZONE CSV -->
        <div class="callout-box" style="margin-bottom: 10px; background: white; border-color: var(--callout-red);">
          <span class="callout-badge">RECUADRO 3: SUBIDA DE INVENTARIO (CSV O EXCEL)</span>
          <div style="border: 2px dashed #86efac; border-radius: 6px; padding: 10px; text-align: center; background: #f0fdf4;">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 20px; color: var(--idaf-light); margin-bottom: 2px;"></i>
            <div style="font-size: 10.5px; font-weight: 700; color: var(--idaf-dark);">
              Archivo cargado: <span class="val-pill">plantilla_inventario_rodales.csv</span> (30 árboles procesados)
            </div>
            <div style="font-size: 9px; color: var(--slate-600);">
              Columnas requeridas: <strong>ID, Especie, DBH</strong> (cm), <strong>Altura</strong> (m)
            </div>
          </div>
        </div>

        <!-- RECUADRO 4, 5 Y 6: DENSIDAD Y SUPERFICIE -->
        <div class="callout-box green" style="background: var(--idaf-bg-soft); border-color: var(--idaf-dark);">
          <span class="callout-badge green">RECUADROS 4, 5 Y 6: MODALIDAD DE INVENTARIO Y DENSIDAD</span>
          
          <!-- SELECTOR MODALIDAD (RECUADRO 4) -->
          <div style="display: flex; gap: 14px; margin-bottom: 8px; font-size: 10px; background: white; padding: 5px 8px; border-radius: 4px; border: 1px solid var(--slate-200);">
            <strong style="color: var(--idaf-dark);">[4] Modalidad:</strong>
            <label style="color: var(--idaf-dark); font-weight: 700;">
              <i class="fa-solid fa-circle-dot"></i> Muestreo en Parcelas (extrapolación a finca)
            </label>
            <label style="color: var(--slate-500);">
              <i class="fa-regular fa-circle"></i> Censo Completo 100% de la Finca (KML)
            </label>
          </div>

          <div class="mock-grid-3">
            <div class="mock-field">
              <span class="mock-label">[5A] Sup. Total Finca KML (ha)</span>
              <div class="mock-input readonly">45.20 ha (Bloqueado)</div>
            </div>
            <div class="mock-field">
              <span class="mock-label" style="color: #b91c1c; font-weight: 700;">[5B] Sup. Muestreada (ha) *</span>
              <div class="mock-input" style="border: 1.5px solid #b91c1c; font-weight: 700;">1.00 ha</div>
            </div>
            <div class="mock-field">
              <span class="mock-label">[6] Densidad Resultante Estimada</span>
              <div style="background: white; border: 1.5px solid var(--idaf-dark); border-radius: 4px; padding: 4px 8px; height: 28px; display: flex; justify-content: space-between; align-items: center;">
                <strong style="color: var(--idaf-dark); font-size: 11px;">30 pies/ha</strong>
                <span style="font-size: 9px; color: var(--slate-500);">(1,356 pies en finca)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- TABLA EXPLICATIVA -->
      <table class="spec-table">
        <thead>
          <tr>
            <th style="width: 14%;">Elemento</th>
            <th style="width: 26%;">Parámetro / Control</th>
            <th style="width: 30%;">Valor en Caso Práctico</th>
            <th style="width: 30%;">Fórmula y Significado Científico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pin-circle btn">1</span></td>
            <td><strong>Descargar Plantillas</strong></td>
            <td>Descarga <span class="val-pill">.csv</span> o <span class="val-pill">.xlsx</span></td>
            <td>Estructura obligatoria de 4 columnas: ID, Especie, DBH (cm), Altura (m).</td>
          </tr>
          <tr>
            <td><span class="pin-circle">2</span></td>
            <td><strong>Parámetros Acreditación</strong></td>
            <td><span class="val-pill">30 años</span> • <span class="val-pill">15% buffer</span> • <span class="val-pill">25 €/t</span></td>
            <td>30 años estándar MITECO; buffer del 15% para bolsa de garantía de permanencia.</td>
          </tr>
          <tr>
            <td><span class="pin-circle">3</span></td>
            <td><strong>Subir Archivo Inventario</strong></td>
            <td><span class="val-pill">plantilla_inventario_rodales.csv</span></td>
            <td>Procesa alometría Ruiz-Peinado de forma individual para cada uno de los 30 árboles.</td>
          </tr>
          <tr>
            <td><span class="pin-circle green">4</span></td>
            <td><strong>Modalidad Inventario</strong></td>
            <td><span class="val-pill">Muestreo en Parcelas</span></td>
            <td>Permite extrapolar la muestra medida (1 ha) a la totalidad de la finca (45.20 ha).</td>
          </tr>
          <tr>
            <td><span class="pin-circle">5B y 6</span></td>
            <td><strong>Sup. Muestra y Densidad</strong></td>
            <td><span class="val-pill">1.00 ha</span> &rarr; <strong>30 pies/ha</strong></td>
            <td>\(\text{{Densidad}} = \frac{{30 \text{{ árboles}}}}{{1.0 \text{{ ha}}}} = 30 \text{{ pies/ha}}\). Total finca: \(30 \times 45.20 = 1,356\) árboles.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 5</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 6: PASO 2 (CONT.) - MATORRAL, PARÁMETROS ACTUACIÓN Y ALOMETRÍA     -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 3: Matorral, Actuación y Alometría</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <h2 class="section-title"><i class="fa-solid fa-seedling"></i> Caracterización de Matorral y Parámetros de Densificación</h2>
      <p class="section-subtitle">
        Ajuste de los modelos de Montero et al. (2020), edad de la masa, potencialidad ecológica y densidad de enriquecimiento:
      </p>

      <!-- MAQUETA MATORRAL, ACTUACIÓN Y ALOMETRÍA -->
      <div class="ui-mockup-card">
        
        <!-- RECUADRO 7: MATORRAL MONTERO ET AL. -->
        <div class="callout-box" style="margin-bottom: 10px; background: white; border-color: var(--callout-red);">
          <span class="callout-badge">CAMPO 7: CARACTERIZACIÓN MANUAL DE MATORRAL (MONTERO ET AL., 2020)</span>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: var(--idaf-dark);">Parámetros del Sotobosque:</span>
            <span style="background: var(--idaf-tint-light); color: var(--idaf-dark); font-weight: 700; font-size: 10px; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--idaf-light);">
              Biomasa Matorral: 2.45 t/ha
            </span>
          </div>
          <div class="mock-grid-3">
            <div class="mock-field">
              <span class="mock-label">Tipo de Matorral (Agrupación D6.2)</span>
              <div class="mock-input">A19 – Mancha mediterránea <i class="fa-solid fa-chevron-down" style="font-size: 9px; color: #94a3b8;"></i></div>
            </div>
            <div class="mock-field">
              <span class="mock-label">FCC del Matorral (%)</span>
              <div class="mock-input">25 %</div>
            </div>
            <div class="mock-field">
              <span class="mock-label">Altura Media Matorral (dm)</span>
              <div class="mock-input">9.0 dm (90 cm)</div>
            </div>
          </div>
        </div>

        <!-- RECUADRO 8: PARÁMETROS ACTUACIÓN -->
        <div class="callout-box highlight-btn" style="margin-bottom: 10px;">
          <span class="callout-badge"><i class="fa-solid fa-sliders"></i> CAMPO 8: PARÁMETROS DE LA MASA Y DENSIFICACIÓN</span>
          <div class="mock-grid-3">
            <div class="mock-field">
              <span class="mock-label">Edad Actual de la Masa (años)</span>
              <div class="mock-input">45 años</div>
            </div>
            <div class="mock-field">
              <span class="mock-label">Potencialidad Bioclimática (0.1 - 1.0)</span>
              <div class="mock-input">0.85 (Andalucía / Alentejo)</div>
            </div>
            <div class="mock-field">
              <span class="mock-label" style="color: #b91c1c; font-weight: 700;">Densidad Añadida a Plantar *</span>
              <div class="mock-input" style="border: 1.5px solid #b91c1c; font-weight: 700;">150 pies/ha</div>
            </div>
          </div>
        </div>

        <!-- RECUADRO 9: RESUMEN DENDROMÉTRICO -->
        <div class="callout-box green" style="background: var(--slate-50); border-color: var(--idaf-dark); margin-bottom: 10px;">
          <span class="callout-badge green">RECUADRO 9: RESUMEN DENDROMÉTRICO DE LOS ÁRBOLES PROCESADOS</span>
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; text-align: center;">
            <div style="background: white; border: 1px solid var(--slate-200); padding: 4px; border-radius: 4px;">
              <div style="font-size: 8.5px; color: var(--slate-500);">Pies Inventario</div>
              <strong style="color: var(--idaf-dark); font-size: 11px;">30 pies</strong>
            </div>
            <div style="background: white; border: 1px solid var(--slate-200); padding: 4px; border-radius: 4px;">
              <div style="font-size: 8.5px; color: var(--slate-500);">DBH Medio</div>
              <strong style="color: var(--idaf-dark); font-size: 11px;">20.3 cm</strong>
            </div>
            <div style="background: white; border: 1px solid var(--slate-200); padding: 4px; border-radius: 4px;">
              <div style="font-size: 8.5px; color: var(--slate-500);">Altura Media</div>
              <strong style="color: var(--idaf-dark); font-size: 11px;">6.4 m</strong>
            </div>
            <div style="background: white; border: 1px solid var(--slate-200); padding: 4px; border-radius: 4px;">
              <div style="font-size: 8.5px; color: var(--slate-500);">Biomasa / Pie</div>
              <strong style="color: var(--idaf-dark); font-size: 11px;">218.4 kg</strong>
            </div>
            <div style="background: #f0fdf4; border: 1px solid var(--idaf-light); padding: 4px; border-radius: 4px;">
              <div style="font-size: 8.5px; color: var(--idaf-dark);">CO₂e / Pie</div>
              <strong style="color: var(--idaf-dark); font-size: 11px;">0.40 t CO₂e</strong>
            </div>
          </div>
        </div>

        <!-- RECUADRO 10: TABLA ALOMÉTRICA POR FRACCIONES -->
        <div class="callout-box" style="background: white; border-color: var(--slate-300); margin-bottom: 10px;">
          <span class="callout-badge accent">RECUADRO 10: ALOMETRÍA POR FRACCIONES (RUIZ-PEINADO ET AL., 2012)</span>
          <div style="font-size: 9px; color: var(--slate-500); margin-bottom: 4px;">
            Desglose aditivo por árbol: Fuste (\(B_f\)), Ramas (\(B_r\)), Raíces (\(B_{{rad}}\)) y Biomasa Total (kg peso seco).
          </div>
          <table style="width: 100%; font-size: 9px; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--slate-100); color: var(--slate-700);">
                <th style="padding: 2px 4px; text-align: left;">ID Árbol</th>
                <th style="padding: 2px 4px; text-align: left;">Especie</th>
                <th style="padding: 2px 4px;">DBH (cm)</th>
                <th style="padding: 2px 4px;">Alt (m)</th>
                <th style="padding: 2px 4px;">Bf (kg)</th>
                <th style="padding: 2px 4px;">Br (kg)</th>
                <th style="padding: 2px 4px;">Brad (kg)</th>
                <th style="padding: 2px 4px; font-weight: 700;">Bio Total</th>
                <th style="padding: 2px 4px; color: var(--idaf-dark); font-weight: 700;">CO₂e/pie</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>ARB_001</td><td>Quercus suber</td><td align="center">18.5</td><td align="center">6.2</td><td align="center">72.4</td><td align="center">45.8</td><td align="center">51.2</td><td align="center"><strong>169.4 kg</strong></td><td align="center" style="color:var(--idaf-dark);font-weight:700;">0.31 t</td></tr>
              <tr><td>ARB_002</td><td>Quercus suber</td><td align="center">22.0</td><td align="center">6.8</td><td align="center">108.6</td><td align="center">68.3</td><td align="center">75.1</td><td align="center"><strong>252.0 kg</strong></td><td align="center" style="color:var(--idaf-dark);font-weight:700;">0.46 t</td></tr>
              <tr><td>ARB_003</td><td>Pinus pinea</td><td align="center">19.2</td><td align="center">7.1</td><td align="center">85.3</td><td align="center">41.2</td><td align="center">38.9</td><td align="center"><strong>165.4 kg</strong></td><td align="center" style="color:var(--idaf-dark);font-weight:700;">0.30 t</td></tr>
            </tbody>
          </table>
        </div>

        <!-- RECUADRO 11: BOTÓN DE CÁLCULO -->
        <div class="callout-box highlight-btn" style="text-align: right;">
          <span class="callout-badge"><i class="fa-solid fa-calculator"></i> BOTÓN 11: EJECUTAR CÁLCULOS</span>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 10px; color: var(--slate-600);">
              * Se computará la proyección temporal a 30 años con descuento de línea base y buffer de riesgo.
            </span>
            <div class="mock-btn mock-btn-primary" style="background: var(--idaf-dark); font-size: 11px; padding: 8px 18px;">
              <span>Ejecutar Cálculos y Ver Resultados (Paso 3)</span>
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
        </div>

      </div>

      <!-- TABLA TÉCNICA -->
      <table class="spec-table">
        <thead>
          <tr>
            <th style="width: 14%;">Elemento</th>
            <th style="width: 26%;">Parámetro</th>
            <th style="width: 30%;">Valor Introducido</th>
            <th style="width: 30%;">Modelo Aplicado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pin-circle">7</span></td>
            <td><strong>Matorral Montero 2020</strong></td>
            <td><span class="val-pill">A19</span> • <span class="val-pill">FCC: 25%</span> • <span class="val-pill">h: 9.0 dm</span></td>
            <td>Modelo D6.2 Tabla 4: \(\text{{Biomasa}} = \beta_0 + \beta_1 \cdot \theta + \beta_2 \cdot h\), resultando en 2.45 t/ha.</td>
          </tr>
          <tr>
            <td><span class="pin-circle btn">8</span></td>
            <td><strong>Densidad Añadida *</strong></td>
            <td><span class="val-pill" style="background:#fee2e2; color:#991b1b; font-weight:700;">150 pies/ha</span></td>
            <td>Enriquecimiento con 150 plantones/ha de <em>Quercus suber</em>. La masa pasará de 30 a 180 pies/ha.</td>
          </tr>
          <tr>
            <td><span class="pin-circle btn">11</span></td>
            <td><strong>Botón Ejecutar Cálculo</strong></td>
            <td>Clic en <strong>[Ejecutar Cálculos]</strong></td>
            <td>Lanza el motor ex-ante D6.2 y traslada al usuario automáticamente al Paso 3.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 6</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 7: PASO 3 - RESULTADOS, KPIS Y CERTIFICACIÓN METODOLÓGICA         -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 4: Paso 3 - Resultados y Certificación</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <!-- STEPPER -->
      <div class="stepper-mini">
        <div class="step-pill completed"><div class="step-num"><i class="fa-solid fa-check"></i></div><span>Datos Proyecto & KML</span></div>
        <i class="fa-solid fa-angle-right step-arrow"></i>
        <div class="step-pill completed"><div class="step-num"><i class="fa-solid fa-check"></i></div><span>Inventario Pie a Pie</span></div>
        <i class="fa-solid fa-angle-right step-arrow"></i>
        <div class="step-pill active"><div class="step-num">3</div><span>Resultados & Certificación (Activo)</span></div>
      </div>

      <h2 class="section-title"><i class="fa-solid fa-award"></i> Cuadro de Mandos de Absorción y Certificación Científica</h2>
      <p class="section-subtitle">
        El Paso 3 consolida la cuantificación neta del proyecto deduciendo el escenario de Línea de Base y la reserva buffer de riesgo:
      </p>

      <!-- MAQUETA RESULTADOS Y KPIS -->
      <div class="ui-mockup-card">
        
        <!-- RECUADRO 1: CERTIFICACIÓN D6.2 -->
        <div class="callout-box green" style="background: #f0fdf4; border-color: var(--idaf-dark); margin-bottom: 12px;">
          <span class="callout-badge green">RECUADRO 1: CERTIFICACIÓN METODOLÓGICA LIFE D6.2 (IDAF)</span>
          <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-award" style="font-size: 26px; color: var(--idaf-dark);"></i>
            <div>
              <div style="font-size: 11px; font-weight: 700; color: var(--idaf-dark);">
                Acreditación Científica Homologada: Ruiz-Peinado (2012) & LIFE Deliverable D6.2
              </div>
              <div style="font-size: 9.5px; color: var(--slate-600); line-height: 1.4;">
                Cálculo aditivo por fracciones para <em>Quercus suber</em> y acompañantes, modelos de matorral de Montero (2020) y algoritmo ex-ante con \(R^2 = 0.78\) calibrado con parcelas MLS/TLS.
              </div>
            </div>
          </div>
        </div>

        <!-- RECUADRO 2: TARJETAS KPI DE ABSORCIÓN -->
        <div class="callout-box" style="background: white; border-color: var(--callout-red); margin-bottom: 12px;">
          <span class="callout-badge">RECUADRO 2: INDICADORES CLAVE (KPIS) DE ABSORCIÓN NETA</span>
          <div class="kpi-row" style="margin-top: 4px;">
            <div class="kpi-mini-card">
              <div class="kpi-mini-title">Créditos Netos</div>
              <div class="kpi-mini-val">3,142.8 t</div>
              <div class="kpi-mini-sub">CO₂e acumulado a 30a</div>
            </div>
            <div class="kpi-mini-card accent">
              <div class="kpi-mini-title">Créditos Anuales</div>
              <div class="kpi-mini-val">104.8 t</div>
              <div class="kpi-mini-sub">CO₂e / año medio</div>
            </div>
            <div class="kpi-mini-card">
              <div class="kpi-mini-title">Rendimiento / ha</div>
              <div class="kpi-mini-val">69.5 t</div>
              <div class="kpi-mini-sub">CO₂e / hectárea</div>
            </div>
            <div class="kpi-mini-card" style="border-top-color: #0284c7;">
              <div class="kpi-mini-title">Valor Estimado</div>
              <div class="kpi-mini-val">78,570 €</div>
              <div class="kpi-mini-sub">A 25.0 €/t CO₂e</div>
            </div>
            <div class="kpi-mini-card amber">
              <div class="kpi-mini-title">Buffer Riesgo</div>
              <div class="kpi-mini-val">554.6 t</div>
              <div class="kpi-mini-sub">15% retenido permanente</div>
            </div>
          </div>
        </div>

      </div>

      <!-- TABLA DETALLADA DE INTERPRETACIÓN DE KPIS -->
      <table class="spec-table">
        <thead>
          <tr>
            <th style="width: 20%;">Métrica KPI</th>
            <th style="width: 20%;">Resultado en Caso</th>
            <th style="width: 30%;">¿Cómo se calcula?</th>
            <th style="width: 30%;">Validez para el Propietario / MITECO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Créditos Netos Totales</strong></td>
            <td><span class="val-pill" style="font-weight: 800; color: #005027;">3,142.80 t CO₂e</span></td>
            <td>\(\sum (\text{{Proyecto}} - \text{{Línea Base}}) \times (1 - \text{{Buffer}})\)</td>
            <td>Créditos efectivamente certificables y comercializables en mercados voluntarios.</td>
          </tr>
          <tr>
            <td><strong>Créditos Medios Anuales</strong></td>
            <td><span class="val-pill">104.76 t CO₂e/año</span></td>
            <td>\(\frac{{\text{{Créditos Netos Totales}}}}{{30 \text{{ años}}}}\)</td>
            <td>Ritmo medio de emisión de créditos en las verificaciones periódicas quinquenales.</td>
          </tr>
          <tr>
            <td><strong>Créditos por Hectárea</strong></td>
            <td><span class="val-pill">69.53 t CO₂e/ha</span></td>
            <td>\(\frac{{3,142.80 \text{{ t}}}}{{45.20 \text{{ ha}}}}\)</td>
            <td>Ratio de eficiencia selvícola del alcornocal densificado.</td>
          </tr>
          <tr>
            <td><strong>Valor Económico</strong></td>
            <td><span class="val-pill">78,570.00 €</span></td>
            <td>\(3,142.80 \text{{ t}} \times 25.00 \text{{ €/t}}\)</td>
            <td>Ingreso potencial bruto por venta de créditos de absorción a empresas compensadoras.</td>
          </tr>
          <tr>
            <td><strong>Buffer de Permanencia</strong></td>
            <td><span class="val-pill" style="color:#b45309;">554.61 t CO₂e</span></td>
            <td>15% del total bruto adicional</td>
            <td>Depósito obligatorio de reserva frente a posibles incendios forestales o plagas.</td>
          </tr>
        </tbody>
      </table>

      <div class="info-card">
        <i class="fa-solid fa-shield-halved"></i>
        <div>
          <strong>Garantía de Adicionalidad en Densificaciones:</strong> En esta actuación, la masa arbórea preexistente de 30 pies/ha y el matorral inicial constituyen la <strong>Línea de Base</strong> (que continúa absorbiendo carbono de forma vegetativa). Los <strong>3,142.80 t CO₂e certificados</strong> provienen exclusivamente del crecimiento adicional generado por los <strong>150 pies/ha</strong> de nueva cohorte añadida.
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 7</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 8: PASO 3 (CONT.) - GRÁFICOS, EXCEL Y EMISIÓN DE INFORME PDF       -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 4: Gráficos y Emisión del Informe</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <h2 class="section-title"><i class="fa-solid fa-chart-line"></i> Curvas Dinámicas, Proyección Anual y Descarga de Informes</h2>
      <p class="section-subtitle">
        Visualización interactiva de curvas y botones finales para exportar datos y generar el dossier oficial:
      </p>

      <!-- MAQUETA GRÁFICOS Y BOTONES FINALES -->
      <div class="ui-mockup-card">
        
        <!-- RECUADROS 3 Y 4: GRÁFICOS INTERACTIVOS -->
        <div class="mock-grid-2" style="margin-bottom: 12px;">
          
          <!-- RECUADRO 3: STOCK -->
          <div class="callout-box" style="background: white; border-color: var(--callout-red);">
            <span class="callout-badge">RECUADRO 3: STOCK DE CARBONO (t CO₂e)</span>
            <div style="font-size: 9.5px; font-weight: 700; color: var(--idaf-dark); margin-bottom: 4px;">
              Línea Base vs Proyecto IFM
            </div>
            <!-- SIMULACIÓN GRÁFICA STOCK -->
            <div style="height: 100px; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: 4px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 6px 12px;">
              <svg width="100%" height="85" viewBox="0 0 200 85" style="overflow: visible;">
                <!-- EJE -->
                <line x1="0" y1="80" x2="200" y2="80" stroke="#cbd5e1" stroke-width="1"/>
                <!-- LÍNEA BASE (AZUL) -->
                <path d="M 0 70 Q 100 62 200 55" fill="none" stroke="#1e3a5f" stroke-width="2.5" stroke-dasharray="3 2"/>
                <!-- PROYECTO (VERDE) -->
                <path d="M 0 70 Q 100 45 200 15" fill="none" stroke="#005027" stroke-width="3"/>
              </svg>
              <div style="position: absolute; top: 6px; right: 8px; font-size: 8.5px; background: white; padding: 2px 6px; border: 1px solid var(--slate-200); border-radius: 3px;">
                <span style="color: #005027; font-weight: 700;">— Proyecto IFM</span><br>
                <span style="color: #1e3a5f; font-weight: 600;">--- Línea Base</span>
              </div>
            </div>
          </div>

          <!-- RECUADRO 4: CRÉDITOS ANUALES Y ACUMULADOS -->
          <div class="callout-box" style="background: white; border-color: var(--callout-red);">
            <span class="callout-badge">RECUADRO 4: CRÉDITOS VERIFICABLES</span>
            <div style="font-size: 9.5px; font-weight: 700; color: var(--idaf-dark); margin-bottom: 4px;">
              Créditos Anuales (Barras) y Acumulados (Línea)
            </div>
            <!-- SIMULACIÓN GRÁFICA CRÉDITOS -->
            <div style="height: 100px; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: 4px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 6px 12px;">
              <svg width="100%" height="85" viewBox="0 0 200 85" style="overflow: visible;">
                <line x1="0" y1="80" x2="200" y2="80" stroke="#cbd5e1" stroke-width="1"/>
                <!-- BARRAS ANUALES -->
                <rect x="10" y="55" width="8" height="25" fill="#76B72B" opacity="0.8"/>
                <rect x="35" y="48" width="8" height="32" fill="#76B72B" opacity="0.8"/>
                <rect x="60" y="42" width="8" height="38" fill="#76B72B" opacity="0.8"/>
                <rect x="85" y="38" width="8" height="42" fill="#76B72B" opacity="0.8"/>
                <rect x="110" y="35" width="8" height="45" fill="#76B72B" opacity="0.8"/>
                <rect x="135" y="32" width="8" height="48" fill="#76B72B" opacity="0.8"/>
                <rect x="160" y="30" width="8" height="50" fill="#76B72B" opacity="0.8"/>
                <rect x="185" y="28" width="8" height="52" fill="#76B72B" opacity="0.8"/>
                <!-- LÍNEA ACUMULADA -->
                <path d="M 14 75 Q 100 50 189 12" fill="none" stroke="#005027" stroke-width="2.5"/>
              </svg>
            </div>
          </div>

        </div>

        <!-- RECUADRO 5: TABLA DETALLADA CON BOTÓN EXCEL (BOTÓN 6) -->
        <div class="callout-box" style="background: white; border-color: var(--slate-300); margin-bottom: 12px;">
          <span class="callout-badge accent">RECUADRO 5: TABLA AÑO A AÑO & EXPORTACIÓN EXCEL</span>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: var(--idaf-dark);">Serie Temporal de Acreditación (Años 1 a 30):</span>
            
            <!-- RECUADRO 6: BOTÓN EXCEL -->
            <div class="callout-box highlight-btn" style="padding: 2px 6px;">
              <span class="callout-badge" style="top:-8px; left:4px; font-size:8px;">BOTÓN 6</span>
              <span class="mock-btn mock-btn-secondary" style="font-size: 9.5px; height: 24px; padding: 2px 8px;">
                <i class="fa-solid fa-file-excel" style="color: #15803d;"></i> Exportar a Excel (.xlsx)
              </span>
            </div>
          </div>

          <table style="width: 100%; font-size: 9px; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--slate-100); color: var(--slate-700);">
                <th style="padding: 2px 4px;">Año</th>
                <th style="padding: 2px 4px;">Edad</th>
                <th style="padding: 2px 4px;">Línea Base (t)</th>
                <th style="padding: 2px 4px;">Proyecto (t)</th>
                <th style="padding: 2px 4px;">Adicionalidad</th>
                <th style="padding: 2px 4px; font-weight:700;">Créditos Anuales</th>
                <th style="padding: 2px 4px; color:var(--idaf-dark); font-weight:700;">Créditos Acumulados</th>
              </tr>
            </thead>
            <tbody>
              <tr><td align="center">Año 1</td><td align="center">46</td><td align="center">545.2 t</td><td align="center">554.8 t</td><td align="center">9.6 t</td><td align="center"><strong>8.2 t/año</strong></td><td align="center" style="color:var(--idaf-dark);font-weight:700;">8.2 t</td></tr>
              <tr><td align="center">Año 5</td><td align="center">50</td><td align="center">558.4 t</td><td align="center">652.1 t</td><td align="center">93.7 t</td><td align="center"><strong>24.8 t/año</strong></td><td align="center" style="color:var(--idaf-dark);font-weight:700;">79.6 t</td></tr>
              <tr><td align="center">Año 15</td><td align="center">60</td><td align="center">592.1 t</td><td align="center">1,240.5 t</td><td align="center">648.4 t</td><td align="center"><strong>118.5 t/año</strong></td><td align="center" style="color:var(--idaf-dark);font-weight:700;">551.1 t</td></tr>
              <tr><td align="center">Año 30</td><td align="center">75</td><td align="center">640.8 t</td><td align="center">4,338.4 t</td><td align="center">3,697.6 t</td><td align="center"><strong>165.2 t/año</strong></td><td align="center" style="color:var(--idaf-dark);font-weight:700;">3,142.8 t</td></tr>
            </tbody>
          </table>
        </div>

        <!-- RECUADRO 7: BOTÓN INFORME PDF TÉCNICO -->
        <div class="callout-box highlight-btn" style="text-align: right; background: #fef2f2;">
          <span class="callout-badge"><i class="fa-solid fa-file-pdf"></i> BOTÓN 7: EMISIÓN DE INFORME TÉCNICO OFICIAL</span>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="text-align: left;">
              <strong style="color: var(--idaf-dark); font-size: 11px;">¿Deseas el informe pericial completo?</strong>
              <div style="font-size: 9.5px; color: var(--slate-600);">Genera un PDF con portada corporativa IDAF, cartografía, firmas y tablas completas.</div>
            </div>
            <div class="mock-btn mock-btn-primary" style="background: var(--idaf-dark); font-size: 11.5px; padding: 8px 20px; box-shadow: 0 2px 6px rgba(0,80,39,0.3);">
              <i class="fa-solid fa-file-pdf"></i>
              <span>Emitir Informe Técnico Completo</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ESPECIFICACIÓN DE LOS BOTONES FINALES -->
      <table class="spec-table">
        <thead>
          <tr>
            <th style="width: 14%;">Elemento</th>
            <th style="width: 26%;">Control / Botón</th>
            <th style="width: 30%;">Formato Generado</th>
            <th style="width: 30%;">Destino / Utilidad Oficial</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="pin-circle btn">BOTÓN 6</span></td>
            <td><strong>Exportar a Excel</strong></td>
            <td>Hoja de cálculo <span class="val-pill">.xlsx</span></td>
            <td>Contiene las 30 filas año a año con los cálculos matemáticos para auditoría financiera.</td>
          </tr>
          <tr>
            <td><span class="pin-circle btn">BOTÓN 7</span></td>
            <td><strong>Emitir Informe Técnico</strong></td>
            <td>Documento oficial <span class="val-pill">.pdf</span></td>
            <td>Dossier de certificación oficial para presentar ante el Registro MITECO y certificadoras.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 8</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 9: GUÍA COMPARATIVA DE LAS 3 ACTUACIONES (PLANT, DENS, CERR)       -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 5: Comparativa de Actuaciones</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <h2 class="section-title"><i class="fa-solid fa-layer-group"></i> Parámetros Específicos según la Actuación Seleccionada</h2>
      <p class="section-subtitle">
        En el <strong>Paso 1 (Campo 11)</strong> puedes seleccionar entre 3 actuaciones. Esta tabla resume qué información colocar en el <strong>Paso 2</strong> para cada una:
      </p>

      <table class="spec-table" style="font-size: 10px;">
        <thead>
          <tr>
            <th style="width: 22%;">Actuación en Paso 1</th>
            <th style="width: 26%;">Estado Inicial de la Masa</th>
            <th style="width: 26%;">Campos que debes colocar en Paso 2</th>
            <th style="width: 26%;">Lógica de la Línea de Base</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong style="color: var(--idaf-dark); font-size: 11px;">1. Plantaciones</strong><br>
              <span style="font-size: 9px; color: var(--slate-500);">Nuevas repoblaciones sobre desarbolado o agrícola marginal.</span>
            </td>
            <td>
              <strong>0 pies/ha existentes</strong>.<br>
              Terreno desarbolado o pastizal sin arbolado previo.
            </td>
            <td>
              • <strong>Densidad Prevista (pies/ha):</strong> ej. <span class="val-pill">400</span>.<br>
              • <em>Árboles totales a plantar</em> se calcula solo: \(\text{{Densidad}} \times \text{{ha KML}}\).<br>
              • Matorral previo (Montero 2020).
            </td>
            <td>
              <strong>Línea Base = 0 t CO₂e</strong>.<br>
              Todo el carbono acumulado por los nuevos árboles se acredita íntegramente como adicional.
            </td>
          </tr>
          <tr>
            <td>
              <strong style="color: var(--idaf-dark); font-size: 11px;">2. Densificaciones</strong><br>
              <span style="font-size: 9px; color: var(--slate-500);">(Caso Práctico de este manual)</span>
            </td>
            <td>
              <strong>Masa abierta o envejecida</strong>.<br>
              Árboles adultos preexistentes con baja espesura.
            </td>
            <td>
              • <strong>Modalidad:</strong> Muestreo en parcelas o censo 100%.<br>
              • <strong>Edad actual:</strong> ej. <span class="val-pill">45 años</span>.<br>
              • <strong>Densidad añadida a densificar:</strong> ej. <span class="val-pill">150 pies/ha</span>.
            </td>
            <td>
              <strong>Línea Base = Stock adulto</strong>.<br>
              Se mantiene la absorción del arbolado previo; solo se acreditan los nuevos árboles plantados.
            </td>
          </tr>
          <tr>
            <td>
              <strong style="color: var(--idaf-dark); font-size: 11px;">3. Cerramientos</strong><br>
              <span style="font-size: 9px; color: var(--slate-500);">Exclusión de herbívoros (ganado y caza) para regeneración.</span>
            </td>
            <td>
              <strong>Masa con regeneración bloqueada</strong> por sobrepastoreo o presión de ciervo/jabalí.
            </td>
            <td>
              • <strong>Modalidad de arbolado adulto</strong>.<br>
              • <strong>Densidad regeneración esperada:</strong> ej. <span class="val-pill">250 pies/ha</span>.<br>
              • <strong>FCC Objetivo Matorral:</strong> ej. <span class="val-pill">55 %</span>.
            </td>
            <td>
              <strong>Línea Base = Sin reclutamiento</strong>.<br>
              Se acredita la nueva cohorte regenerada espontáneamente más el incremento de biomasa arbustiva.
            </td>
          </tr>
        </tbody>
      </table>

      <h2 class="section-title" style="margin-top: 14px;"><i class="fa-solid fa-file-circle-check"></i> Estructura Requerida del Archivo CSV / Excel</h2>
      <p class="section-subtitle">
        Para que el parser client-side procese el inventario sin errores, asegúrate de respetar la cabecera exacta de 4 columnas:
      </p>

      <div style="background: var(--slate-50); border: 1px solid var(--slate-300); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 10.5px; margin-bottom: 12px;">
        <span style="color: #005027; font-weight: 700;">ID,Especie,DBH,Altura</span><br>
        ARB_001,Quercus suber,18.5,6.2<br>
        ARB_002,Quercus suber,22.0,6.8<br>
        ARB_003,Pinus pinea,19.2,7.1<br>
        ARB_004,Quercus suber,15.4,5.8<br>
        ARB_005,Quercus ilex,20.1,6.0
      </div>

      <div class="info-card">
        <i class="fa-solid fa-lightbulb"></i>
        <div>
          <strong>Especies Soportadas en la Base Científica D6.2:</strong> <em>Quercus suber</em> (Alcornoque), <em>Pinus pinea</em> (Pino piñonero), <em>Quercus ilex</em> (Encina), <em>Quercus faginea</em> (Quejigo), <em>Quercus pyrenaica</em> (Rebollo), <em>Quercus canariensis</em> (Quejigo andaluz), <em>Castanea sativa</em> (Castaño), <em>Ceratonia siliqua</em> (Algarrobo), <em>Olea europaea</em> (Acebuche), <em>Celtis australis</em> (Almez) y <em>Juglans regia</em> (Nogal).
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 9</span>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- PÁGINA 10: PREGUNTAS FRECUENTES (FAQ) Y SOPORTE TÉCNICO IDAF              -->
  <!-- ========================================================================= -->
  <div class="page">
    <div class="page-header">
      <img src="{logo_horizontal}" alt="IDAF" class="page-header-logo">
      <div>
        <div class="page-header-title">Capítulo 6: Preguntas Frecuentes y Soporte</div>
        <div class="page-header-sub">Manual de Usuario • Calculadora CO₂ IDAF</div>
      </div>
    </div>

    <div class="page-body">
      <h2 class="section-title"><i class="fa-solid fa-circle-question"></i> Preguntas Frecuentes (FAQ) de Técnicos y Evaluadores</h2>
      <p class="section-subtitle">Respuestas a las dudas más comunes durante la preparación y carga de expedientes:</p>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
        <div style="background: white; border: 1px solid var(--slate-200); border-radius: 6px; padding: 10px;">
          <strong style="color: var(--idaf-dark); font-size: 11px;">1. ¿Cómo obtengo el archivo KML de la finca si solo tengo las referencias SIGPAC?</strong>
          <p style="font-size: 10px; color: var(--slate-600); margin-top: 3px;">
            Puedes abrir <strong>Google Earth Pro</strong> o <strong>QGIS</strong>, buscar las parcelas catastrales correspondientes, dibujar el polígono perimetral y seleccionar <em>"Guardar lugar como... &rarr; Formato KML (.kml)"</em>. Asegúrate de guardarlo como <strong>.kml</strong> y no como <strong>.kmz</strong> comprimido.
          </p>
        </div>

        <div style="background: white; border: 1px solid var(--slate-200); border-radius: 6px; padding: 10px;">
          <strong style="color: var(--idaf-dark); font-size: 11px;">2. ¿Qué ocurre si en mi inventario de campo no medí la altura de todos los árboles?</strong>
          <p style="font-size: 10px; color: var(--slate-600); margin-top: 3px;">
            Las ecuaciones alométricas de Ruiz-Peinado et al. (2012) emplean tanto el diámetro a 1.30 m (DBH) como la altura total (\(h\)). Si te faltan alturas de algunos árboles, se recomienda aplicar la curva altura-diámetro media del rodal o la altura media de la especie en la finca antes de subir el archivo.
          </p>
        </div>

        <div style="background: white; border: 1px solid var(--slate-200); border-radius: 6px; padding: 10px;">
          <strong style="color: var(--idaf-dark); font-size: 11px;">3. ¿Por qué se retiene un 15% de Buffer de Riesgo?</strong>
          <p style="font-size: 10px; color: var(--slate-600); margin-top: 3px;">
            Tanto el <em>Registro de Huella de Carbono, Compensación y Proyectos de Absorción del MITECO</em> como los estándares internacionales (VCS, Gold Standard) exigen depositar entre el 10% y el 20% de los créditos brutos en una cuenta de garantía de permanencia no comercializable para asegurar el proyecto frente a incendios o eventos climáticos extremos.
          </p>
        </div>

        <div style="background: white; border: 1px solid var(--slate-200); border-radius: 6px; padding: 10px;">
          <strong style="color: var(--idaf-dark); font-size: 11px;">4. ¿Se guardan los datos si cierro el navegador?</strong>
          <p style="font-size: 10px; color: var(--slate-600); margin-top: 3px;">
            Al ser una arquitectura 100% Client-Side por motivos de confidencialidad, la sesión reside en la memoria volátil del navegador. Por ello, antes de cerrar la ventana, asegúrate de <strong>exportar a Excel</strong> y <strong>emitir el Informe Técnico en PDF</strong> para conservar la justificación documental.
          </p>
        </div>
      </div>

      <!-- BLOQUE DE CONTACTO Y ASISTENCIA TÉCNICA IDAF -->
      <div style="background: var(--idaf-dark); color: white; border-radius: 8px; padding: 16px; margin-top: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <div style="font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-headset" style="color: var(--idaf-light);"></i>
              Soporte Técnico y Asesoramiento Selvícola IDAF
            </div>
            <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">
              Centro de Investigaciones Aplicadas al Desarrollo Agroforestal S.L.
            </div>
            <div style="font-size: 9.5px; color: #94a3b8; margin-top: 2px;">
              Campus de Rabanales • Edificio Leonardo Da Vinci, 1ª Planta • 14014 Córdoba, España
            </div>
          </div>
          <div style="text-align: right; font-size: 10.5px;">
            <div><i class="fa-solid fa-envelope" style="color: var(--idaf-light);"></i> <a href="mailto:social@idaf.es" style="color: white; text-decoration: none; font-weight: 600;">social@idaf.es</a></div>
            <div style="margin-top: 3px;"><i class="fa-solid fa-globe" style="color: var(--idaf-light);"></i> <a href="https://www.idaf.es" target="_blank" style="color: white; text-decoration: none; font-weight: 600;">www.idaf.es</a></div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>Plataforma Digital para Proyectos de Absorción de Carbono • IDAF</span>
      <span>Página 10</span>
    </div>
  </div>

</body>
</html>
"""

# Guardar archivo HTML en docs
with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generado con éxito: {OUTPUT_HTML} ({len(html_content)} bytes)")

# Generar PDF mediante Chrome headless
chrome_path = r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not os.path.exists(chrome_path):
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

if os.path.exists(chrome_path):
    print("Compilando PDF con Chrome Headless...")
    cmd = [
        chrome_path,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={OUTPUT_PDF_DOCS}",
        OUTPUT_HTML
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(OUTPUT_PDF_DOCS):
        pdf_size = os.path.getsize(OUTPUT_PDF_DOCS)
        print(f"PDF generado exitosamente en docs: {OUTPUT_PDF_DOCS} ({pdf_size} bytes)")
        
        # Copiar también a la raíz para máxima comodidad
        shutil.copy2(OUTPUT_PDF_DOCS, OUTPUT_PDF_ROOT)
        print(f"Copia del PDF creada en la raíz: {OUTPUT_PDF_ROOT}")
    else:
        print("Error: No se encontró el PDF generado. Salida:", res.stdout, res.stderr)
else:
    print(f"No se encontró Chrome en {chrome_path}")
