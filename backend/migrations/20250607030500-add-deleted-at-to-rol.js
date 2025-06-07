// Migration: Add deleted_at and deleted_by to rol
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('rol', 'deleted_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('rol', 'deleted_by', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('rol', 'deleted_at');
    await queryInterface.removeColumn('rol', 'deleted_by');
  }
};
