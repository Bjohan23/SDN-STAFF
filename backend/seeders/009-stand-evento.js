'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('stand_evento', [
      // Asignaciones para Expo Tecnología 2024 (evento 1)
      {
        id_stand: 1,
        id_evento: 1,
        estado_disponibilidad: 'disponible',
        precio_evento: 720.00, // 9m² * 80 PEN
        descuento_porcentaje: 0.00,
        precio_final: 720.00,
        fecha_reserva: null,
        fecha_limite_pago: null,
        configuracion_especial: JSON.stringify({
          'montaje_permitido': '2024-03-14 08:00:00',
          'desmontaje_requerido': '2024-03-17 20:00:00'
        }),
        servicios_incluidos_evento: JSON.stringify([
          'WiFi gratuito',
          'Limpieza diaria',
          'Seguridad general',
          'Directorio oficial'
        ]),
        restricciones_evento: JSON.stringify([
          'No sonido alto después de 18:00',
          'No montaje nocturno'
        ]),
        horario_montaje: JSON.stringify({
          'inicio': '08:00',
          'fin': '18:00',
          'dias_permitidos': ['2024-03-14']
        }),
        horario_desmontaje: JSON.stringify({
          'inicio': '18:00',
          'fin': '22:00',
          'dias_permitidos': ['2024-03-17']
        }),
        observaciones: 'Stand básico disponible para empresas tecnológicas',
        prioridad: 1,
        es_destacado: false,
        maximo_dias_reserva: 7,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_stand: 2,
        id_evento: 1,
        estado_disponibilidad: 'disponible',
        precio_evento: 960.00, // 12m² * 80 PEN
        descuento_porcentaje: 5.00,
        precio_final: 912.00,
        fecha_reserva: null,
        fecha_limite_pago: null,
        configuracion_especial: JSON.stringify({
          'subdivision_permitida': true,
          'area_min_subdivision': 6.00
        }),
        servicios_incluidos_evento: JSON.stringify([
          'WiFi gratuito',
          'Limpieza diaria',
          'Seguridad general',
          'Directorio oficial'
        ]),
        restricciones_evento: JSON.stringify([
          'Si se subdivide, ambas partes deben ser ocupadas'
        ]),
        horario_montaje: JSON.stringify({
          'inicio': '08:00',
          'fin': '18:00',
          'dias_permitidos': ['2024-03-14']
        }),
        horario_desmontaje: JSON.stringify({
          'inicio': '18:00',
          'fin': '22:00',
          'dias_permitidos': ['2024-03-17']
        }),
        observaciones: 'Stand básico ampliado con posibilidad de subdivisión',
        prioridad: 2,
        es_destacado: false,
        maximo_dias_reserva: 7,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_stand: 3,
        id_evento: 1,
        estado_disponibilidad: 'reservado',
        precio_evento: 3000.00, // 20m² * 150 PEN
        descuento_porcentaje: 10.00,
        precio_final: 2700.00,
        fecha_reserva: new Date('2024-02-15 10:30:00'),
        fecha_limite_pago: new Date('2024-02-22 23:59:59'),
        configuracion_especial: JSON.stringify({
          'servicios_premium': true,
          'acceso_vehicular': true
        }),
        servicios_incluidos_evento: JSON.stringify([
          'WiFi premium',
          'Limpieza especializada',
          'Seguridad prioritaria',
          'Servicio de café incluido',
          'Almacenamiento seguro',
          'Asistencia técnica'
        ]),
        restricciones_evento: JSON.stringify([
          'Reservado para EcoGreen Perú',
          'Montaje permitido un día antes'
        ]),
        horario_montaje: JSON.stringify({
          'inicio': '08:00',
          'fin': '20:00',
          'dias_permitidos': ['2024-03-13', '2024-03-14']
        }),
        horario_desmontaje: JSON.stringify({
          'inicio': '18:00',
          'fin': '22:00',
          'dias_permitidos': ['2024-03-17']
        }),
        observaciones: 'Stand premium reservado por EcoGreen Perú',
        prioridad: 8,
        es_destacado: true,
        maximo_dias_reserva: 7,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_stand: 4,
        id_evento: 1,
        estado_disponibilidad: 'ocupado',
        precio_evento: 2700.00, // 18m² * 150 PEN
        descuento_porcentaje: 0.00,
        precio_final: 2700.00,
        fecha_reserva: new Date('2024-01-20 14:15:00'),
        fecha_limite_pago: new Date('2024-01-27 23:59:59'),
        configuracion_especial: JSON.stringify({
          'empresa_asignada': 'TechInnovate Solutions',
          'servicios_adicionales_contratados': true
        }),
        servicios_incluidos_evento: JSON.stringify([
          'WiFi premium',
          'Limpieza especializada',
          'Seguridad prioritaria',
          'Almacenamiento seguro'
        ]),
        restricciones_evento: JSON.stringify([
          'Ocupado por TechInnovate Solutions',
          'Servicios adicionales ya instalados'
        ]),
        horario_montaje: JSON.stringify({
          'inicio': '06:00',
          'fin': '20:00',
          'dias_permitidos': ['2024-03-13', '2024-03-14']
        }),
        horario_desmontaje: JSON.stringify({
          'inicio': '18:00',
          'fin': '23:00',
          'dias_permitidos': ['2024-03-17']
        }),
        observaciones: 'Stand ocupado y confirmado por TechInnovate Solutions',
        prioridad: 10,
        es_destacado: true,
        maximo_dias_reserva: 7,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_stand: 8,
        id_evento: 1,
        estado_disponibilidad: 'disponible',
        precio_evento: 120.00, // Precio fijo para stand virtual
        descuento_porcentaje: 0.00,
        precio_final: 120.00,
        fecha_reserva: null,
        fecha_limite_pago: null,
        configuracion_especial: JSON.stringify({
          'tipo': 'virtual',
          'plataforma_dedicada': true,
          'soporte_24_7': true
        }),
        servicios_incluidos_evento: JSON.stringify([
          'Plataforma virtual completa',
          'Soporte técnico 24/7',
          'Capacitación de uso',
          'Análisis de visitantes',
          'Integración con redes sociales'
        ]),
        restricciones_evento: JSON.stringify([
          'Requiere capacitación previa',
          'Contenido sujeto a moderación'
        ]),
        horario_montaje: JSON.stringify({
          'inicio': 'Configuración 48 horas antes',
          'fin': 'Disponible desde inicio del evento'
        }),
        horario_desmontaje: JSON.stringify({
          'inicio': 'Disponible hasta 24 horas después',
          'fin': 'Descarga de contenido por 7 días'
        }),
        observaciones: 'Stand virtual disponible para modalidad híbrida',
        prioridad: 5,
        es_destacado: false,
        maximo_dias_reserva: 14,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      // Asignaciones para Feria Gastronómica Internacional (evento 2)
      {
        id_stand: 1,
        id_evento: 2,
        estado_disponibilidad: 'disponible',
        precio_evento: 900.00, // Precio especial para evento gastronómico
        descuento_porcentaje: 0.00,
        precio_final: 900.00,
        fecha_reserva: null,
        fecha_limite_pago: null,
        configuracion_especial: JSON.stringify({
          'permite_cocina': true,
          'extraccion_humos': true
        }),
        servicios_incluidos_evento: JSON.stringify([
          'Conexión agua y desagüe',
          'Extracción de humos',
          'Limpieza especializada gastronómica',
          'Almacenamiento refrigerado básico'
        ]),
        restricciones_evento: JSON.stringify([
          'Certificación sanitaria obligatoria',
          'No venta de alcohol sin licencia'
        ]),
        horario_montaje: JSON.stringify({
          'inicio': '06:00',
          'fin': '18:00',
          'dias_permitidos': ['2024-04-24']
        }),
        horario_desmontaje: JSON.stringify({
          'inicio': '20:00',
          'fin': '02:00',
          'dias_permitidos': ['2024-04-28']
        }),
        observaciones: 'Stand adaptado para actividades gastronómicas',
        prioridad: 3,
        es_destacado: false,
        maximo_dias_reserva: 10,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_stand: 5,
        id_evento: 2,
        estado_disponibilidad: 'disponible',
        precio_evento: 12500.00, // 50m² * 250 PEN
        descuento_porcentaje: 15.00,
        precio_final: 10625.00,
        fecha_reserva: null,
        fecha_limite_pago: null,
        configuracion_especial: JSON.stringify({
          'cocina_industrial': true,
          'sala_degustacion_vip': true,
          'almacen_refrigerado': true
        }),
        servicios_incluidos_evento: JSON.stringify([
          'Cocina industrial completa',
          'Sistema de refrigeración',
          'Mobiliario gastronómico',
          'Personal de limpieza especializado',
          'Servicio de catering para staff',
          'Almacenamiento refrigerado amplio'
        ]),
        restricciones_evento: JSON.stringify([
          'Solo para empresas gastronómicas certificadas',
          'Inspección sanitaria obligatoria'
        ]),
        horario_montaje: JSON.stringify({
          'inicio': '06:00',
          'fin': '22:00',
          'dias_permitidos': ['2024-04-23', '2024-04-24']
        }),
        horario_desmontaje: JSON.stringify({
          'inicio': '20:00',
          'fin': '06:00',
          'dias_permitidos': ['2024-04-28', '2024-04-29']
        }),
        observaciones: 'Stand corporativo VIP para grandes empresas gastronómicas',
        prioridad: 10,
        es_destacado: true,
        maximo_dias_reserva: 14,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('stand_evento', null, {});
  }
};
