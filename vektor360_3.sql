-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-11-2026 a las 13:26:50
-- Versión del servidor: 10.11.16-MariaDB
-- Versión de PHP: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vektor360_3`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chofer`
--

CREATE TABLE `chofer` (
  `nro_legajo` int(11) NOT NULL,
  `licencia` varchar(50) NOT NULL,
  `id_usuarios` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `chofer`
--

INSERT INTO `chofer` (`nro_legajo`, `licencia`, `id_usuarios`) VALUES
(101, 'B1-998822', 9),
(102, 'E2-443322', 10),
(103, 'E2-112233', 11),
(107, 'C1-332211', 12),
(108, 'E2-665544', 13),
(109, 'D2-110022', 14),
(110, 'E1-887766', 15),
(111, 'E2-774411', 16),
(112, 'E1-662299', 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `incidentes`
--

CREATE TABLE `incidentes` (
  `id_incidentes` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `detalles` text NOT NULL,
  `lugar` varchar(150) NOT NULL,
  `Estado` varchar(50) NOT NULL,
  `patente_id` varchar(20) NOT NULL,
  `nro_legajo_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `incidentes`
--

INSERT INTO `incidentes` (`id_incidentes`, `fecha`, `detalles`, `lugar`, `Estado`, `patente_id`, `nro_legajo_id`) VALUES
(1, '2026-10-24 08:00:00', 'Desgaste prematuro de neumáticos en el eje delantero', 'Autopista Bs As - Rosario Km 120', 'Pendiente', 'AG789ZZ', 101),
(2, '2026-10-25 16:45:00', 'Falla eléctrica en el tablero de instrumentos', 'Tres Arroyos', 'En Reparación', 'AF111AA', 102),
(6, '2026-10-28 07:15:00', 'Pérdida de presión en circuito neumático de frenos traseros', 'Ruta Nacional 3 Km 680 - Bahía Blanca', 'En Reparación', 'AG666FF', 107),
(7, '2026-10-30 14:20:00', 'Sobrecalentamiento de motor en subida prolongada, posible falla en termostato', 'Ruta Nacional 7 Km 310 - Rufino', 'Resuelto', 'AD444DD', 108),
(8, '2026-11-02 19:50:00', 'Rotura de parabrisas por impacto de piedra en ruta', 'Autopista Córdoba - Rosario Km 215', 'Pendiente', 'AE333CC', 109),
(9, '2026-11-05 06:30:00', 'Alternador no carga correctamente las baterías, testigo encendido', 'Ruta Nacional 22 Km 45 - Río Colorado', 'En Reparación', 'AC999II', 110),
(10, '2026-11-08 11:10:00', 'Vibración excesiva en dirección a más de 80 km/h', 'Ruta Provincial 51 - Olavarría', 'Resuelto', 'AF888HH', 111),
(11, '2026-11-12 15:40:00', 'Pérdida de aceite en retén de diferencial trasero', 'Acceso Oeste Km 42 - Moreno', 'En Reparación', 'AF111AA', 112),
(12, '2026-11-15 09:05:00', 'Falla en sensor ABS rueda delantera izquierda', 'Ruta Nacional 5 Km 160 - Chivilcoy', 'Pendiente', 'AG789ZZ', 103),
(13, '2026-11-18 22:15:00', 'Corte de correa poli-V y detención preventiva en banquina', 'Ruta Nacional 3 Km 490 - Azul', 'Resuelto', 'AF382CD', 101),
(14, '2026-11-21 13:30:00', 'Amortiguador de cabina vencido con golpeteo constante', 'Circunvalación Rosario', 'Pendiente', 'AD444DD', 102),
(15, '2026-11-25 10:00:00', 'Fuga en manguera de intercooler con pérdida de potencia', 'Ruta Nacional 33 Km 110 - Tornquist', 'En Reparación', 'AG666FF', 107);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedor`
--

CREATE TABLE `proveedor` (
  `id_proveedor` int(11) NOT NULL,
  `razon_social` varchar(100) NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedor`
--

INSERT INTO `proveedor` (`id_proveedor`, `razon_social`, `telefono`, `email`) VALUES
(1, 'Repuestos del Litoral S.A.', '011-4555-1234', 'ventas@litoralsat.com'),
(2, 'Frenos y Partes Norte', '0341-4888-9999', 'contacto@frenosnorte.com'),
(3, 'Lubricantes y Filtros Patagónicos', '0299-4444-5555', 'info@lubripata.com'),
(4, 'Neumáticos del Sur S.R.L.', '0291-452-8890', 'ventas@neumaticosdelsur.com.ar'),
(5, 'Autopartes Pesadas Córdoba', '0351-471-3321', 'pedidos@autopartescba.com'),
(6, 'ElectroDiesel Bahía S.A.', '0291-481-0045', 'soporte@electrodieselbahia.com'),
(7, 'Suspensiones y Elásticos Pampeanos', '02954-43-2190', 'info@elasticospampeanos.com'),
(8, 'Inyección y Turbos Argentina', '011-4658-9012', 'ventas@turbosarg.com'),
(9, 'Baterías y Encendido Cuyo', '0261-429-7744', 'contacto@bateriascuyo.com.ar'),
(10, 'Importadora Vial del Centro', '0342-455-6611', 'compras@vialdelcentro.com');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `repuestos`
--

CREATE TABLE `repuestos` (
  `cod_repuesto` varchar(50) NOT NULL,
  `Stock` int(11) NOT NULL,
  `Stock_minimo` int(11) NOT NULL,
  `Costo_unitario` decimal(10,2) NOT NULL,
  `id_usuarios` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `repuestos`
--

INSERT INTO `repuestos` (`cod_repuesto`, `Stock`, `Stock_minimo`, `Costo_unitario`, `id_usuarios`) VALUES
('REP-001', 15, 5, 12500.00, 2),
('REP-002', 3, 8, 45000.50, 2),
('REP-003', 25, 10, 3200.00, 2),
('REP-004', 6, 4, 89000.00, 2),
('REP-005', 12, 6, 15000.00, 2),
('REP-006', 2, 5, 120000.00, 2),
('REP-007', 40, 15, 2500.00, 2),
('REP-008', 8, 5, 54000.00, 2),
('REP-009', 14, 4, 18500.00, 2),
('REP-010', 5, 5, 67000.00, 2),
('REP-011', 30, 10, 4500.00, 2),
('REP-012', 11, 4, 33000.00, 2),
('REP-013', 4, 6, 98000.00, 2),
('REP-014', 19, 8, 7600.00, 2),
('REP-015', 7, 3, 41000.00, 2),
('REP-016', 50, 20, 1200.00, 2),
('REP-017', 9, 5, 29000.00, 2),
('REP-018', 13, 6, 19500.00, 2),
('REP-019', 3, 4, 150000.00, 2),
('REP-020', 22, 10, 8400.00, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicita`
--

CREATE TABLE `solicita` (
  `id_solicita` int(11) NOT NULL,
  `id_proveedor` int(11) NOT NULL,
  `cod_repuesto` varchar(50) NOT NULL,
  `id_usuarios` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `cantidad` int(11) NOT NULL,
  `estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicita`
--

INSERT INTO `solicita` (`id_solicita`, `id_proveedor`, `cod_repuesto`, `id_usuarios`, `fecha`, `cantidad`, `estado`) VALUES
(1, 1, 'REP-002', 2, '2026-10-20 09:00:00', 5, 'Recibido'),
(2, 2, 'REP-006', 2, '2026-10-22 11:30:00', 3, 'Pendiente'),
(3, 3, 'REP-010', 3, '2026-10-25 14:15:00', 10, 'En Proceso'),
(4, 1, 'REP-019', 2, '2026-10-28 16:00:00', 2, 'Pendiente'),
(5, 4, 'REP-001', 2, '2026-10-29 08:30:00', 10, 'Recibido'),
(6, 5, 'REP-004', 3, '2026-11-01 10:15:00', 4, 'Recibido'),
(7, 6, 'REP-006', 7, '2026-11-03 16:40:00', 5, 'En Proceso'),
(8, 7, 'REP-008', 8, '2026-11-06 09:20:00', 6, 'Recibido'),
(9, 8, 'REP-013', 2, '2026-11-09 11:50:00', 4, 'Pendiente'),
(10, 9, 'REP-015', 3, '2026-11-11 14:10:00', 8, 'Recibido'),
(11, 10, 'REP-019', 7, '2026-11-14 17:00:00', 3, 'En Proceso'),
(12, 1, 'REP-003', 8, '2026-11-16 08:45:00', 20, 'Recibido'),
(13, 2, 'REP-009', 2, '2026-11-19 12:30:00', 6, 'Pendiente'),
(14, 3, 'REP-011', 3, '2026-11-22 15:25:00', 15, 'En Proceso'),
(15, 6, 'REP-017', 7, '2026-11-24 10:05:00', 5, 'Pendiente'),
(16, 8, 'REP-020', 8, '2026-11-26 16:50:00', 12, 'Pendiente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `trabajan`
--

CREATE TABLE `trabajan` (
  `id_trabajan` int(11) NOT NULL,
  `id_incidentes` int(11) NOT NULL,
  `cod_repuesto` varchar(50) NOT NULL,
  `id_usuarios` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `cantidad` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `trabajan`
--

INSERT INTO `trabajan` (`id_trabajan`, `id_incidentes`, `cod_repuesto`, `id_usuarios`, `fecha`, `cantidad`) VALUES
(1, 1, 'REP-003', 2, '2026-10-24 10:00:00', 2),
(2, 2, 'REP-002', 2, '2026-10-25 18:00:00', 1),
(5, 6, 'REP-005', 2, '2026-10-28 11:00:00', 2),
(6, 6, 'REP-016', 2, '2026-10-28 11:30:00', 4),
(7, 7, 'REP-007', 7, '2026-10-31 09:15:00', 3),
(8, 7, 'REP-014', 7, '2026-10-31 10:00:00', 1),
(9, 9, 'REP-006', 2, '2026-11-05 14:20:00', 1),
(10, 10, 'REP-012', 7, '2026-11-09 08:45:00', 2),
(11, 11, 'REP-018', 2, '2026-11-13 10:30:00', 1),
(12, 11, 'REP-011', 2, '2026-11-13 11:00:00', 3),
(13, 13, 'REP-016', 7, '2026-11-19 08:00:00', 2),
(14, 14, 'REP-008', 2, '2026-11-22 09:30:00', 2),
(15, 15, 'REP-014', 7, '2026-11-25 15:10:00', 2),
(16, 15, 'REP-020', 7, '2026-11-25 15:45:00', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuarios` int(11) NOT NULL,
  `DNI` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `cargo` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contraseña` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuarios`, `DNI`, `nombre`, `cargo`, `email`, `contraseña`) VALUES
(1, '35489123', 'Administrador Vektor', 'Administrador', 'admin@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(2, '28994112', 'Esteban Dominguez', 'Encargado de Taller', 'edtaller@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(3, '32115488', 'Mariana Gomez', 'Jefa de Logística', 'mgomez@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(6, '33987654', 'Camila Sosa', 'Chofer', 'csosa@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(7, '27654321', 'Martin Pereyra', 'Encargado de Taller', 'mpereyra@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(8, '36789123', 'Sofia Castro', 'Jefa de Logística', 'scastro@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(9, '30456789', 'Lucas Fernandez', 'Chofer', 'lfernandez@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(10, '31789456', 'Diego Martinez', 'Chofer', 'dmartinez@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(11, '29345678', 'Carlos Rodriguez', 'Chofer', 'crodriguez@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(12, '34567890', 'Valeria Lopez', 'Chofer', 'vlopez@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(13, '33123456', 'Javier Perez', 'Chofer', 'jperez@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(14, '28765432', 'Matias Sanchez', 'Chofer', 'msanchez@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(15, '35987123', 'Florencia Romero', 'Chofer', 'fromero@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(16, '31234987', 'Gonzalo Alvarez', 'Chofer', 'galvarez@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
(17, '34890123', 'Hernan Diaz', 'Chofer', 'hdiaz@vektor360.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vehiculos`
--

CREATE TABLE `vehiculos` (
  `patente` varchar(20) NOT NULL,
  `modelo` varchar(50) NOT NULL,
  `marca` varchar(50) NOT NULL,
  `año` int(11) NOT NULL,
  `km_actuales` int(11) NOT NULL,
  `Estado` varchar(50) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`patente`, `modelo`, `marca`, `año`, `km_actuales`, `Estado`, `activo`) VALUES
('AC999II', 'Actros 3342', 'Mercedes-Benz', 2020, 255000, 'Fuera de Servicio', 1),
('AD444DD', 'TGX 18.440', 'MAN', 2021, 210000, 'En Ruta', 1),
('AE333CC', 'Cursor 13', 'Iveco', 2023, 95000, 'Disponible', 1),
('AF111AA', 'FH 460', 'Volvo', 2022, 160000, 'En Taller', 1),
('AF382CD', 'FH', 'Volvo', 2024, 0, 'Disponible', 1),
('AF888HH', 'R450', 'Scania', 2022, 142000, 'Disponible', 1),
('AG666FF', 'Stralis 560', 'Iveco', 2024, 15000, 'En Taller', 1),
('AG789ZZ', 'R500', 'Scania', 2024, 45000, 'Disponible', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `chofer`
--
ALTER TABLE `chofer`
  ADD PRIMARY KEY (`nro_legajo`),
  ADD KEY `fk_chofer_usuario` (`id_usuarios`);

--
-- Indices de la tabla `incidentes`
--
ALTER TABLE `incidentes`
  ADD PRIMARY KEY (`id_incidentes`),
  ADD KEY `fk_incidente_vehiculo` (`patente_id`),
  ADD KEY `fk_incidente_chofer` (`nro_legajo_id`);

--
-- Indices de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  ADD PRIMARY KEY (`id_proveedor`);

--
-- Indices de la tabla `repuestos`
--
ALTER TABLE `repuestos`
  ADD PRIMARY KEY (`cod_repuesto`),
  ADD KEY `fk_repuestos_usuario` (`id_usuarios`);

--
-- Indices de la tabla `solicita`
--
ALTER TABLE `solicita`
  ADD PRIMARY KEY (`id_solicita`),
  ADD KEY `fk_solicita_proveedor` (`id_proveedor`),
  ADD KEY `fk_solicita_repuesto` (`cod_repuesto`),
  ADD KEY `fk_solicita_usuario` (`id_usuarios`);

--
-- Indices de la tabla `trabajan`
--
ALTER TABLE `trabajan`
  ADD PRIMARY KEY (`id_trabajan`),
  ADD KEY `fk_trabajan_incidente` (`id_incidentes`),
  ADD KEY `fk_trabajan_repuesto` (`cod_repuesto`),
  ADD KEY `fk_trabajan_usuario` (`id_usuarios`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuarios`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `vehiculos`
--
ALTER TABLE `vehiculos`
  ADD PRIMARY KEY (`patente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `incidentes`
--
ALTER TABLE `incidentes`
  MODIFY `id_incidentes` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `solicita`
--
ALTER TABLE `solicita`
  MODIFY `id_solicita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `trabajan`
--
ALTER TABLE `trabajan`
  MODIFY `id_trabajan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuarios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `chofer`
--
ALTER TABLE `chofer`
  ADD CONSTRAINT `fk_chofer_usuario` FOREIGN KEY (`id_usuarios`) REFERENCES `usuario` (`id_usuarios`) ON DELETE SET NULL;

--
-- Filtros para la tabla `incidentes`
--
ALTER TABLE `incidentes`
  ADD CONSTRAINT `fk_incidente_chofer` FOREIGN KEY (`nro_legajo_id`) REFERENCES `chofer` (`nro_legajo`),
  ADD CONSTRAINT `fk_incidente_vehiculo` FOREIGN KEY (`patente_id`) REFERENCES `vehiculos` (`patente`);

--
-- Filtros para la tabla `repuestos`
--
ALTER TABLE `repuestos`
  ADD CONSTRAINT `fk_repuestos_usuario` FOREIGN KEY (`id_usuarios`) REFERENCES `usuario` (`id_usuarios`) ON DELETE SET NULL;

--
-- Filtros para la tabla `solicita`
--
ALTER TABLE `solicita`
  ADD CONSTRAINT `fk_solicita_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`),
  ADD CONSTRAINT `fk_solicita_repuesto` FOREIGN KEY (`cod_repuesto`) REFERENCES `repuestos` (`cod_repuesto`),
  ADD CONSTRAINT `fk_solicita_usuario` FOREIGN KEY (`id_usuarios`) REFERENCES `usuario` (`id_usuarios`);

--
-- Filtros para la tabla `trabajan`
--
ALTER TABLE `trabajan`
  ADD CONSTRAINT `fk_trabajan_incidente` FOREIGN KEY (`id_incidentes`) REFERENCES `incidentes` (`id_incidentes`),
  ADD CONSTRAINT `fk_trabajan_repuesto` FOREIGN KEY (`cod_repuesto`) REFERENCES `repuestos` (`cod_repuesto`),
  ADD CONSTRAINT `fk_trabajan_usuario` FOREIGN KEY (`id_usuarios`) REFERENCES `usuario` (`id_usuarios`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
