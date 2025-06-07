# 📅 Módulo de Eventos - SDN-STAFF

## 🎯 Descripción General

El módulo de Eventos es el núcleo del sistema SDN-STAFF que permite la creación, gestión y configuración completa de ferias y eventos. Soporta tres modalidades: presencial, virtual e híbrido.

## 🏗️ Arquitectura Implementada

### Modelos de Base de Datos

#### 1. **TipoEvento**
- **Tabla:** `tipo_evento`
- **Propósito:** Define los tipos de eventos soportados
- **Tipos disponibles:** 
  - `presencial` - Eventos físicos en ubicación específica
  - `virtual` - Eventos completamente online
  - `hibrido` - Combinación de presencial y virtual

#### 2. **Evento** 
- **Tabla:** `evento`
- **Propósito:** Gestión completa de eventos/ferias
- **Estados:** `borrador` → `publicado` → `activo` → `finalizado` → `archivado`

### Servicios Implementados

#### TipoEventoService
- ✅ CRUD completo con auditoría
- ✅ Validaciones específicas por tipo
- ✅ Estadísticas y reportes
- ✅ Gestión de eliminación lógica

#### EventoService
- ✅ Creación y gestión de eventos
- ✅ Validaciones de fechas y tipos
- ✅ Generación automática de URLs amigables
- ✅ Duplicación de eventos
- ✅ Gestión de estados con transiciones válidas
- ✅ Filtros avanzados y búsquedas

## 🛣️ Endpoints API

### Tipos de Evento (`/api/tipos-evento`)

| Método | Endpoint | Permisos | Descripción |
|--------|----------|----------|-------------|
| GET | `/` | Admin/Manager | Listar todos los tipos |
| GET | `/:id` | Admin/Manager | Obtener tipo por ID |
| GET | `/nombre/:nombre` | Admin/Manager | Obtener tipo por nombre |
| GET | `/stats` | Admin | Estadísticas de tipos |
| GET | `/:id/eventos` | Admin/Manager | Eventos por tipo |
| POST | `/` | Admin | Crear nuevo tipo |
| PUT | `/:id` | Admin | Actualizar tipo |
| DELETE | `/:id` | Admin | Eliminar tipo (lógico) |
| POST | `/:id/restore` | Admin | Restaurar tipo eliminado |

### Eventos (`/api/eventos`)

| Método | Endpoint | Permisos | Descripción |
|--------|----------|----------|-------------|
| GET | `/` | Admin/Manager | Listar eventos con filtros |
| GET | `/:id` | Admin/Manager | Obtener evento por ID |
| GET | `/public/url/:url` | Público | Obtener evento por URL amigable |
| GET | `/stats` | Admin | Estadísticas de eventos |
| GET | `/proximos` | Admin/Manager | Eventos próximos |
| GET | `/activos` | Admin/Manager | Eventos activos |
| GET | `/:id/preview` | Admin/Manager | Vista previa del evento |
| GET | `/check-url/:url` | Autenticado | Verificar disponibilidad URL |
| POST | `/` | Admin/Manager | Crear nuevo evento |
| PUT | `/:id` | Admin/Manager | Actualizar evento |
| PATCH | `/:id/estado` | Admin/Manager | Cambiar estado |
| POST | `/:id/duplicate` | Admin/Manager | Duplicar evento |
| DELETE | `/:id` | Admin | Eliminar evento (lógico) |
| POST | `/:id/restore` | Admin | Restaurar evento eliminado |

## 📊 Funcionalidades Principales

### 🎨 Gestión de Estados
```
borrador → publicado → activo → finalizado → archivado
   ↓           ↓         ↓         ↓
archivado   archivado  archivado  archivado
   ↓
borrador (restauración)
```

### 🔧 Configuraciones Específicas por Tipo

#### Eventos Presenciales
```json
{
  "ubicacion_requerida": true,
  "capacidad_fisica": true,
  "servicios_presenciales": ["electricidad", "internet", "mobiliario"],
  "requisitos_especiales": ["permisos_municipales", "seguridad", "limpieza"]
}
```

