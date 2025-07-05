'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('usuario', 'nombre', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });

    await queryInterface.addColumn('usuario', 'foto_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });

    await queryInterface.addColumn('usuario', 'bio', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('usuario', 'nombre');
    await queryInterface.removeColumn('usuario', 'foto_url');
    await queryInterface.removeColumn('usuario', 'bio');
  }
}; 