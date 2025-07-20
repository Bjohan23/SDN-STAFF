const { PreRegistro, Evento, Usuario } = require('../models');
const { Op } = require('sequelize');
const QRGeneratorService = require('../services/QRGeneratorService');
const EmailService = require('../services/EmailService');
const { v4: uuidv4 } = require('uuid');

class PreRegistroController {
  /**
   * Crear nuevo pre-registro
   */
  static async crear(req, res) {
    try {
      const {
        evento_id,
        // Datos personales
        nombre,
        apellidos,
        email,
        telefono,
        documento_identidad,
        tipo_documento,
        fecha_nacimiento,
        genero,
        // Datos profesionales
        empresa,
        cargo,
        sector_empresa,
        anos_experiencia,
        // Datos del evento
        tipo_participacion,
        intereses,
        expectativas,
        como_se_entero,
        // Datos adicionales
        necesidades_especiales,
        comentarios,
        acepta_terminos,
        acepta_marketing,
        // Para registro grupal
        es_registro_grupal,
        participantes_adicionales
      } = req.body;

      // Validar que el evento existe y permite pre-registro
      const evento = await Evento.findByPk(evento_id);
      if (!evento) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado'
        });
      }

      if (!evento.permite_pre_registro) {
        return res.status(400).json({
          success: false,
          message: 'Este evento no permite pre-registro'
        });
      }

      // Verificar si las fechas de registro están abiertas
      const ahora = new Date();
      if (evento.fecha_inicio_registro && ahora < new Date(evento.fecha_inicio_registro)) {
        return res.status(400).json({
          success: false,
          message: 'El registro aún no está disponible'
        });
      }

      if (evento.fecha_fin_registro && ahora > new Date(evento.fecha_fin_registro)) {
        return res.status(400).json({
          success: false,
          message: 'El período de registro ha terminado'
        });
      }

      // Verificar duplicados
      const existeRegistro = await PreRegistro.findOne({
        where: {
          evento_id,
          [Op.or]: [
            { email },
            { documento_identidad }
          ],
          estado: { [Op.ne]: 'cancelado' }
        }
      });

      if (existeRegistro) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un registro con este email o documento para este evento'
        });
      }

      // Generar código único de registro
      const codigoRegistro = PreRegistroController.generarCodigoRegistro();

      // Crear el pre-registro principal
      const preRegistro = await PreRegistro.create({
        evento_id,
        codigo_registro: codigoRegistro,
        // Datos personales
        nombre,
        apellidos,
        email,
        telefono,
        documento_identidad,
        tipo_documento: tipo_documento || 'cedula',
        fecha_nacimiento,
        genero,
        // Datos profesionales
        empresa,
        cargo,
        sector_empresa,
        anos_experiencia,
        // Datos del evento
        tipo_participacion: tipo_participacion || 'visitante',
        intereses: Array.isArray(intereses) ? intereses : [],
        expectativas,
        como_se_entero,
        // Datos adicionales
        necesidades_especiales,
        comentarios,
        acepta_terminos: !!acepta_terminos,
        acepta_marketing: !!acepta_marketing,
        // Estado y metadatos
        estado: 'confirmado',
        fecha_registro: new Date(),
        ip_registro: req.ip,
        user_agent: req.get('User-Agent'),
        // Registro grupal
        es_registro_grupal: !!es_registro_grupal,
        numero_participantes: 1 + (es_registro_grupal ? (participantes_adicionales?.length || 0) : 0)
      });

      // Crear registros para participantes adicionales si es registro grupal
      const participantesCreados = [];
      if (es_registro_grupal && participantes_adicionales?.length > 0) {
        for (const participante of participantes_adicionales) {
          if (participante.nombre && participante.apellidos && participante.email) {
            const codigoParticipante = PreRegistroController.generarCodigoRegistro();
            
            const participanteRegistro = await PreRegistro.create({
              evento_id,
              codigo_registro: codigoParticipante,
              registro_principal_id: preRegistro.id,
              // Datos del participante
              nombre: participante.nombre,
              apellidos: participante.apellidos,
              email: participante.email,
              empresa: participante.empresa || empresa,
              cargo: participante.cargo || cargo,
              sector_empresa,
              // Heredar configuraciones del registro principal
              tipo_participacion,
              acepta_terminos: true,
              acepta_marketing: false,
              // Estado
              estado: 'confirmado',
              fecha_registro: new Date(),
              ip_registro: req.ip,
              user_agent: req.get('User-Agent'),
              es_registro_grupal: false,
              numero_participantes: 1
            });
            
            participantesCreados.push(participanteRegistro);
          }
        }
      }

      // Generar QR para el registro principal
      const qrData = {
        registro_id: preRegistro.id,
        codigo: codigoRegistro,
        evento_id,
        tipo: 'pre_registro',
        timestamp: Date.now()
      };

      const qrCode = await QRGeneratorService.generarQR(qrData, {
        tipo_credencial: tipo_participacion,
        incluir_logo: true
      });

      // Actualizar el registro con el QR
      await preRegistro.update({
        codigo_qr: qrCode.qr_data,
        url_qr: qrCode.qr_url
      });

      // Preparar respuesta
      const response = {
        id: preRegistro.id,
        codigo_registro: codigoRegistro,
        estado: preRegistro.estado,
        tipo_participacion: preRegistro.tipo_participacion,
        qr_code: qrCode.qr_data,
        participantes_adicionales: participantesCreados.map(p => ({
          id: p.id,
          codigo_registro: p.codigo_registro,
          nombre: p.nombre,
          apellidos: p.apellidos,
          email: p.email
        }))
      };

      res.status(201).json({
        success: true,
        message: 'Pre-registro creado exitosamente',
        data: response
      });

      // Enviar email de confirmación (asíncrono)
      setImmediate(async () => {
        try {
          await PreRegistroController.enviarEmailConfirmacion(preRegistro, evento, qrCode);
          
          // Enviar emails a participantes adicionales
          for (const participante of participantesCreados) {
            const qrParticipante = await QRGeneratorService.generarQR({
              registro_id: participante.id,
              codigo: participante.codigo_registro,
              evento_id,
              tipo: 'pre_registro',
              timestamp: Date.now()
            }, {
              tipo_credencial: tipo_participacion,
              incluir_logo: true
            });
            
            await participante.update({
              codigo_qr: qrParticipante.qr_data,
              url_qr: qrParticipante.qr_url
            });
            
            await PreRegistroController.enviarEmailConfirmacion(participante, evento, qrParticipante);
          }
        } catch (emailError) {
          console.error('Error enviando emails de confirmación:', emailError);
        }
      });

    } catch (error) {
      console.error('Error creando pre-registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Verificar si existe duplicado
   */
  static async verificarDuplicado(req, res) {
    try {
      const { email, documento_identidad, evento_id } = req.body;

      const existeRegistro = await PreRegistro.findOne({
        where: {
          evento_id,
          [Op.or]: [
            { email },
            { documento_identidad }
          ],
          estado: { [Op.ne]: 'cancelado' }
        }
      });

      res.json({
        success: true,
        existe: !!existeRegistro,
        data: existeRegistro ? {
          id: existeRegistro.id,
          codigo_registro: existeRegistro.codigo_registro,
          estado: existeRegistro.estado
        } : null
      });

    } catch (error) {
      console.error('Error verificando duplicado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener pre-registro por código
   */
  static async obtenerPorCodigo(req, res) {
    try {
      const { codigo } = req.params;

      const preRegistro = await PreRegistro.findOne({
        where: { codigo_registro: codigo },
        include: [
          {
            model: Evento,
            attributes: ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'ubicacion']
          }
        ]
      });

      if (!preRegistro) {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      }

      res.json({
        success: true,
        data: preRegistro
      });

    } catch (error) {
      console.error('Error obteniendo pre-registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Listar pre-registros de un evento
   */
  static async listarPorEvento(req, res) {
    try {
      const { eventoId } = req.params;
      const { 
        page = 1, 
        limit = 50, 
        estado, 
        tipo_participacion,
        search 
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const whereClause = { evento_id: eventoId };
      
      if (estado) {
        whereClause.estado = estado;
      }
      
      if (tipo_participacion) {
        whereClause.tipo_participacion = tipo_participacion;
      }
      
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { apellidos: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { empresa: { [Op.iLike]: `%${search}%` } },
          { codigo_registro: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { rows: registros, count: total } = await PreRegistro.findAndCountAll({
        where: whereClause,
        order: [['fecha_registro', 'DESC']],
        limit: parseInt(limit),
        offset,
        include: [
          {
            model: Evento,
            attributes: ['id', 'nombre']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          registros,
          pagination: {
            current_page: parseInt(page),
            per_page: parseInt(limit),
            total,
            total_pages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('Error listando pre-registros:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar estado del pre-registro
   */
  static async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado, motivo } = req.body;

      const preRegistro = await PreRegistro.findByPk(id);
      if (!preRegistro) {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      }

      const estadosPermitidos = ['confirmado', 'pendiente_pago', 'pagado', 'cancelado', 'presente'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      await preRegistro.update({
        estado,
        motivo_cancelacion: estado === 'cancelado' ? motivo : null,
        fecha_actualizacion: new Date()
      });

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: preRegistro
      });

    } catch (error) {
      console.error('Error actualizando estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Enviar email de confirmación
   */
  static async enviarConfirmacion(req, res) {
    try {
      const { id } = req.params;

      const preRegistro = await PreRegistro.findByPk(id, {
        include: [
          {
            model: Evento,
            attributes: ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'ubicacion', 'descripcion']
          }
        ]
      });

      if (!preRegistro) {
        return res.status(404).json({
          success: false,
          message: 'Registro no encontrado'
        });
      }

      // Regenerar QR si no existe
      let qrCode = null;
      if (!preRegistro.codigo_qr) {
        const qrData = {
          registro_id: preRegistro.id,
          codigo: preRegistro.codigo_registro,
          evento_id: preRegistro.evento_id,
          tipo: 'pre_registro',
          timestamp: Date.now()
        };

        qrCode = await QRGeneratorService.generarQR(qrData, {
          tipo_credencial: preRegistro.tipo_participacion,
          incluir_logo: true
        });

        await preRegistro.update({
          codigo_qr: qrCode.qr_data,
          url_qr: qrCode.qr_url
        });
      } else {
        qrCode = {
          qr_data: preRegistro.codigo_qr,
          qr_url: preRegistro.url_qr
        };
      }

      // Enviar email
      await PreRegistroController.enviarEmailConfirmacion(preRegistro, preRegistro.Evento, qrCode);

      res.json({
        success: true,
        message: 'Email de confirmación enviado exitosamente'
      });

    } catch (error) {
      console.error('Error enviando confirmación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas de pre-registros
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const { eventoId } = req.params;

      // Total de registros
      const totalRegistros = await PreRegistro.count({
        where: { evento_id: eventoId }
      });

      // Por estado
      const porEstado = await PreRegistro.findAll({
        where: { evento_id: eventoId },
        attributes: [
          'estado',
          [require('sequelize').fn('COUNT', '*'), 'cantidad']
        ],
        group: ['estado'],
        raw: true
      });

      // Por tipo de participación
      const porTipo = await PreRegistro.findAll({
        where: { evento_id: eventoId },
        attributes: [
          'tipo_participacion',
          [require('sequelize').fn('COUNT', '*'), 'cantidad']
        ],
        group: ['tipo_participacion'],
        raw: true
      });

      // Por fecha (últimos 30 días)
      const hace30Dias = new Date();
      hace30Dias.setDate(hace30Dias.getDate() - 30);

      const porFecha = await PreRegistro.findAll({
        where: {
          evento_id: eventoId,
          fecha_registro: { [Op.gte]: hace30Dias }
        },
        attributes: [
          [require('sequelize').fn('DATE', require('sequelize').col('fecha_registro')), 'fecha'],
          [require('sequelize').fn('COUNT', '*'), 'cantidad']
        ],
        group: [require('sequelize').fn('DATE', require('sequelize').col('fecha_registro'))],
        order: [[require('sequelize').fn('DATE', require('sequelize').col('fecha_registro')), 'ASC']],
        raw: true
      });

      // Registros grupales
      const registrosGrupales = await PreRegistro.count({
        where: { 
          evento_id: eventoId,
          es_registro_grupal: true
        }
      });

      const totalParticipantes = await PreRegistro.sum('numero_participantes', {
        where: { evento_id: eventoId }
      });

      res.json({
        success: true,
        data: {
          total_registros: totalRegistros,
          total_participantes: totalParticipantes || 0,
          registros_grupales: registrosGrupales,
          por_estado: porEstado,
          por_tipo: porTipo,
          por_fecha: porFecha
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Exportar registros a Excel
   */
  static async exportarExcel(req, res) {
    try {
      const { eventoId } = req.params;
      const { formato = 'xlsx' } = req.query;

      const registros = await PreRegistro.findAll({
        where: { evento_id: eventoId },
        include: [
          {
            model: Evento,
            attributes: ['nombre', 'fecha_inicio']
          }
        ],
        order: [['fecha_registro', 'DESC']]
      });

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Pre-registros');

      // Encabezados
      worksheet.columns = [
        { header: 'Código', key: 'codigo_registro', width: 15 },
        { header: 'Nombre', key: 'nombre', width: 20 },
        { header: 'Apellidos', key: 'apellidos', width: 20 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Documento', key: 'documento_identidad', width: 15 },
        { header: 'Empresa', key: 'empresa', width: 25 },
        { header: 'Cargo', key: 'cargo', width: 20 },
        { header: 'Tipo Participación', key: 'tipo_participacion', width: 18 },
        { header: 'Estado', key: 'estado', width: 12 },
        { header: 'Fecha Registro', key: 'fecha_registro', width: 18 },
        { header: 'Intereses', key: 'intereses', width: 30 }
      ];

      // Datos
      registros.forEach(registro => {
        worksheet.addRow({
          codigo_registro: registro.codigo_registro,
          nombre: registro.nombre,
          apellidos: registro.apellidos,
          email: registro.email,
          telefono: registro.telefono,
          documento_identidad: registro.documento_identidad,
          empresa: registro.empresa,
          cargo: registro.cargo,
          tipo_participacion: registro.tipo_participacion,
          estado: registro.estado,
          fecha_registro: registro.fecha_registro,
          intereses: Array.isArray(registro.intereses) ? registro.intereses.join(', ') : ''
        });
      });

      // Estilo del encabezado
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };

      // Configurar respuesta
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="pre-registros-${eventoId}-${new Date().toISOString().split('T')[0]}.xlsx"`
      );

      await workbook.xlsx.write(res);
      res.end();

    } catch (error) {
      console.error('Error exportando a Excel:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Generar código único de registro
   */
  static generarCodigoRegistro() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `REG-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Enviar email de confirmación (método auxiliar)
   */
  static async enviarEmailConfirmacion(preRegistro, evento, qrCode) {
    try {
      const EmailService = require('../services/EmailService');
      
      const templateData = {
        nombre: preRegistro.nombre,
        apellidos: preRegistro.apellidos,
        codigo_registro: preRegistro.codigo_registro,
        evento: {
          nombre: evento.nombre,
          fecha_inicio: evento.fecha_inicio,
          fecha_fin: evento.fecha_fin,
          ubicacion: evento.ubicacion
        },
        tipo_participacion: preRegistro.tipo_participacion,
        qr_code: qrCode.qr_data
      };

      await EmailService.enviarEmail({
        to: preRegistro.email,
        subject: `Confirmación de registro - ${evento.nombre}`,
        template: 'confirmacion-pre-registro',
        data: templateData,
        attachments: [
          {
            filename: `qr-${preRegistro.codigo_registro}.png`,
            content: qrCode.qr_data.split(',')[1],
            encoding: 'base64',
            cid: 'qr-code'
          }
        ]
      });

    } catch (error) {
      console.error('Error enviando email de confirmación:', error);
      throw error;
    }
  }
}

module.exports = PreRegistroController;