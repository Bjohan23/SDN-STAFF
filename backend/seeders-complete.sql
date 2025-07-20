-- Script completo de seeders para SDN-STAFF
-- Ejecutar este script DESPUÉS del setup-database.sql

USE `sdn-staff`;

-- =====================================================
-- SEEDER: Usuarios adicionales
-- =====================================================
INSERT INTO `usuario` (`id_usuario`, `correo`, `password_hash`, `nombre`, `estado`, `fecha_creacion`) VALUES
(2, 'editor@sdn-staff.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Editor del Sistema', 'activo', NOW()),
(3, 'usuario@sdn-staff.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuario Demo', 'activo', NOW()),
(4, 'maria.gonzalez@techcorp.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María González', 'activo', NOW()),
(5, 'carlos.rodriguez@innovate.pe', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Rodríguez', 'activo', NOW());

-- =====================================================
-- SEEDER: Asignación de roles a usuarios
-- =====================================================
INSERT INTO `usuariorol` (`id_usuario`, `id_rol`, `fecha_asignacion`) VALUES
(2, 2, NOW()), -- Editor
(3, 3, NOW()), -- Usuario
(4, 3, NOW()), -- Usuario
(5, 3, NOW()); -- Usuario

-- =====================================================
-- SEEDER: Tipos de evento adicionales
-- =====================================================
INSERT INTO `tipo_evento` (`id_tipo_evento`, `nombre_tipo`, `descripcion`, `categoria`, `duracion_estimada`, `capacidad_maxima`, `requiere_aprobacion`, `estado`) VALUES
(4, 'Workshop', 'Taller práctico de capacitación', 'Educativo', 180, 50, 0, 'activo'),
(5, 'Seminario', 'Seminario especializado', 'Educativo', 360, 200, 0, 'activo'),
(6, 'Feria', 'Feria comercial y de servicios', 'Comercial', 2880, 2000, 0, 'activo'),
(7, 'Convención', 'Convención anual de la industria', 'Profesional', 4320, 1500, 1, 'activo'),
(8, 'Demo Day', 'Presentación de startups y proyectos', 'Innovación', 480, 300, 0, 'activo'),
(9, 'Hackathon', 'Competencia de programación', 'Tecnología', 2880, 100, 1, 'activo'),
(10, 'Meetup', 'Encuentro informal de profesionales', 'Networking', 180, 80, 0, 'activo');

-- =====================================================
-- SEEDER: Eventos adicionales
-- =====================================================
INSERT INTO `evento` (`id_evento`, `id_tipo_evento`, `nombre_evento`, `descripcion`, `fecha_inicio`, `fecha_fin`, `ubicacion`, `capacidad_maxima`, `estado`) VALUES
(2, 1, 'Conferencia de Inteligencia Artificial', 'Conferencia sobre las últimas tendencias en IA', '2025-09-20 09:00:00', '2025-09-20 18:00:00', 'Centro de Convenciones de Lima', 500, 'planificado'),
(3, 4, 'Workshop de Desarrollo Web', 'Taller práctico de React y Node.js', '2025-10-15 14:00:00', '2025-10-15 17:00:00', 'Campus San Isidro', 50, 'planificado'),
(4, 6, 'Feria de Empleo Tech 2025', 'Feria de empleo especializada en tecnología', '2025-11-10 09:00:00', '2025-11-12 18:00:00', 'Centro de Exposiciones Jockey', 2000, 'planificado'),
(5, 7, 'Convención Nacional de Startups', 'Convención anual de startups peruanas', '2025-12-05 08:00:00', '2025-12-07 20:00:00', 'Centro de Convenciones de Lima', 1500, 'planificado'),
(6, 8, 'Demo Day Lima 2025', 'Presentación de startups del programa de aceleración', '2025-08-30 16:00:00', '2025-08-30 20:00:00', 'WeWork San Isidro', 300, 'planificado'),
(7, 9, 'Hackathon Blockchain Perú', 'Competencia de desarrollo blockchain', '2025-09-25 18:00:00', '2025-09-27 18:00:00', 'Campus Miraflores', 100, 'planificado'),
(8, 10, 'Meetup React Lima', 'Encuentro de desarrolladores React', '2025-10-05 19:00:00', '2025-10-05 21:00:00', 'Café Z', 80, 'planificado');

-- =====================================================
-- SEEDER: Tipos de stand adicionales
-- =====================================================
INSERT INTO `tipo_stand` (`id_tipo_stand`, `nombre_tipo`, `descripcion`, `area_minima`, `area_maxima`, `precio_base`, `moneda`, `equipamiento_incluido`, `servicios_incluidos`, `caracteristicas_especiales`, `restricciones`, `permite_personalizacion`, `requiere_aprobacion`, `estado`, `orden_visualizacion`) VALUES
(4, 'Virtual', 'Stand virtual para eventos híbridos', NULL, NULL, 120.00, 'PEN', '["Plataforma virtual dedicada", "Sala de videoconferencias", "Chat en tiempo real", "Biblioteca de documentos"]', '["Soporte técnico 24/7", "Capacitación de plataforma", "Análisis de visitantes"]', '["Acceso global", "Sin limitaciones geográficas", "Analíticas avanzadas"]', '["Requiere conexión estable", "Capacitación obligatoria"]', 1, 0, 'activo', 4),
(5, 'Personalizado', 'Stand completamente personalizado', 15.00, 200.00, 300.00, 'PEN', '["Diseño arquitectónico exclusivo", "Mobiliario a medida", "Tecnología de vanguardia"]', '["Consultoría de diseño", "Project manager dedicado", "Instalación especializada"]', '["Diseño único", "Sin limitaciones estéticas", "Integración tecnológica avanzada"]', '["Aprobación obligatoria", "Plazo mínimo 60 días"]', 1, 1, 'activo', 5),
(6, 'Startup', 'Stand especializado para startups', 8.00, 15.00, 100.00, 'PEN', '["Mesa startup", "Tres sillas", "Pantalla LED", "Conexión WiFi premium"]', '["Limpieza diaria", "Seguridad", "WiFi premium", "Mentoría disponible"]', '["Ubicación en zona startup", "Visibilidad especial", "Networking facilitado"]', '["Solo para startups verificadas", "Presentación obligatoria"]', 1, 0, 'activo', 6),
(7, 'Patrocinador', 'Stand para patrocinadores principales', 20.00, 80.00, 400.00, 'PEN', '["Mobiliario premium", "Sistema audiovisual completo", "Sala de reuniones", "Catering incluido"]', '["Servicio VIP", "Seguridad dedicada", "WiFi corporativo", "Catering premium"]', '["Ubicación premium", "Máxima visibilidad", "Branding destacado"]', '["Solo para patrocinadores", "Aprobación previa"]', 1, 1, 'activo', 7);

-- =====================================================
-- SEEDER: Stands adicionales
-- =====================================================
INSERT INTO `stand` (`id_stand`, `id_tipo_stand`, `codigo_stand`, `nombre_stand`, `descripcion`, `area`, `ubicacion`, `estado`, `precio_actual`) VALUES
(5, 1, 'BAS-003', 'Stand Básico 3', 'Stand básico en zona de alto tráfico', 10.00, 'Zona A - Entrada principal', 'disponible', 80.00),
(6, 1, 'BAS-004', 'Stand Básico 4', 'Stand básico cerca de cafetería', 8.00, 'Zona C - Cafetería', 'disponible', 80.00),
(7, 2, 'PRE-002', 'Stand Premium 2', 'Stand premium con vista panorámica', 20.00, 'Zona VIP - Segundo nivel', 'disponible', 150.00),
(8, 2, 'PRE-003', 'Stand Premium 3', 'Stand premium cerca de escenario', 22.00, 'Zona VIP - Frente escenario', 'disponible', 150.00),
(9, 3, 'COR-002', 'Stand Corporativo 2', 'Stand corporativo con sala privada', 60.00, 'Zona Premium - Esquina', 'disponible', 250.00),
(10, 3, 'COR-003', 'Stand Corporativo 3', 'Stand corporativo con terraza', 75.00, 'Zona Premium - Terraza', 'disponible', 250.00),
(11, 4, 'VIR-001', 'Stand Virtual 1', 'Stand virtual para eventos híbridos', NULL, 'Plataforma Virtual', 'disponible', 120.00),
(12, 4, 'VIR-002', 'Stand Virtual 2', 'Stand virtual con sala de reuniones', NULL, 'Plataforma Virtual', 'disponible', 120.00),
(13, 5, 'PER-001', 'Stand Personalizado 1', 'Stand personalizado para empresa grande', 40.00, 'Zona Exclusiva', 'disponible', 300.00),
(14, 6, 'STA-001', 'Stand Startup 1', 'Stand especializado para startups', 12.00, 'Zona Startup', 'disponible', 100.00),
(15, 6, 'STA-002', 'Stand Startup 2', 'Stand startup con visibilidad especial', 10.00, 'Zona Startup - Centro', 'disponible', 100.00),
(16, 7, 'PAT-001', 'Stand Patrocinador 1', 'Stand para patrocinador principal', 50.00, 'Zona Patrocinadores', 'disponible', 400.00);

-- =====================================================
-- SEEDER: Empresas expositoras adicionales
-- =====================================================
INSERT INTO `empresa_expositora` (`id_empresa`, `nombre_empresa`, `razon_social`, `ruc`, `email_contacto`, `telefono_contacto`, `nombre_contacto`, `cargo_contacto`, `sector`, `sitio_web`, `tamaño_empresa`, `descripcion`, `direccion`, `ciudad`, `pais`, `estado`) VALUES
(3, 'Digital Solutions Perú', 'Digital Solutions Perú S.A.C.', '20345678901', 'contacto@digitalsolutions.pe', '+51 1 4567890', 'Ana Martínez', 'CEO', 'Tecnología', 'https://www.digitalsolutions.pe', 'mediana', 'Empresa especializada en soluciones digitales y transformación digital', 'Av. Arequipa 1234, Lima', 'Lima', 'Perú', 'aprobada'),
(4, 'CloudTech Perú', 'CloudTech Perú E.I.R.L.', '20456789012', 'info@cloudtech.pe', '+51 1 5678901', 'Luis Fernández', 'Director Técnico', 'Tecnología', 'https://www.cloudtech.pe', 'pequeña', 'Startup especializada en servicios cloud y DevOps', 'Calle Los Pinos 567, San Isidro', 'Lima', 'Perú', 'aprobada'),
(5, 'Data Analytics Pro', 'Data Analytics Pro S.A.C.', '20567890123', 'contacto@dataanalytics.pe', '+51 1 6789012', 'Carmen Silva', 'Directora de Operaciones', 'Consultoría', 'https://www.dataanalytics.pe', 'mediana', 'Consultora especializada en análisis de datos y business intelligence', 'Av. Javier Prado 890, San Isidro', 'Lima', 'Perú', 'aprobada'),
(6, 'Green Energy Solutions', 'Green Energy Solutions Perú S.A.C.', '20678901234', 'info@greenenergy.pe', '+51 1 7890123', 'Roberto Vargas', 'Gerente General', 'Energía', 'https://www.greenenergy.pe', 'grande', 'Empresa líder en soluciones de energía renovable', 'Av. La Marina 2345, San Miguel', 'Lima', 'Perú', 'aprobada'),
(7, 'EduTech Perú', 'EduTech Perú E.I.R.L.', '20789012345', 'contacto@edutech.pe', '+51 1 8901234', 'Patricia Ríos', 'Directora Académica', 'Educación', 'https://www.edutech.pe', 'pequeña', 'Startup educativa especializada en tecnología educativa', 'Calle Las Begonias 123, Miraflores', 'Lima', 'Perú', 'pendiente'),
(8, 'FinTech Solutions', 'FinTech Solutions Perú S.A.C.', '20890123456', 'info@fintech.pe', '+51 1 9012345', 'Diego Morales', 'CTO', 'Finanzas', 'https://www.fintech.pe', 'mediana', 'Empresa especializada en soluciones financieras tecnológicas', 'Av. Benavides 3456, Miraflores', 'Lima', 'Perú', 'aprobada'),
(9, 'HealthTech Perú', 'HealthTech Perú S.A.C.', '20901234567', 'contacto@healthtech.pe', '+51 1 0123456', 'Sofia Torres', 'Directora Médica', 'Salud', 'https://www.healthtech.pe', 'mediana', 'Empresa especializada en tecnología médica y telemedicina', 'Av. Salaverry 4567, Jesús María', 'Lima', 'Perú', 'aprobada'),
(10, 'Logistics Pro', 'Logistics Pro Perú S.A.C.', '21012345678', 'info@logisticspro.pe', '+51 1 1234567', 'Miguel Ángel Castro', 'Director de Operaciones', 'Logística', 'https://www.logisticspro.pe', 'grande', 'Empresa líder en soluciones logísticas y cadena de suministro', 'Av. Argentina 5678, Callao', 'Callao', 'Perú', 'aprobada');

-- =====================================================
-- SEEDER: Servicios adicionales
-- =====================================================
CREATE TABLE IF NOT EXISTS `servicio_adicional` (
  `id_servicio` int NOT NULL AUTO_INCREMENT,
  `nombre_servicio` varchar(100) NOT NULL,
  `descripcion` text,
  `categoria` varchar(50) DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `moneda` varchar(10) DEFAULT 'PEN',
  `disponibilidad` enum('disponible','limitado','agotado') DEFAULT 'disponible',
  `requiere_reserva` tinyint(1) DEFAULT '0',
  `tiempo_entrega` int DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_servicio`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_estado` (`estado`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `servicio_adicional` (`id_servicio`, `nombre_servicio`, `descripcion`, `categoria`, `precio`, `moneda`, `disponibilidad`, `requiere_reserva`, `tiempo_entrega`, `estado`) VALUES
(1, 'WiFi Premium', 'Conexión WiFi de alta velocidad con ancho de banda dedicado', 'Conectividad', 50.00, 'PEN', 'disponible', 0, 1, 'activo'),
(2, 'Electricidad Adicional', 'Tomas eléctricas adicionales con mayor capacidad', 'Infraestructura', 30.00, 'PEN', 'disponible', 0, 1, 'activo'),
(3, 'Mobiliario Extra', 'Mobiliario adicional (mesas, sillas, estantes)', 'Mobiliario', 80.00, 'PEN', 'disponible', 1, 24, 'activo'),
(4, 'Iluminación Especial', 'Sistema de iluminación personalizado y profesional', 'Iluminación', 120.00, 'PEN', 'disponible', 1, 48, 'activo'),
(5, 'Sistema de Sonido', 'Sistema de audio profesional con micrófonos', 'Audiovisual', 200.00, 'PEN', 'disponible', 1, 48, 'activo'),
(6, 'Pantalla LED', 'Pantalla LED de alta resolución para presentaciones', 'Audiovisual', 300.00, 'PEN', 'disponible', 1, 72, 'activo'),
(7, 'Catering Básico', 'Servicio de catering con café, té y galletas', 'Alimentación', 150.00, 'PEN', 'disponible', 1, 24, 'activo'),
(8, 'Catering Premium', 'Servicio de catering completo con menú ejecutivo', 'Alimentación', 300.00, 'PEN', 'disponible', 1, 48, 'activo'),
(9, 'Seguridad Adicional', 'Servicio de seguridad privada para el stand', 'Seguridad', 250.00, 'PEN', 'disponible', 1, 24, 'activo'),
(10, 'Limpieza Especializada', 'Servicio de limpieza especializada durante el evento', 'Servicios', 100.00, 'PEN', 'disponible', 0, 12, 'activo'),
(11, 'Almacenamiento', 'Espacio de almacenamiento seguro para materiales', 'Logística', 80.00, 'PEN', 'disponible', 0, 1, 'activo'),
(12, 'Transporte de Materiales', 'Servicio de transporte y montaje de materiales', 'Logística', 200.00, 'PEN', 'disponible', 1, 72, 'activo'),
(13, 'Fotografía Profesional', 'Servicio de fotografía profesional del stand', 'Marketing', 180.00, 'PEN', 'disponible', 1, 24, 'activo'),
(14, 'Video Promocional', 'Grabación y edición de video promocional', 'Marketing', 400.00, 'PEN', 'disponible', 1, 72, 'activo'),
(15, 'Análisis de Visitantes', 'Reporte detallado de visitantes y métricas', 'Analytics', 120.00, 'PEN', 'disponible', 0, 48, 'activo'),
(16, 'Soporte Técnico', 'Soporte técnico especializado durante el evento', 'Soporte', 150.00, 'PEN', 'disponible', 0, 1, 'activo'),
(17, 'Traducción Simultánea', 'Servicio de traducción simultánea', 'Comunicación', 500.00, 'PEN', 'disponible', 1, 72, 'activo'),
(18, 'Impresión de Materiales', 'Impresión de folletos, banners y materiales promocionales', 'Impresión', 100.00, 'PEN', 'disponible', 1, 48, 'activo'),
(19, 'Decoración Floral', 'Servicio de decoración con arreglos florales', 'Decoración', 200.00, 'PEN', 'disponible', 1, 24, 'activo'),
(20, 'Silla Ejecutiva', 'Sillas ejecutivas acolchadas y ergonómicas', 'Mobiliario', 50.00, 'PEN', 'disponible', 0, 1, 'activo');

-- =====================================================
-- SEEDER: Categorías comerciales
-- =====================================================
CREATE TABLE IF NOT EXISTS `categoria_comercial` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) NOT NULL,
  `descripcion` text,
  `color` varchar(7) DEFAULT '#3B82F6',
  `icono` varchar(50) DEFAULT NULL,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `orden_visualizacion` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  KEY `idx_estado` (`estado`),
  KEY `idx_orden_visualizacion` (`orden_visualizacion`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `categoria_comercial` (`id_categoria`, `nombre_categoria`, `descripcion`, `color`, `icono`, `estado`, `orden_visualizacion`) VALUES
(1, 'Tecnología', 'Empresas de tecnología, software y servicios digitales', '#3B82F6', 'computer', 'activo', 1),
(2, 'Consultoría', 'Empresas de consultoría empresarial y estratégica', '#10B981', 'briefcase', 'activo', 2),
(3, 'Finanzas', 'Empresas del sector financiero y fintech', '#F59E0B', 'dollar-sign', 'activo', 3),
(4, 'Salud', 'Empresas del sector salud y biotecnología', '#EF4444', 'heart', 'activo', 4),
(5, 'Educación', 'Empresas de educación y capacitación', '#8B5CF6', 'book-open', 'activo', 5),
(6, 'Manufactura', 'Empresas manufactureras e industriales', '#6B7280', 'factory', 'activo', 6),
(7, 'Retail', 'Empresas de comercio minorista', '#EC4899', 'shopping-bag', 'activo', 7),
(8, 'Logística', 'Empresas de logística y transporte', '#F97316', 'truck', 'activo', 8),
(9, 'Energía', 'Empresas del sector energético', '#84CC16', 'zap', 'activo', 9),
(10, 'Medios', 'Empresas de medios y comunicación', '#06B6D4', 'radio', 'activo', 10),
(11, 'Turismo', 'Empresas del sector turístico', '#14B8A6', 'globe', 'activo', 11),
(12, 'Inmobiliaria', 'Empresas del sector inmobiliario', '#6366F1', 'home', 'activo', 12),
(13, 'Legal', 'Empresas de servicios legales', '#A855F7', 'scale', 'activo', 13),
(14, 'Marketing', 'Empresas de marketing y publicidad', '#F43F5E', 'megaphone', 'activo', 14),
(15, 'Startup', 'Startups y empresas emergentes', '#22C55E', 'rocket', 'activo', 15);

-- =====================================================
-- SEEDER: Etiquetas libres
-- =====================================================
CREATE TABLE IF NOT EXISTS `etiqueta_libre` (
  `id_etiqueta` int NOT NULL AUTO_INCREMENT,
  `nombre_etiqueta` varchar(100) NOT NULL,
  `descripcion` text,
  `color` varchar(7) DEFAULT '#6B7280',
  `tipo` enum('general','especializada','temporal') DEFAULT 'general',
  `estado` enum('activa','inactiva') DEFAULT 'activa',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_etiqueta`),
  UNIQUE KEY `unique_nombre_etiqueta` (`nombre_etiqueta`),
  KEY `idx_tipo` (`tipo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `etiqueta_libre` (`id_etiqueta`, `nombre_etiqueta`, `descripcion`, `color`, `tipo`, `estado`) VALUES
(1, 'Innovación', 'Empresas innovadoras y disruptivas', '#3B82F6', 'general', 'activa'),
(2, 'Sostenibilidad', 'Empresas comprometidas con la sostenibilidad', '#10B981', 'general', 'activa'),
(3, 'Certificada', 'Empresas con certificaciones internacionales', '#F59E0B', 'especializada', 'activa'),
(4, 'B Corp', 'Empresas certificadas como B Corporation', '#8B5CF6', 'especializada', 'activa'),
(5, 'Mujer Líder', 'Empresas lideradas por mujeres', '#EC4899', 'especializada', 'activa'),
(6, 'Exportadora', 'Empresas con presencia internacional', '#F97316', 'especializada', 'activa'),
(7, 'RSE', 'Empresas con programas de responsabilidad social', '#84CC16', 'general', 'activa'),
(8, 'Digital', 'Empresas 100% digitales', '#06B6D4', 'general', 'activa'),
(9, 'Tradicional', 'Empresas con larga trayectoria', '#14B8A6', 'general', 'activa'),
(10, 'Emergente', 'Empresas en crecimiento acelerado', '#22C55E', 'general', 'activa'),
(11, 'Premium', 'Empresas de alta gama', '#6366F1', 'especializada', 'activa'),
(12, 'Económica', 'Empresas con productos económicos', '#A855F7', 'especializada', 'activa'),
(13, 'Tecnología Verde', 'Empresas de tecnología sostenible', '#F43F5E', 'especializada', 'activa'),
(14, 'Inclusiva', 'Empresas con políticas de inclusión', '#3B82F6', 'especializada', 'activa'),
(15, 'Remota', 'Empresas con trabajo remoto', '#10B981', 'general', 'activa'),
(16, 'Híbrida', 'Empresas con modelo híbrido', '#F59E0B', 'general', 'activa'),
(17, 'Presencial', 'Empresas con trabajo presencial', '#8B5CF6', 'general', 'activa'),
(18, 'Fintech', 'Empresas de tecnología financiera', '#EC4899', 'especializada', 'activa'),
(19, 'Edtech', 'Empresas de tecnología educativa', '#F97316', 'especializada', 'activa'),
(20, 'Healthtech', 'Empresas de tecnología en salud', '#84CC16', 'especializada', 'activa');

-- =====================================================
-- SEEDER: Relación empresa-categoría
-- =====================================================
CREATE TABLE IF NOT EXISTS `empresa_categoria` (
  `id_empresa` int NOT NULL,
  `id_categoria` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id_empresa`,`id_categoria`),
  KEY `idx_id_categoria` (`id_categoria`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`id_empresa`) REFERENCES `empresa_expositora` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_categoria`) REFERENCES `categoria_comercial` (`id_categoria`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `empresa_categoria` (`id_empresa`, `id_categoria`) VALUES
(1, 1), -- TechCorp Perú - Tecnología
(2, 2), -- Innovate Solutions - Consultoría
(3, 1), -- Digital Solutions Perú - Tecnología
(4, 1), -- CloudTech Perú - Tecnología
(5, 2), -- Data Analytics Pro - Consultoría
(6, 9), -- Green Energy Solutions - Energía
(7, 5), -- EduTech Perú - Educación
(8, 3), -- FinTech Solutions - Finanzas
(9, 4), -- HealthTech Perú - Salud
(10, 8); -- Logistics Pro - Logística

-- =====================================================
-- SEEDER: Relación empresa-etiqueta
-- =====================================================
CREATE TABLE IF NOT EXISTS `empresa_etiqueta` (
  `id_empresa` int NOT NULL,
  `id_etiqueta` int NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  PRIMARY KEY (`id_empresa`,`id_etiqueta`),
  KEY `idx_id_etiqueta` (`id_etiqueta`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`id_empresa`) REFERENCES `empresa_expositora` (`id_empresa`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_etiqueta`) REFERENCES `etiqueta_libre` (`id_etiqueta`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `empresa_etiqueta` (`id_empresa`, `id_etiqueta`) VALUES
(1, 1), -- TechCorp Perú - Innovación
(1, 8), -- TechCorp Perú - Digital
(2, 1), -- Innovate Solutions - Innovación
(2, 15), -- Innovate Solutions - Startup
(3, 1), -- Digital Solutions Perú - Innovación
(3, 8), -- Digital Solutions Perú - Digital
(4, 1), -- CloudTech Perú - Innovación
(4, 15), -- CloudTech Perú - Startup
(5, 7), -- Data Analytics Pro - RSE
(6, 2), -- Green Energy Solutions - Sostenibilidad
(6, 13), -- Green Energy Solutions - Tecnología Verde
(7, 1), -- EduTech Perú - Innovación
(7, 19), -- EduTech Perú - Edtech
(8, 1), -- FinTech Solutions - Innovación
(8, 18), -- FinTech Solutions - Fintech
(9, 1), -- HealthTech Perú - Innovación
(9, 20), -- HealthTech Perú - Healthtech
(10, 6); -- Logistics Pro - Exportadora

COMMIT; 