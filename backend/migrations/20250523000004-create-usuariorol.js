'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('usuariorol', {
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      id_rol: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'rol',
          key: 'id_rol'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      fecha_asignacion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('usuariorol', ['id_usuario']);
    await queryInterface.addIndex('usuariorol', ['id_rol']);
    await queryInterface.addIndex('usuariorol', ['fecha_asignacion']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('usuariorol');
  }
};
