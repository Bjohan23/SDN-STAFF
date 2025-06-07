'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stand', {
      id_stand: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      numero_stand: {
        type: Sequelize.STRING(20),
        allowNull: false,
        comment: 'Número o código único del stand'
      },
      nombre_stand: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre descriptivo del stand'
      },
      id_tipo_stand: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tipo_stand',
          key: 'id_tipo_stand'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      area: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        comment: 'Área del stand en metros cuadrados'
      },
      ubicacion: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Ubicación física del stand (pasillo, sección, etc.)'
      },
      coordenadas_x: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Coordenada X en el plano del evento'
      },
      coordenadas_y: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Coordenada Y en el plano del evento'
      },
      estado_fisico: {
        type: Sequelize.ENUM('disponible', 'ocupado', 'mantenimiento', 'fuera_de_servicio'),
        defaultValue: 'disponible',
        comment: 'Estado físico del stand'
      },
      caracteristicas_fisicas: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Características físicas específicas del stand'
      },
      equipamiento_fijo: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Equipamiento fijo instalado en el stand'
      },
      servicios_disponibles: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Servicios disponibles en este stand específico'
      },
      precio_personalizado: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Precio personalizado que anula el precio base del tipo'
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observaciones especiales sobre el stand'
      },
      fecha_ultima_inspeccion: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de la última inspección del stand'
      },
      fecha_proximo_mantenimiento: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha programada para próximo mantenimiento'
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'temporal'),
        defaultValue: 'activo'
      },
      es_premium: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si es un stand premium con ubicación privilegiada'
      },
      permite_subdivision: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si el stand puede ser subdividido'
      },
      capacidad_maxima_personas: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Capacidad máxima de personas en el stand'
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
    await queryInterface.addIndex('stand', ['numero_stand']);
    await queryInterface.addIndex('stand', ['id_tipo_stand']);
    await queryInterface.addIndex('stand', ['estado_fisico']);
    await queryInterface.addIndex('stand', ['estado']);
    await queryInterface.addIndex('stand', ['es_premium']);
    await queryInterface.addIndex('stand', ['deleted_at']);
    
    // Índice único para número de stand (excluyendo eliminados)
    await queryInterface.addIndex('stand', ['numero_stand'], {
      unique: true,
      where: { deleted_at: null }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stand');
  }
};
