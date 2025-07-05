'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('historico_asignacion', {
      id_historico: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_empresa: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empresa_expositora',
          key: 'id_empresa'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
      id_solicitud: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'solicitud_asignacion',
          key: 'id_solicitud'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      id_stand_anterior: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stand',
          key: 'id_stand'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      id_stand_nuevo: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stand',
          key: 'id_stand'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      tipo_cambio: {
        type: Sequelize.ENUM('asignacion_inicial', 'reasignacion', 'cancelacion', 'liberacion', 'confirmacion', 'pago_realizado', 'montaje_completado'),
        allowNull: false
      },
      estado_anterior: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      estado_nuevo: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      motivo_cambio: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      descripcion_detallada: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      impacto_economico: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      datos_adicionales: {
        type: Sequelize.JSON,
        allowNull: true
      },
      realizado_por: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      fecha_cambio: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      ip_origen: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requiere_aprobacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      aprobado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      fecha_aprobacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      es_revertible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      revertido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      id_reversion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'historico_asignacion',
          key: 'id_historico'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      fecha_reversion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      notificaciones_enviadas: {
        type: Sequelize.JSON,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Crear índices
    await queryInterface.addIndex('historico_asignacion', ['id_empresa']);
    await queryInterface.addIndex('historico_asignacion', ['id_evento']);
    await queryInterface.addIndex('historico_asignacion', ['id_solicitud']);
    await queryInterface.addIndex('historico_asignacion', ['tipo_cambio']);
    await queryInterface.addIndex('historico_asignacion', ['fecha_cambio']);
    await queryInterface.addIndex('historico_asignacion', ['realizado_por']);
    await queryInterface.addIndex('historico_asignacion', ['id_stand_anterior']);
    await queryInterface.addIndex('historico_asignacion', ['id_stand_nuevo']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('historico_asignacion');
  }
};
