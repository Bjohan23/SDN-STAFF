"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "rol",
      [
        {
          id_rol: 1,
          nombre_rol: "administrador",
          descripcion: "Control total del sistema",
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_rol: 2,
          nombre_rol: "Editor",
          descripcion: "Puede editar contenidos y datos",
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_rol: 3,
          nombre_rol: "Usuario",
          descripcion: "Acceso básico limitado",
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id_rol: 4,
          nombre_rol: "visitante",
          descripcion: "Usuario público con acceso limitado",
          created_at: new Date(),
          updated_at: new Date()
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("rol", null, {});
  },
};
