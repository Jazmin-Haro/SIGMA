// src/routes/index.js
// Registro central de todas las rutas del Módulo B
'use strict';

const express = require('express');
const router  = express.Router();

const { verificarToken } = require('../middlewares/auth.middleware');

// ── Controllers ──────────────────────────────────────────
const AuthController        = require('../controllers/auth.controller');
const SolicitudController   = require('../controllers/solicitud.controller');

const {
  ComodatoController,
  MaquinariaController,
}                           = require('../controllers/otros.controller');

const {
  FallaController,
  MantenimientoController: _,
}                           = require('../controllers/recursos.controller');

const {
  MantenimientoController,
}                           = require('../controllers/recursos.controller');

const {
  EntregaController,
}                           = require('../controllers/recursos.controller');

const {
  DevolucionController,
}                           = require('../controllers/recursos.controller');

const {
  DashboardController,
}                           = require('../controllers/recursos.controller');

// ── Validadores ──────────────────────────────────────────
const { validate } = require('../middlewares/validate.middleware');
const { body, param } = require('express-validator');

// Validaciones reutilizables
const validarId = [
  param('id').isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo.'),
  validate,
];

// ─────────────────────────────────────────────────────────
// AUTH — Pública
// POST /api/auth/login
// GET  /api/auth/perfil  (protegida)
// ─────────────────────────────────────────────────────────
const authController = require('../controllers/auth.controller');
router.post('/auth/login',        authController.login);
router.get ('/auth/perfil',        authController.perfil);

// ─────────────────────────────────────────────────────────
// DASHBOARD — Protegida
// GET /api/dashboard
// ─────────────────────────────────────────────────────────
router.get('/dashboard',  DashboardController.resumen);

// ─────────────────────────────────────────────────────────
// MAQUINARIA
// GET    /api/maquinaria            — Obtener todas (?estado=disponible)
// GET    /api/maquinaria/:id        — Obtener una
// POST   /api/maquinaria            — Crear
// PUT    /api/maquinaria/:id        — Actualizar
// DELETE /api/maquinaria/:id        — Eliminar
// ─────────────────────────────────────────────────────────
router.get   ('/maquinaria',          MaquinariaController.getAll);
router.get   ('/maquinaria/:id',      validarId, MaquinariaController.getById);
router.post  ('/maquinaria',         
  [
    body('numero_economico').notEmpty().withMessage('El número económico es obligatorio.'),
    body('tipo_equipo').notEmpty().withMessage('El tipo de equipo es obligatorio.'),
    body('modelo').notEmpty().withMessage('El modelo es obligatorio.'),
    validate,
  ],
  MaquinariaController.create
);
router.put   ('/maquinaria/:id',      validarId, MaquinariaController.update);
router.delete('/maquinaria/:id',      validarId, MaquinariaController.delete);

// ─────────────────────────────────────────────────────────
// SOLICITUDES
// GET    /api/solicitudes            (?estado=pendiente)
// GET    /api/solicitudes/:id
// POST   /api/solicitudes
// PUT    /api/solicitudes/:id
// PATCH  /api/solicitudes/:id/estado
// DELETE /api/solicitudes/:id
// ─────────────────────────────────────────────────────────
router.get   ('/solicitudes',                SolicitudController.getAll);
router.get   ('/solicitudes/:id',            validarId, SolicitudController.getById);
router.post  ('/solicitudes',               
  [
    body('folio').notEmpty().withMessage('El folio CEDER es obligatorio.'),
    body('nombre_productor').notEmpty().withMessage('El nombre del productor es obligatorio.'),
    body('municipio').notEmpty().withMessage('El municipio es obligatorio.'),
    validate,
  ],
  SolicitudController.create
);
router.put   ('/solicitudes/:id',            validarId, SolicitudController.update);
router.patch ('/solicitudes/:id/estado',     validarId,
  [
    body('estado')
      .isIn(['pendiente','aprobada','rechazada','cancelada'])
      .withMessage('Estado no válido. Use: pendiente, aprobada, rechazada o cancelada.'),
    validate,
  ],
  SolicitudController.updateEstado
);
router.delete('/solicitudes/:id',            validarId, SolicitudController.delete);

