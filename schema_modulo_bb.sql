-- ============================================================
-- CREAN — MÓDULO B: COMODATOS
-- Script SQL completo para PostgreSQL / pgAdmin
-- Incluye: Schema, 16 tablas, datos iniciales, índices
-- Ejecutar en pgAdmin sobre la base de datos: crean
-- ============================================================

CREATE SCHEMA IF NOT EXISTS comodatos;

-- ── 1. USUARIOS DEL SISTEMA ──────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.usuario (
    pk_usuario      SERIAL PRIMARY KEY,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    nombre          VARCHAR(200) NOT NULL,
    rol             VARCHAR(30)  NOT NULL DEFAULT 'operador'
                    CHECK (rol IN ('administrador','operador','consulta')),
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_registro  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. MAQUINARIA LOCAL (standalone — sin Módulo A) ──────
CREATE TABLE IF NOT EXISTS comodatos.maquinaria_local (
    pk_maquinaria   SERIAL PRIMARY KEY,
    numero_economico VARCHAR(50)  NOT NULL UNIQUE,
    tipo_equipo     VARCHAR(50)  NOT NULL,
    marca           VARCHAR(100),
    modelo          VARCHAR(100),
    serie           VARCHAR(100),
    num_motor       VARCHAR(100),
    color           VARCHAR(50),
    estado_operativo VARCHAR(30) NOT NULL DEFAULT 'disponible'
                    CHECK (estado_operativo IN ('disponible','prestada','mantenimiento','revision','baja')),
    horas_actuales  INT          NOT NULL DEFAULT 0,
    ubicacion       VARCHAR(100) NOT NULL DEFAULT 'CREAN',
    observaciones   TEXT,
    fecha_registro  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── 3. VEHÍCULOS LOCALES ─────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.vehiculo_local (
    pk_vehiculo     SERIAL PRIMARY KEY,
    numero_economico VARCHAR(50)  NOT NULL UNIQUE,
    tipo_vehiculo   VARCHAR(50),
    marca           VARCHAR(100),
    modelo          VARCHAR(100),
    placas          VARCHAR(30),
    color           VARCHAR(50),
    estado_operativo VARCHAR(30) NOT NULL DEFAULT 'disponible'
                    CHECK (estado_operativo IN ('disponible','en_uso','mantenimiento','baja')),
    kilometraje_actual INT       NOT NULL DEFAULT 0,
    observaciones   TEXT,
    fecha_registro  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── 4. SOLICITUDES DE COMODATO ───────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.solicitud_comodato (
    pk_solicitud        SERIAL PRIMARY KEY,
    folio               VARCHAR(50)  NOT NULL,
    nombre_productor    VARCHAR(200) NOT NULL,
    telefono            VARCHAR(30),
    ejido               VARCHAR(200),
    municipio           VARCHAR(100) NOT NULL,
    superficie_ha       DECIMAL(10,2),
    cultivo             VARCHAR(100),
    equipos_solicitados TEXT,
    num_beneficiarios   INT,
    documento_ceder     TEXT,
    estado              VARCHAR(20)  NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','aprobada','rechazada','cancelada')),
    fecha_solicitud     DATE,
    registrado_por      VARCHAR(100),
    observaciones       TEXT,
    fecha_registro      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── 5. CONTRATOS DE COMODATO ─────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.comodato (
    pk_comodato                 SERIAL PRIMARY KEY,
    fk_solicitud                INT REFERENCES comodatos.solicitud_comodato(pk_solicitud),
    fk_maquinaria               INT REFERENCES comodatos.maquinaria_local(pk_maquinaria),
    numero_economico_maq        VARCHAR(50),
    descripcion_maquinaria      TEXT,
    nombre_comodatario          VARCHAR(200) NOT NULL,
    telefono                    VARCHAR(30),
    ejido                       VARCHAR(200),
    municipio                   VARCHAR(100),
    cultivo                     VARCHAR(100),
    superficie_ha               DECIMAL(10,2),
    num_beneficiarios           INT,
    fecha_entrega               DATE,
    fecha_devolucion_esperada   DATE,
    fecha_devolucion_real       DATE,
    dias_prestamo               INT,
    estado                      VARCHAR(20) NOT NULL DEFAULT 'programado'
                                CHECK (estado IN ('programado','activo','finalizado','incumplido','cancelado')),
    oficio_comodato             TEXT,
    horas_entrega               INT,
    registrado_por              VARCHAR(100),
    observaciones               TEXT,
    fecha_registro              TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── 6. TRASLADOS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.operacion_traslado (
    pk_traslado         SERIAL PRIMARY KEY,
    fk_comodato         INT         NOT NULL REFERENCES comodatos.comodato(pk_comodato),
    tipo                VARCHAR(20) NOT NULL DEFAULT 'entrega'
                        CHECK (tipo IN ('entrega','recoleccion')),
    destino             VARCHAR(300) NOT NULL,
    fecha_salida        TIMESTAMP,
    fecha_llegada       TIMESTAMP,
    fk_vehiculo         INT REFERENCES comodatos.vehiculo_local(pk_vehiculo),
    numero_economico_veh VARCHAR(50),
    km_salida           INT,
    km_llegada          INT,
    foto_tablero_salida TEXT,
    foto_tablero_llegada TEXT,
    observaciones       TEXT,
    registrado_por      VARCHAR(100),
    fecha_registro      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── 7. COMBUSTIBLE ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.operacion_combustible (
    pk_combustible  SERIAL PRIMARY KEY,
    fk_traslado     INT REFERENCES comodatos.operacion_traslado(pk_traslado),
    fk_comodato     INT NOT NULL REFERENCES comodatos.comodato(pk_comodato),
    tipo_activo     VARCHAR(20) DEFAULT 'vehiculo'
                    CHECK (tipo_activo IN ('vehiculo','maquinaria')),
    numero_economico VARCHAR(50),
    litros          DECIMAL(10,2),
    costo           DECIMAL(10,2),
    foto_ticket     TEXT,
    foto_tablero    TEXT,
    fecha           TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    registrado_por  VARCHAR(100)
);

-- ── 8. ENTREGAS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.entrega_comodato (
    pk_entrega              SERIAL PRIMARY KEY,
    fk_comodato             INT         NOT NULL REFERENCES comodatos.comodato(pk_comodato),
    fk_maquinaria           INT REFERENCES comodatos.maquinaria_local(pk_maquinaria),
    numero_economico        VARCHAR(50),
    fecha_entrega           TIMESTAMP   NOT NULL,
    nombre_receptor         VARCHAR(200) NOT NULL,
    cargo_receptor          VARCHAR(200),
    ubicacion_entrega       VARCHAR(300),
    horas_entrega           INT,
    fotos_entrega           TEXT,
    oficio_entrega          TEXT,
    -- Checklist de estado al entregar
    estado_motor            VARCHAR(20) DEFAULT 'bueno',
    estado_llantas          VARCHAR(20) DEFAULT 'bueno',
    estado_asiento          VARCHAR(20) DEFAULT 'bueno',
    nivel_combustible       VARCHAR(20) DEFAULT 'lleno',
    rayones                 BOOLEAN     DEFAULT FALSE,
    descripcion_rayones     TEXT,
    piezas_faltantes        TEXT,
    observaciones_checklist TEXT,
    registrado_por          VARCHAR(100),
    fecha_registro          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── 9. DEVOLUCIONES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.devolucion_comodato (
    pk_devolucion           SERIAL PRIMARY KEY,
    fk_comodato             INT         NOT NULL REFERENCES comodatos.comodato(pk_comodato),
    fk_maquinaria           INT REFERENCES comodatos.maquinaria_local(pk_maquinaria),
    numero_economico        VARCHAR(50),
    fecha_devolucion        TIMESTAMP   NOT NULL,
    horas_regreso           INT,
    tipo_devolucion         VARCHAR(20) DEFAULT 'voluntaria'
                            CHECK (tipo_devolucion IN ('voluntaria','recuperacion')),
    tiene_danos             BOOLEAN     DEFAULT FALSE,
    requiere_mantenimiento  BOOLEAN     DEFAULT FALSE,
    estado_cierre           VARCHAR(30) DEFAULT 'conforme'
                            CHECK (estado_cierre IN ('conforme','con_danos','garantia','taller_externo')),
    estado_motor            VARCHAR(20),
    estado_llantas          VARCHAR(20),
    nivel_combustible       VARCHAR(20),
    rayones_nuevos          BOOLEAN     DEFAULT FALSE,
    descripcion_danos       TEXT,
    foto_tablero            TEXT,
    fotos_devolucion        TEXT,
    observaciones           TEXT,
    registrado_por          VARCHAR(100),
    fecha_registro          TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── 10. REPORTES DE USO (horas/combustible) ──────────────
CREATE TABLE IF NOT EXISTS comodatos.reporte_uso_comodato (
    pk_reporte          SERIAL PRIMARY KEY,
    fk_comodato         INT NOT NULL REFERENCES comodatos.comodato(pk_comodato),
    fk_maquinaria       INT REFERENCES comodatos.maquinaria_local(pk_maquinaria),
    numero_economico    VARCHAR(50),
    horas_horometro     INT NOT NULL,
    combustible_litros  DECIMAL(10,2),
    actividad_realizada TEXT,
    superficie_trabajada DECIMAL(10,2),
    foto_horometro      TEXT,
    ticket_combustible  TEXT,
    fecha_reporte       DATE NOT NULL,
    registrado_por      VARCHAR(100),
    fecha_registro      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 11. FALLAS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.falla (
    pk_falla            SERIAL PRIMARY KEY,
    fk_comodato         INT REFERENCES comodatos.comodato(pk_comodato),
    fk_maquinaria       INT REFERENCES comodatos.maquinaria_local(pk_maquinaria),
    numero_economico    VARCHAR(50),
    tipo                VARCHAR(50) NOT NULL
                        CHECK (tipo IN ('mecanica','electrica','hidraulica','dano_fisico','motor','llantas','dano_devolucion','otro')),
    urgencia            VARCHAR(20) NOT NULL DEFAULT 'normal'
                        CHECK (urgencia IN ('alta','normal','baja')),
    descripcion         TEXT        NOT NULL,
    estado              VARCHAR(30) NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','en_proceso','resuelto','cancelado')),
    origen              VARCHAR(50) NOT NULL DEFAULT 'comodatos'
                        CHECK (origen IN ('comodatos','traslado','operacion','devolucion')),
    reportado_por       VARCHAR(100),
    fecha_reporte       DATE        DEFAULT CURRENT_DATE,
    observaciones       TEXT,
    fecha_registro      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── 12. MANTENIMIENTO ────────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.mantenimiento (
    pk_mantenimiento    SERIAL PRIMARY KEY,
    fk_comodato         INT REFERENCES comodatos.comodato(pk_comodato),
    fk_falla            INT REFERENCES comodatos.falla(pk_falla),
    fk_maquinaria       INT REFERENCES comodatos.maquinaria_local(pk_maquinaria),
    numero_economico    VARCHAR(50),
    tipo_manto          VARCHAR(30) NOT NULL DEFAULT 'correctivo'
                        CHECK (tipo_manto IN ('correctivo','preventivo','garantia','externo')),
    descripcion         TEXT        NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'programado'
                        CHECK (estado IN ('programado','en_proceso','terminado','cancelado')),
    taller              VARCHAR(200),
    tecnico             VARCHAR(200),
    costo_estimado      DECIMAL(12,2),
    costo_real          DECIMAL(12,2),
    fecha_inicio        DATE,
    fecha_fin_estimada  DATE,
    fecha_fin_real      DATE,
    repuestos_usados    TEXT,
    observaciones       TEXT,
    registrado_por      VARCHAR(100),
    fecha_registro      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── 13. DOCUMENTOS OFICIALES ─────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.documento_oficial (
    pk_documento        SERIAL PRIMARY KEY,
    fk_comodato         INT REFERENCES comodatos.comodato(pk_comodato),
    tipo_documento      VARCHAR(50) NOT NULL
                        CHECK (tipo_documento IN ('autorizacion_salida','guia_traslado',
                               'recibo_recepcion','oficio_comodato','penalizacion','otro')),
    numero_folio        VARCHAR(100) NOT NULL,
    fecha_documento     DATE         NOT NULL DEFAULT CURRENT_DATE,
    contenido_json      JSONB,
    estado              VARCHAR(20)  NOT NULL DEFAULT 'borrador'
                        CHECK (estado IN ('borrador','emitido','cancelado')),
    registrado_por      VARCHAR(100),
    fecha_registro      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── 14. INCUMPLIMIENTOS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.incumplimiento_comodato (
    pk_incumplimiento   SERIAL PRIMARY KEY,
    fk_comodato         INT NOT NULL REFERENCES comodatos.comodato(pk_comodato),
    tipo                VARCHAR(50)
                        CHECK (tipo IN ('no_devolucion','devolucion_tardia','dano_equipo','otro')),
    descripcion         TEXT,
    fecha_limite_original DATE,
    dias_de_retraso     INT,
    intentos_contacto   INT DEFAULT 0,
    estado              VARCHAR(20) DEFAULT 'activo'
                        CHECK (estado IN ('activo','resuelto','cancelado')),
    registrado_por      VARCHAR(100),
    fecha_registro      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── 15. PENALIZACIONES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.penalizacion (
    pk_penalizacion     SERIAL PRIMARY KEY,
    fk_incumplimiento   INT NOT NULL REFERENCES comodatos.incumplimiento_comodato(pk_incumplimiento),
    fk_comodato         INT REFERENCES comodatos.comodato(pk_comodato),
    tipo_penalizacion   VARCHAR(100),
    descripcion         TEXT,
    monto               DECIMAL(12,2),
    oficio_penalizacion TEXT,
    estado              VARCHAR(20) DEFAULT 'aplicada'
                        CHECK (estado IN ('aplicada','pagada','cancelada')),
    registrado_por      VARCHAR(100),
    fecha_registro      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
);

-- ── 16. RECUPERACIÓN FORZOSA ─────────────────────────────
CREATE TABLE IF NOT EXISTS comodatos.recuperacion_equipo (
    pk_recuperacion         SERIAL PRIMARY KEY,
    fk_comodato             INT NOT NULL REFERENCES comodatos.comodato(pk_comodato),
    fk_incumplimiento       INT REFERENCES comodatos.incumplimiento_comodato(pk_incumplimiento),
    direccion_recuperacion  TEXT,
    tipo_traslado_regreso   VARCHAR(50)
                            CHECK (tipo_traslado_regreso IN ('rodando','plataforma','cama_baja')),
    numero_economico_veh    VARCHAR(50),
    empleados_participantes TEXT,
    observaciones           TEXT,
    fecha_recuperacion      DATE,
    registrado_por          VARCHAR(100),
    fecha_registro          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_comodato_estado        ON comodatos.comodato(estado);
CREATE INDEX IF NOT EXISTS idx_comodato_comodatario   ON comodatos.comodato(nombre_comodatario);
CREATE INDEX IF NOT EXISTS idx_solicitud_estado       ON comodatos.solicitud_comodato(estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_folio        ON comodatos.solicitud_comodato(folio);
CREATE INDEX IF NOT EXISTS idx_falla_estado           ON comodatos.falla(estado);
CREATE INDEX IF NOT EXISTS idx_falla_maquinaria       ON comodatos.falla(fk_maquinaria);
CREATE INDEX IF NOT EXISTS idx_maquinaria_estado      ON comodatos.maquinaria_local(estado_operativo);
CREATE INDEX IF NOT EXISTS idx_maquinaria_num_eco     ON comodatos.maquinaria_local(numero_economico);
CREATE INDEX IF NOT EXISTS idx_mantenimiento_estado   ON comodatos.mantenimiento(estado);
CREATE INDEX IF NOT EXISTS idx_entrega_comodato       ON comodatos.entrega_comodato(fk_comodato);
CREATE INDEX IF NOT EXISTS idx_devolucion_comodato    ON comodatos.devolucion_comodato(fk_comodato);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

-- Usuario administrador inicial
-- Contraseña: Admin2026! (cambiar después de primer acceso)
INSERT INTO comodatos.usuario (username, password_hash, nombre, rol)
VALUES (
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2',
  'Administrador del Sistema',
  'administrador'
) ON CONFLICT (username) DO NOTHING;

-- Usuario operador Liz
INSERT INTO comodatos.usuario (username, password_hash, nombre, rol)
VALUES (
  'liz',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2',
  'Liz — Responsable Módulo B',
  'operador'
) ON CONFLICT (username) DO NOTHING;

-- Maquinaria inicial del CREAN
INSERT INTO comodatos.maquinaria_local
  (numero_economico, tipo_equipo, marca, modelo, serie, num_motor, estado_operativo, horas_actuales, ubicacion)
VALUES
  ('T001','Tractor','NEW HOLLAND','T8.410',       'JJAT8410LJRE03189',NULL,         'disponible',1200,'CREAN'),
  ('T002','Tractor','NEW HOLLAND','T8.410',       'JJAT8410TJRE02758',NULL,         'disponible',980, 'CREAN'),
  ('T003','Tractor','NEW HOLLAND','T7060 4WD',    'ZMBG20657',       '001883319',  'disponible',800, 'CREAN'),
  ('T004','Tractor','NEW HOLLAND','T7060 4WD',    'ZNBG00655',       '001924986',  'disponible',760, 'CREAN'),
  ('T005','Tractor','NEW HOLLAND','T7060 4WD',    'ZMBG02112',       '001828381',  'disponible',900, 'CREAN'),
  ('T006','Tractor','NEW HOLLAND','T7060 4WD',    'ZMBG20924',       '001883461',  'disponible',850, 'CREAN'),
  ('T007','Tractor','NEW HOLLAND','7610S 4WD',    'S507563M',        '8089575',    'disponible',1050,'CREAN'),
  ('T040','Tractor','NEW HOLLAND','7610S 4WD',    'S508874M',        '8123519',    'disponible',1206,'CREAN'),
  ('R001','Rastra', 'NÚÑEZ',      '48 DISCOS',    NULL,              NULL,         'disponible',0,   'CREAN'),
  ('R002','Rastra', 'NÚÑEZ',      '32 DISCOS',    NULL,              NULL,         'disponible',0,   'CREAN'),
  ('R003','Rastra', 'INDUSTRIAL AMERICA','32 DISCOS',NULL,           NULL,         'disponible',0,   'CREAN'),
  ('S001','Sembradora','PRECISION','PRECISIÓN',   NULL,              NULL,         'disponible',0,   'CREAN'),
  ('S002','Sembradora','CAJÓN',    'CAJÓN',        NULL,              NULL,         'disponible',0,   'CREAN')
ON CONFLICT (numero_economico) DO NOTHING;

-- Vehículos iniciales
INSERT INTO comodatos.vehiculo_local
  (numero_economico, tipo_vehiculo, marca, modelo, estado_operativo, kilometraje_actual)
VALUES
  ('VEH-001','Camioneta','CHEVROLET','SILVERADO','disponible',85000),
  ('VEH-002','Cama Baja','KENWORTH', 'T800',     'disponible',120000),
  ('VEH-003','Camioneta','FORD',     'F-250',    'disponible',62000)
ON CONFLICT (numero_economico) DO NOTHING;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
SELECT
  tablename AS tabla,
  pg_size_pretty(pg_total_relation_size('comodatos.'||tablename)) AS tamaño
FROM pg_tables
WHERE schemaname = 'comodatos'
ORDER BY tablename;
