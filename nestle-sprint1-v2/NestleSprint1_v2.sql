-- ════════════════════════════════════════════════════════
-- NESTLÉ DMS — SPRINT 1 v2  (Full Role-Based System)
-- Roles: retailer | order_team | route_planner | warehouse | distributor
-- Run in SSMS against server: ISHEY-LAPTOP2
-- ════════════════════════════════════════════════════════

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'NestleSprint1')
    CREATE DATABASE NestleSprint1;
GO

USE NestleSprint1;
GO

-- ── drop in FK order ────────────────────────────────────
IF OBJECT_ID('dbo.DeliveryStatus','U') IS NOT NULL DROP TABLE dbo.DeliveryStatus;
IF OBJECT_ID('dbo.RouteStops',   'U') IS NOT NULL DROP TABLE dbo.RouteStops;
IF OBJECT_ID('dbo.Routes',       'U') IS NOT NULL DROP TABLE dbo.Routes;
IF OBJECT_ID('dbo.Deliveries',   'U') IS NOT NULL DROP TABLE dbo.Deliveries;
IF OBJECT_ID('dbo.Orders',       'U') IS NOT NULL DROP TABLE dbo.Orders;
IF OBJECT_ID('dbo.Vehicles',     'U') IS NOT NULL DROP TABLE dbo.Vehicles;
IF OBJECT_ID('dbo.Users',        'U') IS NOT NULL DROP TABLE dbo.Users;
GO

