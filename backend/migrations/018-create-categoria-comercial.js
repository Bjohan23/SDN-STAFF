'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categoria_comercial', {
      id_categoria: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre_categoria: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Jerarquía
      id_categoria_padre: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'categoria_comercial',
          key: 'id_categoria'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      nivel_jerarquia: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      ruta_jerarquia: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Configuración
      permite_expositores: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      icono: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      color_hex: {
        type: Sequelize.STRING(7),
        allowNull: true
      },
      imagen_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      // Estado y orden
      estado: {
        type: Sequelize.ENUM('activa', 'inactiva', 'archivada'),
        defaultValue: 'activa'
      },
      orden_visualizacion: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      es_destacada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      // Métricas
      total_expositores: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      total_subcategorias: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      // Configuración de stands
      sugerencia_ubicacion_stand: {
        type: Sequelize.JSON,
        allowNull: true
      },
      requiere_servicios_especiales: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // SEO y búsqueda
      palabras_clave: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      meta_descripcion: {
        type: Sequelize.STRING(300),
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
    await queryInterface.addIndex('categoria_comercial', ['nombre_categoria']);
    await queryInterface.addIndex('categoria_comercial', ['slug'], { unique: true });
    await queryInterface.addIndex('categoria_comercial', ['id_categoria_padre']);
    await queryInterface.addIndex('categoria_comercial', ['nivel_jerarquia']);
    await queryInterface.addIndex('categoria_comercial', ['estado']);
    await queryInterface.addIndex('categoria_comercial', ['es_destacada']);
    await queryInterface.addIndex('categoria_comercial', ['orden_visualizacion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categoria_comercial');
  }
};
