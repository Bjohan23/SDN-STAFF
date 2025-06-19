'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('validacion_tipo_evento', [
      // Validaciones para Feria Comercial (id_tipo_evento: 1)
      {
        id_tipo_evento: 1,
        nombre_validacion: 'Capacidad Mínima Feria',
        descripcion: 'Valida que la capacidad sea apropiada para una feria comercial',
        tipo_validacion: 'capacidad_validacion',
        campo_objetivo: 'capacidad_maxima',
        condicion_validacion: JSON.stringify({
          valor_minimo: 50,
          capacidades_por_ubicacion: {
            'centro_convenciones': { minima: 100, maxima: 5000 },
            'salon_eventos': { minima: 50, maxima: 1000 },
            'espacios_abiertos': { minima: 200, maxima: 10000 }
          }
        }),
        mensaje_error: 'Para ferias comerciales se requiere una capacidad mínima de 50 personas',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'creacion',
        orden_ejecucion: 1,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 1,
        nombre_validacion: 'Duración Mínima Feria',
        descripcion: 'Valida que la feria tenga duración mínima para ser efectiva',
        tipo_validacion: 'fecha_validacion',
        campo_objetivo: 'duracion_horas',
        condicion_validacion: JSON.stringify({
          duracion_minima_horas: 6,
          duracion_maxima_horas: 72
        }),
        mensaje_error: 'Las ferias comerciales deben durar entre 6 y 72 horas',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'creacion',
        orden_ejecucion: 2,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 1,
        nombre_validacion: 'Ubicación Requerida',
        descripcion: 'Valida que se especifique ubicación para eventos presenciales',
        tipo_validacion: 'campo_requerido',
        campo_objetivo: 'ubicacion',
        condicion_validacion: JSON.stringify({
          requerido_para_modalidades: ['presencial', 'hibrido']
        }),
        mensaje_error: 'La ubicación es obligatoria para ferias presenciales o híbridas',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'creacion',
        orden_ejecucion: 3,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 1,
        nombre_validacion: 'Plataforma Virtual Requerida',
        descripcion: 'Valida que se especifique plataforma para eventos virtuales',
        tipo_validacion: 'campo_requerido',
        campo_objetivo: 'plataforma_virtual',
        condicion_validacion: JSON.stringify({
          requerido_para_modalidades: ['virtual', 'hibrido']
        }),
        mensaje_error: 'La plataforma virtual es obligatoria para ferias virtuales o híbridas',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'creacion',
        orden_ejecucion: 4,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 1,
        nombre_validacion: 'Anticipación Mínima',
        descripcion: 'Recomienda planificar la feria con suficiente anticipación',
        tipo_validacion: 'fecha_validacion',
        campo_objetivo: 'fecha_inicio',
        condicion_validacion: JSON.stringify({
          dias_anticipacion_minima: 30,
          no_pasada: true
        }),
        mensaje_error: 'Se recomienda planificar ferias comerciales con al menos 30 días de anticipación',
        es_critica: false,
        es_advertencia: true,
        momento_validacion: 'creacion',
        orden_ejecucion: 5,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },

      // Validaciones para Conferencia (id_tipo_evento: 2)
      {
        id_tipo_evento: 2,
        nombre_validacion: 'Capacidad Conferencia',
        descripcion: 'Valida capacidad apropiada para conferencias',
        tipo_validacion: 'capacidad_validacion',
        campo_objetivo: 'capacidad_maxima',
        condicion_validacion: JSON.stringify({
          valor_minimo: 20,
          valor_maximo: 1000,
          capacidades_por_ubicacion: {
            'auditorio': { minima: 50, maxima: 500 },
            'salon_conferencias': { minima: 20, maxima: 200 },
            'centro_convenciones': { minima: 100, maxima: 1000 }
          }
        }),
        mensaje_error: 'Las conferencias requieren capacidad entre 20 y 1000 personas',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'creacion',
        orden_ejecucion: 1,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 2,
        nombre_validacion: 'Agenda Requerida',
        descripcion: 'Las conferencias deben tener una agenda definida',
        tipo_validacion: 'campo_requerido',
        campo_objetivo: 'agenda',
        condicion_validacion: JSON.stringify({
          tipo_contenido: 'json_array',
          minimo_elementos: 1
        }),
        mensaje_error: 'Las conferencias deben incluir una agenda con al menos una sesión',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'publicacion',
        orden_ejecucion: 2,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 2,
        nombre_validacion: 'Ponentes Confirmados',
        descripcion: 'Verificar que hay ponentes confirmados antes de publicar',
        tipo_validacion: 'campo_requerido',
        campo_objetivo: 'ponentes',
        condicion_validacion: JSON.stringify({
          tipo_contenido: 'json_array',
          minimo_elementos: 1
        }),
        mensaje_error: 'Se requiere al menos un ponente confirmado para publicar la conferencia',
        es_critica: false,
        es_advertencia: true,
        momento_validacion: 'publicacion',
        orden_ejecucion: 3,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 2,
        nombre_validacion: 'Precio Conferencia',
        descripcion: 'Valida rango de precios apropiado para conferencias',
        tipo_validacion: 'precio_validacion',
        campo_objetivo: 'precio_entrada',
        condicion_validacion: JSON.stringify({
          precio_minimo: 0,
          precio_maximo: 500.00,
          moneda: 'PEN'
        }),
        mensaje_error: 'El precio de conferencias debe estar entre S/ 0.00 y S/ 500.00',
        es_critica: false,
        es_advertencia: true,
        momento_validacion: 'creacion',
        orden_ejecucion: 4,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },

      // Validaciones para Seminario (id_tipo_evento: 3)
      {
        id_tipo_evento: 3,
        nombre_validacion: 'Duración Seminario',
        descripcion: 'Valida duración apropiada para seminarios',
        tipo_validacion: 'fecha_validacion',
        campo_objetivo: 'duracion_horas',
        condicion_validacion: JSON.stringify({
          duracion_minima_horas: 1,
          duracion_maxima_horas: 8
        }),
        mensaje_error: 'Los seminarios deben durar entre 1 y 8 horas',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'creacion',
        orden_ejecucion: 1,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 3,
        nombre_validacion: 'Capacidad Seminario',
        descripcion: 'Valida capacidad apropiada para seminarios',
        tipo_validacion: 'capacidad_validacion',
        campo_objetivo: 'capacidad_maxima',
        condicion_validacion: JSON.stringify({
          valor_minimo: 5,
          valor_maximo: 500
        }),
        mensaje_error: 'Los seminarios deben tener capacidad entre 5 y 500 personas',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'creacion',
        orden_ejecucion: 2,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 3,
        nombre_validacion: 'Materiales Seminario',
        descripcion: 'Recomienda incluir materiales para seminarios',
        tipo_validacion: 'campo_requerido',
        campo_objetivo: 'materiales_incluidos',
        condicion_validacion: JSON.stringify({
          tipo_contenido: 'boolean',
          valor_esperado: true
        }),
        mensaje_error: 'Se recomienda incluir materiales descargables en seminarios',
        es_critica: false,
        es_advertencia: true,
        momento_validacion: 'publicacion',
        orden_ejecucion: 3,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 3,
        nombre_validacion: 'Certificación Disponible',
        descripcion: 'Verifica si se otorgarán certificados',
        tipo_validacion: 'custom',
        campo_objetivo: 'otorga_certificado',
        condicion_validacion: JSON.stringify({
          validacion_custom: 'verificar_certificacion',
          parametros: {
            duracion_minima_certificado: 2,
            evaluacion_requerida: false
          }
        }),
        mensaje_error: 'Para seminarios de más de 2 horas se recomienda otorgar certificado',
        es_critica: false,
        es_advertencia: true,
        momento_validacion: 'publicacion',
        orden_ejecucion: 4,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },

      // Validaciones generales para todos los tipos
      {
        id_tipo_evento: 1,
        nombre_validacion: 'Fecha Fin Posterior',
        descripcion: 'Valida que la fecha fin sea posterior a la fecha inicio',
        tipo_validacion: 'fecha_validacion',
        campo_objetivo: 'fecha_fin',
        condicion_validacion: JSON.stringify({
          debe_ser_posterior_a: 'fecha_inicio'
        }),
        mensaje_error: 'La fecha de fin debe ser posterior a la fecha de inicio',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'siempre',
        orden_ejecucion: 10,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 2,
        nombre_validacion: 'Fecha Fin Posterior',
        descripcion: 'Valida que la fecha fin sea posterior a la fecha inicio',
        tipo_validacion: 'fecha_validacion',
        campo_objetivo: 'fecha_fin',
        condicion_validacion: JSON.stringify({
          debe_ser_posterior_a: 'fecha_inicio'
        }),
        mensaje_error: 'La fecha de fin debe ser posterior a la fecha de inicio',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'siempre',
        orden_ejecucion: 10,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      },
      {
        id_tipo_evento: 3,
        nombre_validacion: 'Fecha Fin Posterior',
        descripcion: 'Valida que la fecha fin sea posterior a la fecha inicio',
        tipo_validacion: 'fecha_validacion',
        campo_objetivo: 'fecha_fin',
        condicion_validacion: JSON.stringify({
          debe_ser_posterior_a: 'fecha_inicio'
        }),
        mensaje_error: 'La fecha de fin debe ser posterior a la fecha de inicio',
        es_critica: true,
        es_advertencia: false,
        momento_validacion: 'siempre',
        orden_ejecucion: 10,
        estado: 'activa',
        created_by: 1,
        created_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('validacion_tipo_evento', null, {});
  }
};
