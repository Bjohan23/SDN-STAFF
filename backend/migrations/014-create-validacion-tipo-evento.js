'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('validacion_tipo_evento', {
      id_validacion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_tipo_evento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tipo_evento',
          key: 'id_tipo_evento'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      nombre_validacion: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre de la validación'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de qué valida'
      },
      tipo_validacion: {
        type: Sequelize.ENUM('campo_requerido', 'valor_minimo', 'valor_maximo', 'formato_especifico', 'fecha_validacion', 'capacidad_validacion', 'ubicacion_validacion', 'precio_validacion', 'custom'),
        allowNull: false,
        comment: 'Tipo de validación'
      },
      campo_objetivo: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Campo que se valida'
      },
      condicion_validacion: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Condiciones específicas de la validación'
      },
      mensaje_error: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Mensaje de error si falla la validación'
      },
      es_critica: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si es una validación crítica (bloquea creación)'
      },
      es_advertencia: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si es solo una advertencia'
      },
      momento_validacion: {
        type: Sequelize.ENUM('creacion', 'edicion', 'publicacion', 'activacion', 'finalizacion', 'siempre'),
        defaultValue: 'creacion',
        comment: 'Cuándo se ejecuta la validación'
      },
      orden_ejecucion: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: 'Orden de ejecución de las validaciones'
      },
      estado: {
        type: Sequelize.ENUM('activa', 'inactiva'),
        defaultValue: 'activa',
        comment: 'Estado de la validación'
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
    await queryInterface.addIndex('validacion_tipo_evento', ['id_tipo_evento']);
    await queryInterface.addIndex('validacion_tipo_evento', ['tipo_validacion']);
    await queryInterface.addIndex('validacion_tipo_evento', ['campo_objetivo']);
    await queryInterface.addIndex('validacion_tipo_evento', ['momento_validacion']);
    await queryInterface.addIndex('validacion_tipo_evento', ['estado']);
    await queryInterface.addIndex('validacion_tipo_evento', ['orden_ejecucion']);
    await queryInterface.addIndex('validacion_tipo_evento', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('validacion_tipo_evento');
  }
};