-- ════════════════════════
-- Users
-- ════════════════════════
CREATE TABLE dbo.Users (
    UserID       INT           IDENTITY(1,1) PRIMARY KEY,
    FullName     NVARCHAR(100) NOT NULL,
    Email        NVARCHAR(150) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(100) NOT NULL,
    Role         NVARCHAR(20)  NOT NULL,
    -- roles: retailer | order_team | route_planner | warehouse | distributor
    Avatar       NVARCHAR(5)   NOT NULL DEFAULT '',
    IsActive     BIT           NOT NULL DEFAULT 1,
    CreatedAt    DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ════════════════════════
-- Vehicles
-- ════════════════════════
CREATE TABLE dbo.Vehicles (
    VehicleID   NVARCHAR(10)  PRIMARY KEY,
    Plate       NVARCHAR(20)  NOT NULL UNIQUE,
    VehicleType NVARCHAR(50)  NOT NULL,
    Capacity    NVARCHAR(20)  NOT NULL,
    FuelPercent INT           NOT NULL DEFAULT 100,
    Status      NVARCHAR(20)  NOT NULL DEFAULT 'idle'
    -- idle | assigned | in-transit
);
GO

-- ════════════════════════
-- Orders  (retailer → OPT)
-- ════════════════════════
CREATE TABLE dbo.Orders (
    OrderID      NVARCHAR(12)  PRIMARY KEY,   -- ORD001 …
    RetailerID   INT           NOT NULL,       -- FK Users
    RetailerName NVARCHAR(150) NOT NULL,
    City         NVARCHAR(100) NOT NULL,
    Region       NVARCHAR(50)  NOT NULL DEFAULT 'Western',
    ItemCount    INT           NOT NULL DEFAULT 0,
    WeightKG     INT           NOT NULL DEFAULT 0,
    Priority     NVARCHAR(10)  NOT NULL DEFAULT 'normal',
    Notes        NVARCHAR(500) NULL    DEFAULT '',
    Status       NVARCHAR(20)  NOT NULL DEFAULT 'pending',
    -- pending | confirmed | rejected | consolidated
    RejectionReason NVARCHAR(300) NULL,
    ConfirmedBy  INT           NULL,           -- FK Users (OPT member)
    CreatedAt    DATETIME2     NOT NULL DEFAULT GETDATE(),
    UpdatedAt    DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ════════════════════════
-- Deliveries  (OPT → Warehouse → Distributor)
-- ════════════════════════
CREATE TABLE dbo.Deliveries (
    DeliveryID   NVARCHAR(10)  PRIMARY KEY,   -- D001 …
    OrderID      NVARCHAR(12)  NULL,
    RetailerName NVARCHAR(150) NOT NULL,
    City         NVARCHAR(100) NOT NULL,
    Region       NVARCHAR(50)  NOT NULL DEFAULT 'Western',
    ItemCount    INT           NOT NULL DEFAULT 0,
    WeightKG     INT           NOT NULL DEFAULT 0,
    Priority     NVARCHAR(10)  NOT NULL DEFAULT 'normal',
    Status       NVARCHAR(20)  NOT NULL DEFAULT 'pending',
    -- pending | assigned | warehouse_ready | in-transit | delivered | failed
    DriverID     INT           NULL,
    VehicleID    NVARCHAR(10)  NULL,
    RouteID      NVARCHAR(10)  NULL,
    ETA          NVARCHAR(20)  NULL DEFAULT '—',
    Notes        NVARCHAR(500) NULL DEFAULT '',
    CreatedAt    DATETIME2     NOT NULL DEFAULT GETDATE(),
    UpdatedAt    DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ════════════════════════
-- Routes
-- ════════════════════════
CREATE TABLE dbo.Routes (
    RouteID      NVARCHAR(10)  PRIMARY KEY,   -- R001 …
    RouteName    NVARCHAR(200) NOT NULL,
    DriverID     INT           NULL,
    VehicleID    NVARCHAR(10)  NULL,
    StopCount    INT           NOT NULL DEFAULT 0,
    DistanceKM   INT           NOT NULL DEFAULT 0,
    DurationMins INT           NOT NULL DEFAULT 0,
    CitySequence NVARCHAR(MAX) NULL,          -- JSON array
    Status       NVARCHAR(20)  NOT NULL DEFAULT 'planned',
    -- planned | active | completed
    CreatedAt    DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ════════════════════════
-- DeliveryStatus  (distributor updates)
-- ════════════════════════
CREATE TABLE dbo.DeliveryStatus (
    StatusID     INT           IDENTITY(1,1) PRIMARY KEY,
    DeliveryID   NVARCHAR(10)  NOT NULL,
    UpdatedByID  INT           NOT NULL,      -- distributor user
    OldStatus    NVARCHAR(20)  NOT NULL,
    NewStatus    NVARCHAR(20)  NOT NULL,
    Note         NVARCHAR(300) NULL,
    UpdatedAt    DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ── Foreign keys ────────────────────────────────────────
ALTER TABLE dbo.Orders     ADD CONSTRAINT FK_Ord_Retailer  FOREIGN KEY (RetailerID)  REFERENCES dbo.Users(UserID);
ALTER TABLE dbo.Orders     ADD CONSTRAINT FK_Ord_Confirm   FOREIGN KEY (ConfirmedBy) REFERENCES dbo.Users(UserID);
ALTER TABLE dbo.Deliveries ADD CONSTRAINT FK_Del_Driver    FOREIGN KEY (DriverID)    REFERENCES dbo.Users(UserID);
ALTER TABLE dbo.Deliveries ADD CONSTRAINT FK_Del_Vehicle   FOREIGN KEY (VehicleID)   REFERENCES dbo.Vehicles(VehicleID);
ALTER TABLE dbo.DeliveryStatus ADD CONSTRAINT FK_DS_Del    FOREIGN KEY (DeliveryID)  REFERENCES dbo.Deliveries(DeliveryID);
ALTER TABLE dbo.DeliveryStatus ADD CONSTRAINT FK_DS_User   FOREIGN KEY (UpdatedByID) REFERENCES dbo.Users(UserID);
GO

-- ════════════════════════
-- SEED DATA
-- ════════════════════════

-- Users (one per role + extras)
INSERT INTO dbo.Users (FullName, Email, PasswordHash, Role, Avatar) VALUES
-- Retailers
('Cargills Manager',    'retailer1@cargills.lk', 'ret123',   'retailer',      'CM'),
('Keells Manager',      'retailer2@keells.lk',   'ret123',   'retailer',      'KM'),
-- Order Processing Team
('Nuwan Dissanayake',   'order@nestle.lk',        'order123', 'order_team',    'ND'),
('Samanthi Perera',     'order2@nestle.lk',       'order123', 'order_team',    'SP'),
-- Route Planner
('Chamodi Rupasinghe',  'route@nestle.lk',        'route123', 'route_planner', 'CR'),
-- Warehouse
('Kasun Bandara',       'warehouse@nestle.lk',    'wh123',    'warehouse',     'KB'),
-- Distributors
('Kumara Silva',        'driver1@nestle.lk',      'drv123',   'distributor',   'KS'),
('Nimal Jayawardena',   'driver2@nestle.lk',      'drv123',   'distributor',   'NJ');
GO

-- Vehicles
INSERT INTO dbo.Vehicles (VehicleID, Plate, VehicleType, Capacity, FuelPercent, Status) VALUES
('V001', 'NB-1234', 'Heavy Lorry', '5 Ton', 88, 'idle'),
('V002', 'NB-5678', 'Mini Truck',  '2 Ton', 72, 'idle'),
('V003', 'NB-9012', 'Cargo Van',   '1 Ton', 95, 'idle'),
('V004', 'NB-3456', 'Heavy Lorry', '5 Ton', 60, 'idle'),
('V005', 'NB-7890', 'Mini Truck',  '2 Ton', 83, 'idle');
GO

PRINT '';
PRINT '✓ NestleSprint1 database ready!';
PRINT '';
PRINT '  Tables: Users, Vehicles, Orders, Deliveries, Routes, DeliveryStatus';
PRINT '';
PRINT '  Login accounts:';
PRINT '    retailer1@cargills.lk  / ret123    (Retailer)';
PRINT '    retailer2@keells.lk    / ret123    (Retailer)';
PRINT '    order@nestle.lk        / order123  (Order Processing Team)';
PRINT '    route@nestle.lk        / route123  (Route Planner)';
PRINT '    warehouse@nestle.lk    / wh123     (Warehouse)';
PRINT '    driver1@nestle.lk      / drv123    (Distributor)';
PRINT '    driver2@nestle.lk      / drv123    (Distributor)';
GO
