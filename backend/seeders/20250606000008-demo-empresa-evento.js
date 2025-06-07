'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert('empresa_evento', [
      {
        id_empresa: 1, // TechInnovate Solutions
        id_evento: 1,   // Feria de Tecnología e Innovación 2025
        fecha_registro: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)), // 15 días atrás
        estado_participacion: 'confirmada',
        fecha_aprobacion_participacion: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)),
        aprobada_participacion_por: 1,
        numero_stand: 'A-15',
        tipo_stand: 'premium',
        area_stand: 25.00,
        precio_stand: 2500.00,
        moneda_precio: 'PEN',
        estado_pago: 'pagado',
        fecha_limite_pago: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)),
        fecha_pago: new Date(now.getTime() - (8 * 24 * 60 * 60 * 1000)),
        referencia_pago: 'PAG-TI-001-2025',
        productos_a_exponer: 'Soluciones de IA para empresas, plataforma de automatización de procesos, chatbots inteligentes, sistema de análisis predictivo.',
        objetivos_participacion: 'Generar 50 leads calificados, cerrar 5 contratos durante la feria, posicionar la marca como líder en IA empresarial.',
        servicios_adicionales: JSON.stringify({
          electricidad: '220V trifásica',
          internet: 'fibra óptica 100Mbps',
          pantallas: '2 pantallas LED 55"',
          mobiliario: 'mesa de reuniones, sillas ejecutivas',
          decoracion: 'diseño personalizado'
        }),
        costo_servicios_adicionales: 800.00,
        personal_asignado: JSON.stringify([
          { nombre: 'Carlos Rodriguez', cargo: 'Gerente Comercial', email: 'carlos@techinnovate.pe' },
          { nombre: 'Ana García', cargo: 'Especialista en IA', email: 'ana@techinnovate.pe' },
          { nombre: 'Miguel Torres', cargo: 'Desarrollador Senior', email: 'miguel@techinnovate.pe' }
        ]),
        contacto_evento: 'Carlos Rodriguez Martinez',
        telefono_contacto_evento: '+51987654321',
        email_contacto_evento: 'carlos@techinnovate.pe',
        horario_atencion: JSON.stringify({
          'dia1': { inicio: '09:00', fin: '18:00' },
          'dia2': { inicio: '09:00', fin: '18:00' },
          'dia3': { inicio: '09:00', fin: '17:00' }
        }),
        requiere_montaje_especial: true,
        fecha_montaje: new Date(now.getTime() + (25 * 24 * 60 * 60 * 1000)),
        fecha_desmontaje: new Date(now.getTime() + (33 * 24 * 60 * 60 * 1000)),
        documentos_evento: JSON.stringify({
          seguro_stand: '/docs/eventos/1/empresas/1/seguro.pdf',
          planos_montaje: '/docs/eventos/1/empresas/1/planos.pdf'
        }),
        configuracion_participacion: JSON.stringify({
          categoria: 'tecnologia_ia',
          demo_schedule: ['10:00', '14:00', '16:00'],
          networking_sessions: true
        }),
        created_by: 1
      },
      {
        id_empresa: 2, // EcoGreen Perú
        id_evento: 1,   // Feria de Tecnología e Innovación 2025
        fecha_registro: new Date(now.getTime() - (12 * 24 * 60 * 60 * 1000)), // 12 días atrás
        estado_participacion: 'aprobada',
        fecha_aprobacion_participacion: new Date(now.getTime() - (8 * 24 * 60 * 60 * 1000)),
        aprobada_participacion_por: 1,
        numero_stand: 'B-08',
        tipo_stand: 'basico',
        area_stand: 12.00,
        precio_stand: 800.00,
        moneda_precio: 'PEN',
        estado_pago: 'pendiente',
        fecha_limite_pago: new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)),
        productos_a_exponer: 'Productos de limpieza biodegradables, soluciones eco-tech para empresas, aplicación móvil de sostenibilidad.',
        objetivos_participacion: 'Dar a conocer la línea eco-tech, establecer alianzas con empresas tecnológicas, generar awareness sobre sostenibilidad.',
        servicios_adicionales: JSON.stringify({
          electricidad: '220V monofásica',
          mobiliario: 'básico'
        }),
        costo_servicios_adicionales: 150.00,
        personal_asignado: JSON.stringify([
          { nombre: 'María Elena Vásquez', cargo: 'Directora Comercial', email: 'maria@ecogreenperu.com' },
          { nombre: 'Pedro Sánchez', cargo: 'Especialista Técnico', email: 'pedro@ecogreenperu.com' }
        ]),
        contacto_evento: 'María Elena Vásquez',
        telefono_contacto_evento: '+51956789123',
        email_contacto_evento: 'maria@ecogreenperu.com',
        horario_atencion: JSON.stringify({
          'dia1': { inicio: '09:30', fin: '17:30' },
          'dia2': { inicio: '09:30', fin: '17:30' },
          'dia3': { inicio: '09:30', fin: '16:30' }
        }),
        requiere_montaje_especial: false,
        configuracion_participacion: JSON.stringify({
          categoria: 'sostenibilidad',
          area_demostracion: true,
          muestras_gratuitas: true
        }),
        created_by: 2
      },
      {
        id_empresa: 4, // Digital Marketing Pro
        id_evento: 2,   // Congreso Virtual de Marketing Digital
        fecha_registro: new Date(now.getTime() - (20 * 24 * 60 * 60 * 1000)), // 20 días atrás
        estado_participacion: 'confirmada',
        fecha_aprobacion_participacion: new Date(now.getTime() - (18 * 24 * 60 * 60 * 1000)),
        aprobada_participacion_por: 1,
        numero_stand: 'VIRTUAL-05',
        tipo_stand: 'virtual',
        precio_stand: 500.00,
        moneda_precio: 'USD',
        estado_pago: 'pagado',
        fecha_limite_pago: new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)),
        fecha_pago: new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000)),
        referencia_pago: 'PAY-DMP-002-2025',
        productos_a_exponer: 'Plataforma de marketing automation, herramientas de análisis de redes sociales, servicios de consultoría digital.',
        objetivos_participacion: 'Conseguir 20 clientes nuevos, posicionar servicios de automation, crear network con profesionales de marketing.',
        servicios_adicionales: JSON.stringify({
          sala_virtual_premium: true,
          transmision_hd: true,
          chat_moderado: true,
          grabacion_sesiones: true
        }),
        costo_servicios_adicionales: 200.00,
        personal_asignado: JSON.stringify([
          { nombre: 'Andrea Fernández López', cargo: 'CEO', email: 'andrea@digitalmarketingpro.pe' },
          { nombre: 'Luis Mora', cargo: 'Strategy Director', email: 'luis@digitalmarketingpro.pe' }
        ]),
        contacto_evento: 'Andrea Fernández López',
        telefono_contacto_evento: '+51923456789',
        email_contacto_evento: 'andrea@digitalmarketingpro.pe',
        horario_atencion: JSON.stringify({
          'dia1': { inicio: '08:00', fin: '17:00', zona_horaria: 'America/Lima' },
          'dia2': { inicio: '08:00', fin: '17:00', zona_horaria: 'America/Lima' }
        }),
        configuracion_participacion: JSON.stringify({
          tipo_participacion: 'conferencia_y_stand',
          conferencia_titulo: 'Marketing Digital para PYMEs en 2025',
          horario_conferencia: '2025-08-15 14:00:00',
          demo_tools: true
        }),
        created_by: 1
      },
      {
        id_empresa: 3, // Sabores del Norte
        id_evento: 3,   // Expo Gastronomía Peruana Híbrida
        fecha_registro: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)), // 5 días atrás
        estado_participacion: 'pendiente_aprobacion',
        productos_a_exponer: 'King Kong de manjar blanco, dulces tradicionales del norte, conservas artesanales, productos gourmet.',
        objetivos_participacion: 'Expandir mercado a Lima, establecer canales de distribución, participar en networking gastronómico.',
        personal_asignado: JSON.stringify([
          { nombre: 'Roberto Salinas Gutiérrez', cargo: 'Gerente General', email: 'roberto@saboresdelnorte.pe' },
          { nombre: 'Carmen Salinas', cargo: 'Chef Ejecutiva', email: 'carmen@saboresdelnorte.pe' }
        ]),
        contacto_evento: 'Roberto Salinas Gutiérrez',
        telefono_contacto_evento: '+51944123456',
        email_contacto_evento: 'roberto@saboresdelnorte.pe',
        requiere_montaje_especial: true,
        configuracion_participacion: JSON.stringify({
          categoria: 'gastronomia_tradicional',
          requiere_cocina: true,
          area_degustacion: true,
          refrigeracion: true,
          demo_cocina_en_vivo: true
        }),
        created_by: 2
      },
      {
        id_empresa: 5, // Textiles Andinos
        id_evento: 1,   // Feria de Tecnología e Innovación 2025 (participación histórica)
        fecha_registro: new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000)), // 60 días atrás
        estado_participacion: 'cancelada',
        fecha_aprobacion_participacion: new Date(now.getTime() - (55 * 24 * 60 * 60 * 1000)),
        aprobada_participacion_por: 1,
        numero_stand: 'C-22',
        tipo_stand: 'corporativo',
        area_stand: 40.00,
        precio_stand: 4000.00,
        moneda_precio: 'PEN',
        estado_pago: 'reembolsado',
        fecha_limite_pago: new Date(now.getTime() - (45 * 24 * 60 * 60 * 1000)),
        fecha_pago: new Date(now.getTime() - (50 * 24 * 60 * 60 * 1000)),
        referencia_pago: 'PAG-TA-003-2025-REF',
        productos_a_exponer: 'Textiles inteligentes, fibras tecnológicas, prendas con sensores integrados.',
        objetivos_participacion: 'Presentar línea de textiles tecnológicos, buscar inversores para I+D.',
        motivo_rechazo_participacion: 'Cancelada por suspensión temporal de la empresa para actualización de documentos.',
        servicios_adicionales: JSON.stringify({
          electricidad: '220V trifásica',
          iluminacion_profesional: true,
          area_exhibicion: true,
          seguridad_adicional: true
        }),
        costo_servicios_adicionales: 1200.00,
        configuracion_participacion: JSON.stringify({
          categoria: 'textiles_tech',
          cancelacion_motivo: 'documentos_vencidos'
        }),
        created_by: 1
      },
      {
        id_empresa: 1, // TechInnovate Solutions - participación histórica
        id_evento: 5,   // Expo Salud y Bienestar 2024 (evento finalizado)
        fecha_registro: new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000)), // 90 días atrás
        estado_participacion: 'confirmada',
        fecha_aprobacion_participacion: new Date(now.getTime() - (85 * 24 * 60 * 60 * 1000)),
        aprobada_participacion_por: 1,
        numero_stand: 'TECH-01',
        tipo_stand: 'premium',
        area_stand: 20.00,
        precio_stand: 2000.00,
        moneda_precio: 'PEN',
        estado_pago: 'pagado',
        fecha_pago: new Date(now.getTime() - (80 * 24 * 60 * 60 * 1000)),
        referencia_pago: 'PAG-TI-SALUD-2024',
        productos_a_exponer: 'Aplicaciones de salud digital, telemedicina, AI para diagnóstico, wearables de salud.',
        objetivos_participacion: 'Introducir soluciones de healthtech, generar leads en sector salud.',
        servicios_adicionales: JSON.stringify({
          electricidad: '220V',
          internet: 'fibra óptica',
          pantallas: '1 pantalla LED 43"'
        }),
        costo_servicios_adicionales: 400.00,
        personal_asignado: JSON.stringify([
          { nombre: 'Carlos Rodriguez', cargo: 'Gerente Comercial', email: 'carlos@techinnovate.pe' },
          { nombre: 'Dr. Patricia Morales', cargo: 'Especialista HealthTech', email: 'patricia@techinnovate.pe' }
        ]),
        contacto_evento: 'Carlos Rodriguez Martinez',
        telefono_contacto_evento: '+51987654321',
        email_contacto_evento: 'carlos@techinnovate.pe',
        // Métricas post-evento (ya finalizado)
        calificacion_evento: 4.5,
        comentarios_evento: 'Excelente organización del evento. Buena afluencia de público objetivo del sector salud. Recomendamos mejorar la señalización.',
        numero_visitantes_stand: 450,
        leads_generados: 35,
        ventas_realizadas: 15000.00,
        configuracion_participacion: JSON.stringify({
          categoria: 'healthtech',
          evento_finalizado: true,
          satisfaccion: 'alta'
        }),
        created_by: 1
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('empresa_evento', null, {});
  }
};
