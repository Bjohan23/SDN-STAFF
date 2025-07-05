const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ConflictoAsignacion = sequelize.define('ConflictoAsignacion', {
    id_conflicto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'evento',
        key: 'id_evento'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de evento es requerido'
        }
      }
    },
    id_stand: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stand',
        key: 'id_stand'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de stand es requerido'
        }
      }
    },
    tipo_conflicto: {
      type: DataTypes.ENUM('multiple_solicitudes', 'cambio_requerido', 'incompatibilidad', 'overbooking', 'conflicto_horario', 'otro'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['multiple_solicitudes', 'cambio_requerido', 'incompatibilidad', 'overbooking', 'conflicto_horario', 'otro']],
          msg: 'El tipo de conflicto debe ser válido'
        }
      }
    },
    empresas_en_conflicto: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Debe haber al menos una empresa en conflicto'
        },
        isValidEmpresasArray(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('Las empresas en conflicto deben ser un array no vacío');
          }
          for (const empresa of value) {
            if (!empresa.id_empresa || !empresa.nombre_empresa) {
              throw new Error('Cada empresa debe tener id_empresa y nombre_empresa');
            }
          }
        }
      },
      comment: 'Array de objetos con información de empresas en conflicto'
    },
    solicitudes_relacionadas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'IDs de solicitudes de asignación relacionadas con el conflicto'
    },
    descripcion_conflicto: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'La descripción del conflicto es requerida'
        }
      }
    },
    criterios_resolucion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Criterios que se usarán para resolver el conflicto'
    },
    estado_conflicto: {
      type: DataTypes.ENUM('detectado', 'en_revision', 'en_resolucion', 'resuelto', 'escalado', 'cancelado'),
      allowNull: false,
      defaultValue: 'detectado',
      validate: {
        isIn: {
          args: [['detectado', 'en_revision', 'en_resolucion', 'resuelto', 'escalado', 'cancelado']],
          msg: 'El estado del conflicto debe ser válido'
        }
      }
    },
    prioridad_resolucion: {
      type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
      allowNull: false,
      defaultValue: 'media',
      validate: {
        isIn: {
          args: [['baja', 'media', 'alta', 'critica']],
          msg: 'La prioridad debe ser: baja, media, alta o critica'
        }
      }
    },
    fecha_deteccion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    detectado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que detectó el conflicto (null si fue automático)'
    },
    metodo_deteccion: {
      type: DataTypes.ENUM('automatico', 'manual', 'reporte_empresa', 'auditoria'),
      allowNull: false,
      defaultValue: 'automatico',
      validate: {
        isIn: {
          args: [['automatico', 'manual', 'reporte_empresa', 'auditoria']],
          msg: 'El método de detección debe ser válido'
        }
      }
    },
    // Información de resolución
    fecha_inicio_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se inició el proceso de resolución'
    },
    asignado_a: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario asignado para resolver el conflicto'
    },
    fecha_limite_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha límite para resolver el conflicto'
    },
    // Resolución final
    empresa_asignada_final: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'empresa_expositora',
        key: 'id_empresa'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Empresa que finalmente obtuvo el stand'
    },
    empresas_compensadas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Empresas que recibieron compensación o alternativas'
    },
    criterio_resolucion_aplicado: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Criterio específico usado para la resolución'
    },
    resuelto_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que resolvió el conflicto'
    },
    fecha_resolucion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se resolvió el conflicto'
    },
    observaciones_resolucion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones sobre la resolución del conflicto'
    },
    // Seguimiento y escalamiento
    escalado_a: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario al que se escaló el conflicto'
    },
    fecha_escalamiento: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se escaló el conflicto'
    },
    motivo_escalamiento: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo por el cual se escaló el conflicto'
    },
    // Impacto y métricas
    impacto_estimado: {
      type: DataTypes.ENUM('bajo', 'medio', 'alto', 'critico'),
      allowNull: false,
      defaultValue: 'medio',
      comment: 'Impacto estimado del conflicto en el evento'
    },
    empresas_afectadas_total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Número total de empresas afectadas por el conflicto'
    },
    tiempo_resolucion_horas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Tiempo que tomó resolver el conflicto en horas'
    },
    // Notificaciones y comunicación
    notificaciones_enviadas: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Log de notificaciones enviadas durante el conflicto'
    },
    comunicaciones_log: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Log de comunicaciones con las empresas involucradas'
    },
    // Campos de auditoría
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'conflicto_asignacion',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_evento']
      },
      {
        fields: ['id_stand']
      },
      {
        fields: ['estado_conflicto']
      },
      {
        fields: ['prioridad_resolucion']
      },
      {
        fields: ['fecha_deteccion']
      },
      {
        fields: ['asignado_a']
      },
      {
        fields: ['empresa_asignada_final']
      },
      {
        fields: ['tipo_conflicto']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      activos: {
        where: {
          estado_conflicto: ['detectado', 'en_revision', 'en_resolucion'],
          deleted_at: null
        }
      },
      resueltos: {
        where: {
          estado_conflicto: 'resuelto',
          deleted_at: null
        }
      },
      porPrioridad: {
        where: {
          deleted_at: null
        },
        order: [
          ['prioridad_resolucion', 'DESC'],
          ['fecha_deteccion', 'ASC']
        ]
      },
      vencidos: {
        where: {
          fecha_limite_resolucion: { [Op.lt]: new Date() },
          estado_conflicto: ['detectado', 'en_revision', 'en_resolucion'],
          deleted_at: null
        }
      }
    }
  });

  // Métodos de instancia
  ConflictoAsignacion.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  ConflictoAsignacion.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  ConflictoAsignacion.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  ConflictoAsignacion.prototype.isActivo = function() {
    return ['detectado', 'en_revision', 'en_resolucion'].includes(this.estado_conflicto);
  };

  ConflictoAsignacion.prototype.isResuelto = function() {
    return this.estado_conflicto === 'resuelto';
  };

  ConflictoAsignacion.prototype.iniciarResolucion = function(asignadoA = null) {
    return this.update({
      estado_conflicto: 'en_resolucion',
      fecha_inicio_resolucion: new Date(),
      asignado_a: asignadoA
    });
  };

  ConflictoAsignacion.prototype.resolver = function(empresaAsignada, criterioAplicado, resueltoPor, observaciones = null) {
    const tiempoResolucion = this.fecha_inicio_resolucion 
      ? Math.round((new Date() - new Date(this.fecha_inicio_resolucion)) / (1000 * 60 * 60))
      : null;

    return this.update({
      estado_conflicto: 'resuelto',
      empresa_asignada_final: empresaAsignada,
      criterio_resolucion_aplicado: criterioAplicado,
      resuelto_por: resueltoPor,
      fecha_resolucion: new Date(),
      observaciones_resolucion: observaciones,
      tiempo_resolucion_horas: tiempoResolucion
    });
  };

  ConflictoAsignacion.prototype.escalar = function(escaladoA, motivo, escaladoPor = null) {
    return this.update({
      estado_conflicto: 'escalado',
      escalado_a: escaladoA,
      fecha_escalamiento: new Date(),
      motivo_escalamiento: motivo,
      updated_by: escaladoPor
    });
  };

  ConflictoAsignacion.prototype.isVencido = function() {
    if (!this.fecha_limite_resolucion) return false;
    return new Date() > new Date(this.fecha_limite_resolucion) && this.isActivo();
  };

  ConflictoAsignacion.prototype.addNotificacion = function(tipo, destinatario, canal = 'email') {
    const notificaciones = this.notificaciones_enviadas || [];
    notificaciones.push({
      tipo: tipo,
      destinatario: destinatario,
      canal: canal,
      fecha: new Date(),
      timestamp: Date.now()
    });
    
    return this.update({
      notificaciones_enviadas: notificaciones
    });
  };

  ConflictoAsignacion.prototype.addComunicacion = function(tipo, participante, mensaje, medio = 'email') {
    const comunicaciones = this.comunicaciones_log || [];
    comunicaciones.push({
      tipo: tipo,
      participante: participante,
      mensaje: mensaje,
      medio: medio,
      fecha: new Date(),
      timestamp: Date.now()
    });
    
    return this.update({
      comunicaciones_log: comunicaciones
    });
  };

  ConflictoAsignacion.prototype.calcularImpacto = function() {
    const numEmpresas = this.empresas_en_conflicto.length;
    const prioridad = this.prioridad_resolucion;
    
    if (prioridad === 'critica' || numEmpresas > 5) return 'critico';
    if (prioridad === 'alta' || numEmpresas > 3) return 'alto';
    if (prioridad === 'media' || numEmpresas > 1) return 'medio';
    return 'bajo';
  };

  ConflictoAsignacion.prototype.getEmpresasAfectadas = function() {
    return this.empresas_en_conflicto.map(empresa => empresa.id_empresa);
  };

  ConflictoAsignacion.prototype.requiereEscalamiento = function() {
    // Escalamiento automático si está vencido y es de alta prioridad
    return this.isVencido() && ['alta', 'critica'].includes(this.prioridad_resolucion);
  };

  // Método estático para detectar conflictos
  ConflictoAsignacion.detectarConflictos = async function(idEvento, idStand = null) {
    const { SolicitudAsignacion } = require('./index');
    
    const whereClause = {
      id_evento: idEvento,
      estado_solicitud: ['solicitada', 'en_revision', 'aprobada']
    };
    
    if (idStand) {
      whereClause.id_stand_solicitado = idStand;
    }
    
    const solicitudes = await SolicitudAsignacion.findAll({
      where: whereClause,
      include: [{ association: 'empresa' }, { association: 'standSolicitado' }]
    });
    
    // Agrupar por stand solicitado
    const solicitudesPorStand = {};
    solicitudes.forEach(solicitud => {
      if (solicitud.id_stand_solicitado) {
        if (!solicitudesPorStand[solicitud.id_stand_solicitado]) {
          solicitudesPorStand[solicitud.id_stand_solicitado] = [];
        }
        solicitudesPorStand[solicitud.id_stand_solicitado].push(solicitud);
      }
    });
    
    // Detectar conflictos (más de una solicitud para el mismo stand)
    const conflictos = [];
    for (const [standId, solicitudesStand] of Object.entries(solicitudesPorStand)) {
      if (solicitudesStand.length > 1) {
        conflictos.push({
          id_stand: parseInt(standId),
          solicitudes: solicitudesStand,
          empresas: solicitudesStand.map(s => ({
            id_empresa: s.id_empresa,
            nombre_empresa: s.empresa.nombre_empresa,
            prioridad_score: s.prioridad_score
          }))
        });
      }
    }
    
    return conflictos;
  };

  // Asociaciones
  ConflictoAsignacion.associate = function(models) {
    // Relación con Evento
    ConflictoAsignacion.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Relación con Stand
    ConflictoAsignacion.belongsTo(models.Stand, {
      foreignKey: 'id_stand',
      as: 'stand'
    });

    // Relación con EmpresaExpositora (empresa finalmente asignada)
    ConflictoAsignacion.belongsTo(models.EmpresaExpositora, {
      foreignKey: 'empresa_asignada_final',
      as: 'empresaAsignada'
    });

    // Relación con Usuario que detectó
    ConflictoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'detectado_por',
      as: 'detectadoPorUsuario'
    });

    // Relación con Usuario asignado para resolver
    ConflictoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'asignado_a',
      as: 'asignadoAUsuario'
    });

    // Relación con Usuario que resolvió
    ConflictoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'resuelto_por',
      as: 'resueltoPorUsuario'
    });

    // Relación con Usuario escalado
    ConflictoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'escalado_a',
      as: 'escaladoAUsuario'
    });

    // Asociaciones de auditoría
    ConflictoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    ConflictoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    ConflictoAsignacion.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return ConflictoAsignacion;
};
