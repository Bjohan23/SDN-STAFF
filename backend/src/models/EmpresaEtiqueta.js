const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const EmpresaEtiqueta = sequelize.define('EmpresaEtiqueta', {
    id_empresa_etiqueta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_empresa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresa_expositora',
        key: 'id_empresa'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    id_etiqueta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'etiqueta_libre',
        key: 'id_etiqueta'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    // Contexto de la asignación
    contexto: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 300],
          msg: 'El contexto no puede exceder 300 caracteres'
        }
      },
      comment: 'Contexto específico de por qué se asignó esta etiqueta'
    },
    relevancia: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
      allowNull: false,
      validate: {
        min: {
          args: 1,
          msg: 'La relevancia mínima es 1'
        },
        max: {
          args: 5,
          msg: 'La relevancia máxima es 5'
        }
      },
      comment: '1=Baja, 2=Media-Baja, 3=Media, 4=Media-Alta, 5=Alta'
    },
    // Origen de la asignación
    origen_asignacion: {
      type: DataTypes.ENUM('manual', 'automatica', 'sugerencia_aceptada', 'importacion', 'ia_generada'),
      defaultValue: 'manual',
      validate: {
        isIn: {
          args: [['manual', 'automatica', 'sugerencia_aceptada', 'importacion', 'ia_generada']],
          msg: 'El origen debe ser válido'
        }
      }
    },
    // Estado y validación
    estado: {
      type: DataTypes.ENUM('activa', 'inactiva', 'pendiente_revision', 'rechazada'),
      defaultValue: 'activa',
      validate: {
        isIn: {
          args: [['activa', 'inactiva', 'pendiente_revision', 'rechazada']],
          msg: 'El estado debe ser: activa, inactiva, pendiente_revision o rechazada'
        }
      }
    },
    fecha_asignacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha en que se asignó la etiqueta'
    },
    fecha_validacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se validó la asignación'
    },
    validada_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuario',
        key: 'id_usuario'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Usuario que validó la asignación'
    },
    motivo_rechazo: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Motivo en caso de rechazo'
    },
    // Uso temporal y vigencia
    es_temporal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si esta asignación es temporal'
    },
    fecha_inicio_uso: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Inicio del período de uso (para etiquetas temporales)'
    },
    fecha_fin_uso: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fin del período de uso (para etiquetas temporales)'
    },
    // Eventos específicos
    id_evento_asignacion: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'evento',
        key: 'id_evento'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      comment: 'Evento específico para el cual se asignó (opcional)'
    },
    es_solo_para_evento: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si la etiqueta es solo válida para un evento específico'
    },
    // Configuración y metadatos
    configuracion_especifica: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Configuraciones específicas para esta asignación'
    },
    metadatos_asignacion: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Metadatos adicionales sobre la asignación'
    },
    // Interacción del usuario
    fue_sugerida: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Si esta etiqueta fue sugerida automáticamente'
    },
    confianza_sugerencia: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: 0,
          msg: 'La confianza no puede ser negativa'
        },
        max: {
          args: 100,
          msg: 'La confianza no puede ser mayor a 100'
        }
      },
      comment: 'Nivel de confianza de la sugerencia automática (0-100)'
    },
    // Métricas de uso
    numero_visualizaciones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de veces que se ha mostrado esta etiqueta'
    },
    numero_clicks: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Número de veces que se ha hecho click en esta etiqueta'
    },
    ultima_visualizacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última vez que se visualizó'
    },
    ultima_interaccion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Última vez que hubo interacción'
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
    tableName: 'empresa_etiqueta',
    timestamps: false,
    underscored: false,
    indexes: [
      {
        fields: ['id_empresa', 'id_etiqueta'],
        unique: true,
        name: 'unique_empresa_etiqueta'
      },
      {
        fields: ['id_empresa']
      },
      {
        fields: ['id_etiqueta']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['origen_asignacion']
      },
      {
        fields: ['relevancia']
      },
      {
        fields: ['fecha_asignacion']
      },
      {
        fields: ['es_temporal']
      },
      {
        fields: ['fecha_fin_uso']
      },
      {
        fields: ['id_evento_asignacion']
      },
      {
        fields: ['fue_sugerida']
      }
    ],
    scopes: {
      active: {
        where: {
          deleted_at: null,
          estado: 'activa'
        }
      },
      deleted: {
        where: {
          deleted_at: { [Op.ne]: null }
        }
      },
      vigentes: {
        where: {
          deleted_at: null,
          estado: 'activa',
          [Op.or]: [
            { es_temporal: false },
            {
              [Op.and]: [
                { es_temporal: true },
                {
                  [Op.or]: [
                    { fecha_inicio_uso: null },
                    { fecha_inicio_uso: { [Op.lte]: new Date() } }
                  ]
                },
                {
                  [Op.or]: [
                    { fecha_fin_uso: null },
                    { fecha_fin_uso: { [Op.gte]: new Date() } }
                  ]
                }
              ]
            }
          ]
        }
      },
      pendientes: {
        where: {
          estado: 'pendiente_revision',
          deleted_at: null
        }
      },
      validadas: {
        where: {
          fecha_validacion: { [Op.ne]: null },
          deleted_at: null
        }
      },
      sugeridas: {
        where: {
          fue_sugerida: true,
          deleted_at: null
        }
      },
      altaRelevancia: {
        where: {
          relevancia: { [Op.gte]: 4 },
          deleted_at: null,
          estado: 'activa'
        }
      }
    }
  });

  // Métodos de instancia
  EmpresaEtiqueta.prototype.isDeleted = function() {
    return this.deleted_at !== null;
  };

  EmpresaEtiqueta.prototype.softDelete = function(deletedBy = null) {
    return this.update({
      deleted_at: new Date(),
      deleted_by: deletedBy
    });
  };

  EmpresaEtiqueta.prototype.restore = function() {
    return this.update({
      deleted_at: null,
      deleted_by: null
    });
  };

  EmpresaEtiqueta.prototype.isVigente = function() {
    if (!this.es_temporal) return true;
    
    const now = new Date();
    const inicioOk = !this.fecha_inicio_uso || this.fecha_inicio_uso <= now;
    const finOk = !this.fecha_fin_uso || this.fecha_fin_uso >= now;
    
    return inicioOk && finOk;
  };

  EmpresaEtiqueta.prototype.isValidated = function() {
    return this.fecha_validacion !== null;
  };

  EmpresaEtiqueta.prototype.validar = function(validadaPor = null) {
    return this.update({
      estado: 'activa',
      fecha_validacion: new Date(),
      validada_por: validadaPor
    });
  };

  EmpresaEtiqueta.prototype.rechazar = function(motivo = null, rechazadaPor = null) {
    return this.update({
      estado: 'rechazada',
      motivo_rechazo: motivo,
      validada_por: rechazadaPor,
      fecha_validacion: new Date()
    });
  };

  EmpresaEtiqueta.prototype.registrarVisualizacion = async function() {
    this.numero_visualizaciones += 1;
    this.ultima_visualizacion = new Date();
    await this.save();
  };

  EmpresaEtiqueta.prototype.registrarClick = async function() {
    this.numero_clicks += 1;
    this.ultima_interaccion = new Date();
    await this.save();
  };

  EmpresaEtiqueta.prototype.establecerVigenciaTemporal = function(fechaInicio, fechaFin) {
    return this.update({
      es_temporal: true,
      fecha_inicio_uso: fechaInicio,
      fecha_fin_uso: fechaFin
    });
  };

  EmpresaEtiqueta.prototype.asociarAEvento = function(eventoId) {
    return this.update({
      id_evento_asignacion: eventoId,
      es_solo_para_evento: true
    });
  };

  // Asociaciones
  EmpresaEtiqueta.associate = function(models) {
    // Relación con EmpresaExpositora
    EmpresaEtiqueta.belongsTo(models.EmpresaExpositora, {
      foreignKey: 'id_empresa',
      as: 'empresaExpositora'
    });

    // Relación con EtiquetaLibre
    EmpresaEtiqueta.belongsTo(models.EtiquetaLibre, {
      foreignKey: 'id_etiqueta',
      as: 'etiquetaLibre'
    });

    // Relación con Evento (opcional)
    EmpresaEtiqueta.belongsTo(models.Evento, {
      foreignKey: 'id_evento_asignacion',
      as: 'eventoAsignacion'
    });

    // Relación con usuario que validó
    EmpresaEtiqueta.belongsTo(models.Usuario, {
      foreignKey: 'validada_por',
      as: 'validadaPorUsuario'
    });

    // Asociaciones de auditoría
    EmpresaEtiqueta.belongsTo(models.Usuario, {
      foreignKey: 'created_by',
      as: 'createdByUser'
    });

    EmpresaEtiqueta.belongsTo(models.Usuario, {
      foreignKey: 'updated_by',
      as: 'updatedByUser'
    });

    EmpresaEtiqueta.belongsTo(models.Usuario, {
      foreignKey: 'deleted_by',
      as: 'deletedByUser'
    });
  };

  return EmpresaEtiqueta;
};
