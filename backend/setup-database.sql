-- Script para crear la base de datos SDN-STAFF
-- Ejecutar este script en MySQL para crear todas las tablas necesarias

USE `sdn-staff`;

-- Tabla de roles
CREATE TABLE `rol` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `unique_nombre_rol` (`nombre_rol`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de usuarios
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `correo` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `foto_url` text,
  `bio` text,
  `estado` enum('activo','inactivo','suspendido') DEFAULT 'activo',
  `ultima_sesion` datetime DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_by_usuario` int DEFAULT NULL,
  `updated_by_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `unique_correo` (`correo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_fecha_creacion` (`fecha_creacion`),
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`created_by_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de relación usuario-rol
CREATE TABLE `usuariorol` (
  `id_usuario` int NOT NULL,
  `id_rol` int NOT NULL,
  `fecha_asignacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`,`id_rol`),
  KEY `idx_id_rol` (`id_rol`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_deleted_at` (`deleted_at`),
  FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tipos de evento
CREATE TABLE `tipo_evento` (
  `id_tipo_evento` int NOT NULL AUTO_INCREMENT,
  `nombre_tipo` varchar(100) NOT NULL,
  `descripcion` text,
  `categoria` varchar(50) DEFAULT NULL,
  `duracion_estimada` int DEFAULT NULL,
  `capacidad_maxima` int DEFAULT NULL,
  `requiere_aprobacion` tinyint(1) DEFAULT '0',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_tipo_evento`),
  KEY `idx_categoria` (`categoria`),
  KEY `idx_estado` (`estado`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de eventos
CREATE TABLE `evento` (
  `id_evento` int NOT NULL AUTO_INCREMENT,
  `id_tipo_evento` int NOT NULL,
  `nombre_evento` varchar(200) NOT NULL,
  `descripcion` text,
  `fecha_inicio` datetime NOT NULL,
  `fecha_fin` datetime NOT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `capacidad_maxima` int DEFAULT NULL,
  `estado` enum('planificado','activo','finalizado','cancelado') DEFAULT 'planificado',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_evento`),
  KEY `idx_id_tipo_evento` (`id_tipo_evento`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_estado` (`estado`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`id_tipo_evento`) REFERENCES `tipo_evento` (`id_tipo_evento`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de empresas expositoras
CREATE TABLE `empresa_expositora` (
  `id_empresa` int NOT NULL AUTO_INCREMENT,
  `nombre_empresa` varchar(200) NOT NULL,
  `razon_social` varchar(200) DEFAULT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `email_contacto` varchar(100) NOT NULL,
  `telefono_contacto` varchar(20) DEFAULT NULL,
  `nombre_contacto` varchar(100) DEFAULT NULL,
  `cargo_contacto` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `sitio_web` varchar(200) DEFAULT NULL,
  `tamaño_empresa` enum('pequeña','mediana','grande') DEFAULT NULL,
  `descripcion` text,
  `direccion` text,
  `ciudad` varchar(100) DEFAULT NULL,
  `pais` varchar(100) DEFAULT 'Perú',
  `estado` enum('pendiente','aprobada','rechazada','suspendida') DEFAULT 'pendiente',
  `fecha_aprobacion` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_empresa`),
  UNIQUE KEY `unique_ruc` (`ruc`),
  KEY `idx_email_contacto` (`email_contacto`),
  KEY `idx_estado` (`estado`),
  KEY `idx_sector` (`sector`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de tipos de stand
CREATE TABLE `tipo_stand` (
  `id_tipo_stand` int NOT NULL AUTO_INCREMENT,
  `nombre_tipo` varchar(100) NOT NULL,
  `descripcion` text,
  `area_minima` decimal(10,2) DEFAULT NULL,
  `area_maxima` decimal(10,2) DEFAULT NULL,
  `precio_base` decimal(10,2) NOT NULL,
  `moneda` varchar(10) DEFAULT 'PEN',
  `equipamiento_incluido` json DEFAULT NULL,
  `servicios_incluidos` json DEFAULT NULL,
  `caracteristicas_especiales` json DEFAULT NULL,
  `restricciones` json DEFAULT NULL,
  `permite_personalizacion` tinyint(1) DEFAULT '1',
  `requiere_aprobacion` tinyint(1) DEFAULT '0',
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `orden_visualizacion` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_tipo_stand`),
  KEY `idx_estado` (`estado`),
  KEY `idx_orden_visualizacion` (`orden_visualizacion`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de stands
CREATE TABLE `stand` (
  `id_stand` int NOT NULL AUTO_INCREMENT,
  `id_tipo_stand` int NOT NULL,
  `codigo_stand` varchar(50) NOT NULL,
  `nombre_stand` varchar(100) DEFAULT NULL,
  `descripcion` text,
  `area` decimal(10,2) NOT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `estado` enum('disponible','ocupado','mantenimiento','reservado') DEFAULT 'disponible',
  `precio_actual` decimal(10,2) DEFAULT NULL,
  `moneda` varchar(10) DEFAULT 'PEN',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id_stand`),
  UNIQUE KEY `unique_codigo_stand` (`codigo_stand`),
  KEY `idx_id_tipo_stand` (`id_tipo_stand`),
  KEY `idx_estado` (`estado`),
  KEY `idx_created_by` (`created_by`),
  FOREIGN KEY (`id_tipo_stand`) REFERENCES `tipo_stand` (`id_tipo_stand`) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (`deleted_by`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles básicos
INSERT INTO `rol` (`id_rol`, `nombre_rol`, `descripcion`) VALUES
(1, 'administrador', 'Control total del sistema'),
(2, 'Editor', 'Puede editar contenidos y datos'),
(3, 'Usuario', 'Acceso básico limitado'),
(4, 'visitante', 'Usuario público con acceso limitado');

-- Insertar tipos de stand básicos
INSERT INTO `tipo_stand` (`id_tipo_stand`, `nombre_tipo`, `descripcion`, `area_minima`, `area_maxima`, `precio_base`, `moneda`, `equipamiento_incluido`, `servicios_incluidos`, `caracteristicas_especiales`, `restricciones`, `permite_personalizacion`, `requiere_aprobacion`, `estado`, `orden_visualizacion`) VALUES
(1, 'Básico', 'Stand básico con servicios esenciales', 6.00, 12.00, 80.00, 'PEN', '["Mesa básica", "Dos sillas", "Toma eléctrica", "Iluminación básica"]', '["Limpieza diaria", "Seguridad general", "WiFi básico"]', '["Ubicación estándar", "Diseño modular", "Fácil montaje"]', '["No permite estructuras altas", "Decoración limitada"]', 1, 0, 'activo', 1),
(2, 'Premium', 'Stand premium con mejores ubicaciones', 12.00, 25.00, 150.00, 'PEN', '["Mesa ejecutiva", "Cuatro sillas acolchadas", "Múltiples tomas eléctricas", "Iluminación profesional"]', '["Limpieza especializada", "Seguridad prioritaria", "WiFi premium", "Servicio de café"]', '["Ubicación privilegiada", "Mayor visibilidad", "Diseño personalizable"]', '["Requiere reserva anticipada"]', 1, 0, 'activo', 2),
(3, 'Corporativo', 'Stand corporativo para grandes empresas', 25.00, 100.00, 250.00, 'PEN', '["Mobiliario ejecutivo completo", "Sistema de iluminación avanzado", "Sala de reuniones privada"]', '["Limpieza premium 24/7", "Seguridad dedicada", "WiFi corporativo", "Servicio de catering"]', '["Ubicación premium", "Máxima visibilidad", "Diseño arquitectónico"]', '["Requiere aprobación previa", "Mínimo 30 días de anticipación"]', 1, 1, 'activo', 3);

-- Insertar tipos de evento básicos
INSERT INTO `tipo_evento` (`id_tipo_evento`, `nombre_tipo`, `descripcion`, `categoria`, `duracion_estimada`, `capacidad_maxima`, `requiere_aprobacion`, `estado`) VALUES
(1, 'Conferencia', 'Evento de conferencias y presentaciones', 'Educativo', 480, 500, 0, 'activo'),
(2, 'Exposición', 'Evento de exposición de productos y servicios', 'Comercial', 1440, 1000, 0, 'activo'),
(3, 'Networking', 'Evento de networking empresarial', 'Social', 240, 200, 0, 'activo');

-- Crear usuario administrador por defecto (password: admin123)
INSERT INTO `usuario` (`id_usuario`, `correo`, `password_hash`, `nombre`, `estado`, `fecha_creacion`) VALUES
(1, 'admin@sdn-staff.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador del Sistema', 'activo', NOW());

-- Asignar rol de administrador al usuario admin
INSERT INTO `usuariorol` (`id_usuario`, `id_rol`, `fecha_asignacion`) VALUES
(1, 1, NOW());

-- Insertar algunos stands de ejemplo
INSERT INTO `stand` (`id_stand`, `id_tipo_stand`, `codigo_stand`, `nombre_stand`, `descripcion`, `area`, `ubicacion`, `estado`, `precio_actual`) VALUES
(1, 1, 'BAS-001', 'Stand Básico 1', 'Stand básico ubicado en zona principal', 9.00, 'Zona A - Pasillo 1', 'disponible', 80.00),
(2, 1, 'BAS-002', 'Stand Básico 2', 'Stand básico ubicado en zona secundaria', 12.00, 'Zona B - Pasillo 2', 'disponible', 80.00),
(3, 2, 'PRE-001', 'Stand Premium 1', 'Stand premium con ubicación privilegiada', 18.00, 'Zona VIP - Entrada principal', 'disponible', 150.00),
(4, 3, 'COR-001', 'Stand Corporativo 1', 'Stand corporativo de gran tamaño', 50.00, 'Zona Premium - Centro del evento', 'disponible', 250.00);

-- Insertar un evento de ejemplo
INSERT INTO `evento` (`id_evento`, `id_tipo_evento`, `nombre_evento`, `descripcion`, `fecha_inicio`, `fecha_fin`, `ubicacion`, `capacidad_maxima`, `estado`) VALUES
(1, 2, 'Expo Tecnología 2025', 'Exposición de las últimas tecnologías del mercado', '2025-08-15 09:00:00', '2025-08-17 18:00:00', 'Centro de Convenciones de Lima', 1000, 'planificado');

-- Insertar algunas empresas de ejemplo
INSERT INTO `empresa_expositora` (`id_empresa`, `nombre_empresa`, `razon_social`, `ruc`, `email_contacto`, `telefono_contacto`, `nombre_contacto`, `cargo_contacto`, `sector`, `estado`) VALUES
(1, 'TechCorp Perú', 'TechCorp Perú S.A.C.', '20123456789', 'contacto@techcorp.pe', '+51 1 2345678', 'María González', 'Gerente de Marketing', 'Tecnología', 'aprobada'),
(2, 'Innovate Solutions', 'Innovate Solutions E.I.R.L.', '20234567890', 'info@innovate.pe', '+51 1 3456789', 'Carlos Rodríguez', 'Director Comercial', 'Consultoría', 'pendiente');

COMMIT; 