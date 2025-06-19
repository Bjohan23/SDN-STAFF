'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('configuracion_tipo_evento', {
      id_configuracion: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_tipo_evento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tipo_evento',
          key: 'id_tipo_evento'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      modalidad: {
        type: Sequelize.ENUM('presencial', 'virtual', 'hibrido'),
        allowNull: false,
        comment: 'Modalidad del evento'
      },
      permite_presencial: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si permite modalidad presencial'
      },
      permite_virtual: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si permite modalidad virtual'
      },
      permite_hibrido: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si permite modalidad híbrida'
      },
      // Configuraciones de ubicación física
      requiere_ubicacion_fisica: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si requiere ubicación física'
      },
      tipos_ubicacion_permitidos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tipos de ubicación permitidos (centro_convenciones, hotel, aire_libre, etc.)'
      },
      capacidad_minima: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Capacidad mínima de asistentes'
      },
      capacidad_maxima: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Capacidad máxima de asistentes'
      },
      // Configuraciones de plataforma virtual
      requiere_plataforma_virtual: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si requiere plataforma virtual'
      },
      plataformas_permitidas: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Plataformas virtuales permitidas (zoom, teams, custom, etc.)'
      },
      permite_transmision_vivo: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si permite transmisión en vivo'
      },
      permite_grabacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si permite grabación del evento'
      },
      permite_interaccion: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si permite interacción con asistentes virtuales'
      },
      // Configuraciones de stands
      permite_stands_fisicos: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si permite stands físicos'
      },
      permite_stands_virtuales: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si permite stands virtuales'
      },
      tipos_stand_permitidos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tipos de stand permitidos para este tipo de evento'
      },
      // Configuraciones de registro y acceso
      requiere_registro_previo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si requiere registro previo'
      },
      permite_registro_in_situ: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si permite registro en el lugar'
      },
      requiere_aprobacion_registro: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si requiere aprobación para registro'
      },
      // Configuraciones de precios
      tiene_costo_entrada: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si tiene costo de entrada'
      },
      precio_base_entrada: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Precio base de entrada'
      },
      moneda_precio: {
        type: Sequelize.STRING(3),
        defaultValue: 'PEN',
        comment: 'Moneda para precios'
      },
      permite_descuentos: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si permite aplicar descuentos'
      },
      // Configuraciones de duración
      duracion_minima_horas: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Duración mínima en horas'
      },
      duracion_maxima_horas: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Duración máxima en horas'
      },
      permite_eventos_multidia: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si permite eventos de múltiples días'
      },
      // Configuraciones específicas
      requiere_acreditacion: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si requiere acreditación especial'
      },
      permite_networking: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si incluye actividades de networking'
      },
      permite_conferencias: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si permite conferencias/ponencias'
      },
      permite_talleres: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si permite talleres prácticos'
      },
      // Restricciones y validaciones
      restricciones_especiales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Restricciones especiales del tipo de evento'
      },
      validaciones_requeridas: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Validaciones requeridas antes de crear evento'
      },
      campos_obligatorios: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Campos obligatorios para este tipo de evento'
      },
      // Plantillas y configuraciones predefinidas
      plantilla_configuracion: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Plantilla de configuración predefinida'
      },
      servicios_incluidos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Servicios incluidos por defecto'
      },
      servicios_recomendados: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Servicios recomendados para este tipo'
      },
      estado: {
        type: Sequelize.ENUM('activo', 'inactivo', 'en_revision'),
        defaultValue: 'activo',
        comment: 'Estado de la configuración'
      },
      orden_visualizacion: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Orden para mostrar en interfaces'
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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
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

    // Índices
    await queryInterface.addIndex('configuracion_tipo_evento', ['id_tipo_evento']);
    await queryInterface.addIndex('configuracion_tipo_evento', ['modalidad']);
    await queryInterface.addIndex('configuracion_tipo_evento', ['estado']);
    await queryInterface.addIndex('configuracion_tipo_evento', ['deleted_at']);
    
    // Índice único para tipo-modalidad
    await queryInterface.addIndex('configuracion_tipo_evento', ['id_tipo_evento', 'modalidad'], {
      unique: true,
      where: { deleted_at: null }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('configuracion_tipo_evento');
  }
};
