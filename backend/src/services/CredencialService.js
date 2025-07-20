const {
  Credencial,
  TipoCredencial,
  PlantillaCredencial,
  AccesoEvento,
  LogValidacion,
  Evento,
  EmpresaExpositora,
  Usuario,
} = require("../models");
const QRGeneratorService = require("./QRGeneratorService");
const PDFGeneratorService = require("./PDFGeneratorService");
const TemplateService = require("./TemplateService");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs").promises;
const path = require("path");

class CredencialService {
  /**
   * Crear una nueva credencial
   */
  static async crearCredencial(datosCredencial, userId = null) {
    try {
      // Validar tipo de credencial
      const tipoCredencial = await TipoCredencial.findByPk(
        datosCredencial.id_tipo_credencial
      );
      if (!tipoCredencial || tipoCredencial.isDeleted()) {
        throw new Error("Tipo de credencial no válido");
      }

      // Validar evento
      const evento = await Evento.findByPk(datosCredencial.id_evento);
      if (!evento || evento.isDeleted()) {
        throw new Error("Evento no válido");
      }

      // Generar código único
      const codigoUnico = await this.generarCodigoUnico(
        datosCredencial.id_evento
      );

      // Preparar datos de la credencial
      const datosCompletos = {
        ...datosCredencial,
        codigo_unico: codigoUnico,
        estado: tipoCredencial.requiere_aprobacion ? "pendiente" : "activa",
        fecha_emision: new Date(),
        created_by: userId,
      };

      // Generar QR con datos temporales para la creación
      const qrData = QRGeneratorService.generateSecureQRData({
        ...datosCompletos,
        id_credencial: 'temp', // Temporal hasta que se cree
      });

      // Crear credencial con QR incluido
      const credencial = await Credencial.create({
        ...datosCompletos,
        qr_data: qrData.qr_data,
        qr_hash: qrData.qr_hash,
      });

      // Regenerar QR con el ID real de la credencial
      const qrDataFinal = QRGeneratorService.generateSecureQRData(credencial);
      
      // Actualizar con QR final que incluye el ID correcto
      await credencial.update({
        qr_data: qrDataFinal.qr_data,
        qr_hash: qrDataFinal.qr_hash,
      });

      // Crear accesos por defecto según el tipo
      await this.crearAccesosPorDefecto(
        credencial.id_credencial,
        credencial.id_evento,
        tipoCredencial
      );

      return await this.obtenerCredencialCompleta(credencial.id_credencial);
    } catch (error) {
      throw new Error(`Error al crear credencial: ${error.message}`);
    }
  }

  /**
   * Generar código único para la credencial
   */
  static async generarCodigoUnico(idEvento, intentos = 0) {
    if (intentos > 10) {
      throw new Error("No se pudo generar código único después de 10 intentos");
    }

    // Formato: EVENTO-TIPO-NUMERO
    const prefijo = `EVT${idEvento}`;
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const codigo = `${prefijo}-${timestamp}-${random}`;

    // Verificar que no exista
    const existente = await Credencial.findOne({
      where: { codigo_unico: codigo, deleted_at: null },
    });

    if (existente) {
      return await this.generarCodigoUnico(idEvento, intentos + 1);
    }

    return codigo;
  }

  /**
   * Crear accesos por defecto según el tipo de credencial
   */
  static async crearAccesosPorDefecto(idCredencial, idEvento, tipoCredencial) {
    const accesosPorDefecto = this.getAccesosPorTipo(
      tipoCredencial.nombre_tipo
    );

    for (const acceso of accesosPorDefecto) {
      await AccesoEvento.create({
        id_credencial: idCredencial,
        id_evento: idEvento,
        ...acceso,
      });
    }
  }

