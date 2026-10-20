/**
 * CONFIGURACIÓN GENERAL Y CONSTANTES BIOMÉTRICAS Y DE CARBONO
 * Plataforma Digital para Proyectos de Absorción de Carbono - IDAF
 * Basado en Informe Metodológico D6.2 (Ruiz-Peinado et al., 2012; Montero et al., 2020; eco2for)
 */

export const CONFIG = {
  // Autenticación con Google Identity Services (OAuth 2.0)
  AUTH: {
    GOOGLE_CLIENT_ID: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    DEMO_USER: {
      name: "Técnico IDAF",
      email: "tecnico@idaf.es",
      picture: "assets/logo_idaf_isotipo.png",
      role: "Especialista en Biomasa y Créditos de Carbono"
    }
  },

  // Constante estequiométrica: Ratio de peso molecular CO2 / C = (12 + 16*2) / 12 = 44 / 12
  CO2_C_RATIO: 44 / 12, // 3.666667

  // Fracción de carbono por defecto en biomasa seca (Montero et al., 2005 / D6.2)
  CARBON_FRACTION_DEFAULT: 0.50,

  // Porcentaje de reserva de riesgo de permanencia (Permanence Risk Buffer Pool)
  DEFAULT_RISK_BUFFER_PCT: 15.0, // 15%

  // Deducción por fugas (Leakage deduction)
  DEFAULT_LEAKAGE_PCT: 5.0, // 5%

  // Periodo de acreditación por defecto (años)
  DEFAULT_CREDITING_PERIOD_YEARS: 30,
  MIN_CREDITING_PERIOD_YEARS: 10,
  MAX_CREDITING_PERIOD_YEARS: 50,

  // Precio orientativo de crédito de carbono forestal (€ / tCO2e)
  DEFAULT_CARBON_PRICE_EUR: 25.0,

  // Parámetros climáticos medios representativos para alcornocal (D6.2 eco2for)
  DEFAULT_CLIMATE: {
    mean_annual_precip_mm: 680,  // pp_m
    mean_annual_temp_c: 15.5     // t_m
  },

  // Potencialidad ambiental por defecto (D6.2 Sección 6.1)
  DEFAULT_POTENTIALITY: 0.85,

  // Mapeo inteligente de encabezados de columnas para importación de Excel/CSV
  COLUMN_ALIASES: {
    id: ['id', 'arbol', 'pie', 'arbol_id', 'id_arbol', 'pie_id', 'codigo', 'cod', 'rodal', 'parcela', 'stand', 'plot', 'id_rodal', 'parcela_id'],
    name: ['nombre', 'descripcion', 'name', 'paraje', 'denominacion', 'rodal_nombre'],
    species: ['especie', 'species', 'sp', 'especie_principal', 'tipo_masa'],
    area: ['superficie', 'superficie_ha', 'area', 'area_ha', 'ha', 'sup', 'sup_ha'],
    density: ['densidad', 'densidad_pies_ha', 'n_pies_ha', 'pies_ha', 'n', 'densidad_arboles', 'densidad_ha', 'densidad_actual'],
    dbh: ['dbh', 'dbh_cm', 'diametro', 'diametro_normal', 'd_cm', 'd', 'dbh_medio_cm', 'diametro_medio_cm'],
    height: ['altura', 'altura_m', 'h_m', 'h', 'altura_media', 'altura_media_m', 'h_media'],
    age: ['edad', 'age', 'edad_actual', 'anos', 'años', 'edad_anios', 't'],
    potentiality: ['potencialidad', 'pot', 'indice_potencialidad', 'calidad_estacion', 'potencialidad_media'],
    shrubType: ['matorral_tipo', 'tipo_matorral', 'shrub_type', 'matorral', 'agrupacion_matorral'],
    shrubFcc: ['fcc_matorral', 'matorral_fcc', 'fcc_matorral_pct', 'fcc_shrub', 'fcc', 'matorral_fcc_%'],
    shrubHeight: ['altura_matorral_dm', 'h_matorral', 'altura_matorral', 'shrub_height', 'h_dm', 'altura_matorral_dm'],
    addedDensity: ['densidad_anadida', 'densidad_nueva', 'pies_anadidos_ha', 'densidad_densificacion', 'nuevos_pies_ha'],
    recruitedDensity: ['densidad_regeneracion', 'regenerado_pies_ha', 'brinzales_ha', 'reclutamiento', 'pies_regenerados_ha'],
    volume: ['volumen', 'volumen_m3_ha', 'vol_m3_ha', 'volumen_ha', 'm3_ha', 'v_m3_ha', 'vol'],
    basalArea: ['area_basimetrica', 'basal_area', 'g_m2_ha', 'g', 'area_basica'],
    growthRate: ['crecimiento', 'ima', 'ica', 'growth', 'incremento', 'crecimiento_m3_ha_ano', 'crec'],
    treatment: ['tratamiento', 'treatment', 'regimen', 'selvicultura'],
    strategy: ['estrategia', 'strategy', 'tipo_mejora', 'actuacion']
  }
};
