'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('solicitud_asignacion', {
      id_solicitud: {
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
      id_stand_solicitado: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stand',
          key: 'id_stand'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Stand específico solicitado, null para asignación automática'
      },
      modalidad_asignacion: {
        type: Sequelize.ENUM('seleccion_directa', 'manual', 'automatica'),
        allowNull: false,
        defaultValue: 'seleccion_directa'
      },
      estado_solicitud: {
        type: Sequelize.ENUM('solicitada', 'en_revision', 'aprobada', 'rechazada', 'asignada', 'cancelada'),
        allowNull: false,
        defaultValue: 'solicitada'
      },
      prioridad_score: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      fecha_solicitud: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      fecha_limite_respuesta: {
        type: Sequelize.DATE,
        allowNull: true
      },
      criterios_automaticos: {
        type: Sequelize.JSON,
        allowNull: true
      },
      preferencias_empresa: {
        type: Sequelize.JSON,
        allowNull: true
      },
      motivo_solicitud: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      motivo_rechazo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      observaciones_internas: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      revisado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      fecha_revision: {
        type: Sequelize.DATE,
        allowNull: true
      },
      asignado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      fecha_asignacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      id_stand_asignado: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'stand',
          key: 'id_stand'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      precio_ofertado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      descuento_aplicado: {
        type: Sequelize.DECIMAL(5, 2),
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
    await queryInterface.addIndex('solicitud_asignacion', ['id_empresa']);
    await queryInterface.addIndex('solicitud_asignacion', ['id_evento']);
    await queryInterface.addIndex('solicitud_asignacion', ['estado_solicitud']);
    await queryInterface.addIndex('solicitud_asignacion', ['fecha_solicitud']);
    await queryInterface.addIndex('solicitud_asignacion', ['prioridad_score']);
    
    // Índice único para una solicitud por empresa por evento
    await queryInterface.addIndex('solicitud_asignacion', {
      fields: ['id_empresa', 'id_evento'],
      unique: true,
      name: 'unique_solicitud_empresa_evento',
      where: { deleted_at: null }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('solicitud_asignacion');
  }
};
