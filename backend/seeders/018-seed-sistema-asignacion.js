'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Insertar datos de ejemplo para solicitudes de asignación
    const solicitudesEjemplo = [
      {
        id_empresa: 1,
        id_evento: 1,
        modalidad_asignacion: 'seleccion_directa',
        estado_solicitud: 'solicitada',
        prioridad_score: 75.5,
        fecha_solicitud: new Date(),
        motivo_solicitud: 'Solicitud para participar en el evento principal',
        criterios_automaticos: JSON.stringify({
          area_minima: 15,
          area_maxima: 30,
          presupuesto_maximo: 1500,
          servicios_requeridos: ['electricidad', 'internet']
        }),
        preferencias_empresa: JSON.stringify({
          zona_preferida: 'entrada principal',
          ubicacion_esquina: true
        }),
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_empresa: 2,
        id_evento: 1,
        modalidad_asignacion: 'automatica',
        estado_solicitud: 'aprobada',
        prioridad_score: 82.0,
        fecha_solicitud: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
        fecha_revision: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
        motivo_solicitud: 'Empresa recurrente con buen historial',
        criterios_automaticos: JSON.stringify({
          area_minima: 20,
          area_maxima: 50,
          presupuesto_maximo: 2000
        }),
        revisado_por: 1,
        created_by: 1,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id_empresa: 1,
        id_evento: 2,
        modalidad_asignacion: 'manual',
        estado_solicitud: 'en_revision',
        prioridad_score: 75.5,
        fecha_solicitud: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
        motivo_solicitud: 'Solicitud para evento de tecnología',
        criterios_automaticos: JSON.stringify({
          area_minima: 25,
          presupuesto_maximo: 1800,
          tipo_stand_preferido: 'premium'
        }),
        created_by: 1,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    await queryInterface.bulkInsert('solicitud_asignacion', solicitudesEjemplo);

    // Insertar datos de ejemplo para historial de asignaciones
    const historicoEjemplo = [
      {
        id_empresa: 1,
        id_evento: 1,
        id_solicitud: 1,
        tipo_cambio: 'asignacion_inicial',
        estado_nuevo: 'solicitada',
        motivo_cambio: 'Solicitud inicial de asignación',
        descripcion_detallada: 'Nueva solicitud creada por la empresa para participar en el evento',
        datos_adicionales: JSON.stringify({
          modalidad: 'seleccion_directa',
          criterios_aplicados: ['area', 'presupuesto', 'servicios']
        }),
        realizado_por: 1,
        fecha_cambio: new Date(),
        created_at: new Date()
      },
      {
        id_empresa: 2,
        id_evento: 1,
        id_solicitud: 2,
        tipo_cambio: 'confirmacion',
        estado_anterior: 'solicitada',
        estado_nuevo: 'aprobada',
        motivo_cambio: 'Solicitud aprobada por revisor',
        descripcion_detallada: 'Solicitud aprobada debido a buen historial de la empresa',
        datos_adicionales: JSON.stringify({
          revisor: 1,
          criterio_aprobacion: 'historial_positivo'
        }),
        realizado_por: 1,
        fecha_cambio: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ];

    await queryInterface.bulkInsert('historico_asignacion', historicoEjemplo);

    // Insertar datos de ejemplo para conflictos (opcional)
    const conflictosEjemplo = [
      {
        id_evento: 1,
        id_stand: 1,
        tipo_conflicto: 'multiple_solicitudes',
        empresas_en_conflicto: JSON.stringify([
          { id_empresa: 1, nombre_empresa: 'Tech Solutions SAC', prioridad_score: 75.5 },
          { id_empresa: 2, nombre_empresa: 'Innovation Corp', prioridad_score: 82.0 }
        ]),
        solicitudes_relacionadas: JSON.stringify([1, 2]),
        descripcion_conflicto: 'Múltiples empresas solicitan el mismo stand premium',
        estado_conflicto: 'detectado',
        prioridad_resolucion: 'alta',
        fecha_deteccion: new Date(),
        detectado_por: 1,
        metodo_deteccion: 'automatico',
        empresas_afectadas_total: 2,
        impacto_estimado: 'medio',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('conflicto_asignacion', conflictosEjemplo);

    console.log('✅ Seeders para sistema de asignación insertados exitosamente');
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar datos en orden inverso para respetar foreign keys
    await queryInterface.bulkDelete('conflicto_asignacion', null, {});
    await queryInterface.bulkDelete('historico_asignacion', null, {});
    await queryInterface.bulkDelete('solicitud_asignacion', null, {});
    
    console.log('🗑️ Seeders para sistema de asignación eliminados');
  }
};
