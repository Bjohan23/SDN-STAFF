'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const futureDate1 = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días después
    const futureDate2 = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 días después
    const futureDate3 = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 días después
    const pastDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)); // 30 días atrás

    await queryInterface.bulkInsert('evento', [
      {
        id_evento: 1,
        nombre_evento: 'Feria de Tecnología e Innovación 2025',
        descripcion: 'La feria de tecnología más importante del norte del Perú. Expositores nacionales e internacionales presentarán las últimas innovaciones en tecnología, inteligencia artificial, robótica y startups. Incluye conferencias magistrales, talleres prácticos y networking empresarial.',
        fecha_inicio: futureDate1,
        fecha_fin: new Date(futureDate1.getTime() + (3 * 24 * 60 * 60 * 1000)), // 3 días después del inicio
        ubicacion: 'Centro de Convenciones de Trujillo, Av. Mansiche 1234, Trujillo, La Libertad',
        url_virtual: null,
        id_tipo_evento: 1, // presencial
        estado: 'publicado',
        imagen_logo: '/images/eventos/tech-fair-2025.jpg',
        configuracion_especifica: JSON.stringify({
          horario_apertura: '09:00',
          horario_cierre: '18:00',
          areas_tematicas: ['Inteligencia Artificial', 'Robótica', 'Startups', 'E-commerce'],
          servicios_incluidos: ['Wi-Fi gratuito', 'Estacionamiento', 'Food court', 'Seguridad 24h'],
          capacidad_stands: 150,
          tipos_stand: ['básico', 'premium', 'corporativo']
        }),
        url_amigable: 'feria-tecnologia-innovacion-2025',
        capacidad_maxima: 5000,
        precio_entrada: 25.00,
        moneda: 'PEN',
        requiere_aprobacion: true,
        fecha_limite_registro: new Date(futureDate1.getTime() - (7 * 24 * 60 * 60 * 1000)), // 7 días antes
        created_at: now,
        created_by: 1
      },
      {
        id_evento: 2,
        nombre_evento: 'Congreso Virtual de Marketing Digital',
        descripcion: 'Congreso internacional de marketing digital con expertos de América Latina. Conferencias en vivo, talleres interactivos y networking virtual. Temas: SEO/SEM, Social Media, Content Marketing, Analytics y E-commerce.',
        fecha_inicio: futureDate2,
        fecha_fin: new Date(futureDate2.getTime() + (2 * 24 * 60 * 60 * 1000)), // 2 días
        ubicacion: null,
        url_virtual: 'https://meet.google.com/marketing-digital-2025',
        id_tipo_evento: 2, // virtual
        estado: 'publicado',
        imagen_logo: '/images/eventos/marketing-digital-congress.jpg',
        configuracion_especifica: JSON.stringify({
          plataforma: 'Google Meet',
          salas_simultaneas: 4,
          capacidad_por_sala: 500,
          idiomas: ['español', 'portugués'],
          grabacion_disponible: true,
          materiales_descargables: true,
          certificado_participacion: true
        }),
        url_amigable: 'congreso-virtual-marketing-digital',
        capacidad_maxima: 2000,
        precio_entrada: 0.00,
        moneda: 'USD',
        requiere_aprobacion: false,
        fecha_limite_registro: new Date(futureDate2.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 días antes
        created_at: now,
        created_by: 1
      },
      {
        id_evento: 3,
        nombre_evento: 'Expo Gastronomía Peruana Híbrida',
        descripcion: 'Exposición gastronómica que celebra la rica tradición culinaria peruana. Modalidad híbrida que permite participación presencial en Lima y virtual para todo el mundo. Incluye demostraciones de cocina, degustaciones, concursos y venta de productos.',
        fecha_inicio: futureDate3,
        fecha_fin: new Date(futureDate3.getTime() + (4 * 24 * 60 * 60 * 1000)), // 4 días
        ubicacion: 'Gran Teatro Nacional, Av. Javier Prado Este 2225, San Borja, Lima',
        url_virtual: 'https://zoom.us/j/gastronomia-peru-2025',
        id_tipo_evento: 3, // híbrido
        estado: 'borrador',
        imagen_logo: '/images/eventos/expo-gastronomia-peru.jpg',
        configuracion_especifica: JSON.stringify({
          modalidad_presencial: {
            ubicacion_principal: 'Gran Teatro Nacional',
            stands_gastronomicos: 80,
            area_degustacion: true,
            cocina_demo_en_vivo: true
          },
          modalidad_virtual: {
            plataforma: 'Zoom',
            transmision_en_vivo: true,
            clases_cocina_online: true,
            tienda_virtual: true
          },
          actividades_compartidas: [
            'Conferencias magistrales',
            'Concurso de platos',
            'Networking gastronómico'
          ]
        }),
        url_amigable: 'expo-gastronomia-peruana-hibrida',
        capacidad_maxima: 3000,
        precio_entrada: 35.00,
        moneda: 'PEN',
        requiere_aprobacion: true,
        fecha_limite_registro: new Date(futureDate3.getTime() - (14 * 24 * 60 * 60 * 1000)), // 14 días antes
        created_at: now,
        created_by: 1
      },
      {
        id_evento: 4,
        nombre_evento: 'Feria del Libro Universitario',
        descripcion: 'Feria académica dirigida a estudiantes universitarios con editoriales especializadas, presentaciones de libros, charlas con autores y descuentos especiales en material académico.',
        fecha_inicio: new Date(now.getTime() + (15 * 24 * 60 * 60 * 1000)), // 15 días después
        fecha_fin: new Date(now.getTime() + (18 * 24 * 60 * 60 * 1000)), // 18 días después
        ubicacion: 'Universidad Nacional de Trujillo, Campus Central',
        url_virtual: null,
        id_tipo_evento: 1, // presencial
        estado: 'activo',
        imagen_logo: '/images/eventos/feria-libro-universitario.jpg',
        configuracion_especifica: JSON.stringify({
          publico_objetivo: 'estudiantes universitarios',
          descuentos_especiales: '20% estudiantes, 15% docentes',
          editoriales_participantes: 25,
          presentaciones_diarias: 6,
          area_firma_libros: true
        }),
        url_amigable: 'feria-libro-universitario',
        capacidad_maxima: 1500,
        precio_entrada: 0.00,
        moneda: 'PEN',
        requiere_aprobacion: false,
        fecha_limite_registro: new Date(now.getTime() + (10 * 24 * 60 * 60 * 1000)), // 10 días después
        created_at: now,
        created_by: 2
      },
      {
        id_evento: 5,
        nombre_evento: 'Expo Salud y Bienestar 2024',
        descripcion: 'Evento finalizado que sirvió como referencia para futuros eventos de salud. Incluyó stands de productos naturales, consultas médicas gratuitas y talleres de bienestar.',
        fecha_inicio: pastDate,
        fecha_fin: new Date(pastDate.getTime() + (2 * 24 * 60 * 60 * 1000)),
        ubicacion: 'Centro Comercial Real Plaza, Trujillo',
        url_virtual: null,
        id_tipo_evento: 1, // presencial
        estado: 'finalizado',
        imagen_logo: '/images/eventos/expo-salud-bienestar.jpg',
        configuracion_especifica: JSON.stringify({
          consultas_gratuitas: true,
          especialidades: ['nutrición', 'medicina general', 'odontología'],
          talleres_incluidos: ['yoga', 'meditación', 'cocina saludable'],
          participantes_totales: 2500
        }),
        url_amigable: 'expo-salud-bienestar-2024',
        capacidad_maxima: 1200,
        precio_entrada: 10.00,
        moneda: 'PEN',
        requiere_aprobacion: false,
        fecha_limite_registro: null,
        created_at: new Date(pastDate.getTime() - (10 * 24 * 60 * 60 * 1000)),
        created_by: 2
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('evento', null, {});
  }
};