  /**
   * Obtener accesos por defecto según el tipo
   */
  static getAccesosPorTipo(tipoNombre) {
    const accesos = {
      visitante: [
        {
          tipo_acceso: "entrada_general",
          descripcion_acceso: "Acceso general al evento",
        },
      ],
      expositor: [
        {
          tipo_acceso: "entrada_general",
          descripcion_acceso: "Acceso general al evento",
        },
        {
          tipo_acceso: "area_expositores",
          descripcion_acceso: "Acceso al área de expositores",
        },
        {
          tipo_acceso: "zona_catering",
          descripcion_acceso: "Acceso a zona de catering",
        },
      ],
      personal: [
        {
          tipo_acceso: "entrada_general",
          descripcion_acceso: "Acceso general al evento",
        },
        {
          tipo_acceso: "area_staff",
          descripcion_acceso: "Acceso al área de personal",
        },
        { tipo_acceso: "backstage", descripcion_acceso: "Acceso a backstage" },
      ],
      prensa: [
        {
          tipo_acceso: "entrada_general",
          descripcion_acceso: "Acceso general al evento",
        },
        {
          tipo_acceso: "area_prensa",
          descripcion_acceso: "Acceso al área de prensa",
        },
        {
          tipo_acceso: "sala_conferencias",
          descripcion_acceso: "Acceso a sala de conferencias",
        },
      ],
      vip: [
        {
          tipo_acceso: "entrada_general",
          descripcion_acceso: "Acceso general al evento",
        },
        { tipo_acceso: "zona_vip", descripcion_acceso: "Acceso a zona VIP" },
        {
          tipo_acceso: "area_networking",
          descripcion_acceso: "Acceso a área de networking",
        },
        {
          tipo_acceso: "zona_catering",
          descripcion_acceso: "Acceso a zona de catering premium",
        },
        { tipo_acceso: "parking", descripcion_acceso: "Acceso a parking VIP" },
      ],
    };

    return accesos[tipoNombre.toLowerCase()] || accesos["visitante"];
  }

  /**
   * Obtener credencial completa con relaciones
   */
  static async obtenerCredencialCompleta(idCredencial) {
    try {
      console.log("Buscando credencial con ID:", idCredencial);

      // Primero verificar si la credencial existe sin includes
      const credencialBasica = await Credencial.findByPk(idCredencial);
      console.log(
        "Credencial básica encontrada:",
        credencialBasica ? "Sí" : "No"
      );

      if (!credencialBasica) {
        return null;
      }

      // Luego intentar con includes paso a paso
      const credencial = await Credencial.findByPk(idCredencial, {
        include: [
          {
            model: TipoCredencial,
            as: "tipoCredencial",
            required: false,
          },
          {
            model: Evento,
            as: "evento",
            required: false,
          },
          {
            model: PlantillaCredencial,
            as: "plantilla",
            required: false,
          },
          {
            model: AccesoEvento,
            as: "accesos",
            where: { deleted_at: null },
            required: false,
          },
          {
            model: EmpresaExpositora,
            as: "empresaExpositora",
            required: false,
          },
          {
            model: Usuario,
            as: "usuario",
            required: false,
          },
        ],
      });

      console.log(
        "Credencial con includes encontrada:",
        credencial ? "Sí" : "No"
      );
      return credencial;
    } catch (error) {
      console.error("Error en obtenerCredencialCompleta:", error.message);
      console.error("Stack:", error.stack);
      throw error;
    }
  }

