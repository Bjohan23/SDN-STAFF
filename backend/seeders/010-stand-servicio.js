'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('stand_servicio', [
      // Servicios contratados por TechInnovate Solutions (Stand B-002 en Expo Tecnología)
      {
        id_stand_servicio: 1,
        id_stand: 4, // Stand B-002
        id_evento: 1, // Expo Tecnología 2024
        id_servicio: 1, // Toma Eléctrica Adicional
        id_empresa: 1, // TechInnovate Solutions
        cantidad: 3,
        precio_unitario: 35.00,
        descuento_aplicado: 0.00,
        precio_total: 105.00,
        estado_servicio: 'instalado',
        fecha_solicitud: new Date('2024-02-01 09:15:00'),
        fecha_instalacion_programada: new Date('2024-03-13 10:00:00'),
        fecha_instalacion_real: new Date('2024-03-13 09:45:00'),
        fecha_retiro_programada: new Date('2024-03-17 19:00:00'),
        fecha_retiro_real: null,
        especificaciones_adicionales: JSON.stringify({
          'ubicacion': 'Distribuidas en el perímetro del stand',
          'amperaje': '20A cada una',
          'tipo_conector': 'Schuko europeo'
        }),
        contacto_instalacion: JSON.stringify({
          'responsable': 'Carlos Mendoza',
          'telefono': '+51 999 888 777',
          'email': 'carlos.mendoza@techinnovate.pe'
        }),
        observaciones: 'Instalación exitosa, funcionando correctamente',
        calificacion_servicio: null,
        comentarios_calificacion: null,
        requiere_supervision: true,
        es_urgente: false,
        created_by: 1,
        created_at: new Date('2024-02-01 09:15:00'),
        updated_at: new Date('2024-03-13 09:45:00')
      },
      {
        id_stand_servicio: 2,
        id_stand: 4, // Stand B-002
        id_evento: 1, // Expo Tecnología 2024
        id_servicio: 3, // Internet Dedicado Premium
        id_empresa: 1, // TechInnovate Solutions
        cantidad: 1,
        precio_unitario: 120.00,
        descuento_aplicado: 20.00, // Descuento por contratación múltiple
        precio_total: 400.00, // 4 días * 120 - 80 de descuento
        estado_servicio: 'activo',
        fecha_solicitud: new Date('2024-02-01 09:20:00'),
        fecha_instalacion_programada: new Date('2024-03-13 08:00:00'),
        fecha_instalacion_real: new Date('2024-03-13 07:30:00'),
        fecha_retiro_programada: new Date('2024-03-17 20:00:00'),
        fecha_retiro_real: null,
        especificaciones_adicionales: JSON.stringify({
          'velocidad_garantizada': '100 Mbps',
          'ip_publica_dedicada': true,
          'soporte_tecnico': '24/7 durante el evento'
        }),
        contacto_instalacion: JSON.stringify({
          'responsable': 'Carlos Mendoza',
          'telefono': '+51 999 888 777',
          'email': 'carlos.mendoza@techinnovate.pe'
        }),
        observaciones: 'Conexión funcionando perfectamente, velocidad confirmada',
        calificacion_servicio: null,
        comentarios_calificacion: null,
        requiere_supervision: true,
        es_urgente: false,
        created_by: 1,
        created_at: new Date('2024-02-01 09:20:00'),
        updated_at: new Date('2024-03-13 07:30:00')
      },
      {
        id_stand_servicio: 3,
        id_stand: 4, // Stand B-002
        id_evento: 1, // Expo Tecnología 2024
        id_servicio: 7, // Pantalla LED 55 pulgadas
        id_empresa: 1, // TechInnovate Solutions
        cantidad: 2,
        precio_unitario: 280.00,
        descuento_aplicado: 0.00,
        precio_total: 560.00,
        estado_servicio: 'activo',
        fecha_solicitud: new Date('2024-02-05 14:30:00'),
        fecha_instalacion_programada: new Date('2024-03-13 14:00:00'),
        fecha_instalacion_real: new Date('2024-03-13 13:45:00'),
        fecha_retiro_programada: new Date('2024-03-17 18:00:00'),
        fecha_retiro_real: null,
        especificaciones_adicionales: JSON.stringify({
          'una_horizontal': 'Para presentaciones principales',
          'una_vertical': 'Para información de productos',
          'contenido_4k': true,
          'control_remoto': 'Incluido'
        }),
        contacto_instalacion: JSON.stringify({
          'responsable': 'Carlos Mendoza',
          'telefono': '+51 999 888 777',
          'email': 'carlos.mendoza@techinnovate.pe'
        }),
        observaciones: 'Pantallas instaladas y configuradas, excelente calidad de imagen',
        calificacion_servicio: null,
        comentarios_calificacion: null,
        requiere_supervision: true,
        es_urgente: false,
        created_by: 1,
        created_at: new Date('2024-02-05 14:30:00'),
        updated_at: new Date('2024-03-13 13:45:00')
      },
      // Servicios contratados por EcoGreen Perú (Stand B-001 en Expo Tecnología) - Estado: Confirmado
      {
        id_stand_servicio: 4,
        id_stand: 3, // Stand B-001
        id_evento: 1, // Expo Tecnología 2024
        id_servicio: 5, // Mesa Ejecutiva Adicional
        id_empresa: 2, // EcoGreen Perú
        cantidad: 2,
        precio_unitario: 85.00,
        descuento_aplicado: 15.00, // Descuento por cliente frecuente
        precio_total: 155.00,
        estado_servicio: 'confirmado',
        fecha_solicitud: new Date('2024-02-16 11:00:00'),
        fecha_instalacion_programada: new Date('2024-03-14 09:00:00'),
        fecha_instalacion_real: null,
        fecha_retiro_programada: new Date('2024-03-17 19:00:00'),
        fecha_retiro_real: null,
        especificaciones_adicionales: JSON.stringify({
          'material': 'Madera de roble',
          'estilo': 'Ejecutivo moderno',
          'accesorios': 'Incluye organizadores'
        }),
        contacto_instalacion: JSON.stringify({
          'responsable': 'María García',
          'telefono': '+51 888 777 666',
          'email': 'maria.garcia@ecogreen.pe'
        }),
        observaciones: 'Pendiente de instalación, coordinación confirmada',
        calificacion_servicio: null,
        comentarios_calificacion: null,
        requiere_supervision: false,
        es_urgente: false,
        created_by: 1,
        created_at: new Date('2024-02-16 11:00:00'),
        updated_at: new Date('2024-02-16 11:00:00')
      },
      {
        id_stand_servicio: 5,
        id_stand: 3, // Stand B-001
        id_evento: 1, // Expo Tecnología 2024
        id_servicio: 11, // Servicio de Coffee Break
        id_empresa: 2, // EcoGreen Perú
        cantidad: 1,
        precio_unitario: 150.00,
        descuento_aplicado: 0.00,
        precio_total: 600.00, // 4 días * 150
        estado_servicio: 'confirmado',
        fecha_solicitud: new Date('2024-02-16 11:15:00'),
        fecha_instalacion_programada: new Date('2024-03-15 07:00:00'),
        fecha_instalacion_real: null,
        fecha_retiro_programada: new Date('2024-03-17 18:00:00'),
        fecha_retiro_real: null,
        especificaciones_adicionales: JSON.stringify({
          'menu': 'Café orgánico, té verde, snacks saludables',
          'horario': '09:00 - 17:00 cada día',
          'personal': '1 barista incluido',
          'equipamiento': 'Máquina profesional, vajilla biodegradable'
        }),
        contacto_instalacion: JSON.stringify({
          'responsable': 'María García',
          'telefono': '+51 888 777 666',
          'email': 'maria.garcia@ecogreen.pe'
        }),
        observaciones: 'Enfoque en productos orgánicos y sostenibles',
        calificacion_servicio: null,
        comentarios_calificacion: null,
        requiere_supervision: true,
        es_urgente: false,
        created_by: 1,
        created_at: new Date('2024-02-16 11:15:00'),
        updated_at: new Date('2024-02-16 11:15:00')
      },
      // Servicios solicitados para stand disponible (simulando nueva solicitud)
      {
        id_stand_servicio: 6,
        id_stand: 1, // Stand A-001
        id_evento: 2, // Feria Gastronómica Internacional
        id_servicio: 6, // Sillas Ejecutivas
        id_empresa: 3, // Sabores del Norte
        cantidad: 8,
        precio_unitario: 25.00,
        descuento_aplicado: 0.00,
        precio_total: 200.00,
        estado_servicio: 'solicitado',
        fecha_solicitud: new Date('2024-03-01 16:20:00'),
        fecha_instalacion_programada: new Date('2024-04-24 10:00:00'),
        fecha_instalacion_real: null,
        fecha_retiro_programada: new Date('2024-04-28 20:00:00'),
        fecha_retiro_real: null,
        especificaciones_adicionales: JSON.stringify({
          'color': 'Marrón chocolate',
          'material': 'Cuero sintético',
          'distribucion': '4 para área de atención, 4 para zona de degustación'
        }),
        contacto_instalacion: JSON.stringify({
          'responsable': 'José Rivera',
          'telefono': '+51 777 666 555',
          'email': 'jose.rivera@saboresdelnorte.pe'
        }),
        observaciones: 'Solicitud reciente, pendiente de confirmación',
        calificacion_servicio: null,
        comentarios_calificacion: null,
        requiere_supervision: false,
        es_urgente: false,
        created_by: 1,
        created_at: new Date('2024-03-01 16:20:00'),
        updated_at: new Date('2024-03-01 16:20:00')
      },
      // Servicio finalizado con calificación
      {
        id_stand_servicio: 7,
        id_stand: 4, // Stand B-002
        id_evento: 1, // Expo Tecnología 2024  
        id_servicio: 9, // Limpieza Especializada VIP
        id_empresa: 1, // TechInnovate Solutions
        cantidad: 1,
        precio_unitario: 95.00,
        descuento_aplicado: 0.00,
        precio_total: 380.00, // 4 días * 95
        estado_servicio: 'finalizado',
        fecha_solicitud: new Date('2024-02-10 10:00:00'),
        fecha_instalacion_programada: new Date('2024-03-15 06:00:00'),
        fecha_instalacion_real: new Date('2024-03-15 06:00:00'),
        fecha_retiro_programada: new Date('2024-03-17 22:00:00'),
        fecha_retiro_real: new Date('2024-03-17 21:30:00'),
        especificaciones_adicionales: JSON.stringify({
          'frecuencia': 'Cada 4 horas',
          'productos': 'Ecológicos y antibacteriales',
          'areas_especiales': 'Zona de demostraciones tecnológicas'
        }),
        contacto_instalacion: JSON.stringify({
          'responsable': 'Carlos Mendoza',
          'telefono': '+51 999 888 777',
          'email': 'carlos.mendoza@techinnovate.pe'
        }),
        observaciones: 'Servicio completado exitosamente',
        calificacion_servicio: 4.8,
        comentarios_calificacion: 'Excelente servicio, muy profesional y discreto. El stand se mantuvo impecable durante todo el evento.',
        requiere_supervision: false,
        es_urgente: false,
        created_by: 1,
        created_at: new Date('2024-02-10 10:00:00'),
        updated_at: new Date('2024-03-17 22:00:00')
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('stand_servicio', null, {});
  }
};
