'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar campos de auditoría faltantes a la tabla rol
    try {
      // Verificar si las columnas existen antes de agregarlas
      const tableDescription = await queryInterface.describeTable('rol');
      
      // Agregar created_by si no existe
      if (!tableDescription.created_by) {
        await queryInterface.addColumn('rol', 'created_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id_usuario'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        });
      }

      // Agregar updated_by si no existe
      if (!tableDescription.updated_by) {
        await queryInterface.addColumn('rol', 'updated_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id_usuario'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        });
      }

      // Agregar deleted_by si no existe
      if (!tableDescription.deleted_by) {
        await queryInterface.addColumn('rol', 'deleted_by', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'usuario',
            key: 'id_usuario'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        });
      }

      // Agregar deleted_at si no existe
      if (!tableDescription.deleted_at) {
        await queryInterface.addColumn('rol', 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }

      // Agregar created_at si no existe
      if (!tableDescription.created_at) {
        await queryInterface.addColumn('rol', 'created_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW
        });
      }

      // Agregar updated_at si no existe
      if (!tableDescription.updated_at) {
        await queryInterface.addColumn('rol', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }

      // Inicializar created_at y updated_at para registros existentes
      await queryInterface.sequelize.query(`
        UPDATE rol 
        SET created_at = NOW(), updated_at = NOW()
        WHERE created_at IS NULL
      `);

      // Agregar índices para optimizar consultas
      try {
        await queryInterface.addIndex('rol', ['created_by']);
      } catch (e) {
        console.log('Índice created_by ya existe en rol');
      }

      try {
        await queryInterface.addIndex('rol', ['deleted_at']);
      } catch (e) {
        console.log('Índice deleted_at ya existe en rol');
      }

      console.log('✅ Campos de auditoría agregados a la tabla rol');

    } catch (error) {
      console.error('Error al agregar campos de auditoría a rol:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar campos de auditoría (solo si existen)
    try {
      const tableDescription = await queryInterface.describeTable('rol');
      
      // Eliminar índices primero
      try {
        await queryInterface.removeIndex('rol', ['created_by']);
      } catch (e) {
        // Índice no existe
      }

      try {
        await queryInterface.removeIndex('rol', ['deleted_at']);
      } catch (e) {
        // Índice no existe
      }

      // Eliminar columnas si existen
      if (tableDescription.created_by) {
        await queryInterface.removeColumn('rol', 'created_by');
      }

      if (tableDescription.updated_by) {
        await queryInterface.removeColumn('rol', 'updated_by');
      }

      if (tableDescription.deleted_by) {
        await queryInterface.removeColumn('rol', 'deleted_by');
      }

      if (tableDescription.deleted_at) {
        await queryInterface.removeColumn('rol', 'deleted_at');
      }

      if (tableDescription.created_at) {
        await queryInterface.removeColumn('rol', 'created_at');
      }

      if (tableDescription.updated_at) {
        await queryInterface.removeColumn('rol', 'updated_at');
      }

    } catch (error) {
      console.error('Error al eliminar campos de auditoría de rol:', error);
      throw error;
    }
  }
};
