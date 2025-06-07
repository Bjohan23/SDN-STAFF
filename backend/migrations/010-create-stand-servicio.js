'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stand_servicio', {
      id_stand_servicio: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
      id_servicio: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'servicio_adicional',
          key: 'id_servicio'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_empresa: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'empresa_expositora',
          key: 'id_empresa'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Empresa que contrató el servicio'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Cantidad contratada del servicio'
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Precio unitario al momento de la contratación'
      },
      descuento_aplicado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00,
        comment: 'Descuento aplicado en monto'
      },
      precio_total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Precio total (cantidad * precio_unitario - descuento)'
      },
      estado_servicio: {
        type: Sequelize.ENUM('solicitado', 'confirmado', 'instalado', 'activo', 'finalizado', 'cancelado'),
        defaultValue: 'solicitado',
        comment: 'Estado del servicio contratado'
      },
      fecha_solicitud: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Fecha de solicitud del servicio'
      },
      fecha_instalacion_programada: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha programada para instalación'
      },
      fecha_instalacion_real: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha real de instalación'
      },
      fecha_retiro_programada: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha programada para retiro'
      },
      fecha_retiro_real: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha real de retiro'
      },
      especificaciones_adicionales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Especificaciones adicionales del servicio'
      },
      contacto_instalacion: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos de contacto para la instalación'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones del servicio'
      },
      calificacion_servicio: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Calificación del servicio (1-5)'
      },
      comentarios_calificacion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Comentarios sobre la calificación'
      },
      requiere_supervision: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si requiere supervisión durante la instalación'
      },
      es_urgente: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si es una instalación urgente'
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
    await queryInterface.addIndex('stand_servicio', ['id_stand']);
    await queryInterface.addIndex('stand_servicio', ['id_evento']);
    await queryInterface.addIndex('stand_servicio', ['id_servicio']);
    await queryInterface.addIndex('stand_servicio', ['id_empresa']);
    await queryInterface.addIndex('stand_servicio', ['estado_servicio']);
    await queryInterface.addIndex('stand_servicio', ['fecha_solicitud']);
    await queryInterface.addIndex('stand_servicio', ['fecha_instalacion_programada']);
    await queryInterface.addIndex('stand_servicio', ['es_urgente']);
    await queryInterface.addIndex('stand_servicio', ['deleted_at']);
    
    // Índice compuesto para evitar duplicados
    await queryInterface.addIndex('stand_servicio', ['id_stand', 'id_evento', 'id_servicio'], {
      name: 'idx_stand_evento_servicio_unique'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stand_servicio');
  }
};
