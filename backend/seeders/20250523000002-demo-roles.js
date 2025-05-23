'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('rol', [
      {
        id_rol: 1,
        nombre_rol: 'Administrador',
        descripcion: 'Control total del sistema'
      },
      {
        id_rol: 2,
        nombre_rol: 'Editor',
        descripcion: 'Puede editar contenidos y datos'
      },
      {
        id_rol: 3,
        nombre_rol: 'Usuario',
        descripcion: 'Acceso básico limitado'
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('rol', null, {});
  }
};
