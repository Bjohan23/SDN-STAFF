'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresa_expositora', {
      id_empresa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre_empresa: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      razon_social: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      ruc: {
        type: Sequelize.STRING(11),
        allowNull: true,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sector: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Sector o industria de la empresa'
      },
      tamaño_empresa: {
        type: Sequelize.ENUM('micro', 'pequeña', 'mediana', 'grande'),
        allowNull: true
      },
      logo_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL o path del logo de la empresa'
      },
      sitio_web: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      // Información de contacto principal
      email_contacto: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      telefono_contacto: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      nombre_contacto: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Nombre de la persona de contacto principal'
      },
      cargo_contacto: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      // Dirección
      direccion: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      ciudad: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      pais: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Perú'
      },
      // Estado y aprobación
      estado: {
        type: Sequelize.ENUM('pendiente', 'aprobada', 'rechazada', 'suspendida', 'inactiva'),
        defaultValue: 'pendiente'
      },
      fecha_aprobacion: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha en que la empresa fue aprobada'
      },
      aprobada_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Usuario que aprobó la empresa'
      },
      motivo_rechazo: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Motivo en caso de rechazo'
      },
      // Documentación legal
      documentos_legales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'URLs y metadatos de documentos legales subidos'
      },
      fecha_vencimiento_documentos: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de vencimiento de documentos legales'
      },
      // Redes sociales
      redes_sociales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'URLs de redes sociales'
      },
      // Información adicional
      productos_servicios: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de productos y servicios que ofrece'
      },
      experiencia_ferias: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Experiencia previa en ferias y eventos'
      },
      // Configuración específica
      configuracion_especifica: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Configuraciones específicas por empresa'
      },
      // Métricas
      numero_participaciones: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      calificacion_promedio: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Calificación promedio basada en participaciones anteriores'
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
    await queryInterface.addIndex('empresa_expositora', ['nombre_empresa']);
    await queryInterface.addIndex('empresa_expositora', ['ruc'], { unique: true });
    await queryInterface.addIndex('empresa_expositora', ['email_contacto']);
    await queryInterface.addIndex('empresa_expositora', ['estado']);
    await queryInterface.addIndex('empresa_expositora', ['sector']);
    await queryInterface.addIndex('empresa_expositora', ['fecha_aprobacion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empresa_expositora');
  }
};
