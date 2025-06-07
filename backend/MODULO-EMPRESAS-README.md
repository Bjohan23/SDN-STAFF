# 🏢 Módulo de Empresas Expositoras - SDN-STAFF

## 🎯 Descripción General

El módulo de Empresas Expositoras gestiona el registro, aprobación y participación de empresas en ferias y eventos. Incluye un sistema completo de gestión de participantes con proceso de aprobación, documentación legal, asignación de stands y métricas de participación.

## 🏗️ Arquitectura Implementada

### Modelos de Base de Datos

#### 1. **EmpresaExpositora**
- **Tabla:** `empresa_expositora`
- **Propósito:** Gestión completa de empresas participantes
- **Estados:** `pendiente` → `aprobada` / `rechazada` / `suspendida` / `inactiva`
- **Funcionalidades:**
  - Información completa de contacto y empresa
  - Documentación legal con fechas de vencimiento
  - Validación de RUC único
  - Sistema de aprobación con auditoría
  - Métricas de participación histórica

#### 2. **EmpresaEvento**
- **Tabla:** `empresa_evento`
- **Propósito:** Relación many-to-many entre empresas y eventos específicos
- **Estados de participación:** `registrada` → `pendiente_aprobacion` → `aprobada` → `confirmada` / `cancelada`
- **Estados de pago:** `pendiente` → `parcial` → `pagado` / `vencido` / `reembolsado`
- **Funcionalidades:**
  - Gestión de stands (número, tipo, área, precio)
  - Servicios adicionales contratados
  - Personal asignado por evento
  - Métricas post-evento (visitantes, leads, ventas)

### Servicios Implementados

#### EmpresaExpositoraService
- ✅ CRUD completo con validaciones robustas
- ✅ Sistema de aprobación/rechazo/suspensión
- ✅ Registro en eventos específicos
- ✅ Validaciones de unicidad (RUC, email)
- ✅ Alertas de documentos próximos a vencer
- ✅ Estadísticas completas por sector/tamaño/estado
- ✅ Carga masiva desde CSV
- ✅ Filtros avanzados y búsquedas

## 🛣️ Endpoints API

### Empresas Expositoras (`/api/empresas-expositoras`)

| Método | Endpoint | Permisos | Descripción |
|--------|----------|----------|-------------|
| POST | `/registro-publico` | Público | Auto-registro de empresas |
| GET | `/` | Admin/Manager | Listar empresas con filtros |
| GET | `/:id` | Admin/Manager | Obtener empresa por ID |
| GET | `/ruc/:ruc` | Admin/Manager | Buscar por RUC |
| GET | `/email/:email` | Admin/Manager | Buscar por email |
| GET | `/stats` | Admin | Estadísticas completas |
| GET | `/pendientes` | Admin/Manager | Empresas pendientes de aprobación |
| GET | `/documentos-vencer` | Admin/Manager | Documentos próximos a vencer |
| GET | `/check-ruc/:ruc` | Autenticado | Verificar disponibilidad de RUC |
| POST | `/` | Admin/Manager | Crear empresa (admin) |
| PUT | `/:id` | Admin/Manager | Actualizar empresa |
| DELETE | `/:id` | Admin | Eliminar empresa |
| POST | `/:id/aprobar` | Admin | Aprobar empresa |
| POST | `/:id/rechazar` | Admin | Rechazar empresa |
| POST | `/:id/suspender` | Admin | Suspender empresa |
| POST | `/:id/eventos` | Admin/Manager | Registrar en evento |
| GET | `/:id/eventos/:evento_id` | Admin/Manager | Ver participación específica |
| POST | `/:id/restore` | Admin | Restaurar empresa eliminada |
| POST | `/carga-masiva` | Admin | Carga masiva desde CSV |

## 📊 Funcionalidades Principales

### 🎭 Sistema de Estados

#### Estados de Empresa
```
registro → pendiente → aprobada / rechazada
                   ↓
               suspendida ↔ inactiva
```

#### Estados de Participación en Eventos
```
registrada → pendiente_aprobacion → aprobada → confirmada
                                      ↓
                                  cancelada
```

#### Estados de Pago
```
pendiente → parcial → pagado
     ↓         ↓
  vencido   reembolsado
```

### 🏢 Información Empresarial Completa

#### Datos Básicos
- Nombre comercial y razón social
- RUC único validado
- Sector y tamaño de empresa
- Información de contacto completa
- Dirección física

