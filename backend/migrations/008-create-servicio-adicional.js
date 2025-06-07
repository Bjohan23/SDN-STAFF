'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('servicio_adicional', {
      id_servicio: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre_servicio: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre del servicio adicional'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del servicio'
      },
      categoria: {
        type: Sequelize.ENUM('electricidad', 'conectividad', 'mobiliario', 'audiovisual', 'limpieza', 'seguridad', 'catering', 'decoracion', 'logistica', 'otros'),
        allowNull: false,
        comment: 'Categoría del servicio'
      },
      tipo_precio: {
        type: Sequelize.ENUM('fijo', 'por_metro', 'por_dia', 'por_evento', 'por_unidad'),
        defaultValue: 'fijo',
        comment: 'Tipo de cálculo del precio'
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Precio del servicio'
      },
      moneda: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'PEN'
      },
      unidad_medida: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Unidad de medida (kW, Mbps, unidades, etc.)'
      },
      cantidad_minima: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Cantidad mínima que se puede contratar'
      },
      cantidad_maxima: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Cantidad máxima que se puede contratar'
      },
      requiere_instalacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si requiere instalación previa'
      },
      tiempo_instalacion_horas: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tiempo estimado de instalación en horas'
      },
      disponible_tipos_stand: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tipos de stand donde está disponible este servicio'
      },
      restricciones: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Restricciones específicas del servicio'
      },
      incluye_mantenimiento: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si incluye mantenimiento durante el evento'
      },
      proveedor_externo: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Proveedor externo si aplica'
      },
      contacto_proveedor: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Datos de contacto del proveedor'
      },
      estado: {
        type: Sequelize.ENUM('disponible', 'agotado', 'mantenimiento', 'descontinuado'),
        defaultValue: 'disponible'
      },
      orden_visualizacion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Orden para mostrar en catálogos'
      },
      es_popular: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si es un servicio popular/destacado'
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
    await queryInterface.addIndex('servicio_adicional', ['nombre_servicio']);
    await queryInterface.addIndex('servicio_adicional', ['categoria']);
    await queryInterface.addIndex('servicio_adicional', ['estado']);
    await queryInterface.addIndex('servicio_adicional', ['es_popular']);
    await queryInterface.addIndex('servicio_adicional', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('servicio_adicional');
  }
};
