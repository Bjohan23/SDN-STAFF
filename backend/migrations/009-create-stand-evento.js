'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stand_evento', {
      id_stand: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'stand',
          key: 'id_stand'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_evento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'evento',
          key: 'id_evento'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      estado_disponibilidad: {
        type: Sequelize.ENUM('disponible', 'reservado', 'ocupado', 'mantenimiento', 'bloqueado'),
        defaultValue: 'disponible',
        comment: 'Estado específico del stand para este evento'
      },
      precio_evento: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Precio específico para este evento (anula precio base)'
      },
      descuento_porcentaje: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Descuento específico para este evento'
      },
      precio_final: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Precio final después de descuentos'
      },
      fecha_reserva: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha en que se reservó el stand'
      },
      fecha_limite_pago: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha límite para confirmar con pago'
      },
      configuracion_especial: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Configuración especial para este evento'
      },
      servicios_incluidos_evento: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Servicios incluidos específicos para este evento'
      },
      restricciones_evento: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Restricciones específicas para este evento'
      },
      horario_montaje: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Horarios disponibles para montaje'
      },
      horario_desmontaje: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Horarios para desmontaje'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones específicas para este evento'
      },
      prioridad: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'Prioridad de asignación (mayor número = mayor prioridad)'
      },
      es_destacado: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si es un stand destacado para este evento'
      },
      maximo_dias_reserva: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 7,
        comment: 'Máximo de días que puede estar reservado sin confirmar'
      },
      // Campos de auditoría
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

    // Índices
    await queryInterface.addIndex('stand_evento', ['id_stand']);
    await queryInterface.addIndex('stand_evento', ['id_evento']);
    await queryInterface.addIndex('stand_evento', ['estado_disponibilidad']);
    await queryInterface.addIndex('stand_evento', ['fecha_reserva']);
    await queryInterface.addIndex('stand_evento', ['es_destacado']);
    await queryInterface.addIndex('stand_evento', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stand_evento');
  }
};
