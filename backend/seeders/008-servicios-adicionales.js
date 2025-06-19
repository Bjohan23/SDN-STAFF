'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('servicio_adicional', [
      // Servicios de Electricidad
      {
        id_servicio: 1,
        nombre_servicio: 'Toma Eléctrica Adicional',
        descripcion: 'Instalación de tomas eléctricas adicionales para mayor capacidad energética.',
        categoria: 'electricidad',
        tipo_precio: 'por_unidad',
        precio: 35.00,
        moneda: 'PEN',
        unidad_medida: 'unidad',
        cantidad_minima: 1,
        cantidad_maxima: 10,
        requiere_instalacion: true,
        tiempo_instalacion_horas: 2,
        disponible_tipos_stand: JSON.stringify(['basico', 'premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Instalación 24 horas antes del evento',
          'Sujeto a capacidad eléctrica del stand'
        ]),
        incluye_mantenimiento: true,
        proveedor_externo: null,
        contacto_proveedor: null,
        estado: 'disponible',
        orden_visualizacion: 1,
        es_popular: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_servicio: 2,
        nombre_servicio: 'Generador Eléctrico Backup',
        descripcion: 'Generador de respaldo para garantizar suministro eléctrico continuo.',
        categoria: 'electricidad',
        tipo_precio: 'por_dia',
        precio: 180.00,
        moneda: 'PEN',
        unidad_medida: 'día',
        cantidad_minima: 1,
        cantidad_maxima: null,
        requiere_instalacion: true,
        tiempo_instalacion_horas: 4,
        disponible_tipos_stand: JSON.stringify(['premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Solo para stands con alto consumo energético',
          'Requiere espacio adicional'
        ]),
        incluye_mantenimiento: true,
        proveedor_externo: 'ElectroServicios SAC',
        contacto_proveedor: JSON.stringify({
          'empresa': 'ElectroServicios SAC',
          'telefono': '+51 999 888 777',
          'email': 'contacto@electroservicios.pe'
        }),
        estado: 'disponible',
        orden_visualizacion: 5,
        es_popular: false,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Servicios de Conectividad
      {
        id_servicio: 3,
        nombre_servicio: 'Internet Dedicado Premium',
        descripcion: 'Conexión de internet dedicada de alta velocidad para demostraciones en línea.',
        categoria: 'conectividad',
        tipo_precio: 'por_dia',
        precio: 120.00,
        moneda: 'PEN',
        unidad_medida: 'día',
        cantidad_minima: 1,
        cantidad_maxima: null,
        requiere_instalacion: true,
        tiempo_instalacion_horas: 3,
        disponible_tipos_stand: JSON.stringify(['premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Velocidad garantizada 100 Mbps',
          'Instalación 48 horas antes'
        ]),
        incluye_mantenimiento: true,
        proveedor_externo: 'TelecomPlus',
        contacto_proveedor: JSON.stringify({
          'empresa': 'TelecomPlus',
          'telefono': '+51 888 777 666',
          'email': 'soporte@telecomplus.pe'
        }),
        estado: 'disponible',
        orden_visualizacion: 2,
        es_popular: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_servicio: 4,
        nombre_servicio: 'Sistema de Videoconferencia',
        descripcion: 'Equipo completo para videoconferencias profesionales con soporte técnico.',
        categoria: 'conectividad',
        tipo_precio: 'por_evento',
        precio: 450.00,
        moneda: 'PEN',
        unidad_medida: 'evento',
        cantidad_minima: 1,
        cantidad_maxima: 3,
        requiere_instalacion: true,
        tiempo_instalacion_horas: 6,
        disponible_tipos_stand: JSON.stringify(['corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Requiere internet dedicado',
          'Capacitación obligatoria del personal'
        ]),
        incluye_mantenimiento: true,
        proveedor_externo: null,
        contacto_proveedor: null,
        estado: 'disponible',
        orden_visualizacion: 8,
        es_popular: false,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Servicios de Mobiliario
      {
        id_servicio: 5,
        nombre_servicio: 'Mesa Ejecutiva Adicional',
        descripcion: 'Mesa ejecutiva de alta calidad para reuniones y presentaciones.',
        categoria: 'mobiliario',
        tipo_precio: 'por_evento',
        precio: 85.00,
        moneda: 'PEN',
        unidad_medida: 'unidad',
        cantidad_minima: 1,
        cantidad_maxima: 5,
        requiere_instalacion: false,
        tiempo_instalacion_horas: 1,
        disponible_tipos_stand: JSON.stringify(['basico', 'premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Sujeto a espacio disponible'
        ]),
        incluye_mantenimiento: false,
        proveedor_externo: null,
        contacto_proveedor: null,
        estado: 'disponible',
        orden_visualizacion: 3,
        es_popular: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_servicio: 6,
        nombre_servicio: 'Sillas Ejecutivas',
        descripcion: 'Sillas ejecutivas acolchadas y ergonómicas para comodidad de visitantes.',
        categoria: 'mobiliario',
        tipo_precio: 'por_unidad',
        precio: 25.00,
        moneda: 'PEN',
        unidad_medida: 'unidad',
        cantidad_minima: 2,
        cantidad_maxima: 20,
        requiere_instalacion: false,
        tiempo_instalacion_horas: null,
        disponible_tipos_stand: JSON.stringify(['basico', 'premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Mínimo 2 unidades',
          'Disponibilidad sujeta a stock'
        ]),
        incluye_mantenimiento: false,
        proveedor_externo: null,
        contacto_proveedor: null,
        estado: 'disponible',
        orden_visualizacion: 4,
        es_popular: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Servicios Audiovisuales
      {
        id_servicio: 7,
        nombre_servicio: 'Pantalla LED 55 pulgadas',
        descripcion: 'Pantalla LED de 55 pulgadas para presentaciones y contenido multimedia.',
        categoria: 'audiovisual',
        tipo_precio: 'por_evento',
        precio: 280.00,
        moneda: 'PEN',
        unidad_medida: 'unidad',
        cantidad_minima: 1,
        cantidad_maxima: 4,
        requiere_instalacion: true,
        tiempo_instalacion_horas: 3,
        disponible_tipos_stand: JSON.stringify(['premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Requiere soporte estructural',
          'Instalación por técnico especializado'
        ]),
        incluye_mantenimiento: true,
        proveedor_externo: 'AudioVisual Pro',
        contacto_proveedor: JSON.stringify({
          'empresa': 'AudioVisual Pro',
          'telefono': '+51 777 666 555',
          'email': 'alquiler@avpro.pe'
        }),
        estado: 'disponible',
        orden_visualizacion: 6,
        es_popular: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_servicio: 8,
        nombre_servicio: 'Sistema de Sonido Profesional',
        descripcion: 'Sistema de sonido completo con micrófonos inalámbricos para presentaciones.',
        categoria: 'audiovisual',
        tipo_precio: 'por_evento',
        precio: 350.00,
        moneda: 'PEN',
        unidad_medida: 'evento',
        cantidad_minima: 1,
        cantidad_maxima: 2,
        requiere_instalacion: true,
        tiempo_instalacion_horas: 4,
        disponible_tipos_stand: JSON.stringify(['corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Requiere prueba de sonido previa',
          'No permitido cerca de stands con actividades similares'
        ]),
        incluye_mantenimiento: true,
        proveedor_externo: 'AudioVisual Pro',
        contacto_proveedor: JSON.stringify({
          'empresa': 'AudioVisual Pro',
          'telefono': '+51 777 666 555',
          'email': 'alquiler@avpro.pe'
        }),
        estado: 'disponible',
        orden_visualizacion: 9,
        es_popular: false,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Servicios de Limpieza
      {
        id_servicio: 9,
        nombre_servicio: 'Limpieza Especializada VIP',
        descripcion: 'Servicio de limpieza especializada cada 4 horas durante el evento.',
        categoria: 'limpieza',
        tipo_precio: 'por_dia',
        precio: 95.00,
        moneda: 'PEN',
        unidad_medida: 'día',
        cantidad_minima: 1,
        cantidad_maxima: null,
        requiere_instalacion: false,
        tiempo_instalacion_horas: null,
        disponible_tipos_stand: JSON.stringify(['premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'No interrumpe actividades del stand',
          'Productos ecológicos disponibles'
        ]),
        incluye_mantenimiento: false,
        proveedor_externo: 'LimpiezaTotal',
        contacto_proveedor: JSON.stringify({
          'empresa': 'LimpiezaTotal',
          'telefono': '+51 666 555 444',
          'email': 'servicios@limpiezatotal.pe'
        }),
        estado: 'disponible',
        orden_visualizacion: 7,
        es_popular: false,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Servicios de Seguridad
      {
        id_servicio: 10,
        nombre_servicio: 'Vigilancia Privada 24/7',
        descripcion: 'Vigilante privado dedicado exclusivamente al stand durante todo el evento.',
        categoria: 'seguridad',
        tipo_precio: 'por_dia',
        precio: 220.00,
        moneda: 'PEN',
        unidad_medida: 'día',
        cantidad_minima: 1,
        cantidad_maxima: 3,
        requiere_instalacion: false,
        tiempo_instalacion_horas: null,
        disponible_tipos_stand: JSON.stringify(['corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Personal certificado y uniformado',
          'Coordinación con seguridad general del evento'
        ]),
        incluye_mantenimiento: false,
        proveedor_externo: 'SegurMax',
        contacto_proveedor: JSON.stringify({
          'empresa': 'SegurMax',
          'telefono': '+51 555 444 333',
          'email': 'contrataciones@segurmax.pe'
        }),
        estado: 'disponible',
        orden_visualizacion: 10,
        es_popular: false,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Servicios de Catering
      {
        id_servicio: 11,
        nombre_servicio: 'Servicio de Coffee Break',
        descripcion: 'Servicio de café, té y snacks disponible durante todo el evento.',
        categoria: 'catering',
        tipo_precio: 'por_dia',
        precio: 150.00,
        moneda: 'PEN',
        unidad_medida: 'día',
        cantidad_minima: 1,
        cantidad_maxima: null,
        requiere_instalacion: true,
        tiempo_instalacion_horas: 1,
        disponible_tipos_stand: JSON.stringify(['premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Requiere espacio para estación de café',
          'Disponible solo durante horario del evento'
        ]),
        incluye_mantenimiento: true,
        proveedor_externo: 'Catering Deluxe',
        contacto_proveedor: JSON.stringify({
          'empresa': 'Catering Deluxe',
          'telefono': '+51 444 333 222',
          'email': 'eventos@cateringdeluxe.pe'
        }),
        estado: 'disponible',
        orden_visualizacion: 11,
        es_popular: true,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Servicios de Decoración
      {
        id_servicio: 12,
        nombre_servicio: 'Decoración Temática Personalizada',
        descripcion: 'Diseño y decoración temática acorde a la imagen corporativa de la empresa.',
        categoria: 'decoracion',
        tipo_precio: 'por_evento',
        precio: 680.00,
        moneda: 'PEN',
        unidad_medida: 'evento',
        cantidad_minima: 1,
        cantidad_maxima: 1,
        requiere_instalacion: true,
        tiempo_instalacion_horas: 8,
        disponible_tipos_stand: JSON.stringify(['premium', 'corporativo', 'personalizado']),
        restricciones: JSON.stringify([
          'Diseño sujeto a aprobación previa',
          'Instalación mínimo 12 horas antes',
          'Materiales ignífugos obligatorios'
        ]),
        incluye_mantenimiento: true,
        proveedor_externo: 'Decoraciones Eventos',
        contacto_proveedor: JSON.stringify({
          'empresa': 'Decoraciones Eventos',
          'telefono': '+51 333 222 111',
          'email': 'diseño@decoracioneseventos.pe'
        }),
        estado: 'disponible',
        orden_visualizacion: 12,
        es_popular: false,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('servicio_adicional', null, {});
  }
};
