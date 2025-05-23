'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rol', {
      id_rol: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      nombre_rol: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });

    // Crear índices
    await queryInterface.addIndex('rol', ['nombre_rol'], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rol');
  }
};
