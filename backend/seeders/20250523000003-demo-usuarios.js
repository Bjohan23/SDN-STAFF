'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generar hashes para las contraseñas
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const user1Hash = await bcrypt.hash('usuario1123', salt);
    const user2Hash = await bcrypt.hash('usuario2123', salt);

    await queryInterface.bulkInsert('usuario', [
      {
        id_usuario: 1,
        correo: 'admin@admin.com',
        password_hash: adminHash,
        estado: 'activo',
        fecha_creacion: new Date(),
        ultima_sesion: null
      },
      {
        id_usuario: 2,
        correo: 'admin@admin.com',
        password_hash: user1Hash,
        estado: 'activo',
        fecha_creacion: new Date(),
        ultima_sesion: null
      },
      {
        id_usuario: 3,
        correo: 'admin@admin.com',
        password_hash: user2Hash,
        estado: 'activo',
        fecha_creacion: new Date(),
        ultima_sesion: null
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('usuario', null, {});
  }
};
