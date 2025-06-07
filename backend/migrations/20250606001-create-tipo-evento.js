'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tipo_evento', {
      id_tipo_evento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre_tipo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      caracteristicas: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Configuraciones específicas del tipo de evento'
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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

    // Insertar tipos de evento por defecto
    await queryInterface.bulkInsert('tipo_evento', [
      {
        nombre_tipo: 'Presencial',
        descripcion: 'Evento que se realiza en un lugar físico específico',
        caracteristicas: JSON.stringify({
          requiere_ubicacion: true,
          permite_stands: true,
          permite_transmision: false,
          aforo_maximo: true
        }),
        created_at: new Date()
      },
      {
        nombre_tipo: 'Virtual',
        descripcion: 'Evento que se realiza completamente en línea',
        caracteristicas: JSON.stringify({
          requiere_ubicacion: false,
          permite_stands: false,
          permite_transmision: true,
          requiere_plataforma: true
        }),
        created_at: new Date()
      },
      {
        nombre_tipo: 'Híbrido',
        descripcion: 'Evento que combina componentes presenciales y virtuales',
        caracteristicas: JSON.stringify({
          requiere_ubicacion: true,
          permite_stands: true,
          permite_transmision: true,
          aforo_maximo: true,
          requiere_plataforma: true
        }),
        created_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('tipo_evento');
  }
};
