const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const EmpresaEvento = sequelize.define('EmpresaEvento', {
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'empresa_expositora',
        key: 'id_empresa'
      },
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de empresa es requerido'
        },
        isInt: {
          msg: 'El ID de empresa debe ser un número entero'
        }
      }
    },
    id_evento: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'evento',
        key: 'id_evento'
      },
      onDelete: 'CASCADE',
      validate: {
        notNull: {
          msg: 'El ID de evento es requerido'
        },
        isInt: {
          msg: 'El ID de evento debe ser un número entero'
        }
      }
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha en que la empresa se registró para el evento'
    },
    estado_participacion: {
      type: DataTypes.ENUM('registrada', 'pendiente_aprobacion', 'aprobada', 'rechazada', 'confirmada', 'cancelada'),
      defaultValue: 'registrada',
      validate: {
        isIn: {
          args: [['registrada', 'pendiente_aprobacion', 'aprobada', 'rechazada', 'confirmada', 'cancelada']],
          msg: 'El estado debe ser: registrada, pendiente_aprobacion, aprobada, rechazada, confirmada o cancelada'
        }
      }
    },
    fecha_aprobacion_participacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se aprobó la participación en este evento específico'
    },
    aprobada_participacion_por: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo en caso de rechazo de participación'
    },
    // Información del stand asignado
    numero_stand: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Número o código del stand asignado'
    },
    tipo_stand: {
      type: DataTypes.ENUM('basico', 'premium', 'corporativo', 'virtual', 'personalizado'),
      allowNull: true,
      validate: {
        isIn: {
          args: [['basico', 'premium', 'corporativo', 'virtual', 'personalizado']],
          msg: 'El tipo de stand debe ser: basico, premium, corporativo, virtual o personalizado'
        }
      }
    },
    area_stand: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El área del stand no puede ser negativa'
        }
      },
      comment: 'Área del stand en metros cuadrados'
    },
    precio_stand: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'El precio del stand no puede ser negativo'
        }
      }
    },
    moneda_precio: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'PEN',
      validate: {
        len: {
          args: [3, 3],
          msg: 'La moneda debe tener 3 caracteres (ISO 4217)'
        }
      }
    },
    // Pagos y facturación
    estado_pago: {
      type: DataTypes.ENUM('pendiente', 'parcial', 'pagado', 'vencido', 'reembolsado'),
      defaultValue: 'pendiente',
      validate: {
        isIn: {
          args: [['pendiente', 'parcial', 'pagado', 'vencido', 'reembolsado']],
          msg: 'El estado de pago debe ser: pendiente, parcial, pagado, vencido o reembolsado'
        }
      }
    },
    fecha_limite_pago: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha límite para completar el pago'
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se completó el pago'
    },
    referencia_pago: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Número de referencia del pago o transacción'
    },
    // Productos y servicios a exponer
    productos_a_exponer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción de productos/servicios que expondrá en este evento'
    },
    objetivos_participacion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Objetivos específicos para este evento'
    },
    // Servicios adicionales
    servicios_adicionales: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Servicios adicionales contratados (electricidad, internet, mobiliario, etc.)'
    },
    costo_servicios_adicionales: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.00,
      validate: {
        min: {
          args: 0,
          msg: 'El costo de servicios adicionales no puede ser negativo'
        }
      }
    },
    // Personal asignado
    personal_asignado: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Lista de personas que representarán a la empresa en el evento'
    },
    contacto_evento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Persona de contacto específica para este evento'
    },
    telefono_contacto_evento: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email_contacto_evento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Debe ser un email válido'
        }
      }
    },
    // Horarios y disponibilidad
    horario_atencion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Horarios de atención en el stand por día'
    },
    requiere_montaje_especial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si requiere montaje especial del stand'
    },
    fecha_montaje: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha programada para montaje del stand'
    },
    fecha_desmontaje: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha programada para desmontaje del stand'
    },
    // Documentación específica del evento
    documentos_evento: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Documentos específicos requeridos para este evento'
    },
    // Evaluación post-evento
    calificacion_evento: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'La calificación no puede ser negativa'
        },
        max: {
          args: 5,
          msg: 'La calificación no puede ser mayor a 5'
        }
      },
      comment: 'Calificación otorgada por la empresa al evento'
    },
    comentarios_evento: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comentarios de la empresa sobre el evento'
    },
    // Métricas de participación
    numero_visitantes_stand: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El número de visitantes no puede ser negativo'
        }
      }
    },
    leads_generados: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'El número de leads no puede ser negativo'
        }
      }
    },
    ventas_realizadas: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'Las ventas no pueden ser negativas'
        }
      }
    },
    // Configuración específica
    configuracion_participacion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas para esta participación'
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
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'empresa_evento',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_empresa']
      },
      {
        fields: ['id_evento']
      },
      {
        fields: ['estado_participacion']
      },
      {
        fields: ['estado_pago']
      },
      {
        fields: ['fecha_registro']
      },
      {
        fields: ['numero_stand']
      },
      {
        unique: true,
        fields: ['id_evento', 'numero_stand'],
        name: 'unique_stand_por_evento'
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
      aprobadas: {
        where: {
          estado_participacion: 'aprobada',
          deleted_at: null
        }
      },
      confirmadas: {
        where: {
          estado_participacion: 'confirmada',
          deleted_at: null
        }
      },
      pendientes: {
        where: {
          estado_participacion: ['registrada', 'pendiente_aprobacion'],
          deleted_at: null
        }
      },
      pagadas: {
        where: {
          estado_pago: 'pagado',
          deleted_at: null
        }
      }
    }
  });

  // Métodos de instancia
  EmpresaEvento.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  EmpresaEvento.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  EmpresaEvento.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  EmpresaEvento.prototype.isApproved = function() {
    return this.estado_participacion === 'aprobada';
  };

  EmpresaEvento.prototype.isConfirmed = function() {
    return this.estado_participacion === 'confirmada';
  };

  EmpresaEvento.prototype.isPaid = function() {
    return this.estado_pago === 'pagado';
  };

  EmpresaEvento.prototype.aprobarParticipacion = function(aprobadaPor = null) {
    return this.update({
      estado_participacion: 'aprobada',
      fecha_aprobacion_participacion: new Date(),
      aprobada_participacion_por: aprobadaPor,
      motivo_rechazo_participacion: null
    });
  };

  EmpresaEvento.prototype.rechazarParticipacion = function(motivo = null, rechazadaPor = null) {
    return this.update({
      estado_participacion: 'rechazada',
      motivo_rechazo_participacion: motivo,
      aprobada_participacion_por: rechazadaPor,
      fecha_aprobacion_participacion: null
    });
  };

  EmpresaEvento.prototype.confirmarParticipacion = function() {
    return this.update({
      estado_participacion: 'confirmada'
    });
  };

  EmpresaEvento.prototype.pagoVencido = function() {
    if (!this.fecha_limite_pago) return false;
    return new Date() > new Date(this.fecha_limite_pago) && this.estado_pago === 'pendiente';
  };

  EmpresaEvento.prototype.calcularCostoTotal = function() {
    const costoStand = parseFloat(this.precio_stand || 0);
    const costoServicios = parseFloat(this.costo_servicios_adicionales || 0);
    return costoStand + costoServicios;
  };

  // Asociaciones
  EmpresaEvento.associate = function(models) {
    // Relación con EmpresaExpositora
    EmpresaEvento.belongsTo(models.EmpresaExpositora, {
      foreignKey: 'id_empresa',
      as: 'empresa'
    });

    // Relación con Evento
    EmpresaEvento.belongsTo(models.Evento, {
      foreignKey: 'id_evento',
      as: 'evento'
    });

    // Relación con Stand asignado
    EmpresaEvento.belongsTo(models.Stand, {
      foreignKey: 'id_stand',
      as: 'standAsignado'
    });

    // Relación con Usuario que aprobó participación
    EmpresaEvento.belongsTo(models.Usuario, {
      foreignKey: 'aprobada_participacion_por',
      as: 'aprobadaParticipacionPorUsuario'
    });

    // Asociaciones de auditoría
    EmpresaEvento.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    EmpresaEvento.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    EmpresaEvento.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return EmpresaEvento;
};
