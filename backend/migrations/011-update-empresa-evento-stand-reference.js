'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar nueva columna para referenciar el stand específico
    await queryInterface.addColumn('empresa_evento', 'id_stand', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'stand',
        key: 'id_stand'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'ID del stand específico asignado'
    });

    // Agregar índice para la nueva columna
    await queryInterface.addIndex('empresa_evento', ['id_stand']);
    
    // Actualizar el tipo_stand para que coincida con los nuevos tipos
    await queryInterface.changeColumn('empresa_evento', 'tipo_stand', {
      type: Sequelize.ENUM('basico', 'premium', 'corporativo', 'virtual', 'personalizado'),
      allowNull: true,
      comment: 'Tipo de stand (para compatibilidad)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remover la columna y el índice
    await queryInterface.removeIndex('empresa_evento', ['id_stand']);
    await queryInterface.removeColumn('empresa_evento', 'id_stand');
    
    // Revertir el tipo_stand si es necesario
    await queryInterface.changeColumn('empresa_evento', 'tipo_stand', {
      type: Sequelize.ENUM('basico', 'premium', 'corporativo', 'virtual', 'personalizado'),
      allowNull: true
    });
  }
};
