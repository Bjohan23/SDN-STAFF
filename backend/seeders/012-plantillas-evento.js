'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('plantilla_evento', [
      // Plantillas para Feria Comercial (id_tipo_evento: 1)
      {
        nombre_plantilla: 'Feria Comercial Básica - Presencial',
        descripcion: 'Plantilla estándar para ferias comerciales presenciales de pequeña a mediana escala',
        id_tipo_evento: 1,
        modalidad_predefinida: 'presencial',
        configuracion_basica: JSON.stringify({
          nombre_sugerido: 'Feria Comercial {Año}',
          descripcion_base: 'Feria comercial presencial con stands y actividades de networking',
          tipo_acceso: 'publico',
          categoria_principal: 'comercial'
        }),
        duracion_predefinida: JSON.stringify({
          dias: 3,
          hora_inicio: '09:00',
          hora_fin: '18:00',
          horario_montaje: '2 días antes',
          horario_desmontaje: '1 día después'
        }),
        ubicacion_sugerida: JSON.stringify({
          tipo_preferido: 'centro_convenciones',
          alternativas: ['salon_eventos', 'espacios_abiertos'],
          requisitos_minimos: {
            area_minima: '500 m²',
            estacionamiento: true,
            acceso_carga: true
          }
        }),
        capacidad_sugerida: JSON.stringify({
          optima: 200,
          minima: 50,
          maxima: 1000,
          stands_sugeridos: 20
        }),
        perfil_asistentes: JSON.stringify({
          tipo_principal: 'empresarios',
          sectores: ['comercio', 'servicios', 'industria'],
          edad_promedio: '25-55',
          nivel_profesional: 'medio-alto'
        }),
        stands_recomendados: JSON.stringify({
          tipos: ['basico', 'premium'],
          cantidad_sugerida: 20,
          distribucion: {
            'basico': '70%',
            'premium': '30%'
          }
        }),
        layout_sugerido: JSON.stringify({
          distribucion: 'pasillo_central',
          areas_especiales: ['recepcion', 'networking', 'food_court'],
          flujo_visitantes: 'circular'
        }),
        servicios_incluidos: JSON.stringify([
          'seguridad',
          'limpieza',
          'energia_basica',
          'agua_potable',
          'wifi_basico'
        ]),
        servicios_opcionales: JSON.stringify([
          'sonido_ambiente',
          'iluminacion_especial',
          'catering',
          'decoracion_tematica',
          'azafatas'
        ]),
        recursos_necesarios: JSON.stringify({
          personal: {
            coordinador_general: 1,
            seguridad: 3,
            limpieza: 2,
            tecnico: 1
          },
          equipamiento: [
            'mesas_stands',
            'sillas',
            'biombos',
            'sistema_sonido',
            'iluminacion'
          ]
        }),
        estructura_precios: JSON.stringify({
          precio_base: 25.00,
          descuentos: {
            'estudiantes': '20%',
            'grupos_10': '15%',
            'early_bird': '25%'
          },
          precios_stands: {
            'basico': 500.00,
            'premium': 800.00
          }
        }),
        presupuesto_estimado: JSON.stringify({
          total_estimado: 15000.00,
          desglose: {
            'venue': 5000.00,
            'servicios': 3000.00,
            'marketing': 2000.00,
            'personal': 3000.00,
            'varios': 2000.00
          }
        }),
        cronograma_tipo: JSON.stringify({
          planificacion: '3 meses antes',
          marketing: '2 meses antes',
          inscripciones: '1 mes antes',
          montaje: '2 días antes',
          evento: 'según fechas',
          desmontaje: '1 día después'
        }),
        fases_planificacion: JSON.stringify([
          {
            nombre: 'Conceptualización',
            duracion_dias: 15,
            tareas: ['definir_objetivos', 'target_audience', 'presupuesto_inicial']
          },
          {
            nombre: 'Planificación',
            duracion_dias: 30,
            tareas: ['reservar_venue', 'contratar_servicios', 'diseñar_layout']
          },
          {
            nombre: 'Marketing',
            duracion_dias: 45,
            tareas: ['crear_materiales', 'lanzar_campaña', 'gestionar_inscripciones']
          }
        ]),
        tareas_previas: JSON.stringify([
          {
            tarea: 'Reservar centro de convenciones',
            dias_anticipacion: 90,
            responsable: 'Coordinador General',
            prioridad: 'alta'
          },
          {
            tarea: 'Contratar servicios básicos',
            dias_anticipacion: 60,
            responsable: 'Coordinador General',
            prioridad: 'alta'
          },
          {
            tarea: 'Lanzar campaña marketing',
            dias_anticipacion: 45,
            responsable: 'Marketing',
            prioridad: 'media'
          }
        ]),
        estrategia_marketing: JSON.stringify({
          canales_principales: ['redes_sociales', 'email_marketing', 'prensa_local'],
          presupuesto_sugerido: 2000.00,
          timeline: '6 semanas antes del evento'
        }),
        canales_promocion: JSON.stringify([
          'Facebook Business',
          'LinkedIn',
          'Email directo',
          'Radio local',
          'Periódicos comerciales'
        ]),
        kpis_sugeridos: JSON.stringify([
          'numero_asistentes',
          'numero_expositores',
          'ingresos_generados',
          'satisfaccion_asistentes',
          'leads_generados'
        ]),
        metricas_seguimiento: JSON.stringify({
          pre_evento: ['inscripciones', 'stands_vendidos'],
          durante_evento: ['asistencia_diaria', 'engagement'],
          post_evento: ['encuestas_satisfaccion', 'seguimiento_leads']
        }),
        es_plantilla_base: true,
        es_personalizable: true,
        nivel_complejidad: 'intermedio',
        tiempo_planificacion_sugerido: 90,
        popularidad: 85,
        calificacion_promedio: 4.2,
        estado: 'activa',
        version: '1.0',
        created_by: 1,
        created_at: new Date()
      },

      // Plantilla para Feria Virtual
      {
        nombre_plantilla: 'Feria Comercial Virtual',
        descripcion: 'Plantilla para ferias comerciales completamente virtuales con stands digitales',
        id_tipo_evento: 1,
        modalidad_predefinida: 'virtual',
        configuracion_basica: JSON.stringify({
          nombre_sugerido: 'Feria Virtual {Sector} {Año}',
          descripcion_base: 'Feria comercial 100% virtual con stands digitales interactivos',
          tipo_acceso: 'publico',
          categoria_principal: 'comercial_virtual'
        }),
        duracion_predefinida: JSON.stringify({
          dias: 2,
          hora_inicio: '10:00',
          hora_fin: '20:00',
          horario_setup: '1 día antes',
          tiempo_pruebas: '2 horas antes'
        }),
        capacidad_sugerida: JSON.stringify({
          optima: 1000,
          minima: 100,
          maxima: 5000,
          stands_virtuales: 30
        }),
        plataformas_recomendadas: JSON.stringify([
          'custom_platform',
          'zoom_webinar',
          'hopin'
        ]),
        tecnologia_requerida: JSON.stringify({
          plataforma: 'custom_virtual_fair',
          requisitos_minimos: {
            ancho_banda: '10 Mbps',
            navegador: 'Chrome 90+',
            dispositivos: ['PC', 'tablet', 'mobile']
          },
          funcionalidades: [
            'stands_3d',
            'video_llamadas',
            'chat_tiempo_real',
            'networking_automatico'
          ]
        }),
        servicios_incluidos: JSON.stringify([
          'plataforma_virtual',
          'soporte_tecnico_24h',
          'grabacion_sesiones',
          'analytics_detallado'
        ]),
        servicios_opcionales: JSON.stringify([
          'stands_personalizados',
          'gamificacion',
          'traduccion_simultanea',
          'networking_ai'
        ]),
        estructura_precios: JSON.stringify({
          precio_base: 15.00,
          descuentos: {
            'estudiantes': '30%',
            'grupos_20': '20%',
            'early_bird': '35%'
          },
          precios_stands: {
            'virtual_basico': 300.00,
            'virtual_premium': 600.00
          }
        }),
        es_plantilla_base: true,
        es_personalizable: true,
        nivel_complejidad: 'avanzado',
        tiempo_planificacion_sugerido: 60,
        popularidad: 92,
        calificacion_promedio: 4.5,
        estado: 'activa',
        version: '1.2',
        created_by: 1,
        created_at: new Date()
      },

      // Plantilla para Conferencia Presencial
      {
        nombre_plantilla: 'Conferencia Profesional',
        descripcion: 'Plantilla para conferencias presenciales con múltiples ponentes',
        id_tipo_evento: 2,
        modalidad_predefinida: 'presencial',
        configuracion_basica: JSON.stringify({
          nombre_sugerido: 'Conferencia {Tema} {Año}',
          descripcion_base: 'Conferencia profesional con ponentes expertos del sector',
          tipo_acceso: 'profesional',
          categoria_principal: 'educativo'
        }),
        duracion_predefinida: JSON.stringify({
          dias: 1,
          hora_inicio: '08:30',
          hora_fin: '17:30',
          descansos: ['10:30-11:00', '15:00-15:30'],
          almuerzo: '12:30-14:00'
        }),
        ubicacion_sugerida: JSON.stringify({
          tipo_preferido: 'auditorio',
          alternativas: ['salon_conferencias', 'centro_convenciones'],
          requisitos_minimos: {
            capacidad: '200 personas',
            audio_profesional: true,
            proyeccion: true,
            aire_acondicionado: true
          }
        }),
        capacidad_sugerida: JSON.stringify({
          optima: 150,
          minima: 50,
          maxima: 300
        }),
        servicios_incluidos: JSON.stringify([
          'sonido_profesional',
          'iluminacion_escenario',
          'proyeccion_dual',
          'grabacion_sesiones',
          'coffee_breaks'
        ]),
        estructura_precios: JSON.stringify({
          precio_base: 50.00,
          descuentos: {
            'miembros_asociacion': '25%',
            'estudiantes': '40%',
            'early_bird': '30%'
          },
          paquetes: {
            'basico': 50.00,
            'premium_con_almuerzo': 75.00,
            'vip_con_networking': 100.00
          }
        }),
        es_plantilla_base: true,
        es_personalizable: true,
        nivel_complejidad: 'basico',
        tiempo_planificacion_sugerido: 45,
        popularidad: 78,
        calificacion_promedio: 4.0,
        estado: 'activa',
        version: '1.1',
        created_by: 1,
        created_at: new Date()
      },

      // Plantilla para Seminario Virtual
      {
        nombre_plantilla: 'Seminario Online Interactivo',
        descripcion: 'Plantilla para seminarios virtuales con alta interacción',
        id_tipo_evento: 3,
        modalidad_predefinida: 'virtual',
        configuracion_basica: JSON.stringify({
          nombre_sugerido: 'Seminario {Tema Específico}',
          descripcion_base: 'Seminario online con enfoque práctico e interactivo',
          tipo_acceso: 'publico',
          categoria_principal: 'educativo_online'
        }),
        duracion_predefinida: JSON.stringify({
          dias: 1,
          hora_inicio: '19:00',
          hora_fin: '21:00',
          descanso: '20:00-20:10'
        }),
        capacidad_sugerida: JSON.stringify({
          optima: 50,
          minima: 10,
          maxima: 200
        }),
        tecnologia_requerida: JSON.stringify({
          plataforma: 'zoom_professional',
          funcionalidades: [
            'breakout_rooms',
            'polling_tiempo_real',
            'chat_interactivo',
            'screen_sharing',
            'grabacion'
          ]
        }),
        servicios_incluidos: JSON.stringify([
          'plataforma_zoom_pro',
          'grabacion_sesion',
          'materiales_descarga',
          'certificado_participacion'
        ]),
        estructura_precios: JSON.stringify({
          precio_base: 20.00,
          descuentos: {
            'estudiantes': '50%',
            'grupos_5': '15%',
            'early_bird': '25%'
          }
        }),
        es_plantilla_base: true,
        es_personalizable: true,
        nivel_complejidad: 'basico',
        tiempo_planificacion_sugerido: 21,
        popularidad: 95,
        calificacion_promedio: 4.7,
        estado: 'activa',
        version: '1.0',
        created_by: 1,
        created_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('plantilla_evento', null, {});
  }
};