// ─────────────────────────────────────────────────────────
// COMODATOS
// GET    /api/comodatos              (?estado=activo)
// GET    /api/comodatos/:id
// POST   /api/comodatos
// PATCH  /api/comodatos/:id/estado
// DELETE /api/comodatos/:id
// ─────────────────────────────────────────────────────────
router.get   ('/comodatos',                ComodatoController.getAll);
router.get   ('/comodatos/:id',            validarId, ComodatoController.getById);
router.post  ('/comodatos',               
  [
    body('nombre_comodatario').notEmpty().withMessage('El nombre del comodatario es obligatorio.'),
    body('fecha_entrega').notEmpty().withMessage('La fecha de entrega es obligatoria.'),
    validate,
  ],
  ComodatoController.create
);
router.patch ('/comodatos/:id/estado',     validarId,
  [
    body('estado')
      .isIn(['programado','activo','finalizado','incumplido','cancelado'])
      .withMessage('Estado no válido.'),
    validate,
  ],
  ComodatoController.updateEstado
);
router.delete('/comodatos/:id',            validarId, ComodatoController.delete);

// ─────────────────────────────────────────────────────────
// ENTREGAS
// GET    /api/entregas
// GET    /api/entregas/:id
// POST   /api/entregas
// DELETE /api/entregas/:id
// ─────────────────────────────────────────────────────────
router.get   ('/entregas',           EntregaController.getAll);
router.get   ('/entregas/:id',       validarId, EntregaController.getById);
router.post  ('/entregas',          
  [
    body('fk_comodato').isInt({ min: 1 }).withMessage('El comodato es obligatorio.'),
    body('nombre_receptor').notEmpty().withMessage('El nombre del receptor es obligatorio.'),
    body('fecha_entrega').notEmpty().withMessage('La fecha de entrega es obligatoria.'),
    validate,
  ],
  EntregaController.create
);
router.delete('/entregas/:id',       validarId, EntregaController.delete);

// ─────────────────────────────────────────────────────────
// DEVOLUCIONES
// GET    /api/devoluciones
// GET    /api/devoluciones/:id
// POST   /api/devoluciones
// DELETE /api/devoluciones/:id
// ─────────────────────────────────────────────────────────
router.get   ('/devoluciones',       DevolucionController.getAll);
router.get   ('/devoluciones/:id',   validarId, DevolucionController.getById);
router.post  ('/devoluciones',      
  [
    body('fk_comodato').isInt({ min: 1 }).withMessage('El comodato es obligatorio.'),
    body('fecha_devolucion').notEmpty().withMessage('La fecha de devolución es obligatoria.'),
    validate,
  ],
  DevolucionController.create
);
router.delete('/devoluciones/:id',   validarId, DevolucionController.delete);

// ─────────────────────────────────────────────────────────
// FALLAS
// GET    /api/fallas                 (?estado=pendiente)
// GET    /api/fallas/:id
// POST   /api/fallas
// PATCH  /api/fallas/:id/estado
// DELETE /api/fallas/:id
// ─────────────────────────────────────────────────────────
router.get   ('/fallas',               FallaController.getAll);
router.get   ('/fallas/:id',           validarId, FallaController.getById);
router.post  ('/fallas',              
  [
    body('descripcion').notEmpty().withMessage('La descripción de la falla es obligatoria.'),
    body('tipo').isIn(['mecanica','electrica','hidraulica','dano_fisico','motor','llantas','dano_devolucion','otro'])
      .withMessage('Tipo de falla no válido.'),
    validate,
  ],
  FallaController.create
);
router.patch ('/fallas/:id/estado',    validarId,
  [
    body('estado').isIn(['pendiente','en_proceso','resuelto','cancelado'])
      .withMessage('Estado de falla no válido.'),
    validate,
  ],
  FallaController.updateEstado
);
router.delete('/fallas/:id',           validarId, FallaController.delete);

// ─────────────────────────────────────────────────────────
// MANTENIMIENTO
// GET    /api/mantenimientos
// GET    /api/mantenimientos/:id
// POST   /api/mantenimientos
// PATCH  /api/mantenimientos/:id/terminar
// DELETE /api/mantenimientos/:id
// ─────────────────────────────────────────────────────────
router.get   ('/mantenimientos',                 MantenimientoController.getAll);
router.get   ('/mantenimientos/:id',             validarId, MantenimientoController.getById);
router.post  ('/mantenimientos',                
  [
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria.'),
    body('tipo_manto').isIn(['correctivo','preventivo','garantia','externo'])
      .withMessage('Tipo de mantenimiento no válido.'),
    validate,
  ],
  MantenimientoController.create
);
router.patch ('/mantenimientos/:id/terminar',    validarId, MantenimientoController.terminar);
router.delete('/mantenimientos/:id',             validarId, MantenimientoController.delete);

module.exports = router;
