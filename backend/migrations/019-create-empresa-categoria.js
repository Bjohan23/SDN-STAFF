'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresa_categoria', {
      id_empresa_categoria: {
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
      id_categoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categoria_comercial',
          key: 'id_categoria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      es_categoria_principal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      prioridad: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      porcentaje_actividad: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      descripcion_actividad: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      productos_principales: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      servicios_principales: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      experiencia_años: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      certificaciones: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // Estado
      estado: {
        type: Sequelize.ENUM('activa', 'inactiva', 'pendiente_revision'),
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
      motivo_asignacion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Configuración específica
      configuracion_especifica: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // Métricas
      numero_eventos_categoria: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ultima_participacion: {
        type: Sequelize.DATE,
        allowNull: true
      },
      calificacion_categoria: {
        type: Sequelize.DECIMAL(3, 2),
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
    await queryInterface.addIndex('empresa_categoria', ['id_empresa', 'id_categoria'], { 
      unique: true, 
      name: 'unique_empresa_categoria' 
    });
    await queryInterface.addIndex('empresa_categoria', ['id_empresa']);
    await queryInterface.addIndex('empresa_categoria', ['id_categoria']);
    await queryInterface.addIndex('empresa_categoria', ['es_categoria_principal']);
    await queryInterface.addIndex('empresa_categoria', ['estado']);
    await queryInterface.addIndex('empresa_categoria', ['prioridad']);
    await queryInterface.addIndex('empresa_categoria', ['fecha_asignacion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empresa_categoria');
  }
};
