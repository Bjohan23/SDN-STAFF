'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar campos de auditoría faltantes a la tabla usuario
    try {
      // Verificar si las columnas existen antes de agregarlas
      const tableDescription = await queryInterface.describeTable('usuario');
      
      // Agregar created_by si no existe
      if (!tableDescription.created_by) {
        await queryInterface.addColumn('usuario', 'created_by', {
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
        await queryInterface.addColumn('usuario', 'updated_by', {
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
        await queryInterface.addColumn('usuario', 'deleted_by', {
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
        await queryInterface.addColumn('usuario', 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }

      // Agregar created_at si no existe
      if (!tableDescription.created_at) {
        await queryInterface.addColumn('usuario', 'created_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW
        });
      }

      // Agregar updated_at si no existe
      if (!tableDescription.updated_at) {
        await queryInterface.addColumn('usuario', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }

      // Inicializar created_at con fecha_creacion para registros existentes
      await queryInterface.sequelize.query(`
        UPDATE usuario 
        SET created_at = fecha_creacion 
        WHERE created_at IS NULL AND fecha_creacion IS NOT NULL
      `);

      // Inicializar updated_at con fecha_creacion para registros existentes
      await queryInterface.sequelize.query(`
        UPDATE usuario 
        SET updated_at = fecha_creacion 
        WHERE updated_at IS NULL AND fecha_creacion IS NOT NULL
      `);

      // Agregar índices para optimizar consultas
      try {
        await queryInterface.addIndex('usuario', ['created_by']);
      } catch (e) {
        console.log('Índice created_by ya existe');
      }

      try {
        await queryInterface.addIndex('usuario', ['deleted_at']);
      } catch (e) {
        console.log('Índice deleted_at ya existe');
      }

      console.log('✅ Campos de auditoría agregados a la tabla usuario');

    } catch (error) {
      console.error('Error al agregar campos de auditoría:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar campos de auditoría (solo si existen)
    try {
      const tableDescription = await queryInterface.describeTable('usuario');
      
      // Eliminar índices primero
      try {
        await queryInterface.removeIndex('usuario', ['created_by']);
      } catch (e) {
        // Índice no existe
      }

      try {
        await queryInterface.removeIndex('usuario', ['deleted_at']);
      } catch (e) {
        // Índice no existe
      }

      // Eliminar columnas si existen
      if (tableDescription.created_by) {
        await queryInterface.removeColumn('usuario', 'created_by');
      }

      if (tableDescription.updated_by) {
        await queryInterface.removeColumn('usuario', 'updated_by');
      }

      if (tableDescription.deleted_by) {
        await queryInterface.removeColumn('usuario', 'deleted_by');
      }

      if (tableDescription.deleted_at) {
        await queryInterface.removeColumn('usuario', 'deleted_at');
      }

      if (tableDescription.created_at) {
        await queryInterface.removeColumn('usuario', 'created_at');
      }

      if (tableDescription.updated_at) {
        await queryInterface.removeColumn('usuario', 'updated_at');
      }

    } catch (error) {
      console.error('Error al eliminar campos de auditoría:', error);
      throw error;
    }
  }
};
