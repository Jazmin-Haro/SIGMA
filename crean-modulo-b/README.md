# CREAN — Módulo B: Comodatos
## Sistema de Gestión Institucional · Secretaría de Desarrollo Rural · Nayarit

---

## ARQUITECTURA DEL PROYECTO

```
crean-modulo-b/
│
├── src/
│   ├── app.js                          ← Punto de entrada Express
│   ├── config/
│   │   └── database.js                 ← Conexión PostgreSQL (Pool)
│   ├── middlewares/
│   │   ├── auth.middleware.js           ← Verificación JWT
│   │   ├── error.middleware.js          ← Manejo global de errores
│   │   └── validate.middleware.js       ← Validación express-validator
│   ├── models/                         ← Capa Model (MVC) — SQL puro
│   │   ├── solicitud.model.js
│   │   ├── comodato.model.js
│   │   ├── maquinaria.model.js
│   │   ├── falla.model.js
│   │   ├── mantenimiento.model.js
│   │   ├── entrega.model.js
│   │   ├── devolucion.model.js
│   │   └── otros.model.js              ← Traslados, Documentos, Usuarios
│   ├── controllers/                    ← Capa Controller (MVC)
│   │   ├── auth.controller.js
│   │   ├── solicitud.controller.js
│   │   ├── otros.controller.js         ← Comodato, Maquinaria
│   │   └── recursos.controller.js      ← Fallas, Manto., Entrega, Dev., Dashboard
│   └── routes/
│       └── index.js                    ← Capa View/Routes (MVC) — todos los endpoints
│
├── sql/
│   └── 01_schema_comodatos.sql         ← Script completo para pgAdmin
│
├── tests/
│   └── CREAN_ModuloB.postman_collection.json  ← Colección Postman lista
│
├── .env.example                        ← Variables de entorno (renombrar a .env)
└── package.json
```

---

## TECNOLOGÍAS UTILIZADAS

| Tecnología | Uso |
|-----------|-----|
| **Node.js + Express** | Plataforma backend, servidor API REST |
| **PostgreSQL** | Sistema gestor de base de datos |
| **Arquitectura MVC** | Organización en capas: Model / Controller / Routes |
| **JWT (jsonwebtoken)** | Autenticación y seguridad de endpoints |
| **bcryptjs** | Hash seguro de contraseñas |
| **helmet** | Cabeceras HTTP de seguridad |
| **cors** | Control de acceso entre orígenes |
| **express-validator** | Validación de datos en las peticiones |
| **pg / pg-pool** | Conexión a PostgreSQL con pool de conexiones |
| **morgan** | Logger de peticiones HTTP |
| **Postman** | Pruebas de API (colección incluida) |
| **Visual Studio Code** | Entorno de desarrollo recomendado |

---

## PASO 1 — BASE DE DATOS EN POSTGRESQL (pgAdmin)

1. Abrir **pgAdmin**
2. Conectarse al servidor PostgreSQL
3. Crear base de datos `crean` (si no existe):
   - Clic derecho en "Databases" → Create → Database → Nombre: `crean`
4. Seleccionar la base `crean` → abrir **Query Tool**
5. Abrir el archivo `sql/01_schema_comodatos.sql`
6. Presionar **F5** para ejecutar

✅ Esto crea el schema `comodatos` con 16 tablas, índices y datos iniciales.

**Usuarios iniciales creados:**
| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin   | Admin2026! | administrador |
| liz     | Admin2026! | operador |

---

## PASO 2 — CONFIGURAR EL SERVIDOR

1. Copiar `.env.example` → renombrar a `.env`
2. Editar `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crean
DB_USER=postgres
DB_PASSWORD=tu_contrasena_de_postgresql

JWT_SECRET=cambiar_por_una_clave_muy_larga_y_aleatoria
JWT_EXPIRES_IN=8h

PORT=3001
CORS_ORIGIN=http://localhost:5173
```

3. Instalar dependencias:

```bash
npm install
```

4. Iniciar servidor:

```bash
# Producción
npm start

# Desarrollo (con recarga automática)
npm run dev
```

✅ Debe aparecer el banner de C.R.E.A.N. en la consola.

---

## PASO 3 — PROBAR CON POSTMAN

1. Abrir **Postman**
2. Importar: `tests/CREAN_ModuloB.postman_collection.json`
3. Ejecutar **POST Login** primero → el token se guarda automáticamente
4. Todos los demás endpoints usan `{{TOKEN}}` automáticamente