#### Eventos Virtuales
```json
{
  "plataforma_virtual": true,
  "transmision_en_vivo": true,
  "plataformas_soportadas": ["Zoom", "Microsoft Teams", "Google Meet"],
  "funcionalidades": ["chat", "breakout_rooms", "screen_sharing", "recording"]
}
```

#### Eventos Híbridos
```json
{
  "ubicacion_requerida": true,
  "plataforma_virtual": true,
  "transmision_simultanea": true,
  "equipamiento_especial": ["camaras_profesionales", "streaming_equipment"]
}
```

### 🛡️ Validaciones Implementadas

#### Validaciones de Tipo
- ✅ Solo tipos permitidos: `presencial`, `virtual`, `hibrido`
- ✅ Configuración específica según tipo
- ✅ URLs válidas para eventos virtuales
- ✅ Ubicación requerida para presenciales

#### Validaciones de Evento
- ✅ Fechas lógicas (fin > inicio)
- ✅ URLs amigables únicas
- ✅ Capacidad máxima positiva
- ✅ Precios no negativos
- ✅ Estados válidos y transiciones permitidas

### 🔍 Filtros y Búsquedas

#### Filtros Disponibles
- 📝 **Búsqueda de texto:** nombre y descripción
- 📅 **Rango de fechas:** fecha_desde, fecha_hasta
- 🏷️ **Estado:** borrador, publicado, activo, etc.
- 📊 **Tipo de evento:** presencial, virtual, híbrido

#### Scopes de Consulta
- `active` - Solo registros no eliminados
- `published` - Solo eventos publicados/activos
- `upcoming` - Eventos futuros
- `current` - Eventos en curso

## 🗄️ Migraciones y Seeders

### Migraciones Creadas
- `20250606001-create-tipo-evento.js` - Tabla tipos de evento
- `20250606002-create-evento.js` - Tabla eventos

### Seeders de Datos
- `20250606000005-demo-tipos-evento.js` - Tipos básicos (presencial, virtual, híbrido)
- `20250606000006-demo-eventos.js` - 5 eventos de ejemplo con diferentes estados

## 🧪 Testing

### Script de Pruebas
```bash
node test-eventos-module.js
```

### Pruebas Incluidas
- ✅ Conexión a base de datos
- ✅ Carga de modelos y servicios
- ✅ Obtención de tipos y eventos
- ✅ Validaciones de duplicados
- ✅ Estadísticas y reportes
- ✅ Eventos próximos
- ✅ Asociaciones entre modelos

## 🚀 Instalación y Configuración

### 1. Ejecutar Migraciones
```bash
npm run db:migrate
```

### 2. Poblar Datos Iniciales
```bash
npm run db:seed
```

### 3. Verificar Funcionamiento
```bash
node test-eventos-module.js
```

## 📋 Próximos Pasos

Con el módulo base de Eventos completado, ahora puedes continuar con:

1. **🏢 Módulo de Empresas Expositoras**
   - Gestión de empresas participantes
   - Proceso de aprobación
   - Vinculación con eventos

2. **🏪 Módulo de Inventario de Stands**
   - Gestión de espacios disponibles
   - Tipos de stands (básico, premium, corporativo)
   - Asignación y reservas

3. **👥 Módulo de Participantes**
   - Registro de visitantes
   - Control de acceso
   - Estadísticas de participación

## 🔧 Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para base de datos
- **MySQL** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

## 📝 Notas Importantes

- ✅ Todos los modelos incluyen auditoría completa (created_by, updated_by, deleted_by)
- ✅ Eliminación lógica implementada (soft delete)
- ✅ Validaciones robustas en todos los niveles
- ✅ Endpoints públicos para vista de eventos
- ✅ Sistema de permisos granular
- ✅ URLs amigables para SEO
- ✅ Configuraciones específicas por tipo de evento

---

## 🎉 Estado del Desarrollo

**✅ MÓDULO DE EVENTOS COMPLETADO**

El sistema ahora puede:
- Gestionar tipos de evento (presencial, virtual, híbrido)
- Crear y administrar eventos completos
- Manejar estados y transiciones
- Filtrar y buscar eventos
- Generar estadísticas y reportes
- Duplicar eventos existentes
- Gestionar URLs amigables
- Validar datos de forma robusta

**¿Listo para continuar con el siguiente módulo?** 🚀
