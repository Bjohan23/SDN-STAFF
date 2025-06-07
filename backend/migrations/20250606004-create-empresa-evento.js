'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('empresa_evento', {
      id_empresa: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'empresa_expositora',
          key: 'id_empresa'
        },
        onDelete: 'CASCADE'
      },
      id_evento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
          model: 'evento',
          key: 'id_evento'
        },
        onDelete: 'CASCADE'
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Fecha en que la empresa se registró para el evento'
      },
      estado_participacion: {
        type: Sequelize.ENUM('registrada', 'pendiente_aprobacion', 'aprobada', 'rechazada', 'confirmada', 'cancelada'),
        defaultValue: 'registrada'
      },
      fecha_aprobacion_participacion: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha en que se aprobó la participación en este evento específico'
      },
      aprobada_participacion_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Usuario que aprobó la participación en este evento'
      },
      motivo_rechazo_participacion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Motivo en caso de rechazo de participación'
      },
      // Información del stand asignado
      numero_stand: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: 'Número o código del stand asignado'
      },
      tipo_stand: {
        type: Sequelize.ENUM('basico', 'premium', 'corporativo', 'virtual', 'personalizado'),
        allowNull: true
      },
      area_stand: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Área del stand en metros cuadrados'
      },
      precio_stand: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      moneda_precio: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'PEN'
      },
      // Pagos y facturación
      estado_pago: {
        type: Sequelize.ENUM('pendiente', 'parcial', 'pagado', 'vencido', 'reembolsado'),
        defaultValue: 'pendiente'
      },
      fecha_limite_pago: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha límite para completar el pago'
      },
      fecha_pago: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha en que se completó el pago'
      },
      referencia_pago: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Número de referencia del pago o transacción'
      },
      // Productos y servicios a exponer
      productos_a_exponer: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de productos/servicios que expondrá en este evento'
      },
      objetivos_participacion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Objetivos específicos para este evento'
      },
      // Servicios adicionales
      servicios_adicionales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Servicios adicionales contratados'
      },
      costo_servicios_adicionales: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.00
      },
      // Personal asignado
      personal_asignado: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Lista de personas que representarán a la empresa en el evento'
      },
      contacto_evento: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Persona de contacto específica para este evento'
      },
      telefono_contacto_evento: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email_contacto_evento: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      // Horarios y disponibilidad
      horario_atencion: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Horarios de atención en el stand por día'
      },
      requiere_montaje_especial: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si requiere montaje especial del stand'
      },
      fecha_montaje: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha programada para montaje del stand'
      },
      fecha_desmontaje: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha programada para desmontaje del stand'
      },
      // Documentación específica del evento
      documentos_evento: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Documentos específicos requeridos para este evento'
      },
      // Evaluación post-evento
      calificacion_evento: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Calificación otorgada por la empresa al evento'
      },
      comentarios_evento: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Comentarios de la empresa sobre el evento'
      },
      // Métricas de participación
      numero_visitantes_stand: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      leads_generados: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      ventas_realizadas: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      // Configuración específica
      configuracion_participacion: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Configuraciones específicas para esta participación'
      },
      // Campos de auditoría
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      deleted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuario',
          key: 'id_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Agregar índices
    await queryInterface.addIndex('empresa_evento', ['id_empresa']);
    await queryInterface.addIndex('empresa_evento', ['id_evento']);
    await queryInterface.addIndex('empresa_evento', ['estado_participacion']);
    await queryInterface.addIndex('empresa_evento', ['estado_pago']);
    await queryInterface.addIndex('empresa_evento', ['fecha_registro']);
    await queryInterface.addIndex('empresa_evento', ['numero_stand']);
    
    // Índice único para asegurar que no se repita el número de stand por evento
    await queryInterface.addIndex('empresa_evento', ['id_evento', 'numero_stand'], {
      unique: true,
      name: 'unique_stand_por_evento',
      where: {
        numero_stand: { [Sequelize.Op.ne]: null },
        deleted_at: null
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('empresa_evento');
  }
};