  /**
   * Generar credencial física (PDF + QR)
   */
  static async generarCredencialFisica(idCredencial) {
    try {
      const credencial = await this.obtenerCredencialCompleta(idCredencial);
      if (!credencial) {
        throw new Error("Credencial no encontrada");
      }

      // Obtener plantilla
      let plantilla = credencial.plantilla;
      if (!plantilla) {
        plantilla = await this.obtenerPlantillaPorDefecto(
          credencial.id_tipo_credencial
        );
      }

      // Generar imagen QR
      const qrImage = await QRGeneratorService.generateQRImage(
        credencial.qr_data,
        {
          width: plantilla.configuracion_qr?.tamaño || 100,
        }
      );

      // Generar PDF
      const pdf = await PDFGeneratorService.generateCredentialPDF(
        credencial,
        plantilla,
        qrImage
      );

      // Guardar archivos si es necesario
      const archivos = await this.guardarArchivosCredencial(
        credencial,
        qrImage,
        pdf
      );

      // Actualizar credencial con rutas de archivos
      await credencial.update({
        archivo_pdf_path: archivos.pdfPath,
        imagen_credencial_path: archivos.imagePath,
      });

      return {
        credencial,
        pdf: pdf,
        qr: qrImage,
        archivos: archivos,
      };
    } catch (error) {
      throw new Error(`Error al generar credencial física: ${error.message}`);
    }
  }

  /**
   * Obtener plantilla por defecto para un tipo
   */
  static async obtenerPlantillaPorDefecto(idTipoCredencial) {
    let plantilla = await PlantillaCredencial.findOne({
      where: {
        id_tipo_credencial: idTipoCredencial,
        es_plantilla_default: true,
        activa: true,
        deleted_at: null,
      },
    });

    if (!plantilla) {
      // Buscar cualquier plantilla activa para el tipo
      plantilla = await PlantillaCredencial.findOne({
        where: {
          id_tipo_credencial: idTipoCredencial,
          activa: true,
          deleted_at: null,
        },
      });
    }

    if (!plantilla) {
      // Crear plantilla básica por defecto
      plantilla = await this.crearPlantillaPorDefecto(idTipoCredencial);
    }

    return plantilla;
  }

  /**
   * Crear plantilla por defecto
   */
  static async crearPlantillaPorDefecto(idTipoCredencial) {
    const tipoCredencial = await TipoCredencial.findByPk(idTipoCredencial);

    return await PlantillaCredencial.create({
      nombre_plantilla: `Plantilla por defecto - ${tipoCredencial.nombre_tipo}`,
      id_tipo_credencial: idTipoCredencial,
      diseño_html: TemplateService.getDefaultTemplate(),
      estilos_css: TemplateService.getDefaultCSS(),
      es_plantilla_default: true,
      activa: true,
    });
  }

  /**
   * Guardar archivos de credencial
   */
  static async guardarArchivosCredencial(credencial, qrImage, pdf) {
    try {
      const uploadsDir = path.join(
        process.cwd(),
        "uploads",
        "credenciales",
        credencial.id_evento.toString()
      );

      // Crear directorio si no existe
      await fs.mkdir(uploadsDir, { recursive: true });

      // Guardar imagen QR
      const qrFileName = `qr_${credencial.codigo_unico}.png`;
      const qrPath = path.join(uploadsDir, qrFileName);
      await fs.writeFile(qrPath, qrImage.buffer);

      // Guardar PDF
      const pdfFileName = `credencial_${credencial.codigo_unico}.pdf`;
      const pdfPath = path.join(uploadsDir, pdfFileName);
      await fs.writeFile(pdfPath, pdf.buffer);

      return {
        qrPath: `/uploads/credenciales/${credencial.id_evento}/${qrFileName}`,
        pdfPath: `/uploads/credenciales/${credencial.id_evento}/${pdfFileName}`,
        imagePath: `/uploads/credenciales/${credencial.id_evento}/${qrFileName}`,
      };
    } catch (error) {
      throw new Error(`Error al guardar archivos: ${error.message}`);
    }
  }

  /**
   * Generar credenciales en lote
   */
  static async generarCredencialesLote(datosCredenciales, userId = null) {
    const resultados = [];
    const errores = [];

    for (let i = 0; i < datosCredenciales.length; i++) {
      try {
        const credencial = await this.crearCredencial(
          datosCredenciales[i],
          userId
        );
        resultados.push(credencial);
      } catch (error) {
        errores.push({
          indice: i,
          datos: datosCredenciales[i],
          error: error.message,
        });
      }
    }

    return {
      exitosas: resultados,
      errores: errores,
      total_procesadas: datosCredenciales.length,
      exitosas_count: resultados.length,
      errores_count: errores.length,
    };
  }

