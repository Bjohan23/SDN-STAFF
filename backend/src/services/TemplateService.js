const { PlantillaCredencial, TipoCredencial } = require('../models');
const handlebars = require('handlebars');

class TemplateService {
  
  /**
   * Obtener template HTML por defecto
   */
  static getDefaultTemplate() {
    return `
      <div class="credencial">
        <div class="header">
          {{#if logoEvento}}
          <img src="{{logoEvento}}" alt="Logo" class="logo-evento" />
          {{/if}}
          <h1 class="evento-titulo">{{evento.nombre_evento}}</h1>
        </div>
        
        <div class="contenido-principal">
          <div class="foto-perfil">
            {{#if foto_url}}
            <img src="{{foto_url}}" alt="Foto" class="foto" />
            {{else}}
            <div class="foto-placeholder">
              <span class="iniciales">{{getIniciales nombre_completo}}</span>
            </div>
            {{/if}}
          </div>
          
          <div class="informacion">
            <h2 class="nombre">{{uppercase nombre_completo}}</h2>
            {{#if cargo_titulo}}
            <p class="cargo">{{cargo_titulo}}</p>
            {{/if}}
            {{#if empresa_organizacion}}
            <p class="empresa">{{empresa_organizacion}}</p>
            {{/if}}
          </div>
        </div>
        
        <div class="tipo-credencial" style="background-color: {{tipoCredencial.color_identificacion}}">
          <span class="tipo-texto">{{uppercase tipoCredencial.nombre_tipo}}</span>
        </div>
        
        <div class="footer">
          <div class="qr-section">
            {{qrCode qrCodeDataURL 80}}
            <p class="codigo">{{codigo_unico}}</p>
          </div>
          
          <div class="fechas">
            {{#if fechaActivacion}}
            <p class="fecha-activacion">Válida desde: {{fechaActivacion}}</p>
            {{/if}}
            {{#if fechaExpiracion}}
            <p class="fecha-expiracion">Válida hasta: {{fechaExpiracion}}</p>
            {{/if}}
          </div>
        </div>
        
        {{#if imagenFondo}}
        <div class="fondo" style="background-image: url('{{imagenFondo}}')"></div>
        {{/if}}
      </div>
    `;
  }
  
  /**
   * Obtener CSS por defecto
   */
  static getDefaultCSS() {
    return `
      .credencial {
        width: 300px;
        height: 450px;
        position: relative;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        padding: 20px;
        box-sizing: border-box;
        color: white;
        font-family: 'Arial', sans-serif;
        overflow: hidden;
      }
      
      .fondo {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        opacity: 0.1;
        z-index: 0;
      }
      
      .header {
        text-align: center;
        margin-bottom: 20px;
        position: relative;
        z-index: 1;
      }
      
      .logo-evento {
        max-width: 80px;
        max-height: 40px;
        margin-bottom: 10px;
      }
      
      .evento-titulo {
        font-size: 14px;
        margin: 0;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      }
      
      .contenido-principal {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        position: relative;
        z-index: 1;
      }
      
      .foto-perfil {
        margin-right: 15px;
      }
      
      .foto {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid white;
      }
      
      .foto-placeholder {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
      }
      
      .iniciales {
        font-size: 20px;
        font-weight: bold;
        color: white;
      }
      
      .informacion {
        flex: 1;
      }
      
      .nombre {
        font-size: 18px;
        margin: 0 0 5px 0;
        font-weight: bold;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        line-height: 1.2;
      }
      
      .cargo {
        font-size: 12px;
        margin: 0 0 3px 0;
        opacity: 0.9;
      }
      
      .empresa {
        font-size: 12px;
        margin: 0;
        opacity: 0.9;
        font-style: italic;
      }
      
      .tipo-credencial {
        background: #ff6b6b;
        padding: 8px 15px;
        border-radius: 20px;
        text-align: center;
        margin-bottom: 20px;
        position: relative;
        z-index: 1;
      }
      
      .tipo-texto {
        font-size: 12px;
        font-weight: bold;
        color: white;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
      }
      
      .footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        z-index: 1;
      }
      
      .qr-section {
        text-align: center;
      }
      
      .qr-section img {
        background: white;
        padding: 5px;
        border-radius: 5px;
      }
      
      .codigo {
        font-size: 10px;
        margin: 5px 0 0 0;
        opacity: 0.9;
      }
      
      .fechas {
        text-align: right;
        font-size: 9px;
      }
      
      .fecha-activacion,
      .fecha-expiracion {
        margin: 2px 0;
        opacity: 0.8;
      }
      
      /* Variaciones por tipo */
      .credencial.visitante {
        background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
      }
      
      .credencial.expositor {
        background: linear-gradient(135deg, #00cec9 0%, #00b894 100%);
      }
      
      .credencial.personal {
        background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
      }
      
      .credencial.prensa {
        background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
      }
      
      .credencial.vip {
        background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
        border: 3px solid #f39c12;
      }
    `;
  }
  
