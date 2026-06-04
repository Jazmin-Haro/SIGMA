// src/app.js
// Punto de entrada principal — Módulo B: Comodatos C.R.E.A.N.
// Arquitectura: Monolítica con organización en capas (MVC)
'use strict';

require('dotenv').config();
const express  = require('express');
const helmet   = require('helmet');
const cors     = require('cors');
const morgan   = require('morgan');

const routes                    = require('./routes/index');
const { errorHandler, notFound } = require('./middlewares/error.middleware');

const app = express();

// ── Seguridad ─────────────────────────────────────────────
// helmet: cabeceras HTTP seguras
app.use(helmet());

// CORS: solo permite el origen del frontend configurado
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Parseo de JSON ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logger HTTP ───────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Ruta de salud ─────────────────────────────────────────
// GET /health — para verificar que el servidor está arriba
app.get('/health', (req, res) => {
  res.json({
    success: true,
    servicio: 'CREAN — Módulo B: Comodatos',
    version: '1.0.0',
    entorno: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── Rutas principales — prefijo /api ──────────────────────
app.use('/api', routes);

// ── Manejadores de errores ────────────────────────────────
app.use(notFound);       // 404 para rutas no definidas
app.use(errorHandler);   // errores generales

// ── Iniciar servidor ──────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001');

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║  C.R.E.A.N. — Módulo B: Comodatos               ║');
  console.log('║  Secretaría de Desarrollo Rural · Nayarit        ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  Servidor:  http://localhost:${PORT}                  ║`);
  console.log(`║  Entorno:   ${(process.env.NODE_ENV || 'development').padEnd(38)}║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  ENDPOINTS DISPONIBLES:                          ║');
  console.log('║  GET    /health                                  ║');
  console.log('║  POST   /api/auth/login                          ║');
  console.log('║  GET    /api/auth/perfil          [JWT]          ║');
  console.log('║  GET    /api/dashboard            [JWT]          ║');
  console.log('║  CRUD   /api/maquinaria           [JWT]          ║');
  console.log('║  CRUD   /api/solicitudes          [JWT]          ║');
  console.log('║  CRUD   /api/comodatos            [JWT]          ║');
  console.log('║  CRUD   /api/entregas             [JWT]          ║');
  console.log('║  CRUD   /api/devoluciones         [JWT]          ║');
  console.log('║  CRUD   /api/fallas               [JWT]          ║');
  console.log('║  CRUD   /api/mantenimientos       [JWT]          ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});

module.exports = app;
