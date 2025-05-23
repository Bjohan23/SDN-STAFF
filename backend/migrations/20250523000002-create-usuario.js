'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuario', {
      id_usuario: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      correo: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'suspendido'),
        allowNull: false,
        defaultValue: 'activo'
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      ultima_sesion: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Crear índices
    await queryInterface.addIndex('usuario', ['correo'], { unique: true });
    await queryInterface.addIndex('usuario', ['estado']);
    await queryInterface.addIndex('usuario', ['fecha_creacion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuario');
  }
};