  /**
   * Obtener template para tipo específico
   */
  static getTemplateByType(tipoCredencial) {
    const templates = {
      'visitante': this.getVisitanteTemplate(),
      'expositor': this.getExpositorTemplate(),
      'personal': this.getPersonalTemplate(),
      'prensa': this.getPrensaTemplate(),
      'vip': this.getVIPTemplate()
    };
    
    return templates[tipoCredencial.toLowerCase()] || this.getDefaultTemplate();
  }
  
  /**
   * Template para visitantes
   */
  static getVisitanteTemplate() {
    return `
      <div class="credencial visitante">
        <div class="header">
          {{#if logoEvento}}
          <img src="{{logoEvento}}" alt="Logo" class="logo-evento" />
          {{/if}}
          <h1 class="evento-titulo">{{evento.nombre_evento}}</h1>
        </div>
        
        <div class="visitante-info">
          <h2 class="nombre">{{uppercase nombre_completo}}</h2>
          {{#if empresa_organizacion}}
          <p class="empresa">{{empresa_organizacion}}</p>
          {{/if}}
          
          <div class="accesos-permitidos">
            <h3>Accesos Incluidos:</h3>
            <ul>
              <li>Áreas públicas</li>
              <li>Exposición principal</li>
              <li>Zona de conferencias</li>
            </ul>
          </div>
        </div>
        
        <div class="footer-visitante">
          <div class="qr-section">
            {{qrCode qrCodeDataURL 80}}
            <p class="codigo">{{codigo_unico}}</p>
          </div>
          
          <div class="instrucciones">
            <p>Mantenga visible durante su visita</p>
            <p>Válida para: {{fechaActivacion}} - {{fechaExpiracion}}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Template para expositores
   */
  static getExpositorTemplate() {
    return `
      <div class="credencial expositor">
        <div class="header-expositor">
          <div class="badges">
            <span class="badge-expositor">EXPOSITOR</span>
          </div>
          {{#if logoEvento}}
          <img src="{{logoEvento}}" alt="Logo" class="logo-evento" />
          {{/if}}
        </div>
        
        <div class="info-expositor">
          <h2 class="nombre">{{uppercase nombre_completo}}</h2>
          <p class="empresa-destacada">{{uppercase empresa_organizacion}}</p>
          {{#if cargo_titulo}}
          <p class="cargo">{{cargo_titulo}}</p>
          {{/if}}
          
          {{#if stand_asignado}}
          <div class="stand-info">
            <strong>Stand: {{stand_asignado}}</strong>
          </div>
          {{/if}}
        </div>
        
        <div class="privilegios">
          <h3>Accesos Especiales:</h3>
          <div class="lista-privilegios">
            <span class="privilegio">Área Expositores</span>
            <span class="privilegio">Montaje/Desmontaje</span>
            <span class="privilegio">Catering</span>
          </div>
        </div>
        
        <div class="footer">
          {{qrCode qrCodeDataURL 80}}
          <p class="codigo">{{codigo_unico}}</p>
        </div>
      </div>
    `;
  }
  
  /**
   * Template para personal
   */
  static getPersonalTemplate() {
    return `
      <div class="credencial personal">
        <div class="header-staff">
          <span class="badge-staff">STAFF</span>
          <h1 class="evento-titulo">{{evento.nombre_evento}}</h1>
        </div>
        
        <div class="foto-staff">
          {{#if foto_url}}
          <img src="{{foto_url}}" alt="Foto" class="foto" />
          {{else}}
          <div class="foto-placeholder">
            <span class="iniciales">{{getIniciales nombre_completo}}</span>
          </div>
          {{/if}}
        </div>
        
        <div class="info-staff">
          <h2 class="nombre">{{uppercase nombre_completo}}</h2>
          <p class="departamento">{{cargo_titulo}}</p>
          <p class="id-empleado">ID: {{documento_identidad}}</p>
        </div>
        
        <div class="accesos-staff">
          <div class="acceso-total">
            <strong>ACCESO TOTAL</strong>
            <p>Todas las áreas del evento</p>
          </div>
        </div>
        
        <div class="contacto-emergencia">
          <p>Emergencias: {{telefono_emergencia}}</p>
        </div>
        
        <div class="footer">
          {{qrCode qrCodeDataURL 80}}
          <p class="codigo">{{codigo_unico}}</p>
        </div>
      </div>
    `;
  }
  
  /**
   * Template para prensa
   */
  static getPrensaTemplate() {
    return `
      <div class="credencial prensa">
        <div class="header-prensa">
          <span class="badge-prensa">PRENSA</span>
          {{#if logoEvento}}
          <img src="{{logoEvento}}" alt="Logo" class="logo-evento" />
          {{/if}}
        </div>
        
        <div class="info-prensa">
          <h2 class="nombre">{{uppercase nombre_completo}}</h2>
          <p class="medio">{{uppercase empresa_organizacion}}</p>
          <p class="tipo-medio">{{cargo_titulo}}</p>
        </div>
        
        <div class="acreditacion">
          <h3>Acreditación de Prensa</h3>
          <div class="permisos-prensa">
            <div class="permiso">📸 Fotografía</div>
            <div class="permiso">🎥 Video</div>
            <div class="permiso">🎤 Entrevistas</div>
          </div>
        </div>
        
        <div class="area-prensa">
          <strong>Sala de Prensa</strong>
          <p>Zona exclusiva para medios</p>
        </div>
        
        <div class="footer">
          {{qrCode qrCodeDataURL 80}}
          <p class="codigo">{{codigo_unico}}</p>
        </div>
        
        <div class="disclaimer">
          <p class="texto-pequeño">Sujeto a términos de uso de medios</p>
        </div>
      </div>
    `;
  }
  
  /**
   * Template para VIP
   */
  static getVIPTemplate() {
    return `
      <div class="credencial vip">
        <div class="header-vip">
          <div class="corona">👑</div>
          <span class="badge-vip">VIP EXCLUSIVE</span>
          {{#if logoEvento}}
          <img src="{{logoEvento}}" alt="Logo" class="logo-evento-vip" />
          {{/if}}
        </div>
        
        <div class="info-vip">
          <h2 class="nombre-vip">{{uppercase nombre_completo}}</h2>
          {{#if empresa_organizacion}}
          <p class="empresa-vip">{{empresa_organizacion}}</p>
          {{/if}}
          {{#if cargo_titulo}}
          <p class="titulo-vip">{{cargo_titulo}}</p>
          {{/if}}
        </div>
        
        <div class="privilegios-vip">
          <h3>Privilegios Exclusivos</h3>
          <div class="lista-vip">
            <div class="privilegio-vip">🥂 Área VIP Lounge</div>
            <div class="privilegio-vip">🍾 Catering Premium</div>
            <div class="privilegio-vip">🚗 Parking Preferencial</div>
            <div class="privilegio-vip">👥 Acceso Networking</div>
            <div class="privilegio-vip">🎯 Entrada Prioritaria</div>
          </div>
        </div>
        
        <div class="concierge">
          <strong>Servicio de Concierge</strong>
          <p>{{telefono_concierge}}</p>
        </div>
        
        <div class="footer-vip">
          <div class="qr-vip">
            {{qrCode qrCodeDataURL 90}}
          </div>
          <div class="codigo-vip">
            <p>{{codigo_unico}}</p>
            <p class="serie">Serie: {{serie_vip}}</p>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Registrar helpers personalizados de Handlebars
   */
  static registerCustomHelpers() {
    // Helper para obtener iniciales
    handlebars.registerHelper('getIniciales', (nombreCompleto) => {
      if (!nombreCompleto) return '';
      return nombreCompleto
        .split(' ')
        .map(palabra => palabra.charAt(0))
        .join('')
        .substring(0, 2)
        .toUpperCase();
    });
    
    // Helper para formatear teléfono
    handlebars.registerHelper('formatTelefono', (telefono) => {
      if (!telefono) return '';
      return telefono.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    });
    
    // Helper para generar color aleatorio
    handlebars.registerHelper('colorAleatorio', () => {
      const colores = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
      return colores[Math.floor(Math.random() * colores.length)];
    });
    
    // Helper para verificar si es VIP
    handlebars.registerHelper('esVIP', (tipoCredencial) => {
      return tipoCredencial && tipoCredencial.toLowerCase() === 'vip';
    });
    
    // Helper para mostrar fecha relativa
    handlebars.registerHelper('fechaRelativa', (fecha) => {
      if (!fecha) return '';
      const ahora = new Date();
      const fechaObj = new Date(fecha);
      const diferencia = fechaObj - ahora;
      const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
      
      if (dias === 0) return 'Hoy';
      if (dias === 1) return 'Mañana';
      if (dias === -1) return 'Ayer';
      if (dias > 1) return `En ${dias} días`;
      if (dias < -1) return `Hace ${Math.abs(dias)} días`;
      
      return fechaObj.toLocaleDateString();
    });
  }
  
  /**
   * Compilar template con datos
   */
  static compileTemplate(templateHTML, data) {
    this.registerCustomHelpers();
    const template = handlebars.compile(templateHTML);
    return template(data);
  }
  
  /**
   * Validar template HTML
   */
  static validateTemplate(templateHTML) {
    try {
      handlebars.compile(templateHTML);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.message 
      };
    }
  }
  
  /**
   * Obtener variables disponibles para templates
   */
  static getAvailableVariables() {
    return {
      // Datos de la credencial
      credencial: [
        'codigo_unico',
        'nombre_completo',
        'email',
        'telefono',
        'documento_identidad',
        'empresa_organizacion',
        'cargo_titulo',
        'foto_url',
        'fechaEmision',
        'fechaActivacion',
        'fechaExpiracion',
        'estado'
      ],
      
      // Datos del evento
      evento: [
        'nombre_evento',
        'descripcion',
        'fecha_inicio',
        'fecha_fin',
        'ubicacion',
        'capacidad_maxima'
      ],
      
      // Datos del tipo de credencial
      tipoCredencial: [
        'nombre_tipo',
        'descripcion',
        'color_identificacion',
        'nivel_acceso'
      ],
      
      // Assets
      assets: [
        'logoEvento',
        'imagenFondo',
        'qrCodeDataURL'
      ],
      
      // Helpers disponibles
      helpers: [
        'uppercase',
        'lowercase',
        'capitalize',
        'formatDate',
        'getIniciales',
        'formatTelefono',
        'colorAleatorio',
        'esVIP',
        'fechaRelativa',
        'qrCode',
        'ifEquals'
      ]
    };
  }
  
  /**
   * Generar preview de template
   */
  static generatePreview(plantilla, datosEjemplo = null) {
    const datos = datosEjemplo || this.getSampleData();
    
    try {
      const html = this.compileTemplate(plantilla.diseño_html, datos);
      const css = plantilla.estilos_css || this.getDefaultCSS();
      
      return {
        html: html,
        css: css,
        fullHTML: this.wrapPreviewHTML(html, css)
      };
    } catch (error) {
      throw new Error(`Error generating preview: ${error.message}`);
    }
  }
  
  /**
   * Datos de ejemplo para preview
   */
  static getSampleData() {
    return {
      codigo_unico: 'EVT001-123456-ABCD',
      nombre_completo: 'Juan Carlos Pérez González',
      email: 'juan.perez@empresa.com',
      telefono: '+51 999 888 777',
      documento_identidad: '12345678',
      empresa_organizacion: 'Tecnología y Innovación S.A.C.',
      cargo_titulo: 'Gerente General',
      fechaEmision: '15 de Julio, 2024',
      fechaActivacion: '20 de Julio, 2024',
      fechaExpiracion: '25 de Julio, 2024',
      estado: 'activa',
      
      evento: {
        nombre_evento: 'ExpoTech 2024 - Feria de Tecnología',
        descripcion: 'La feria de tecnología más importante del año',
        ubicacion: 'Centro de Convenciones Lima'
      },
      
      tipoCredencial: {
        nombre_tipo: 'Expositor',
        color_identificacion: '#00b894'
      },
      
      qrCodeDataURL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      logoEvento: '/assets/logo-evento.png',
      imagenFondo: '/assets/fondo-credencial.jpg'
    };
  }
  
  /**
   * Envolver HTML para preview
   */
  static wrapPreviewHTML(html, css) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Preview Credencial</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          ${css}
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `;
  }
}

module.exports = TemplateService;