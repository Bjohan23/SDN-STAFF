'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('evento', {
      id_evento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre_evento: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha_inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_fin: {
        type: Sequelize.DATE,
        allowNull: false
      },
      ubicacion: {
        type: Sequelize.STRING(200),
        allowNull: true,
        comment: 'Ubicación física para eventos presenciales o híbridos'
      },
      url_virtual: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL de la plataforma virtual para eventos virtuales o híbridos'
      },
      id_tipo_evento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tipo_evento',
          key: 'id_tipo_evento'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      },
      estado: {
        type: Sequelize.ENUM('borrador', 'publicado', 'activo', 'finalizado', 'archivado'),
        defaultValue: 'borrador'
      },
      imagen_logo: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL o path de la imagen/logo del evento'
      },
      configuracion_especifica: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Configuraciones específicas del evento: horarios, requisitos, etc.'
      },
      url_amigable: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'URL personalizada para el evento'
      },
      capacidad_maxima: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      precio_entrada: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      moneda: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'PEN'
      },
      requiere_aprobacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si los expositores requieren aprobación para participar'
      },
      fecha_limite_registro: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha límite para registro de expositores'
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
    await queryInterface.addIndex('evento', ['nombre_evento']);
    await queryInterface.addIndex('evento', ['fecha_inicio']);
    await queryInterface.addIndex('evento', ['fecha_fin']);
    await queryInterface.addIndex('evento', ['estado']);
    await queryInterface.addIndex('evento', ['id_tipo_evento']);
    await queryInterface.addIndex('evento', ['url_amigable'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evento');
  }
};
