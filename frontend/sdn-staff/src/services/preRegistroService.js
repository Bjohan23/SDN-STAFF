import axios from '../config/axios';

class PreRegistroService {
  /**
   * Crear nuevo pre-registro
   */
  static async crearPreRegistro(registroData) {
    try {
      const response = await axios.post('/api/pre-registro', registroData);
      return response.data;
    } catch (error) {
      console.error('Error creando pre-registro:', error);
      throw new Error(error.response?.data?.message || 'Error al crear el pre-registro');
    }
  }

  /**
   * Verificar duplicados
   */
  static async verificarDuplicado(email, documentoIdentidad, eventoId) {
    try {
      const response = await axios.post('/api/pre-registro/verificar-duplicado', {
        email,
        documento_identidad: documentoIdentidad,
        evento_id: eventoId
      });
      return response.data;
    } catch (error) {
      console.error('Error verificando duplicado:', error);
      throw new Error('Error al verificar duplicados');
    }
  }

  /**
   * Obtener registro por código
   */
  static async obtenerPorCodigo(codigoRegistro) {
    try {
      const response = await axios.get(`/api/pre-registro/codigo/${codigoRegistro}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo registro:', error);
      throw new Error('Registro no encontrado');
    }
  }

  /**
   * Reenviar email de confirmación
   */
  static async reenviarConfirmacion(registroId) {
    try {
      const response = await axios.post(`/api/pre-registro/${registroId}/enviar-confirmacion`);
      return response.data;
    } catch (error) {
      console.error('Error reenviando confirmación:', error);
      throw new Error('Error al reenviar confirmación');
    }
  }

  /**
   * Listar registros de un evento (admin)
   */
  static async listarPorEvento(eventoId, filtros = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo_participacion) params.append('tipo_participacion', filtros.tipo_participacion);
      if (filtros.search) params.append('search', filtros.search);

      const response = await axios.get(`/api/pre-registro/evento/${eventoId}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error listando registros:', error);
      throw new Error('Error al obtener los registros');
    }
  }

  /**
   * Actualizar estado del registro
   */
  static async actualizarEstado(registroId, estado, motivo = null) {
    try {
      const data = { estado };
      if (motivo) data.motivo = motivo;

      const response = await axios.put(`/api/pre-registro/${registroId}/estado`, data);
      return response.data;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      throw new Error('Error al actualizar el estado');
    }
  }

  /**
   * Obtener estadísticas de registros
   */
  static async obtenerEstadisticas(eventoId) {
    try {
      const response = await axios.get(`/api/pre-registro/evento/${eventoId}/estadisticas`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }

  /**
   * Exportar registros a Excel
   */
  static async exportarExcel(eventoId, formato = 'xlsx') {
    try {
      const response = await axios.get(`/api/pre-registro/evento/${eventoId}/exportar`, {
        params: { formato },
        responseType: 'blob'
      });

      // Crear y descargar archivo
      const blob = new Blob([response.data], { 
        type: formato === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pre-registros-${eventoId}-${new Date().toISOString().split('T')[0]}.${formato}`;
      link.click();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exportando registros:', error);
      throw new Error('Error al exportar registros');
    }
  }

  /**
   * Validar datos del formulario
   */
  static validarFormulario(formData, paso) {
    const errores = {};

    switch (paso) {
      case 1: // Datos personales
        if (!formData.nombre?.trim()) {
          errores.nombre = 'El nombre es requerido';
        }
        
        if (!formData.apellidos?.trim()) {
          errores.apellidos = 'Los apellidos son requeridos';
        }
        
        if (!formData.email?.trim()) {
          errores.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errores.email = 'Email inválido';
        }
        
        if (!formData.telefono?.trim()) {
          errores.telefono = 'El teléfono es requerido';
        }
        
        if (!formData.documento_identidad?.trim()) {
          errores.documento_identidad = 'El documento es requerido';
        }
        break;

      case 2: // Datos profesionales
        if (!formData.empresa?.trim()) {
          errores.empresa = 'La empresa es requerida';
        }
        
        if (!formData.cargo?.trim()) {
          errores.cargo = 'El cargo es requerido';
        }
        
        if (!formData.sector_empresa) {
          errores.sector_empresa = 'El sector es requerido';
        }

        // Validar participantes adicionales si es registro grupal
        if (formData.es_registro_grupal && formData.participantes_adicionales) {
          formData.participantes_adicionales.forEach((participante, index) => {
            if (!participante.nombre?.trim()) {
              errores[`participante_${index}_nombre`] = 'Nombre requerido';
            }
            if (!participante.apellidos?.trim()) {
              errores[`participante_${index}_apellidos`] = 'Apellidos requeridos';
            }
            if (!participante.email?.trim()) {
              errores[`participante_${index}_email`] = 'Email requerido';
            } else if (!/\S+@\S+\.\S+/.test(participante.email)) {
              errores[`participante_${index}_email`] = 'Email inválido';
            }
          });
        }
        break;

      case 3: // Preferencias del evento
        if (!formData.intereses || formData.intereses.length === 0) {
          errores.intereses = 'Selecciona al menos un interés';
        }
        
        if (!formData.como_se_entero) {
          errores.como_se_entero = 'Indica cómo te enteraste';
        }
        break;

      case 4: // Términos y condiciones
        if (!formData.acepta_terminos) {
          errores.acepta_terminos = 'Debes aceptar los términos y condiciones';
        }
        break;
    }

    return errores;
  }

  /**
   * Formatear datos para envío
   */
  static formatearDatosEnvio(formData) {
    return {
      ...formData,
      // Normalizar email
      email: formData.email?.toLowerCase().trim(),
      
      // Asegurar que los arrays estén definidos
      intereses: Array.isArray(formData.intereses) ? formData.intereses : [],
      participantes_adicionales: Array.isArray(formData.participantes_adicionales) 
        ? formData.participantes_adicionales.filter(p => p.nombre && p.apellidos && p.email)
        : [],
      
      // Normalizar booleanos
      acepta_terminos: !!formData.acepta_terminos,
      acepta_marketing: !!formData.acepta_marketing,
      es_registro_grupal: !!formData.es_registro_grupal,
      
      // Limpiar campos vacíos
      fecha_nacimiento: formData.fecha_nacimiento || null,
      genero: formData.genero || null,
      anos_experiencia: formData.anos_experiencia || null,
      expectativas: formData.expectativas?.trim() || null,
      necesidades_especiales: formData.necesidades_especiales?.trim() || null,
      comentarios: formData.comentarios?.trim() || null
    };
  }

  /**
   * Obtener opciones de configuración
   */
  static obtenerOpciones() {
    return {
      tiposDocumento: [
        { value: 'cedula', label: 'Cédula de Identidad' },
        { value: 'pasaporte', label: 'Pasaporte' },
        { value: 'ruc', label: 'RUC' },
        { value: 'otro', label: 'Otro' }
      ],
      
      sectoresEmpresa: [
        'Tecnología', 'Salud', 'Educación', 'Finanzas', 'Manufactura',
        'Comercio', 'Servicios', 'Agricultura', 'Turismo', 'Construcción',
        'Transporte', 'Comunicaciones', 'Energía', 'Otro'
      ],
      
      tiposParticipacion: [
        { value: 'visitante', label: 'Visitante General', precio: 0 },
        { value: 'profesional', label: 'Profesional', precio: 50 },
        { value: 'estudiante', label: 'Estudiante', precio: 25 },
        { value: 'vip', label: 'VIP', precio: 150 },
        { value: 'prensa', label: 'Prensa', precio: 0 }
      ],
      
      interesesDisponibles: [
        'Tecnología', 'Negocios', 'Marketing', 'Ventas', 'Innovación',
        'Sostenibilidad', 'Liderazgo', 'Networking', 'Educación', 'Salud'
      ],
      
      comoSeEntero: [
        'Redes sociales', 'Página web', 'Email marketing', 'Recomendación',
        'Medios de comunicación', 'Evento anterior', 'Publicidad', 'Otro'
      ],
      
      estadosRegistro: [
        { value: 'pendiente', label: 'Pendiente', color: 'yellow' },
        { value: 'confirmado', label: 'Confirmado', color: 'blue' },
        { value: 'pendiente_pago', label: 'Pendiente Pago', color: 'orange' },
        { value: 'pagado', label: 'Pagado', color: 'green' },
        { value: 'cancelado', label: 'Cancelado', color: 'red' },
        { value: 'presente', label: 'Presente', color: 'purple' },
        { value: 'no_asistio', label: 'No Asistió', color: 'gray' }
      ]
    };
  }

  /**
   * Calcular precio total del registro
   */
  static calcularPrecioTotal(tipoParticipacion, esGrupal = false, numParticipantes = 1) {
    const opciones = this.obtenerOpciones();
    const tipo = opciones.tiposParticipacion.find(t => t.value === tipoParticipacion);
    const precioBase = tipo?.precio || 0;
    const cantidad = esGrupal ? numParticipantes : 1;
    
    return precioBase * cantidad;
  }

  /**
   * Generar resumen del registro
   */
  static generarResumen(formData) {
    const opciones = this.obtenerOpciones();
    const tipoParticipacion = opciones.tiposParticipacion.find(t => t.value === formData.tipo_participacion);
    const precioTotal = this.calcularPrecioTotal(
      formData.tipo_participacion,
      formData.es_registro_grupal,
      1 + (formData.participantes_adicionales?.length || 0)
    );

    return {
      participante_principal: {
        nombre_completo: `${formData.nombre} ${formData.apellidos}`,
        email: formData.email,
        empresa: formData.empresa,
        cargo: formData.cargo
      },
      tipo_participacion: tipoParticipacion?.label || formData.tipo_participacion,
      total_participantes: 1 + (formData.es_registro_grupal ? (formData.participantes_adicionales?.length || 0) : 0),
      precio_total: precioTotal,
      requiere_pago: precioTotal > 0,
      participantes_adicionales: formData.es_registro_grupal ? formData.participantes_adicionales : [],
      intereses: formData.intereses || [],
      acepta_marketing: formData.acepta_marketing
    };
  }

  /**
   * Obtener estado con color y descripción
   */
  static obtenerEstadoInfo(estado) {
    const opciones = this.obtenerOpciones();
    return opciones.estadosRegistro.find(e => e.value === estado) || {
      value: estado,
      label: estado,
      color: 'gray'
    };
  }

  /**
   * Validar código de registro
   */
  static validarCodigoRegistro(codigo) {
    // Formato: REG-XXXXXXXXX-XXXXX
    const regex = /^REG-[A-Z0-9]+-[A-Z0-9]+$/;
    return regex.test(codigo);
  }

  /**
   * Formatear fecha para mostrar
   */
  static formatearFecha(fecha, incluirHora = false) {
    if (!fecha) return '';
    
    const date = new Date(fecha);
    const opciones = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    if (incluirHora) {
      opciones.hour = '2-digit';
      opciones.minute = '2-digit';
    }
    
    return date.toLocaleDateString('es-ES', opciones);
  }

  /**
   * Obtener próximos eventos con pre-registro disponible
   */
  static async obtenerEventosDisponibles() {
    try {
      const response = await axios.get('/api/eventos/publicos/pre-registro-disponible');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo eventos disponibles:', error);
      throw new Error('Error al obtener eventos disponibles');
    }
  }

  /**
   * Buscar registros (para autocomplete)
   */
  static async buscarRegistros(query, eventoId = null) {
    try {
      const params = new URLSearchParams({ search: query });
      if (eventoId) params.append('evento_id', eventoId);
      
      const response = await axios.get(`/api/pre-registro/buscar?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error buscando registros:', error);
      throw new Error('Error en la búsqueda');
    }
  }
}

export default PreRegistroService;