---

## ENDPOINTS REST — REFERENCIA COMPLETA

### Autenticación (Pública)
```
POST   /api/auth/login                  Login — obtener token JWT
GET    /api/auth/perfil         [JWT]   Ver datos del usuario activo
```

### Dashboard
```
GET    /api/dashboard           [JWT]   Resumen general del sistema
```

### Maquinaria
```
GET    /api/maquinaria          [JWT]   Listar toda (?estado=disponible)
GET    /api/maquinaria/:id      [JWT]   Obtener una por ID
POST   /api/maquinaria          [JWT]   Crear nueva
PUT    /api/maquinaria/:id      [JWT]   Actualizar estado/horas/ubicación
DELETE /api/maquinaria/:id      [JWT]   Eliminar
```

### Solicitudes
```
GET    /api/solicitudes         [JWT]   Listar todas (?estado=pendiente)
GET    /api/solicitudes/:id     [JWT]   Obtener una
POST   /api/solicitudes         [JWT]   Crear nueva
PUT    /api/solicitudes/:id     [JWT]   Editar
PATCH  /api/solicitudes/:id/estado [JWT]  Cambiar estado
DELETE /api/solicitudes/:id     [JWT]   Eliminar
```

### Comodatos
```
GET    /api/comodatos           [JWT]   Listar todos (?estado=activo)
GET    /api/comodatos/:id       [JWT]   Obtener uno
POST   /api/comodatos           [JWT]   Crear (cambia maquinaria a "prestada")
PATCH  /api/comodatos/:id/estado [JWT]  Cambiar estado
DELETE /api/comodatos/:id       [JWT]   Eliminar
```

### Entregas
```
GET    /api/entregas            [JWT]   Listar todas
GET    /api/entregas/:id        [JWT]   Obtener una
POST   /api/entregas            [JWT]   Registrar (activa comodato + checklist)
DELETE /api/entregas/:id        [JWT]   Eliminar
```

### Devoluciones
```
GET    /api/devoluciones        [JWT]   Listar todas
GET    /api/devoluciones/:id    [JWT]   Obtener una
POST   /api/devoluciones        [JWT]   Registrar (cierra comodato, libera maquinaria,
                                         genera falla automática si hay daños)
DELETE /api/devoluciones/:id    [JWT]   Eliminar
```

### Fallas
```
GET    /api/fallas              [JWT]   Listar todas (?estado=pendiente)
GET    /api/fallas/:id          [JWT]   Obtener una
POST   /api/fallas              [JWT]   Reportar falla
PATCH  /api/fallas/:id/estado   [JWT]   Cambiar estado
DELETE /api/fallas/:id          [JWT]   Eliminar
```

### Mantenimiento
```
GET    /api/mantenimientos              [JWT]   Listar todas las órdenes
GET    /api/mantenimientos/:id          [JWT]   Obtener una
POST   /api/mantenimientos              [JWT]   Crear orden (pone maquinaria en "mantenimiento")
PATCH  /api/mantenimientos/:id/terminar [JWT]   Terminar (libera maquinaria a "disponible")
DELETE /api/mantenimientos/:id          [JWT]   Eliminar
```

---

## FORMATO DE RESPUESTA JSON (todas las rutas)

**Éxito:**
```json
{
  "success": true,
  "mensaje": "Descripción de la operación",
  "dato": { ... },
  "total": 10
}
```

**Error de validación (422):**
```json
{
  "success": false,
  "mensaje": "Error de validación.",
  "errores": [
    { "campo": "folio", "mensaje": "El folio CEDER es obligatorio.", "valor": "" }
  ]
}
```

**Error de autenticación (401/403):**
```json
{
  "success": false,
  "mensaje": "Acceso denegado. Se requiere token de autenticación."
}
```

---

## SEGURIDAD IMPLEMENTADA

- **JWT** en todos los endpoints (excepto login y /health)
- **bcryptjs** para hash de contraseñas (nunca se guarda en texto plano)
- **helmet** para cabeceras HTTP seguras (XSS, clickjacking, etc.)
- **CORS** configurado solo para el origen del frontend
- **express-validator** para sanitizar y validar entradas
- **Transacciones PostgreSQL** en operaciones críticas (crear comodato, devolución con daños, etc.)
- **Pool de conexiones** con límites configurados
- **Variables de entorno** para credenciales (nunca en el código)

---

Módulo B — Responsable: Liz | C.R.E.A.N. · Nayarit 2026
