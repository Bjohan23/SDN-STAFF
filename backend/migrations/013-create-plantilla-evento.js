'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('plantilla_evento', {
      id_plantilla: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      nombre_plantilla: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nombre de la plantilla'
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción de la plantilla'
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
      modalidad_predefinida: {
        type: Sequelize.ENUM('presencial', 'virtual', 'hibrido'),
        allowNull: false,
        comment: 'Modalidad predefinida'
      },
      // Configuración predefinida del evento
      configuracion_basica: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Configuración básica del evento (nombre, descripción base, etc.)'
      },
      duracion_predefinida: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Duración predefinida (días, horas inicio/fin)'
      },
      ubicacion_sugerida: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tipos de ubicación sugeridos'
      },
      // Configuración de participantes
      capacidad_sugerida: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Capacidad sugerida (min, max, óptima)'
      },
      perfil_asistentes: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Perfil típico de asistentes'
      },
      // Configuración de stands
      stands_recomendados: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tipos y cantidad de stands recomendados'
      },
      layout_sugerido: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Layout sugerido para el evento'
      },
      // Servicios y recursos
      servicios_incluidos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Servicios incluidos en la plantilla'
      },
      servicios_opcionales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Servicios opcionales recomendados'
      },
      recursos_necesarios: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Recursos necesarios para el evento'
      },
      // Configuración de precios
      estructura_precios: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Estructura de precios sugerida'
      },
      presupuesto_estimado: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Presupuesto estimado por categorías'
      },
      // Cronograma y fases
      cronograma_tipo: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Cronograma típico del evento'
      },
      fases_planificacion: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Fases de planificación recomendadas'
      },
      tareas_previas: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tareas previas recomendadas'
      },
      // Marketing y promoción
      estrategia_marketing: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Estrategia de marketing sugerida'
      },
      canales_promocion: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Canales de promoción recomendados'
      },
      // Configuración tecnológica
      tecnologia_requerida: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Tecnología requerida para el evento'
      },
      plataformas_recomendadas: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Plataformas recomendadas (si es virtual/híbrido)'
      },
      // Métricas y KPIs
      kpis_sugeridos: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'KPIs sugeridos para medir éxito'
      },
      metricas_seguimiento: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Métricas de seguimiento recomendadas'
      },
      // Configuraciones especiales
      requisitos_especiales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Requisitos especiales del tipo de evento'
      },
      consideraciones_legales: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Consideraciones legales a tener en cuenta'
      },
      // Metadatos de la plantilla
      es_plantilla_base: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Si es una plantilla base del sistema'
      },
      es_personalizable: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: 'Si la plantilla puede ser personalizada'
      },
      nivel_complejidad: {
        type: Sequelize.ENUM('basico', 'intermedio', 'avanzado', 'experto'),
        defaultValue: 'basico',
        comment: 'Nivel de complejidad de la plantilla'
      },
      tiempo_planificacion_sugerido: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Tiempo de planificación sugerido en días'
      },
      popularidad: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Contador de veces que se ha usado'
      },
      calificacion_promedio: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: true,
        comment: 'Calificación promedio de la plantilla'
      },
      estado: {
        type: Sequelize.ENUM('activa', 'inactiva', 'en_revision', 'archivada'),
        defaultValue: 'activa',
        comment: 'Estado de la plantilla'
      },
      version: {
        type: Sequelize.STRING(10),
        defaultValue: '1.0',
        comment: 'Versión de la plantilla'
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
    await queryInterface.addIndex('plantilla_evento', ['nombre_plantilla']);
    await queryInterface.addIndex('plantilla_evento', ['id_tipo_evento']);
    await queryInterface.addIndex('plantilla_evento', ['modalidad_predefinida']);
    await queryInterface.addIndex('plantilla_evento', ['estado']);
    await queryInterface.addIndex('plantilla_evento', ['nivel_complejidad']);
    await queryInterface.addIndex('plantilla_evento', ['es_plantilla_base']);
    await queryInterface.addIndex('plantilla_evento', ['popularidad']);
    await queryInterface.addIndex('plantilla_evento', ['deleted_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('plantilla_evento');
  }
};
