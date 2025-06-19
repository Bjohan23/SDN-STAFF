'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tipo_stand', [
      {
        id_tipo_stand: 1,
        nombre_tipo: 'Básico',
        descripcion: 'Stand básico con servicios esenciales. Ideal para empresas que inician o con presupuesto limitado.',
        area_minima: 6.00,
        area_maxima: 12.00,
        precio_base: 80.00,
        moneda: 'PEN',
        equipamiento_incluido: JSON.stringify([
          'Mesa básica',
          'Dos sillas',
          'Toma eléctrica',
          'Iluminación básica'
        ]),
        servicios_incluidos: JSON.stringify([
          'Limpieza diaria',
          'Seguridad general',
          'WiFi básico'
        ]),
        caracteristicas_especiales: JSON.stringify([
          'Ubicación estándar',
          'Diseño modular',
          'Fácil montaje'
        ]),
        restricciones: JSON.stringify([
          'No permite estructuras altas',
          'Decoración limitada',
          'Sin servicios premium'
        ]),
        permite_personalizacion: true,
        requiere_aprobacion: false,
        estado: 'activo',
        orden_visualizacion: 1,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_stand: 2,
        nombre_tipo: 'Premium',
        descripcion: 'Stand premium con mejores ubicaciones y servicios adicionales incluidos.',
        area_minima: 12.00,
        area_maxima: 25.00,
        precio_base: 150.00,
        moneda: 'PEN',
        equipamiento_incluido: JSON.stringify([
          'Mesa ejecutiva',
          'Cuatro sillas acolchadas',
          'Múltiples tomas eléctricas',
          'Iluminación profesional',
          'Alfombra',
          'Mostrador de recepción'
        ]),
        servicios_incluidos: JSON.stringify([
          'Limpieza especializada',
          'Seguridad prioritaria',
          'WiFi premium',
          'Servicio de café',
          'Almacenamiento'
        ]),
        caracteristicas_especiales: JSON.stringify([
          'Ubicación privilegiada',
          'Mayor visibilidad',
          'Diseño personalizable',
          'Soporte técnico'
        ]),
        restricciones: JSON.stringify([
          'Requiere reserva anticipada',
          'Mínimo de área aplicable'
        ]),
        permite_personalizacion: true,
        requiere_aprobacion: false,
        estado: 'activo',
        orden_visualizacion: 2,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_stand: 3,
        nombre_tipo: 'Corporativo',
        descripcion: 'Stand corporativo para grandes empresas con necesidades especiales y máxima personalización.',
        area_minima: 25.00,
        area_maxima: 100.00,
        precio_base: 250.00,
        moneda: 'PEN',
        equipamiento_incluido: JSON.stringify([
          'Mobiliario ejecutivo completo',
          'Sistema de iluminación avanzado',
          'Múltiples espacios de trabajo',
          'Sala de reuniones privada',
          'Sistema audiovisual',
          'Decoración personalizada'
        ]),
        servicios_incluidos: JSON.stringify([
          'Limpieza premium 24/7',
          'Seguridad dedicada',
          'WiFi corporativo',
          'Servicio de catering',
          'Almacenamiento amplio',
          'Asistente dedicado',
          'Servicio técnico 24/7'
        ]),
        caracteristicas_especiales: JSON.stringify([
          'Ubicación premium',
          'Máxima visibilidad',
          'Diseño arquitectónico',
          'Branding corporativo',
          'Espacios multifuncionales'
        ]),
        restricciones: JSON.stringify([
          'Requiere aprobación previa',
          'Mínimo 30 días de anticipación',
          'Diseño sujeto a aprobación'
        ]),
        permite_personalizacion: true,
        requiere_aprobacion: true,
        estado: 'activo',
        orden_visualizacion: 3,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_stand: 4,
        nombre_tipo: 'Virtual',
        descripcion: 'Stand virtual para eventos híbridos con presencia digital completa.',
        area_minima: null,
        area_maxima: null,
        precio_base: 120.00,
        moneda: 'PEN',
        equipamiento_incluido: JSON.stringify([
          'Plataforma virtual dedicada',
          'Sala de videoconferencias',
          'Chat en tiempo real',
          'Biblioteca de documentos',
          'Sistema de citas virtuales'
        ]),
        servicios_incluidos: JSON.stringify([
          'Soporte técnico 24/7',
          'Capacitación de plataforma',
          'Análisis de visitantes',
          'Integración con redes sociales',
          'Grabación de sesiones'
        ]),
        caracteristicas_especiales: JSON.stringify([
          'Acceso global',
          'Sin limitaciones geográficas',
          'Analíticas avanzadas',
          'Interacción multimedia',
          'Disponibilidad extendida'
        ]),
        restricciones: JSON.stringify([
          'Requiere conexión estable',
          'Capacitación obligatoria',
          'Contenido sujeto a moderación'
        ]),
        permite_personalizacion: true,
        requiere_aprobacion: false,
        estado: 'activo',
        orden_visualizacion: 4,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_stand: 5,
        nombre_tipo: 'Personalizado',
        descripcion: 'Stand completamente personalizado según especificaciones del cliente.',
        area_minima: 15.00,
        area_maxima: 200.00,
        precio_base: 300.00,
        moneda: 'PEN',
        equipamiento_incluido: JSON.stringify([
          'Diseño arquitectónico exclusivo',
          'Mobiliario a medida',
          'Tecnología de vanguardia',
          'Instalaciones especiales'
        ]),
        servicios_incluidos: JSON.stringify([
          'Consultoría de diseño',
          'Project manager dedicado',
          'Instalación especializada',
          'Servicios premium incluidos'
        ]),
        caracteristicas_especiales: JSON.stringify([
          'Diseño único',
          'Sin limitaciones estéticas',
          'Integración tecnológica avanzada',
          'Experiencias inmersivas'
        ]),
        restricciones: JSON.stringify([
          'Aprobación obligatoria',
          'Plazo mínimo 60 días',
          'Presupuesto sujeto a cotización',
          'Cumplimiento de normativas'
        ]),
        permite_personalizacion: true,
        requiere_aprobacion: true,
        estado: 'activo',
        orden_visualizacion: 5,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tipo_stand', null, {});
  }
};
