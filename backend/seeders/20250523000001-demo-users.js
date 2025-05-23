'use strict';

const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Crear hash para passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    await queryInterface.bulkInsert('users', [
      {
        first_name: 'Admin',
        last_name: 'Sistema',
        email: 'admin@sdn-staff.com',
        password: hashedPassword,
        phone: '+51987654321',
        role: 'admin',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Manager',
        last_name: 'Principal',
        email: 'manager@sdn-staff.com',
        password: hashedPassword,
        phone: '+51987654322',
        role: 'manager',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Juan',
        last_name: 'Pérez',
        email: 'juan.perez@sdn-staff.com',
        password: hashedPassword,
        phone: '+51987654323',
        role: 'employee',
        is_active: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'María',
        last_name: 'García',
        email: 'maria.garcia@sdn-staff.com',
        password: hashedPassword,
        phone: '+51987654324',
        role: 'employee',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        first_name: 'Carlos',
        last_name: 'López',
        email: 'carlos.lopez@sdn-staff.com',
        password: hashedPassword,
        phone: '+51987654325',
        role: 'employee',
        is_active: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
