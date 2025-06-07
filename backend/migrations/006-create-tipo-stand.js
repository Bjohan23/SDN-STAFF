'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tipo_stand', {
      id_tipo_stand: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre_tipo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: 'Nombre del tipo de stand (básico, premium, corporativo, virtual, personalizado)'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del tipo de stand'
      },
      area_minima: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Área mínima en metros cuadrados'
      },
      area_maxima: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Área máxima en metros cuadrados'
      },
      precio_base: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Precio base por metro cuadrado'
      },
      moneda: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'PEN',
        comment: 'Moneda del precio (ISO 4217)'
      },
      equipamiento_incluido: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Lista de equipamiento incluido por defecto'
      },
      servicios_incluidos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Servicios incluidos en el precio base'
      },
      caracteristicas_especiales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Características especiales del tipo de stand'
      },
      restricciones: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Restricciones específicas para este tipo'
      },
      permite_personalizacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si permite personalización adicional'
      },
      requiere_aprobacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si requiere aprobación especial'
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'descontinuado'),
        defaultValue: 'activo'
      },
      orden_visualizacion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Orden para mostrar en interfaces'
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
    await queryInterface.addIndex('tipo_stand', ['nombre_tipo']);
    await queryInterface.addIndex('tipo_stand', ['estado']);
    await queryInterface.addIndex('tipo_stand', ['precio_base']);
    await queryInterface.addIndex('tipo_stand', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tipo_stand');
  }
};
