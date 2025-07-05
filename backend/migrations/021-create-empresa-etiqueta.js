'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresa_etiqueta', {
      id_empresa_etiqueta: {
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
      id_etiqueta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'etiqueta_libre',
          key: 'id_etiqueta'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      // Contexto de la asignación
      contexto: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      relevancia: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
        allowNull: false
      },
      // Origen de la asignación
      origen_asignacion: {
        type: Sequelize.ENUM('manual', 'automatica', 'sugerencia_aceptada', 'importacion', 'ia_generada'),
        defaultValue: 'manual'
      },
      // Estado y validación
      estado: {
        type: Sequelize.ENUM('activa', 'inactiva', 'pendiente_revision', 'rechazada'),
        defaultValue: 'activa'
      },
      fecha_asignacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_validacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      validada_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      motivo_rechazo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Uso temporal y vigencia
      es_temporal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fecha_inicio_uso: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_fin_uso: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Eventos específicos
      id_evento_asignacion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'evento',
          key: 'id_evento'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      es_solo_para_evento: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // Configuración y metadatos
      configuracion_especifica: {
        type: Sequelize.JSON,
        allowNull: true
      },
      metadatos_asignacion: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // Interacción del usuario
      fue_sugerida: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      confianza_sugerencia: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      // Métricas de uso
      numero_visualizaciones: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      numero_clicks: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ultima_visualizacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      ultima_interaccion: {
        type: Sequelize.DATE,
        allowNull: true
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    // Agregar índices
    await queryInterface.addIndex('empresa_etiqueta', ['id_empresa', 'id_etiqueta'], { 
      unique: true, 
      name: 'unique_empresa_etiqueta' 
    });
    await queryInterface.addIndex('empresa_etiqueta', ['id_empresa']);
    await queryInterface.addIndex('empresa_etiqueta', ['id_etiqueta']);
    await queryInterface.addIndex('empresa_etiqueta', ['estado']);
    await queryInterface.addIndex('empresa_etiqueta', ['origen_asignacion']);
    await queryInterface.addIndex('empresa_etiqueta', ['relevancia']);
    await queryInterface.addIndex('empresa_etiqueta', ['fecha_asignacion']);
    await queryInterface.addIndex('empresa_etiqueta', ['es_temporal']);
    await queryInterface.addIndex('empresa_etiqueta', ['fecha_fin_uso']);
    await queryInterface.addIndex('empresa_etiqueta', ['id_evento_asignacion']);
    await queryInterface.addIndex('empresa_etiqueta', ['fue_sugerida']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empresa_etiqueta');
  }
};
