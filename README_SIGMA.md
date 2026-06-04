C.R.E.A.N. – Sistema de Gestión de Maquinaria (Módulo B)

Sistema web desarrollado para la administración y control de maquinaria agrícola del Centro Regional de Entrenamiento y Asistencia Nayarit (C.R.E.A.N.).

Permite gestionar inventario de maquinaria, solicitudes, comodatos, traslados, entregas, devoluciones, fallas, mantenimientos y documentos oficiales desde una interfaz web moderna.

📋 Características
📦 Gestión de inventario de maquinaria.
📝 Registro y seguimiento de solicitudes.
🤝 Administración de comodatos.
🚜 Control de traslados de maquinaria.
✅ Registro de entregas.
↩️ Registro de devoluciones.
🔧 Control de fallas y mantenimientos.
📄 Generación de documentos oficiales:
Autorización de salida.
Guía de traslado.
Recibo de recepción.
Oficio de comodato.
📊 Dashboard con indicadores operativos.
🔍 Búsquedas y filtros dinámicos.
🖨️ Impresión de documentos oficiales.
🛠️ Tecnologías Utilizadas
Frontend
React
Vite
JavaScript (ES6+)
CSS3
Backend
Node.js
Express.js
Base de Datos
PostgreSQL
Herramientas
Nodemon
Express Validator
Git
GitHub
📂 Estructura del Proyecto
CREAN_MODULOB
│
├── crean-frontend
│   ├── public
│   ├── src
│   ├── package.json
│   └── vite.config.js
│
├── crean-modulo-b
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   └── app.js
│   │
│   ├── sql
│   ├── package.json
│   └── .env
│
└── README.md
⚙️ Instalación
1. Clonar el repositorio
git clone https://github.com/USUARIO/CREAN-ModuloB.git
2. Entrar al proyecto
cd CREAN-ModuloB
🚀 Configuración del Backend

Entrar a la carpeta:

cd crean-modulo-b

Instalar dependencias:

npm install

Crear archivo .env

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=crean_modulo_b

Iniciar servidor:

npm run dev
💻 Configuración del Frontend

Entrar a la carpeta:

cd crean-frontend

Instalar dependencias:

npm install

Iniciar proyecto:

npm run dev
📊 Módulos del Sistema
Inventario

Permite registrar y administrar maquinaria agrícola.

Solicitudes

Gestión de solicitudes de maquinaria realizadas por productores.

Comodatos

Administración de préstamos de maquinaria mediante contratos de comodato.

Traslados

Control de movimientos de maquinaria entre ubicaciones.

Entregas

Registro de entrega de maquinaria al productor.

Devoluciones

Control de recepción y devolución de equipos.

Fallas y Mantenimiento

Seguimiento de incidencias y servicios de mantenimiento.

Documentos Oficiales

Generación e impresión de:

Autorización de salida.
Guía de traslado.
Recibo de recepción.
Oficio de comodato.
👨‍💻 Equipo de Desarrollo

Proyecto desarrollado como parte de la implementación del sistema de gestión de maquinaria agrícola para el:

C.R.E.A.N. – Centro Regional de Entrenamiento y Asistencia Nayarit

📄 Licencia

Este proyecto fue desarrollado con fines académicos e institucionales.

Todos los derechos reservados © ING. Litzy Jazmin Haro Salado.