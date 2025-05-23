'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('usuariorol', [
      {
        id_usuario: 1,
        id_rol: 1,
        fecha_asignacion: new Date()
      },
      {
        id_usuario: 2,
        id_rol: 3,
        fecha_asignacion: new Date()
      },
      {
        id_usuario: 3,
        id_rol: 2,
        fecha_asignacion: new Date()
      },
      {
        id_usuario: 3,
        id_rol: 3,
        fecha_asignacion: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuariorol', null, {});
  }
};
