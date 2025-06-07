'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('empresa_expositora', [
      {
        id_empresa: 1,
        nombre_empresa: 'TechInnovate Solutions',
        razon_social: 'TechInnovate Solutions S.A.C.',
        ruc: '20123456789',
        descripcion: 'Empresa líder en desarrollo de software y soluciones tecnológicas para empresas. Especializada en inteligencia artificial, machine learning y automatización de procesos.',
        sector: 'Tecnología',
        tamaño_empresa: 'mediana',
        logo_url: '/images/empresas/techinnovate-logo.png',
        sitio_web: 'https://www.techinnovate.pe',
        email_contacto: 'contacto@techinnovate.pe',
        telefono_contacto: '+51987654321',
        nombre_contacto: 'Carlos Rodriguez Martinez',
        cargo_contacto: 'Gerente Comercial',
        direccion: 'Av. Javier Prado Este 4200, Surquillo',
        ciudad: 'Lima',
        pais: 'Perú',
        estado: 'aprobada',
        fecha_aprobacion: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)), // 5 días atrás
        aprobada_por: 1,
        documentos_legales: JSON.stringify({
          ruc_document: '/docs/empresas/1/ruc.pdf',
          constitución_empresa: '/docs/empresas/1/constitucion.pdf',
          poder_representante: '/docs/empresas/1/poder.pdf'
        }),
        fecha_vencimiento_documentos: new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)), // 1 año
        redes_sociales: JSON.stringify({
          facebook: 'https://facebook.com/techinnovate',
          linkedin: 'https://linkedin.com/company/techinnovate',
          instagram: 'https://instagram.com/techinnovate'
        }),
        productos_servicios: 'Desarrollo de software a medida, consultoría en transformación digital, implementación de IA y ML, automatización de procesos empresariales.',
        experiencia_ferias: 'Participación en CADE Ejecutivos 2023, ExpoTech Lima 2023, Feria Internacional de Tecnología 2022.',
        configuracion_especifica: JSON.stringify({
          categoria_preferida: 'tecnologia',
          area_stand_preferida: 'grande',
          servicios_requeridos: ['electricidad', 'internet', 'pantallas']
        }),
        numero_participaciones: 3,
        calificacion_promedio: 4.80,
        created_at: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)),
        created_by: 1
      },
      {
        id_empresa: 2,
        nombre_empresa: 'EcoGreen Perú',
        razon_social: 'EcoGreen Perú E.I.R.L.',
        ruc: '20987654321',
        descripcion: 'Empresa comprometida con el medio ambiente, especializada en productos eco-amigables y soluciones sostenibles para empresas y hogares.',
        sector: 'Medio Ambiente',
        tamaño_empresa: 'pequeña',
        logo_url: '/images/empresas/ecogreen-logo.png',
        sitio_web: 'https://www.ecogreenperu.com',
        email_contacto: 'ventas@ecogreenperu.com',
        telefono_contacto: '+51956789123',
        nombre_contacto: 'María Elena Vásquez',
        cargo_contacto: 'Directora Comercial',
        direccion: 'Calle Los Eucaliptos 245, San Isidro',
        ciudad: 'Lima',
        pais: 'Perú',
        estado: 'aprobada',
        fecha_aprobacion: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)), // 3 días atrás
        aprobada_por: 1,
        documentos_legales: JSON.stringify({
          ruc_document: '/docs/empresas/2/ruc.pdf',
          licencia_funcionamiento: '/docs/empresas/2/licencia.pdf'
        }),
        fecha_vencimiento_documentos: new Date(now.getTime() + (180 * 24 * 60 * 60 * 1000)), // 6 meses
        redes_sociales: JSON.stringify({
          facebook: 'https://facebook.com/ecogreenperu',
          instagram: 'https://instagram.com/ecogreenperu'
        }),
        productos_servicios: 'Productos de limpieza biodegradables, bolsas ecológicas, utensilios compostables, asesoría en sostenibilidad empresarial.',
        experiencia_ferias: 'Primera participación en ferias comerciales, pero con experiencia en mercados locales y ferias distritales.',
        configuracion_especifica: JSON.stringify({
          categoria_preferida: 'sostenibilidad',
          requiere_area_demostracion: true,
          productos_organicos: true
        }),
        numero_participaciones: 0,
        calificacion_promedio: null,
        created_at: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)),
        created_by: 2
      },
      {
        id_empresa: 3,
        nombre_empresa: 'Sabores del Norte',
        razon_social: 'Industrias Alimentarias del Norte S.A.',
        ruc: '20555666777',
        descripcion: 'Empresa familiar dedicada a la producción y comercialización de productos alimenticios tradicionales del norte del Perú, con más de 20 años de experiencia.',
        sector: 'Alimentario',
        tamaño_empresa: 'mediana',
        logo_url: '/images/empresas/sabores-norte-logo.png',
        sitio_web: 'https://www.saboresdelnorte.pe',
        email_contacto: 'info@saboresdelnorte.pe',
        telefono_contacto: '+51944123456',
        nombre_contacto: 'Roberto Salinas Gutiérrez',
        cargo_contacto: 'Gerente General',
        direccion: 'Carretera Panamericana Norte Km 552, Trujillo',
        ciudad: 'Trujillo',
        pais: 'Perú',
        estado: 'pendiente',
        documentos_legales: JSON.stringify({
          ruc_document: '/docs/empresas/3/ruc.pdf',
          registro_sanitario: '/docs/empresas/3/registro_sanitario.pdf',
          certificado_haccp: '/docs/empresas/3/haccp.pdf'
        }),
        fecha_vencimiento_documentos: new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)), // 3 meses
        redes_sociales: JSON.stringify({
          facebook: 'https://facebook.com/saboresdelnorte',
          instagram: 'https://instagram.com/saboresdelnorte',
          tiktok: 'https://tiktok.com/@saboresdelnorte'
        }),
        productos_servicios: 'King Kong de manjar blanco, dulces tradicionales, conservas de frutas, productos artesanales del norte peruano.',
        experiencia_ferias: 'Mistura 2022, Feria Gastronómica del Norte 2023, ExpoAlimentos Trujillo 2023.',
        configuracion_especifica: JSON.stringify({
          categoria_preferida: 'gastronomia',
          requiere_refrigeracion: true,
          area_degustacion: true
        }),
        numero_participaciones: 2,
        calificacion_promedio: 4.50,
        created_at: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)),
        created_by: 2
      },
      {
        id_empresa: 4,
        nombre_empresa: 'Digital Marketing Pro',
        razon_social: 'Digital Marketing Pro S.A.C.',
        ruc: '20444555666',
        descripcion: 'Agencia de marketing digital especializada en estrategias 360°, manejo de redes sociales, SEO/SEM y publicidad digital para empresas de todos los tamaños.',
        sector: 'Marketing',
        tamaño_empresa: 'pequeña',
        logo_url: '/images/empresas/digital-marketing-pro-logo.png',
        sitio_web: 'https://www.digitalmarketingpro.pe',
        email_contacto: 'hola@digitalmarketingpro.pe',
        telefono_contacto: '+51923456789',
        nombre_contacto: 'Andrea Fernández López',
        cargo_contacto: 'CEO & Founder',
        direccion: 'Av. El Sol 1234, Oficina 502, San Blas',
        ciudad: 'Cusco',
        pais: 'Perú',
        estado: 'aprobada',
        fecha_aprobacion: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)), // 1 día atrás
        aprobada_por: 1,
        documentos_legales: JSON.stringify({
          ruc_document: '/docs/empresas/4/ruc.pdf',
          licencia_funcionamiento: '/docs/empresas/4/licencia.pdf'
        }),
        fecha_vencimiento_documentos: new Date(now.getTime() + (300 * 24 * 60 * 60 * 1000)), // 10 meses
        redes_sociales: JSON.stringify({
          facebook: 'https://facebook.com/digitalmarketingpro',
          linkedin: 'https://linkedin.com/company/digitalmarketingpro',
          instagram: 'https://instagram.com/digitalmarketingpro',
          youtube: 'https://youtube.com/c/digitalmarketingpro'
        }),
        productos_servicios: 'Estrategias de marketing digital, gestión de redes sociales, desarrollo web, SEO/SEM, publicidad en Google y Facebook.',
        experiencia_ferias: 'Expomarketing 2023, Digital Summit Lima 2023.',
        configuracion_especifica: JSON.stringify({
          categoria_preferida: 'servicios',
          requiere_area_presentaciones: true,
          pantallas_led: true
        }),
        numero_participaciones: 1,
        calificacion_promedio: 4.90,
        created_at: new Date(now.getTime() - (1 * 24 * 60 * 60 * 1000)),
        created_by: 1
      },
      {
        id_empresa: 5,
        nombre_empresa: 'Textiles Andinos',
        razon_social: 'Textiles Andinos del Perú S.A.',
        ruc: '20777888999',
        descripcion: 'Empresa textil con tradición familiar, especializada en la producción de prendas de alpaca y algodón pima peruano, combinando técnicas ancestrales con diseños contemporáneos.',
        sector: 'Textil',
        tamaño_empresa: 'grande',
        logo_url: '/images/empresas/textiles-andinos-logo.png',
        sitio_web: 'https://www.textilesandinos.com',
        email_contacto: 'exportaciones@textilesandinos.com',
        telefono_contacto: '+51945678912',
        nombre_contacto: 'Juan Carlos Mendoza Quispe',
        cargo_contacto: 'Director de Exportaciones',
        direccion: 'Parque Industrial de Arequipa, Lote 15',
        ciudad: 'Arequipa',
        pais: 'Perú',
        estado: 'suspendida',
        fecha_aprobacion: new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000)), // 30 días atrás
        aprobada_por: 1,
        motivo_rechazo: 'Suspendida temporalmente por actualización de documentos de exportación.',
        documentos_legales: JSON.stringify({
          ruc_document: '/docs/empresas/5/ruc.pdf',
          registro_exportador: '/docs/empresas/5/registro_exportador.pdf',
          certificado_origen: '/docs/empresas/5/certificado_origen.pdf'
        }),
        fecha_vencimiento_documentos: new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)), // 1 mes (próximo a vencer)
        redes_sociales: JSON.stringify({
          facebook: 'https://facebook.com/textilesandinos',
          instagram: 'https://instagram.com/textilesandinos',
          linkedin: 'https://linkedin.com/company/textilesandinos'
        }),
        productos_servicios: 'Prendas de alpaca, ropa de algodón pima, accesorios textiles, tejidos artesanales, productos de exportación.',
        experiencia_ferias: 'Expo Textil Perú 2019-2023, Magic Las Vegas 2022, Texworld París 2023.',
        configuracion_especifica: JSON.stringify({
          categoria_preferida: 'moda',
          requiere_area_exhibicion: true,
          maniquies: true,
          iluminacion_especial: true
        }),
        numero_participaciones: 8,
        calificacion_promedio: 4.60,
        created_at: new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)),
        created_by: 1
      },
      {
        id_empresa: 6,
        nombre_empresa: 'Startup InnovaLab',
        razon_social: 'InnovaLab Technologies S.A.C.',
        ruc: '20111222333',
        descripcion: 'Startup emergente enfocada en el desarrollo de aplicaciones móviles y soluciones IoT para smart cities y agricultura de precisión.',
        sector: 'Tecnología',
        tamaño_empresa: 'micro',
        logo_url: '/images/empresas/innovalab-logo.png',
        sitio_web: 'https://www.innovalab.pe',
        email_contacto: 'contact@innovalab.pe',
        telefono_contacto: '+51987123456',
        nombre_contacto: 'Sofía Ramírez Torres',
        cargo_contacto: 'CTO & Co-founder',
        direccion: 'Hub de Innovación UTEC, Barranco',
        ciudad: 'Lima',
        pais: 'Perú',
        estado: 'rechazada',
        motivo_rechazo: 'Documentación incompleta. Falta registro de propiedad intelectual de las soluciones tecnológicas.',
        documentos_legales: JSON.stringify({
          ruc_document: '/docs/empresas/6/ruc.pdf'
        }),
        redes_sociales: JSON.stringify({
          linkedin: 'https://linkedin.com/company/innovalab',
          twitter: 'https://twitter.com/innovalab_pe'
        }),
        productos_servicios: 'Aplicaciones móviles para agricultura, sensores IoT, plataformas de monitoreo remoto, consultoría en transformación digital.',
        experiencia_ferias: 'Primera participación en ferias. Experiencia en demodays y eventos de startups.',
        configuracion_especifica: JSON.stringify({
          categoria_preferida: 'innovation',
          requiere_demos_vivo: true,
          area_networking: true
        }),
        numero_participaciones: 0,
        calificacion_promedio: null,
        created_at: now,
        created_by: 2
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('empresa_expositora', null, {});
  }
};
