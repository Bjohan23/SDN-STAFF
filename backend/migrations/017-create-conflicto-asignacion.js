'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conflicto_asignacion', {
      id_conflicto: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_evento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'evento',
          key: 'id_evento'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_stand: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stand',
          key: 'id_stand'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tipo_conflicto: {
        type: Sequelize.ENUM('multiple_solicitudes', 'cambio_requerido', 'incompatibilidad', 'overbooking', 'conflicto_horario', 'otro'),
        allowNull: false
      },
      empresas_en_conflicto: {
        type: Sequelize.JSON,
        allowNull: false
      },
      solicitudes_relacionadas: {
        type: Sequelize.JSON,
        allowNull: true
      },
      descripcion_conflicto: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      criterios_resolucion: {
        type: Sequelize.JSON,
        allowNull: true
      },
      estado_conflicto: {
        type: Sequelize.ENUM('detectado', 'en_revision', 'en_resolucion', 'resuelto', 'escalado', 'cancelado'),
        allowNull: false,
        defaultValue: 'detectado'
      },
      prioridad_resolucion: {
        type: Sequelize.ENUM('baja', 'media', 'alta', 'critica'),
        allowNull: false,
        defaultValue: 'media'
      },
      fecha_deteccion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      detectado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      metodo_deteccion: {
        type: Sequelize.ENUM('automatico', 'manual', 'reporte_empresa', 'auditoria'),
        allowNull: false,
        defaultValue: 'automatico'
      },
      fecha_inicio_resolucion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      asignado_a: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      fecha_limite_resolucion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      empresa_asignada_final: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'empresa_expositora',
          key: 'id_empresa'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      empresas_compensadas: {
        type: Sequelize.JSON,
        allowNull: true
      },
      criterio_resolucion_aplicado: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      resuelto_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      fecha_resolucion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      observaciones_resolucion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      escalado_a: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      fecha_escalamiento: {
        type: Sequelize.DATE,
        allowNull: true
      },
      motivo_escalamiento: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      impacto_estimado: {
        type: Sequelize.ENUM('bajo', 'medio', 'alto', 'critico'),
        allowNull: false,
        defaultValue: 'medio'
      },
      empresas_afectadas_total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      tiempo_resolucion_horas: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      notificaciones_enviadas: {
        type: Sequelize.JSON,
        allowNull: true
      },
      comunicaciones_log: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      deleted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear índices
    await queryInterface.addIndex('conflicto_asignacion', ['id_evento']);
    await queryInterface.addIndex('conflicto_asignacion', ['id_stand']);
    await queryInterface.addIndex('conflicto_asignacion', ['estado_conflicto']);
    await queryInterface.addIndex('conflicto_asignacion', ['prioridad_resolucion']);
    await queryInterface.addIndex('conflicto_asignacion', ['fecha_deteccion']);
    await queryInterface.addIndex('conflicto_asignacion', ['asignado_a']);
    await queryInterface.addIndex('conflicto_asignacion', ['empresa_asignada_final']);
    await queryInterface.addIndex('conflicto_asignacion', ['tipo_conflicto']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('conflicto_asignacion');
  }
};
