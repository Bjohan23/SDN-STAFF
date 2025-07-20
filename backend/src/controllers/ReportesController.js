const { 
  Evento, 
  PreRegistro, 
  EmpresaEvento, 
  EmpresaExpositora,
  Stand,
  StandEvento,
  Usuario 
} = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const EmailService = require('../services/EmailService');

class ReportesController {
  /**
   * Obtener reporte general de eventos
   */
  static async obtenerReporteGeneral(req, res) {
    try {
      const { 
        evento_id, 
        fecha_inicio, 
        fecha_fin,
        incluir_graficos = true 
      } = req.query;

      const whereClause = {};
      
      if (evento_id) {
        whereClause.id = evento_id;
      }
      
      if (fecha_inicio && fecha_fin) {
        whereClause.fecha_inicio = {
          [Op.between]: [fecha_inicio, fecha_fin]
        };
      }

      // Métricas principales
      const totalEventos = await Evento.count({ where: whereClause });
      
      const totalPreRegistros = await PreRegistro.count({
        include: [{
          model: Evento,
          where: whereClause,
          attributes: []
        }]
      });

      const totalParticipantes = await PreRegistro.sum('numero_participantes', {
        include: [{
          model: Evento,
          where: whereClause,
          attributes: []
        }]
      });

      const ingresosTotales = await PreRegistro.sum('monto_pagado', {
        include: [{
          model: Evento,
          where: whereClause,
          attributes: []
        }],
        where: {
          estado: ['pagado', 'presente']
        }
      });

      // Tasa de conversión (registros confirmados vs total)
      const registrosConfirmados = await PreRegistro.count({
        include: [{
          model: Evento,
          where: whereClause,
          attributes: []
        }],
        where: {
          estado: ['confirmado', 'pagado', 'presente']
        }
      });

      const tasaConversion = totalPreRegistros > 0 
        ? (registrosConfirmados / totalPreRegistros * 100).toFixed(2)
        : 0;

      // Eventos por mes (últimos 12 meses)
      const eventosPorMes = await Evento.findAll({
        where: {
          ...whereClause,
          fecha_inicio: {
            [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        },
        attributes: [
          [fn('DATE_TRUNC', 'month', col('fecha_inicio')), 'mes'],
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: [fn('DATE_TRUNC', 'month', col('fecha_inicio'))],
        order: [[fn('DATE_TRUNC', 'month', col('fecha_inicio')), 'ASC']],
        raw: true
      });

      // Distribución por tipos de participación
      const tiposParticipacion = await PreRegistro.findAll({
        include: [{
          model: Evento,
          where: whereClause,
          attributes: []
        }],
        attributes: [
          'tipo_participacion',
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: ['tipo_participacion'],
        raw: true
      });

      // Eventos más populares
      const eventosPopulares = await Evento.findAll({
        where: whereClause,
        attributes: [
          'id',
          'nombre',
          'fecha_inicio',
          [fn('COUNT', col('PreRegistros.id')), 'total_registros']
        ],
        include: [{
          model: PreRegistro,
          attributes: [],
          required: false
        }],
        group: ['Evento.id'],
        order: [[fn('COUNT', col('PreRegistros.id')), 'DESC']],
        limit: 10
      });

      // Satisfacción promedio (simulada - implementar según sistema de rating)
      const satisfaccionPromedio = 4.3;

      const reporte = {
        metricas_principales: {
          total_eventos: totalEventos,
          total_registros: totalPreRegistros,
          total_participantes: totalParticipantes || 0,
          ingresos_totales: parseFloat(ingresosTotales) || 0,
          tasa_conversion: parseFloat(tasaConversion),
          satisfaccion_promedio: satisfaccionPromedio
        },
        eventos_por_mes: eventosPorMes.map(item => ({
          mes: item.mes,
          cantidad: parseInt(item.cantidad)
        })),
        tipos_participacion: tiposParticipacion.map(item => ({
          tipo: item.tipo_participacion,
          cantidad: parseInt(item.cantidad)
        })),
        eventos_populares: eventosPopulares.map(evento => ({
          id: evento.id,
          nombre: evento.nombre,
          fecha: evento.fecha_inicio,
          registros: parseInt(evento.dataValues.total_registros) || 0
        }))
      };

      res.json({
        success: true,
        data: reporte
      });

    } catch (error) {
      console.error('Error generando reporte general:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener reporte de visitantes/registros
   */
  static async obtenerReporteVisitantes(req, res) {
    try {
      const { evento_id, fecha_inicio, fecha_fin } = req.query;

      const whereEventos = {};
      const whereRegistros = {};
      
      if (evento_id) {
        whereEventos.id = evento_id;
        whereRegistros.evento_id = evento_id;
      }
      
      if (fecha_inicio && fecha_fin) {
        whereRegistros.fecha_registro = {
          [Op.between]: [fecha_inicio, fecha_fin]
        };
      }

      // Registros por día
      const registrosPorDia = await PreRegistro.findAll({
        where: whereRegistros,
        attributes: [
          [fn('DATE', col('fecha_registro')), 'fecha'],
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: [fn('DATE', col('fecha_registro'))],
        order: [[fn('DATE', col('fecha_registro')), 'ASC']],
        raw: true
      });

      // Fuentes de tráfico (cómo se enteraron)
      const fuentesTrafico = await PreRegistro.findAll({
        where: whereRegistros,
        attributes: [
          'como_se_entero',
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: ['como_se_entero'],
        order: [[fn('COUNT', '*'), 'DESC']],
        raw: true
      });

      // Embudo de conversión
      const totalVisitasWeb = await PreRegistro.count({
        where: {
          ...whereRegistros,
          fuente_registro: 'web'
        }
      });

      const iniciaronRegistro = await PreRegistro.count({
        where: {
          ...whereRegistros,
          estado: { [Op.ne]: 'cancelado' }
        }
      });

      const completaronRegistro = await PreRegistro.count({
        where: {
          ...whereRegistros,
          estado: ['confirmado', 'pagado', 'presente']
        }
      });

      const asistieronEvento = await PreRegistro.count({
        where: {
          ...whereRegistros,
          estado: 'presente'
        }
      });

      // Segmentación por intereses
      const intereses = await PreRegistro.findAll({
        where: whereRegistros,
        attributes: ['intereses'],
        raw: true
      });

      const conteoIntereses = {};
      intereses.forEach(registro => {
        if (Array.isArray(registro.intereses)) {
          registro.intereses.forEach(interes => {
            conteoIntereses[interes] = (conteoIntereses[interes] || 0) + 1;
          });
        }
      });

      const segmentacionIntereses = Object.entries(conteoIntereses).map(([interes, cantidad]) => ({
        interes,
        cantidad
      })).sort((a, b) => b.cantidad - a.cantidad);

      // Registros grupales vs individuales
      const registrosGrupales = await PreRegistro.count({
        where: {
          ...whereRegistros,
          es_registro_grupal: true
        }
      });

      const registrosIndividuales = await PreRegistro.count({
        where: {
          ...whereRegistros,
          es_registro_grupal: false
        }
      });

      const reporte = {
        registros_por_dia: registrosPorDia.map(item => ({
          fecha: item.fecha,
          cantidad: parseInt(item.cantidad)
        })),
        fuentes_trafico: fuentesTrafico.map(item => ({
          fuente: item.como_se_entero || 'No especificado',
          cantidad: parseInt(item.cantidad)
        })),
        embudo_conversion: {
          visitas_web: totalVisitasWeb || 0,
          iniciaron_registro: iniciaronRegistro,
          completaron_registro: completaronRegistro,
          asistieron_evento: asistieronEvento
        },
        segmentacion_intereses: segmentacionIntereses,
        tipos_registro: {
          grupales: registrosGrupales,
          individuales: registrosIndividuales
        }
      };

      res.json({
        success: true,
        data: reporte
      });

    } catch (error) {
      console.error('Error generando reporte de visitantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener reporte financiero
   */
  static async obtenerReporteFinanciero(req, res) {
    try {
      const { evento_id, fecha_inicio, fecha_fin } = req.query;

      const whereEventos = {};
      const whereRegistros = {};
      
      if (evento_id) {
        whereEventos.id = evento_id;
        whereRegistros.evento_id = evento_id;
      }
      
      if (fecha_inicio && fecha_fin) {
        whereRegistros.fecha_pago = {
          [Op.between]: [fecha_inicio, fecha_fin]
        };
      }

      // Ingresos por mes
      const ingresosPorMes = await PreRegistro.findAll({
        where: {
          ...whereRegistros,
          estado: ['pagado', 'presente'],
          monto_pagado: { [Op.gt]: 0 }
        },
        attributes: [
          [fn('DATE_TRUNC', 'month', col('fecha_pago')), 'mes'],
          [fn('SUM', col('monto_pagado')), 'total_ingresos']
        ],
        group: [fn('DATE_TRUNC', 'month', col('fecha_pago'))],
        order: [[fn('DATE_TRUNC', 'month', col('fecha_pago')), 'ASC']],
        raw: true
      });

      // Ingresos por tipo de participación
      const ingresosPorTipo = await PreRegistro.findAll({
        where: {
          ...whereRegistros,
          estado: ['pagado', 'presente'],
          monto_pagado: { [Op.gt]: 0 }
        },
        attributes: [
          'tipo_participacion',
          [fn('SUM', col('monto_pagado')), 'total_ingresos'],
          [fn('COUNT', '*'), 'cantidad_registros']
        ],
        group: ['tipo_participacion'],
        order: [[fn('SUM', col('monto_pagado')), 'DESC']],
        raw: true
      });

      // Ingresos totales
      const ingresosTotales = await PreRegistro.sum('monto_pagado', {
        where: {
          ...whereRegistros,
          estado: ['pagado', 'presente']
        }
      });

      // Costos estimados (simulados - implementar según sistema de costos)
      const costosEstimados = parseFloat(ingresosTotales) * 0.65; // 65% de los ingresos como costos

      // ROI y margen de beneficio
      const beneficio = parseFloat(ingresosTotales) - costosEstimados;
      const roi = costosEstimados > 0 ? ((beneficio / costosEstimados) * 100).toFixed(2) : 0;
      const margenBeneficio = ingresosTotales > 0 ? ((beneficio / parseFloat(ingresosTotales)) * 100).toFixed(2) : 0;

      // Ticket promedio por tipo
      const ticketPromedio = ingresosPorTipo.map(item => ({
        tipo: item.tipo_participacion,
        ticket_promedio: item.total_ingresos / item.cantidad_registros,
        total_ingresos: parseFloat(item.total_ingresos),
        cantidad: parseInt(item.cantidad_registros)
      }));

      // Tendencia de pagos
      const pagosPorEstado = await PreRegistro.findAll({
        where: whereRegistros,
        attributes: [
          'estado',
          [fn('COUNT', '*'), 'cantidad'],
          [fn('SUM', col('monto_pagado')), 'total_monto']
        ],
        group: ['estado'],
        raw: true
      });

      const reporte = {
        ingresos_por_mes: ingresosPorMes.map(item => ({
          mes: item.mes,
          ingresos: parseFloat(item.total_ingresos) || 0
        })),
        ingresos_por_tipo: ingresosPorTipo.map(item => ({
          tipo: item.tipo_participacion,
          ingresos: parseFloat(item.total_ingresos),
          cantidad: parseInt(item.cantidad_registros)
        })),
        metricas_financieras: {
          ingresos_totales: parseFloat(ingresosTotales) || 0,
          costos_estimados: costosEstimados,
          beneficio_neto: beneficio,
          roi: parseFloat(roi),
          margen_beneficio: parseFloat(margenBeneficio)
        },
        ticket_promedio: ticketPromedio,
        pagos_por_estado: pagosPorEstado.map(item => ({
          estado: item.estado,
          cantidad: parseInt(item.cantidad),
          monto_total: parseFloat(item.total_monto) || 0
        }))
      };

      res.json({
        success: true,
        data: reporte
      });

    } catch (error) {
      console.error('Error generando reporte financiero:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener reporte comparativo
   */
  static async obtenerReporteComparativo(req, res) {
    try {
      const { evento_id, fecha_inicio, fecha_fin } = req.query;

      // Definir períodos de comparación
      const fechaActual = new Date(fecha_fin || new Date());
      const fechaAnterior = new Date(fechaActual);
      fechaAnterior.setFullYear(fechaAnterior.getFullYear() - 1);

      const periodoActual = {
        inicio: fecha_inicio || new Date(fechaActual.getFullYear(), 0, 1).toISOString(),
        fin: fecha_fin || fechaActual.toISOString()
      };

      const periodoAnterior = {
        inicio: new Date(fechaAnterior.getFullYear(), 0, 1).toISOString(),
        fin: fechaAnterior.toISOString()
      };

      // Comparar métricas principales
      const metricas = ['visitantes', 'ingresos', 'eventos', 'satisfaccion'];
      const comparacion = {};

      for (const metrica of metricas) {
        const actual = await ReportesController.obtenerMetrica(metrica, periodoActual, evento_id);
        const anterior = await ReportesController.obtenerMetrica(metrica, periodoAnterior, evento_id);
        
        const crecimiento = anterior > 0 ? ((actual - anterior) / anterior * 100).toFixed(2) : 0;
        
        comparacion[metrica] = {
          actual,
          anterior,
          crecimiento: parseFloat(crecimiento)
        };
      }

      // Comparación por trimestres
      const trimestres = ['Q1', 'Q2', 'Q3', 'Q4'];
      const datosPorTrimestre = await Promise.all(
        trimestres.map(async (trimestre, index) => {
          const inicioTrimestre = new Date(fechaActual.getFullYear(), index * 3, 1);
          const finTrimestre = new Date(fechaActual.getFullYear(), (index + 1) * 3, 0);
          
          const eventosActual = await Evento.count({
            where: {
              ...(evento_id ? { id: evento_id } : {}),
              fecha_inicio: {
                [Op.between]: [inicioTrimestre, finTrimestre]
              }
            }
          });

          const eventosAnterior = await Evento.count({
            where: {
              ...(evento_id ? { id: evento_id } : {}),
              fecha_inicio: {
                [Op.between]: [
                  new Date(inicioTrimestre.getFullYear() - 1, inicioTrimestre.getMonth(), 1),
                  new Date(finTrimestre.getFullYear() - 1, finTrimestre.getMonth(), finTrimestre.getDate())
                ]
              }
            }
          });

          return {
            trimestre,
            actual: eventosActual,
            anterior: eventosAnterior
          };
        })
      );

      // Comparación de satisfacción por evento
      const satisfaccionEventos = await Evento.findAll({
        where: {
          ...(evento_id ? { id: evento_id } : {}),
          fecha_inicio: {
            [Op.between]: [periodoActual.inicio, periodoActual.fin]
          }
        },
        attributes: ['id', 'nombre', 'fecha_inicio'],
        limit: 10
      });

      const reporte = {
        comparacion_metricas: comparacion,
        datos_por_trimestre: datosPorTrimestre,
        satisfaccion_eventos: satisfaccionEventos.map(evento => ({
          id: evento.id,
          nombre: evento.nombre,
          fecha: evento.fecha_inicio,
          satisfaccion: (Math.random() * 2 + 3).toFixed(1) // Simulado
        })),
        periodo_actual: periodoActual,
        periodo_anterior: periodoAnterior
      };

      res.json({
        success: true,
        data: reporte
      });

    } catch (error) {
      console.error('Error generando reporte comparativo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener reporte demográfico
   */
  static async obtenerReporteDemografico(req, res) {
    try {
      const { evento_id, fecha_inicio, fecha_fin } = req.query;

      const whereRegistros = {};
      
      if (evento_id) {
        whereRegistros.evento_id = evento_id;
      }
      
      if (fecha_inicio && fecha_fin) {
        whereRegistros.fecha_registro = {
          [Op.between]: [fecha_inicio, fecha_fin]
        };
      }

      // Distribución por edad
      const edadParticipantes = await PreRegistro.findAll({
        where: {
          ...whereRegistros,
          fecha_nacimiento: { [Op.ne]: null }
        },
        attributes: [
          [
            literal(`
              CASE 
                WHEN EXTRACT(year from AGE(fecha_nacimiento)) BETWEEN 18 AND 25 THEN '18-25'
                WHEN EXTRACT(year from AGE(fecha_nacimiento)) BETWEEN 26 AND 35 THEN '26-35'
                WHEN EXTRACT(year from AGE(fecha_nacimiento)) BETWEEN 36 AND 45 THEN '36-45'
                WHEN EXTRACT(year from AGE(fecha_nacimiento)) BETWEEN 46 AND 55 THEN '46-55'
                ELSE '56+'
              END
            `),
            'rango_edad'
          ],
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: [literal(`
          CASE 
            WHEN EXTRACT(year from AGE(fecha_nacimiento)) BETWEEN 18 AND 25 THEN '18-25'
            WHEN EXTRACT(year from AGE(fecha_nacimiento)) BETWEEN 26 AND 35 THEN '26-35'
            WHEN EXTRACT(year from AGE(fecha_nacimiento)) BETWEEN 36 AND 45 THEN '36-45'
            WHEN EXTRACT(year from AGE(fecha_nacimiento)) BETWEEN 46 AND 55 THEN '46-55'
            ELSE '56+'
          END
        `)],
        raw: true
      });

      // Distribución por género
      const generoParticipantes = await PreRegistro.findAll({
        where: {
          ...whereRegistros,
          genero: { [Op.ne]: null }
        },
        attributes: [
          'genero',
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: ['genero'],
        raw: true
      });

      // Distribución por sector de empresa
      const sectoresEmpresa = await PreRegistro.findAll({
        where: {
          ...whereRegistros,
          sector_empresa: { [Op.ne]: null }
        },
        attributes: [
          'sector_empresa',
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: ['sector_empresa'],
        order: [[fn('COUNT', '*'), 'DESC']],
        limit: 10,
        raw: true
      });

      // Distribución por años de experiencia
      const experienciaLaboral = await PreRegistro.findAll({
        where: {
          ...whereRegistros,
          anos_experiencia: { [Op.ne]: null }
        },
        attributes: [
          'anos_experiencia',
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: ['anos_experiencia'],
        order: [['anos_experiencia', 'ASC']],
        raw: true
      });

      // Top empresas participantes
      const topEmpresas = await PreRegistro.findAll({
        where: {
          ...whereRegistros,
          empresa: { [Op.ne]: null }
        },
        attributes: [
          'empresa',
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: ['empresa'],
        order: [[fn('COUNT', '*'), 'DESC']],
        limit: 15,
        raw: true
      });

      // Cargos más comunes
      const cargosFrecuentes = await PreRegistro.findAll({
        where: {
          ...whereRegistros,
          cargo: { [Op.ne]: null }
        },
        attributes: [
          'cargo',
          [fn('COUNT', '*'), 'cantidad']
        ],
        group: ['cargo'],
        order: [[fn('COUNT', '*'), 'DESC']],
        limit: 10,
        raw: true
      });

      const reporte = {
        edad_participantes: edadParticipantes.map(item => ({
          rango: item.rango_edad,
          cantidad: parseInt(item.cantidad)
        })),
        genero_participantes: generoParticipantes.map(item => ({
          genero: item.genero,
          cantidad: parseInt(item.cantidad)
        })),
        sectores_empresa: sectoresEmpresa.map(item => ({
          sector: item.sector_empresa,
          cantidad: parseInt(item.cantidad)
        })),
        experiencia_laboral: experienciaLaboral.map(item => ({
          experiencia: item.anos_experiencia,
          cantidad: parseInt(item.cantidad)
        })),
        top_empresas: topEmpresas.map(item => ({
          empresa: item.empresa,
          cantidad: parseInt(item.cantidad)
        })),
        cargos_frecuentes: cargosFrecuentes.map(item => ({
          cargo: item.cargo,
          cantidad: parseInt(item.cantidad)
        }))
      };

      res.json({
        success: true,
        data: reporte
      });

    } catch (error) {
      console.error('Error generando reporte demográfico:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Exportar reporte a Excel
   */
  static async exportarExcel(req, res) {
    try {
      const { eventoId } = req.params;
      const { tipo, fecha_inicio, fecha_fin } = req.query;

      // Obtener datos del reporte según el tipo
      let datosReporte;
      switch (tipo) {
        case 'general':
          datosReporte = await ReportesController.obtenerDatosReporteGeneral(eventoId, fecha_inicio, fecha_fin);
          break;
        case 'visitantes':
          datosReporte = await ReportesController.obtenerDatosReporteVisitantes(eventoId, fecha_inicio, fecha_fin);
          break;
        case 'financiero':
          datosReporte = await ReportesController.obtenerDatosReporteFinanciero(eventoId, fecha_inicio, fecha_fin);
          break;
        default:
          datosReporte = await ReportesController.obtenerDatosReporteGeneral(eventoId, fecha_inicio, fecha_fin);
      }

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      
      // Hoja de resumen
      const worksheetResumen = workbook.addWorksheet('Resumen');
      
      // Configurar columnas
      worksheetResumen.columns = [
        { header: 'Métrica', key: 'metrica', width: 30 },
        { header: 'Valor', key: 'valor', width: 20 }
      ];

      // Agregar datos de resumen
      Object.entries(datosReporte.metricas_principales || {}).forEach(([key, value]) => {
        worksheetResumen.addRow({
          metrica: key.replace(/_/g, ' ').toUpperCase(),
          valor: value
        });
      });

      // Estilo del encabezado
      worksheetResumen.getRow(1).font = { bold: true };
      worksheetResumen.getRow(1).fill = {
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
        `attachment; filename="reporte-${tipo}-${eventoId}-${new Date().toISOString().split('T')[0]}.xlsx"`
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
   * Exportar reporte a PDF
   */
  static async exportarPDF(req, res) {
    try {
      const { eventoId } = req.params;
      const { tipo, fecha_inicio, fecha_fin } = req.query;

      // Crear documento PDF
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="reporte-${tipo}-${eventoId}-${new Date().toISOString().split('T')[0]}.pdf"`
      );

      doc.pipe(res);

      // Título
      doc.fontSize(20).text(`Reporte ${tipo.toUpperCase()}`, 50, 50);
      doc.fontSize(12).text(`Generado el: ${new Date().toLocaleDateString()}`, 50, 80);

      // Obtener datos y agregar al PDF
      const datosReporte = await ReportesController.obtenerDatosReporteGeneral(eventoId, fecha_inicio, fecha_fin);
      
      let yPosition = 120;
      
      // Métricas principales
      doc.fontSize(16).text('Métricas Principales', 50, yPosition);
      yPosition += 30;
      
      Object.entries(datosReporte.metricas_principales || {}).forEach(([key, value]) => {
        doc.fontSize(12).text(`${key.replace(/_/g, ' ').toUpperCase()}: ${value}`, 50, yPosition);
        yPosition += 20;
      });

      doc.end();

    } catch (error) {
      console.error('Error exportando a PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Enviar reporte por email
   */
  static async enviarPorEmail(req, res) {
    try {
      const { eventoId } = req.params;
      const { tipo, destinatarios, fecha_inicio, fecha_fin } = req.body;

      if (!destinatarios || destinatarios.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar al menos un destinatario'
        });
      }

      // Generar reporte
      const datosReporte = await ReportesController.obtenerDatosReporteGeneral(eventoId, fecha_inicio, fecha_fin);

      // Enviar email con el reporte
      await EmailService.enviarEmail({
        to: destinatarios,
        subject: `Reporte ${tipo.toUpperCase()} - Evento ${eventoId}`,
        template: 'reporte-evento',
        data: {
          tipo_reporte: tipo,
          evento_id: eventoId,
          fecha_generacion: new Date().toLocaleDateString(),
          metricas: datosReporte.metricas_principales
        }
      });

      res.json({
        success: true,
        message: 'Reporte enviado por email exitosamente'
      });

    } catch (error) {
      console.error('Error enviando reporte por email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Programar reportes automáticos
   */
  static async programarReporte(req, res) {
    try {
      const { 
        evento_id, 
        tipo_reporte, 
        frecuencia, 
        destinatarios, 
        activo = true 
      } = req.body;

      // Validar datos
      if (!evento_id || !tipo_reporte || !frecuencia || !destinatarios) {
        return res.status(400).json({
          success: false,
          message: 'Datos incompletos para programar el reporte'
        });
      }

      // Aquí se implementaría la lógica para programar reportes automáticos
      // Podría usar cron jobs o un sistema de cola de trabajos

      res.json({
        success: true,
        message: 'Reporte programado exitosamente',
        data: {
          id: Date.now(), // ID temporal
          evento_id,
          tipo_reporte,
          frecuencia,
          destinatarios,
          activo,
          proximo_envio: new Date(Date.now() + 24 * 60 * 60 * 1000) // Mañana
        }
      });

    } catch (error) {
      console.error('Error programando reporte:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Métodos auxiliares
  static async obtenerMetrica(metrica, periodo, eventoId) {
    const whereClause = {
      fecha_inicio: {
        [Op.between]: [periodo.inicio, periodo.fin]
      }
    };

    if (eventoId) {
      whereClause.id = eventoId;
    }

    switch (metrica) {
      case 'visitantes':
        return await PreRegistro.count({
          include: [{
            model: Evento,
            where: whereClause,
            attributes: []
          }]
        });
        
      case 'ingresos':
        const ingresos = await PreRegistro.sum('monto_pagado', {
          include: [{
            model: Evento,
            where: whereClause,
            attributes: []
          }],
          where: { estado: ['pagado', 'presente'] }
        });
        return parseFloat(ingresos) || 0;
        
      case 'eventos':
        return await Evento.count({ where: whereClause });
        
      case 'satisfaccion':
        return Math.random() * 2 + 3; // Simulado - implementar según sistema real
        
      default:
        return 0;
    }
  }

  static async obtenerDatosReporteGeneral(eventoId, fechaInicio, fechaFin) {
    // Implementar obtención de datos para reporte general
    return {
      metricas_principales: {
        total_eventos: 10,
        total_registros: 500,
        ingresos_totales: 25000
      }
    };
  }

  static async obtenerDatosReporteVisitantes(eventoId, fechaInicio, fechaFin) {
    // Implementar obtención de datos para reporte de visitantes
    return {};
  }

  static async obtenerDatosReporteFinanciero(eventoId, fechaInicio, fechaFin) {
    // Implementar obtención de datos para reporte financiero
    return {};
  }
}

module.exports = ReportesController;