  /**
   * Revocar credencial
   */
  static async revocarCredencial(idCredencial, motivo, userId = null) {
    const credencial = await Credencial.findByPk(idCredencial);
    if (!credencial) {
      throw new Error("Credencial no encontrada");
    }

    await credencial.revocar(userId);

    // Registrar en log
    await LogValidacion.create({
      id_credencial: idCredencial,
      id_evento: credencial.id_evento,
      fecha_validacion: new Date(),
      resultado: "bloqueada",
      motivo_fallo: `Credencial revocada: ${motivo}`,
      id_usuario_validador: userId,
      tipo_movimiento: "verificacion",
    });

    return credencial;
  }

  /**
   * Reactivar credencial
   */
  static async reactivarCredencial(idCredencial, userId = null) {
    const credencial = await Credencial.findByPk(idCredencial);
    if (!credencial) {
      throw new Error("Credencial no encontrada");
    }

    await credencial.activar(userId);

    return credencial;
  }

  /**
   * Reimprimir credencial
   */
  static async reimprimirCredencial(idCredencial, userId = null) {
    const credencial = await Credencial.findByPk(idCredencial);
    if (!credencial) {
      throw new Error("Credencial no encontrada");
    }

    // Incrementar contador de reimpresiones
    await credencial.update({
      total_reimpresiones: credencial.total_reimpresiones + 1,
      ultima_reimpresion: new Date(),
      updated_by: userId,
    });

    // Generar nuevamente la credencial física
    return await this.generarCredencialFisica(idCredencial);
  }

  /**
   * Buscar credenciales con filtros
   */
  static async buscarCredenciales(filtros = {}) {
    const {
      id_evento,
      id_tipo_credencial,
      estado,
      search,
      fecha_desde,
      fecha_hasta,
      page = 1,
      limit = 10,
    } = filtros;

    const where = { deleted_at: null };

    if (id_evento) where.id_evento = id_evento;
    if (id_tipo_credencial) where.id_tipo_credencial = id_tipo_credencial;
    if (estado) where.estado = estado;

    if (fecha_desde || fecha_hasta) {
      where.fecha_emision = {};
      if (fecha_desde) where.fecha_emision[Op.gte] = fecha_desde;
      if (fecha_hasta) where.fecha_emision[Op.lte] = fecha_hasta;
    }

    if (search) {
      where[Op.or] = [
        { codigo_unico: { [Op.like]: `%${search}%` } },
        { nombre_completo: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { empresa_organizacion: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (page - 1) * limit;

    return await Credencial.findAndCountAll({
      where,
      include: [
        { model: TipoCredencial, as: "tipoCredencial" },
        { model: Evento, as: "evento" },
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [["fecha_emision", "DESC"]],
    });
  }

  /**
   * Obtener estadísticas de credenciales
   */
  static async obtenerEstadisticas(idEvento = null) {
    const where = { deleted_at: null };
    if (idEvento) where.id_evento = idEvento;

    const total = await Credencial.count({ where });

    const porEstado = await Credencial.findAll({
      where,
      attributes: ["estado", [sequelize.fn("COUNT", "*"), "total"]],
      group: ["estado"],
      raw: true,
    });

    const porTipo = await Credencial.findAll({
      where,
      include: [
        {
          model: TipoCredencial,
          as: "tipoCredencial",
          attributes: ["nombre_tipo"],
        },
      ],
      attributes: [[sequelize.fn("COUNT", "*"), "total"]],
      group: [
        "tipoCredencial.id_tipo_credencial",
        "tipoCredencial.nombre_tipo",
      ],
      raw: true,
    });

    return {
      total,
      por_estado: porEstado,
      por_tipo: porTipo,
    };
  }
}

module.exports = CredencialService;
