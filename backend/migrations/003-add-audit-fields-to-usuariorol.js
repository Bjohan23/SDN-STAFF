'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Agregar campos de auditoría faltantes a la tabla usuariorol
    try {
      // Verificar si las columnas existen antes de agregarlas
      const tableDescription = await queryInterface.describeTable('usuariorol');
      
      // Agregar created_by si no existe
      if (!tableDescription.created_by) {
        await queryInterface.addColumn('usuariorol', 'created_by', {
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
        await queryInterface.addColumn('usuariorol', 'updated_by', {
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
        await queryInterface.addColumn('usuariorol', 'deleted_by', {
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
        await queryInterface.addColumn('usuariorol', 'deleted_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }

      // Agregar created_at si no existe
      if (!tableDescription.created_at) {
        await queryInterface.addColumn('usuariorol', 'created_at', {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: Sequelize.NOW
        });
      }

      // Agregar updated_at si no existe
      if (!tableDescription.updated_at) {
        await queryInterface.addColumn('usuariorol', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }

      // Inicializar created_at con fecha_asignacion para registros existentes
      await queryInterface.sequelize.query(`
        UPDATE usuariorol 
        SET created_at = fecha_asignacion,
            updated_at = fecha_asignacion
        WHERE created_at IS NULL AND fecha_asignacion IS NOT NULL
      `);

      // Si no hay fecha_asignacion, usar NOW()
      await queryInterface.sequelize.query(`
        UPDATE usuariorol 
        SET created_at = NOW(),
            updated_at = NOW()
        WHERE created_at IS NULL
      `);

      // Agregar índices para optimizar consultas
      try {
        await queryInterface.addIndex('usuariorol', ['created_by']);
      } catch (e) {
        console.log('Índice created_by ya existe en usuariorol');
      }

      try {
        await queryInterface.addIndex('usuariorol', ['deleted_at']);
      } catch (e) {
        console.log('Índice deleted_at ya existe en usuariorol');
      }

      console.log('✅ Campos de auditoría agregados a la tabla usuariorol');

    } catch (error) {
      console.error('Error al agregar campos de auditoría a usuariorol:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar campos de auditoría (solo si existen)
    try {
      const tableDescription = await queryInterface.describeTable('usuariorol');
      
      // Eliminar índices primero
      try {
        await queryInterface.removeIndex('usuariorol', ['created_by']);
      } catch (e) {
        // Índice no existe
      }

      try {
        await queryInterface.removeIndex('usuariorol', ['deleted_at']);
      } catch (e) {
        // Índice no existe
      }

      // Eliminar columnas si existen
      if (tableDescription.created_by) {
        await queryInterface.removeColumn('usuariorol', 'created_by');
      }

      if (tableDescription.updated_by) {
        await queryInterface.removeColumn('usuariorol', 'updated_by');
      }

      if (tableDescription.deleted_by) {
        await queryInterface.removeColumn('usuariorol', 'deleted_by');
      }

      if (tableDescription.deleted_at) {
        await queryInterface.removeColumn('usuariorol', 'deleted_at');
      }

      if (tableDescription.created_at) {
        await queryInterface.removeColumn('usuariorol', 'created_at');
      }

      if (tableDescription.updated_at) {
        await queryInterface.removeColumn('usuariorol', 'updated_at');
      }

    } catch (error) {
      console.error('Error al eliminar campos de auditoría de usuariorol:', error);
      throw error;
    }
  }
};
