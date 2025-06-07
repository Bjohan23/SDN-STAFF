'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('tipo_evento', [
      {
        id_tipo_evento: 1,
        nombre_tipo: 'presencial',
        descripcion: 'Eventos que se realizan en una ubicación física específica, donde los participantes asisten en persona.',
        configuracion_especifica: JSON.stringify({
          ubicacion_requerida: true,
          capacidad_fisica: true,
          servicios_presenciales: ['electricidad', 'internet', 'mobiliario'],
          requisitos_especiales: ['permisos_municipales', 'seguridad', 'limpieza']
        }),
        created_at: now,
        created_by: 1
      },
      {
        id_tipo_evento: 2,
        nombre_tipo: 'virtual',
        descripcion: 'Eventos que se realizan completamente en línea a través de plataformas digitales.',
        configuracion_especifica: JSON.stringify({
          plataforma_virtual: true,
          transmision_en_vivo: true,
          plataformas_soportadas: ['Zoom', 'Microsoft Teams', 'Google Meet', 'YouTube Live'],
          funcionalidades: ['chat', 'breakout_rooms', 'screen_sharing', 'recording']
        }),
        created_at: now,
        created_by: 1
      },
      {
        id_tipo_evento: 3,
        nombre_tipo: 'hibrido',
        descripcion: 'Eventos que combinan elementos presenciales y virtuales, permitiendo participación tanto física como digital.',
        configuracion_especifica: JSON.stringify({
          ubicacion_requerida: true,
          plataforma_virtual: true,
          transmision_simultanea: true,
          interaccion_dual: true,
          equipamiento_especial: ['camaras_profesionales', 'micrófonos_direccionales', 'streaming_equipment'],
          gestión_dual: ['moderadores_presenciales', 'moderadores_virtuales']
        }),
        created_at: now,
        created_by: 1
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tipo_evento', null, {});
  }
};