#### Documentación Legal
- Documentos requeridos por tipo de empresa
- Fechas de vencimiento con alertas
- Validación de documentos por administradores
- Historial de actualizaciones

#### Presencia Digital
- Sitio web corporativo
- Redes sociales (Facebook, Instagram, LinkedIn, etc.)
- Logo y material gráfico

### 🎪 Gestión de Participación en Eventos

#### Registro y Aprobación
- Auto-registro público de empresas
- Proceso de aprobación configurable por evento
- Validaciones específicas según tipo de evento
- Notificaciones automáticas de estado

#### Asignación de Stands
- Tipos de stand: básico, premium, corporativo, virtual, personalizado
- Gestión de números únicos por evento
- Cálculo automático de precios
- Servicios adicionales contratables

#### Personal y Contactos
- Asignación de personal por evento
- Contactos específicos por participación
- Horarios de atención diferenciados
- Coordinación de montaje/desmontaje

### 📈 Métricas y Análisis

#### Estadísticas Empresariales
- Distribución por sector industrial
- Análisis por tamaño de empresa
- Estados de aprobación
- Participaciones históricas

#### Métricas de Evento
- Número de visitantes al stand
- Leads generados
- Ventas realizadas
- Calificación del evento por empresa

#### Alertas y Notificaciones
- Documentos próximos a vencer
- Pagos pendientes o vencidos
- Empresas pendientes de aprobación

### 🔧 Configuraciones Avanzadas

#### Por Empresa
```json
{
  "categoria_preferida": "tecnologia",
  "area_stand_preferida": "grande",
  "servicios_requeridos": ["electricidad", "internet", "pantallas"],
  "requiere_area_demostracion": true
}
```

#### Por Participación
```json
{
  "tipo_participacion": "conferencia_y_stand",
  "demo_schedule": ["10:00", "14:00", "16:00"],
  "networking_sessions": true,
  "requiere_traduccion": false
}
```

### 🛡️ Validaciones y Seguridad

#### Validaciones de Datos
- ✅ RUC peruano válido (11 dígitos)
- ✅ Email único por empresa
- ✅ URLs válidas para sitio web
- ✅ Teléfonos en formato correcto
- ✅ Documentos con fechas coherentes

#### Proceso de Aprobación
- ✅ Revisión manual de documentos
- ✅ Validación de información empresarial
- ✅ Verificación de antecedentes
- ✅ Aprobación con comentarios y auditoría

#### Seguridad de Datos
- ✅ Encriptación de datos sensibles
- ✅ Auditoría completa de cambios
- ✅ Eliminación lógica para historial
- ✅ Control de acceso por roles

## 🗄️ Estructura de Base de Datos

### Campos Principales de EmpresaExpositora
```sql
-- Información básica
nombre_empresa VARCHAR(150) NOT NULL
razon_social VARCHAR(200)
ruc VARCHAR(11) UNIQUE
descripcion TEXT
sector VARCHAR(100)
tamaño_empresa ENUM('micro', 'pequeña', 'mediana', 'grande')

-- Contacto
email_contacto VARCHAR(100) NOT NULL UNIQUE
telefono_contacto VARCHAR(20)
nombre_contacto VARCHAR(100)
cargo_contacto VARCHAR(100)

-- Ubicación
direccion VARCHAR(300)
ciudad VARCHAR(100)
pais VARCHAR(100) DEFAULT 'Perú'

-- Estado y aprobación
estado ENUM('pendiente', 'aprobada', 'rechazada', 'suspendida', 'inactiva')
fecha_aprobacion DATE
aprobada_por INT REFERENCES usuario(id_usuario)
motivo_rechazo TEXT

-- Documentación
documentos_legales JSON
fecha_vencimiento_documentos DATE
redes_sociales JSON

-- Métricas
numero_participaciones INT DEFAULT 0
calificacion_promedio DECIMAL(3,2)
```

