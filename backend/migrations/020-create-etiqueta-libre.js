'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('etiqueta_libre', {
      id_etiqueta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre_etiqueta: {
        type: Sequelize.STRING(60),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(70),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Clasificación y organización
      tipo_etiqueta: {
        type: Sequelize.ENUM('producto', 'servicio', 'tecnologia', 'especialidad', 'certificacion', 'temporal', 'promocional', 'ubicacion', 'otros'),
        defaultValue: 'otros'
      },
      color_hex: {
        type: Sequelize.STRING(7),
        allowNull: true
      },
      icono: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      // Estado y configuración
      estado: {
        type: Sequelize.ENUM('activa', 'inactiva', 'archivada'),
        defaultValue: 'activa'
      },
      es_destacada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      es_publica: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      es_sugerible: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      // Uso temporal
      es_temporal: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      fecha_inicio_vigencia: {
        type: Sequelize.DATE,
        allowNull: true
      },
      fecha_fin_vigencia: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Restricciones de uso
      requiere_aprobacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      solo_admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      max_usos_empresa: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      // Métricas y estadísticas
      total_usos: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      total_empresas: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      popularidad_score: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0.00
      },
      ultima_vez_usada: {
        type: Sequelize.DATE,
        allowNull: true
      },
      // Configuración de búsqueda y SEO
      palabras_clave: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sinonimos: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      // Asociaciones sugeridas
      categorias_sugeridas: {
        type: Sequelize.JSON,
        allowNull: true
      },
      etiquetas_relacionadas: {
        type: Sequelize.JSON,
        allowNull: true
      },
      // Configuración específica
      configuracion_especifica: {
        type: Sequelize.JSON,
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
    await queryInterface.addIndex('etiqueta_libre', ['nombre_etiqueta']);
    await queryInterface.addIndex('etiqueta_libre', ['slug'], { unique: true });
    await queryInterface.addIndex('etiqueta_libre', ['tipo_etiqueta']);
    await queryInterface.addIndex('etiqueta_libre', ['estado']);
    await queryInterface.addIndex('etiqueta_libre', ['es_destacada']);
    await queryInterface.addIndex('etiqueta_libre', ['es_publica']);
    await queryInterface.addIndex('etiqueta_libre', ['es_temporal']);
    await queryInterface.addIndex('etiqueta_libre', ['fecha_fin_vigencia']);
    await queryInterface.addIndex('etiqueta_libre', ['popularidad_score']);
    await queryInterface.addIndex('etiqueta_libre', ['total_usos']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('etiqueta_libre');
  }
};
