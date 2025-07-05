const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ActividadRecurso = sequelize.define('ActividadRecurso', {
    id_actividad_recurso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_actividad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'actividad',
        key: 'id_actividad'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    id_recurso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'recurso',
        key: 'id_recurso'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    // Detalles de la reserva
    cantidad_solicitada: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'La cantidad mínima es 1'
        }
      }
    },
    cantidad_asignada: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      comment: 'Cantidad realmente asignada'
    },
    // Tiempo específico de uso
    hora_inicio_uso: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora específica de inicio de uso del recurso'
    },
    hora_fin_uso: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Hora específica de fin de uso del recurso'
    },
    tiempo_setup_recurso: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Tiempo adicional de setup para este recurso (minutos)'
    },
    tiempo_desmontaje_recurso: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Tiempo adicional de desmontaje (minutos)'
    },
    // Prioridad y clasificación
    prioridad: {
      type: DataTypes.ENUM('critica', 'alta', 'media', 'baja'),
      defaultValue: 'media',
      validate: {
        isIn: {
          args: [['critica', 'alta', 'media', 'baja']],
          msg: 'La prioridad debe ser válida'
        }
      }
    },
    es_indispensable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si el recurso es indispensable para la actividad'
    },
    tiene_alternativa: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si existe alternativa para este recurso'
    },
    recurso_alternativo_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'recurso',
        key: 'id_recurso'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'ID del recurso alternativo'
    },
    // Estado de la asignación
    estado: {
      type: DataTypes.ENUM('solicitado', 'aprobado', 'asignado', 'en_uso', 'devuelto', 'rechazado', 'cancelado'),
      defaultValue: 'solicitado',
      validate: {
        isIn: {
          args: [['solicitado', 'aprobado', 'asignado', 'en_uso', 'devuelto', 'rechazado', 'cancelado']],
          msg: 'El estado debe ser válido'
        }
      }
    },
    fecha_solicitud: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_aprobacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_devolucion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Ubicación específica
    ubicacion_uso: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: 'Ubicación específica donde se usará el recurso'
    },
    instrucciones_ubicacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones específicas de ubicación'
    },
    requiere_transporte: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si el recurso requiere transporte especial'
    },
    // Configuración específica
    configuracion_requerida: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuración específica requerida para este uso'
    },
    parametros_tecnicos: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Parámetros técnicos específicos'
    },
    instrucciones_uso: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Instrucciones específicas de uso para esta actividad'
    },
    // Responsabilidad y operación
    responsable_recurso: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Persona responsable del recurso durante la actividad'
    },
    requiere_operador: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere operador especializado'
    },
    operador_asignado: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Operador asignado al recurso'
    },
    contacto_operador: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Contacto del operador'
    },
    // Costos y facturación
    costo_uso: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo específico por usar este recurso'
    },
    costo_transporte: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo adicional de transporte'
    },
    costo_operador: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo del operador'
    },
    costo_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo total calculado'
    },
    moneda: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    // Control de calidad y estado
    condicion_entrega: {
      type: DataTypes.ENUM('excelente', 'buena', 'regular', 'mala'),
      allowNull: true,
      comment: 'Condición del recurso al momento de entrega'
    },
    condicion_devolucion: {
      type: DataTypes.ENUM('excelente', 'buena', 'regular', 'mala'),
      allowNull: true,
      comment: 'Condición del recurso al momento de devolución'
    },
    incidentes_reportados: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Incidentes o problemas reportados durante el uso'
    },
    satisfaccion_uso: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 1,
          msg: 'La satisfacción mínima es 1'
        },
        max: {
          args: 5,
          msg: 'La satisfacción máxima es 5'
        }
      },
      comment: 'Calificación de satisfacción del uso (1-5)'
    },
    // Coordinación y comunicación
    notas_coordinacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas de coordinación para el uso del recurso'
    },
    motivo_solicitud: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo específico de la solicitud'
    },
    motivo_rechazo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo de rechazo si aplica'
    },
    // Automatización y alertas
    enviar_recordatorio: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Si enviar recordatorios automáticos'
    },
    tiempo_recordatorio_minutos: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: 'Minutos antes para enviar recordatorio'
    },
    notificacion_enviada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si ya se envió la notificación'
    },
    // Información adicional
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas adicionales'
    },
    documentos_asociados: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'URLs de documentos asociados (manuales, contratos, etc.)'
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
    tableName: 'actividad_recurso',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_actividad', 'id_recurso'],
        unique: true,
        name: 'unique_actividad_recurso'
      },
      {
        fields: ['id_actividad']
      },
      {
        fields: ['id_recurso']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['prioridad']
      },
      {
        fields: ['es_indispensable']
      },
      {
        fields: ['fecha_solicitud']
      },
      {
        fields: ['hora_inicio_uso']
      },
      {
        fields: ['hora_fin_uso']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: { [Op.notIn]: ['cancelado', 'rechazado'] }
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      aprobados: {
        where: {
          deleted_at: null,
          estado: { [Op.in]: ['aprobado', 'asignado', 'en_uso', 'devuelto'] }
        }
      },
      criticos: {
        where: {
          deleted_at: null,
          es_indispensable: true,
          estado: { [Op.notIn]: ['cancelado', 'rechazado'] }
        }
      }
    }
  });

  // Métodos de instancia
  ActividadRecurso.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  ActividadRecurso.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  ActividadRecurso.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  ActividadRecurso.prototype.isApproved = function() {
    return ['aprobado', 'asignado', 'en_uso', 'devuelto'].includes(this.estado);
  };

  ActividadRecurso.prototype.isCritical = function() {
    return this.es_indispensable || this.prioridad === 'critica';
  };

  ActividadRecurso.prototype.aprobar = function(cantidadAsignada = null) {
    return this.update({
      estado: 'aprobado',
      fecha_aprobacion: new Date(),
      cantidad_asignada: cantidadAsignada || this.cantidad_solicitada
    });
  };

  ActividadRecurso.prototype.rechazar = function(motivo = null) {
    return this.update({
      estado: 'rechazado',
      motivo_rechazo: motivo
    });
  };

  ActividadRecurso.prototype.asignar = function() {
    return this.update({
      estado: 'asignado',
      fecha_asignacion: new Date()
    });
  };

  ActividadRecurso.prototype.marcarEnUso = function() {
    return this.update({
      estado: 'en_uso'
    });
  };

  ActividadRecurso.prototype.devolver = function(condicion = null, incidentes = null) {
    return this.update({
      estado: 'devuelto',
      fecha_devolucion: new Date(),
      condicion_devolucion: condicion,
      incidentes_reportados: incidentes
    });
  };

  ActividadRecurso.prototype.calcularCostoTotal = function() {
    let costoTotal = 0;
    
    if (this.costo_uso) costoTotal += parseFloat(this.costo_uso);
    if (this.costo_transporte) costoTotal += parseFloat(this.costo_transporte);
    if (this.costo_operador) costoTotal += parseFloat(this.costo_operador);
    
    return costoTotal;
  };

  ActividadRecurso.prototype.actualizarCostoTotal = function() {
    const costoTotal = this.calcularCostoTotal();
    return this.update({ costo_total: costoTotal });
  };

  ActividadRecurso.prototype.getUsageTimeSlot = function() {
    if (this.hora_inicio_uso && this.hora_fin_uso) {
      return {
        inicio: this.hora_inicio_uso,
        fin: this.hora_fin_uso,
        duracion_minutos: Math.round((new Date(this.hora_fin_uso) - new Date(this.hora_inicio_uso)) / 60000)
      };
    }
    return null;
  };

  ActividadRecurso.prototype.needsReminder = function() {
    if (!this.enviar_recordatorio || this.notificacion_enviada) return false;
    if (!this.hora_inicio_uso) return false;
    
    const now = new Date();
    const inicioUso = new Date(this.hora_inicio_uso);
    const tiempoRecordatorio = this.tiempo_recordatorio_minutos * 60 * 1000; // convertir a ms
    
    return (inicioUso - now) <= tiempoRecordatorio;
  };

  ActividadRecurso.prototype.marcarNotificacionEnviada = function() {
    return this.update({ notificacion_enviada: true });
  };

  ActividadRecurso.prototype.evaluarSatisfaccion = function(calificacion, comentarios = null) {
    return this.update({
      satisfaccion_uso: calificacion,
      incidentes_reportados: comentarios ? `${this.incidentes_reportados || ''}\n\nEvaluación: ${comentarios}` : this.incidentes_reportados
    });
  };

  // Asociaciones
  ActividadRecurso.associate = function(models) {
    // Relación con Actividad
    ActividadRecurso.belongsTo(models.Actividad, {
      foreignKey: 'id_actividad',
      as: 'actividad'
    });

    // Relación con Recurso
    ActividadRecurso.belongsTo(models.Recurso, {
      foreignKey: 'id_recurso',
      as: 'recurso'
    });

    // Relación con recurso alternativo
    ActividadRecurso.belongsTo(models.Recurso, {
      foreignKey: 'recurso_alternativo_id',
      as: 'recursoAlternativo'
    });

    // Asociaciones de auditoría
    ActividadRecurso.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    ActividadRecurso.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    ActividadRecurso.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return ActividadRecurso;
};