### Campos Principales de EmpresaEvento
```sql
-- Relación
id_empresa INT REFERENCES empresa_expositora(id_empresa)
id_evento INT REFERENCES evento(id_evento)
fecha_registro DATE NOT NULL

-- Estado de participación
estado_participacion ENUM('registrada', 'pendiente_aprobacion', 'aprobada', 'rechazada', 'confirmada', 'cancelada')
fecha_aprobacion_participacion DATE
aprobada_participacion_por INT REFERENCES usuario(id_usuario)

-- Stand
numero_stand VARCHAR(20)
tipo_stand ENUM('basico', 'premium', 'corporativo', 'virtual', 'personalizado')
area_stand DECIMAL(5,2)
precio_stand DECIMAL(10,2)

-- Pago
estado_pago ENUM('pendiente', 'parcial', 'pagado', 'vencido', 'reembolsado')
fecha_limite_pago DATE
fecha_pago DATE
referencia_pago VARCHAR(100)

-- Métricas post-evento
numero_visitantes_stand INT
leads_generados INT
ventas_realizadas DECIMAL(10,2)
calificacion_evento DECIMAL(3,2)
```

## 🧪 Testing

### Script de Pruebas
```bash
node test-empresas-module.js
```

### Pruebas Incluidas
- ✅ CRUD de empresas expositoras
- ✅ Validaciones de unicidad (RUC, email)
- ✅ Sistema de aprobación/rechazo
- ✅ Registro en eventos
- ✅ Filtros y búsquedas avanzadas
- ✅ Estadísticas por sector/tamaño
- ✅ Alertas de documentos vencidos
- ✅ Asociaciones entre modelos
- ✅ Métricas de participación

## 📋 Datos de Ejemplo

### Empresas Incluidas en Seeders
1. **TechInnovate Solutions** - Tecnología (Aprobada)
2. **EcoGreen Perú** - Medio Ambiente (Aprobada)
3. **Sabores del Norte** - Alimentario (Pendiente)
4. **Digital Marketing Pro** - Marketing (Aprobada)
5. **Textiles Andinos** - Textil (Suspendida)
6. **Startup InnovaLab** - Tecnología (Rechazada)

### Participaciones de Ejemplo
- TechInnovate en Feria de Tecnología (Confirmada, Stand A-15)
- EcoGreen en Feria de Tecnología (Aprobada, Stand B-08)
- Digital Marketing Pro en Congreso Virtual (Confirmada, Virtual-05)
- Sabores del Norte en Expo Gastronomía (Pendiente)

## 🚀 Instalación y Configuración

### 1. Ejecutar Migraciones
```bash
npm run db:migrate
```

### 2. Poblar Datos de Ejemplo
```bash
npm run db:seed
```

### 3. Verificar Funcionamiento
```bash
node test-empresas-module.js
```

## 📈 Métricas del Sistema

### Dashboard de Administrador
- Total de empresas registradas
- Empresas pendientes de aprobación
- Documentos próximos a vencer
- Participaciones por evento
- Ingresos por stands y servicios

### Reportes Disponibles
- Empresas por sector industrial
- Evolución de registros mensuales
- Tasa de aprobación vs rechazo
- ROI por tipo de stand
- Satisfacción promedio de empresas

## 🔄 Flujos de Proceso

### Registro de Nueva Empresa
1. Empresa completa formulario público
2. Sistema valida datos únicos (RUC, email)
3. Estado inicial: "pendiente"
4. Notificación a administradores
5. Revisión manual de documentos
6. Aprobación/rechazo con comentarios
7. Notificación a empresa del resultado

### Registro en Evento
1. Empresa aprobada solicita participación
2. Validación de requisitos del evento
3. Asignación automática o manual de stand
4. Cálculo de costos (stand + servicios)
5. Generación de factura/cotización
6. Confirmación de pago
7. Estado: "confirmada"

### Post-Evento
1. Recolección de métricas de participación
2. Encuesta de satisfacción
3. Actualización de calificación empresa
4. Generación de reporte de resultados
5. Renovación de documentos si es necesario

---

## 🎉 Estado del Desarrollo

**✅ MÓDULO DE EMPRESAS EXPOSITORAS COMPLETADO**

El sistema ahora puede:
- Gestionar registro completo de empresas expositoras
- Implementar proceso de aprobación robusta
- Manejar participaciones específicas por evento
- Asignar y gestionar stands con precios
- Controlar pagos y facturación
- Generar alertas de documentos vencidos
- Producir estadísticas detalladas por múltiples criterios
- Realizar carga masiva desde archivos CSV
- Mantener historial completo de participaciones
- Calcular métricas de éxito post-evento

**Próximo módulo sugerido:** 🏪 **Inventario de Stands Disponibles** 🚀
