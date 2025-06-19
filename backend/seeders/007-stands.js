'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('stand', [
      // Stands Básicos
      {
        id_stand: 1,
        numero_stand: 'A-001',
        nombre_stand: 'Stand Básico Norte A1',
        id_tipo_stand: 1,
        area: 9.00,
        ubicacion: 'Pabellón A - Sector Norte',
        coordenadas_x: 10.00,
        coordenadas_y: 10.00,
        estado_fisico: 'disponible',
        caracteristicas_fisicas: JSON.stringify({
          'orientacion': 'Norte',
          'acceso_vehicular': false,
          'cerca_baños': true,
          'cerca_entrada': true
        }),
        equipamiento_fijo: JSON.stringify([
          'Toma eléctrica 220V',
          'Punto de red',
          'Iluminación LED'
        ]),
        servicios_disponibles: JSON.stringify([
          'WiFi',
          'Limpieza',
          'Seguridad'
        ]),
        precio_personalizado: null,
        observaciones: 'Ubicación ideal para empresas nuevas',
        fecha_ultima_inspeccion: new Date('2024-01-15'),
        fecha_proximo_mantenimiento: new Date('2024-07-15'),
        estado: 'activo',
        es_premium: false,
        permite_subdivision: false,
        capacidad_maxima_personas: 8,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_stand: 2,
        numero_stand: 'A-002',
        nombre_stand: 'Stand Básico Norte A2',
        id_tipo_stand: 1,
        area: 12.00,
        ubicacion: 'Pabellón A - Sector Norte',
        coordenadas_x: 22.00,
        coordenadas_y: 10.00,
        estado_fisico: 'disponible',
        caracteristicas_fisicas: JSON.stringify({
          'orientacion': 'Norte',
          'acceso_vehicular': false,
          'cerca_baños': true,
          'cerca_entrada': true
        }),
        equipamiento_fijo: JSON.stringify([
          'Toma eléctrica 220V',
          'Punto de red',
          'Iluminación LED'
        ]),
        servicios_disponibles: JSON.stringify([
          'WiFi',
          'Limpieza',
          'Seguridad'
        ]),
        precio_personalizado: null,
        observaciones: 'Stand básico ampliado',
        fecha_ultima_inspeccion: new Date('2024-01-15'),
        fecha_proximo_mantenimiento: new Date('2024-07-15'),
        estado: 'activo',
        es_premium: false,
        permite_subdivision: true,
        capacidad_maxima_personas: 12,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Stands Premium
      {
        id_stand: 3,
        numero_stand: 'B-001',
        nombre_stand: 'Stand Premium Centro B1',
        id_tipo_stand: 2,
        area: 20.00,
        ubicacion: 'Pabellón B - Sector Centro',
        coordenadas_x: 50.00,
        coordenadas_y: 30.00,
        estado_fisico: 'disponible',
        caracteristicas_fisicas: JSON.stringify({
          'orientacion': 'Centro',
          'acceso_vehicular': true,
          'cerca_baños': true,
          'cerca_entrada': false,
          'esquina': true,
          'doble_frente': true
        }),
        equipamiento_fijo: JSON.stringify([
          'Múltiples tomas eléctricas',
          'Conexión de red redundante',
          'Iluminación profesional',
          'Sistema de sonido',
          'Alfombrado'
        ]),
        servicios_disponibles: JSON.stringify([
          'WiFi Premium',
          'Limpieza especializada',
          'Seguridad prioritaria',
          'Servicio de café',
          'Almacenamiento'
        ]),
        precio_personalizado: 3200.00,
        observaciones: 'Ubicación privilegiada con mayor visibilidad',
        fecha_ultima_inspeccion: new Date('2024-01-10'),
        fecha_proximo_mantenimiento: new Date('2024-06-10'),
        estado: 'activo',
        es_premium: true,
        permite_subdivision: false,
        capacidad_maxima_personas: 25,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_stand: 4,
        numero_stand: 'B-002',
        nombre_stand: 'Stand Premium Centro B2',
        id_tipo_stand: 2,
        area: 18.00,
        ubicacion: 'Pabellón B - Sector Centro',
        coordenadas_x: 70.00,
        coordenadas_y: 30.00,
        estado_fisico: 'ocupado',
        caracteristicas_fisicas: JSON.stringify({
          'orientacion': 'Centro',
          'acceso_vehicular': false,
          'cerca_baños': false,
          'cerca_entrada': false
        }),
        equipamiento_fijo: JSON.stringify([
          'Múltiples tomas eléctricas',
          'Conexión de red redundante',
          'Iluminación profesional',
          'Alfombrado'
        ]),
        servicios_disponibles: JSON.stringify([
          'WiFi Premium',
          'Limpieza especializada',
          'Seguridad prioritaria',
          'Almacenamiento'
        ]),
        precio_personalizado: null,
        observaciones: 'Actualmente ocupado por TechInnovate Solutions',
        fecha_ultima_inspeccion: new Date('2024-01-10'),
        fecha_proximo_mantenimiento: new Date('2024-06-10'),
        estado: 'activo',
        es_premium: true,
        permite_subdivision: false,
        capacidad_maxima_personas: 22,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Stands Corporativos
      {
        id_stand: 5,
        numero_stand: 'C-001',
        nombre_stand: 'Stand Corporativo VIP C1',
        id_tipo_stand: 3,
        area: 50.00,
        ubicacion: 'Pabellón C - Sector VIP',
        coordenadas_x: 100.00,
        coordenadas_y: 50.00,
        estado_fisico: 'disponible',
        caracteristicas_fisicas: JSON.stringify({
          'orientacion': 'VIP',
          'acceso_vehicular': true,
          'cerca_baños': true,
          'cerca_entrada': true,
          'esquina': true,
          'triple_frente': true,
          'sala_privada': true
        }),
        equipamiento_fijo: JSON.stringify([
          'Sistema eléctrico completo',
          'Red corporativa',
          'Iluminación arquitectónica',
          'Sistema audiovisual completo',
          'Sala de reuniones',
          'Cocina ejecutiva',
          'Almacén privado'
        ]),
        servicios_disponibles: JSON.stringify([
          'WiFi corporativo',
          'Limpieza premium 24/7',
          'Seguridad dedicada',
          'Servicio de catering',
          'Asistente dedicado',
          'Servicio técnico 24/7'
        ]),
        precio_personalizado: 15000.00,
        observaciones: 'Stand corporativo premium con todos los servicios',
        fecha_ultima_inspeccion: new Date('2024-01-05'),
        fecha_proximo_mantenimiento: new Date('2024-05-05'),
        estado: 'activo',
        es_premium: true,
        permite_subdivision: true,
        capacidad_maxima_personas: 80,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Stands en mantenimiento
      {
        id_stand: 6,
        numero_stand: 'A-003',
        nombre_stand: 'Stand Básico Sur A3',
        id_tipo_stand: 1,
        area: 8.00,
        ubicacion: 'Pabellón A - Sector Sur',
        coordenadas_x: 10.00,
        coordenadas_y: 80.00,
        estado_fisico: 'mantenimiento',
        caracteristicas_fisicas: JSON.stringify({
          'orientacion': 'Sur',
          'acceso_vehicular': false,
          'cerca_baños': false,
          'cerca_entrada': false
        }),
        equipamiento_fijo: JSON.stringify([
          'Toma eléctrica 220V (en reparación)',
          'Punto de red',
          'Iluminación LED'
        ]),
        servicios_disponibles: JSON.stringify([
          'WiFi',
          'Limpieza',
          'Seguridad'
        ]),
        precio_personalizado: null,
        observaciones: 'En mantenimiento por problemas eléctricos',
        fecha_ultima_inspeccion: new Date('2024-02-01'),
        fecha_proximo_mantenimiento: new Date('2024-08-01'),
        estado: 'activo',
        es_premium: false,
        permite_subdivision: false,
        capacidad_maxima_personas: 6,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Stands adicionales para variedad
      {
        id_stand: 7,
        numero_stand: 'D-001',
        nombre_stand: 'Stand Personalizado Especial D1',
        id_tipo_stand: 5,
        area: 75.00,
        ubicacion: 'Pabellón D - Sector Especial',
        coordenadas_x: 150.00,
        coordenadas_y: 25.00,
        estado_fisico: 'disponible',
        caracteristicas_fisicas: JSON.stringify({
          'orientacion': 'Especial',
          'acceso_vehicular': true,
          'cerca_baños': true,
          'cerca_entrada': true,
          'diseño_exclusivo': true,
          'altura_especial': true
        }),
        equipamiento_fijo: JSON.stringify([
          'Infraestructura personalizada',
          'Tecnología de vanguardia',
          'Diseño arquitectónico exclusivo'
        ]),
        servicios_disponibles: JSON.stringify([
          'Todos los servicios premium',
          'Consultoría de diseño',
          'Project manager dedicado'
        ]),
        precio_personalizado: 25000.00,
        observaciones: 'Stand para empresas con necesidades especiales',
        fecha_ultima_inspeccion: new Date('2024-01-01'),
        fecha_proximo_mantenimiento: new Date('2024-04-01'),
        estado: 'activo',
        es_premium: true,
        permite_subdivision: true,
        capacidad_maxima_personas: 120,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_stand: 8,
        numero_stand: 'V-001',
        nombre_stand: 'Stand Virtual Principal',
        id_tipo_stand: 4,
        area: null,
        ubicacion: 'Plataforma Virtual',
        coordenadas_x: null,
        coordenadas_y: null,
        estado_fisico: 'disponible',
        caracteristicas_fisicas: JSON.stringify({
          'tipo': 'virtual',
          'plataforma': 'dedicada',
          'capacidad_ilimitada': true
        }),
        equipamiento_fijo: JSON.stringify([
          'Plataforma virtual dedicada',
          'Salas de videoconferencias',
          'Sistema de chat avanzado',
          'Biblioteca digital'
        ]),
        servicios_disponibles: JSON.stringify([
          'Soporte técnico 24/7',
          'Capacitación de plataforma',
          'Análisis de visitantes',
          'Integración con redes sociales'
        ]),
        precio_personalizado: null,
        observaciones: 'Stand virtual para eventos híbridos',
        fecha_ultima_inspeccion: new Date('2024-02-01'),
        fecha_proximo_mantenimiento: new Date('2024-08-01'),
        estado: 'activo',
        es_premium: false,
        permite_subdivision: false,
        capacidad_maxima_personas: null,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('stand', null, {});
  }
};
