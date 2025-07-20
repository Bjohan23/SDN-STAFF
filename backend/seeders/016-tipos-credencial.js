'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TipoCredencial', [
      {
        id_tipo_credencial: 1,
        nombre_tipo: 'Visitante',
        descripcion: 'Credencial para visitantes generales del evento',
        color_identificacion: '#2563eb',
        nivel_acceso: 'basico',
        es_imprimible: true,
        requiere_aprobacion: false,
        duracion_validez_horas: 24,
        permite_reingreso: true,
        configuracion_accesos: JSON.stringify({
          areas_permitidas: ['publicas', 'stands', 'conferencias'],
          horarios_acceso: 'evento',
          requiere_validacion: false
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_credencial: 2,
        nombre_tipo: 'Expositor',
        descripcion: 'Credencial para empresas expositoras y sus representantes',
        color_identificacion: '#dc2626',
        nivel_acceso: 'intermedio',
        es_imprimible: true,
        requiere_aprobacion: true,
        duracion_validez_horas: 72,
        permite_reingreso: true,
        configuracion_accesos: JSON.stringify({
          areas_permitidas: ['publicas', 'stands', 'conferencias', 'areas_expositores'],
          horarios_acceso: 'extendido',
          requiere_validacion: true
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_credencial: 3,
        nombre_tipo: 'VIP',
        descripcion: 'Credencial para invitados especiales y patrocinadores',
        color_identificacion: '#7c3aed',
        nivel_acceso: 'avanzado',
        es_imprimible: true,
        requiere_aprobacion: true,
        duracion_validez_horas: 72,
        permite_reingreso: true,
        configuracion_accesos: JSON.stringify({
          areas_permitidas: ['publicas', 'stands', 'conferencias', 'areas_expositores', 'vip'],
          horarios_acceso: 'completo',
          requiere_validacion: true
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_credencial: 4,
        nombre_tipo: 'Staff',
        descripcion: 'Credencial para personal organizador del evento',
        color_identificacion: '#059669',
        nivel_acceso: 'total',
        es_imprimible: true,
        requiere_aprobacion: false,
        duracion_validez_horas: 168,
        permite_reingreso: true,
        configuracion_accesos: JSON.stringify({
          areas_permitidas: ['todas'],
          horarios_acceso: 'ilimitado',
          requiere_validacion: false
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_credencial: 5,
        nombre_tipo: 'Prensa',
        descripcion: 'Credencial para medios de comunicación y prensa',
        color_identificacion: '#ea580c',
        nivel_acceso: 'intermedio',
        es_imprimible: true,
        requiere_aprobacion: true,
        duracion_validez_horas: 48,
        permite_reingreso: true,
        configuracion_accesos: JSON.stringify({
          areas_permitidas: ['publicas', 'stands', 'conferencias', 'prensa'],
          horarios_acceso: 'evento',
          requiere_validacion: true
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_tipo_credencial: 6,
        nombre_tipo: 'Conferencista',
        descripcion: 'Credencial para ponentes y conferencistas',
        color_identificacion: '#0891b2',
        nivel_acceso: 'avanzado',
        es_imprimible: true,
        requiere_aprobacion: true,
        duracion_validez_horas: 72,
        permite_reingreso: true,
        configuracion_accesos: JSON.stringify({
          areas_permitidas: ['publicas', 'stands', 'conferencias', 'backstage', 'ponentes'],
          horarios_acceso: 'extendido',
          requiere_validacion: true
        }),
        activo: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TipoCredencial', null, {});
  }
};