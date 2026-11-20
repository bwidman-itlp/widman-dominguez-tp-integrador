-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-11-2026 a las 15:38:36
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
-- Base de datos: `vektor360_2`
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
(101, 'B1-998822', NULL),
(102, 'E2-443322', NULL),
(103, 'E2-112233', NULL),
(104, 'D1-778899', NULL),
(105, 'E1-554433', NULL),
(106, 'E2-990011', NULL),
(107, 'C1-332211', NULL),
(108, 'E2-665544', NULL),
(109, 'D2-110022', NULL),
(110, 'E1-887766', NULL);

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
(3, '2026-10-26 11:20:00', 'Pérdida menor de líquido refrigerante', 'Bahía Blanca - Zona Industrial', 'Solucionado', 'AC222BB', 103),
(4, '2026-10-27 19:10:00', 'Rotura de manguera de aire de suspensión', 'Ruta Nacional 3 Km 710', 'Pendiente', 'AE333CC', 104),
(5, '2026-10-28 09:30:00', 'Baja presión de aceite en motor', 'Ruta 22 Km 1050', 'En Reparación', 'AG666FF', 105);

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
(3, 'Lubricantes y Filtros Patagónicos', '0299-4444-5555', 'info@lubripata.com');

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
(1, 1, 'REP-002', 2, '2026-10-20 09:00:00', 5, 'Entregado'),
(2, 2, 'REP-006', 2, '2026-10-22 11:30:00', 3, 'Pendiente'),
(3, 3, 'REP-010', 3, '2026-10-25 14:15:00', 10, 'En Proceso'),
(4, 1, 'REP-019', 2, '2026-10-28 16:00:00', 2, 'Pendiente');

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
(3, 3, 'REP-007', 2, '2026-10-26 12:30:00', 4),
(4, 4, 'REP-001', 2, '2026-10-27 20:00:00', 1);

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
(1, '35489123', 'Administrador Vektor', 'Administrador', 'admin@vektor360.com', 'P4$$W0RD'),
(2, '28994112', 'Esteban Dominguez', 'Encargado de Taller', 'edtaller@vektor360.com', 'P4$$W0RD'),
(3, '32115488', 'Mariana Gomez', 'Jefa de Logística', 'mgomez@vektor360.com', 'P4$$W0RD');

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
  `Estado` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vehiculos`
--

INSERT INTO `vehiculos` (`patente`, `modelo`, `marca`, `año`, `km_actuales`, `Estado`) VALUES
('AA555EE', 'Antos 1932', 'Mercedes-Benz', 2019, 310000, 'Disponible'),
('AB777GG', 'FH 540', 'Volvo', 2023, 85000, 'En Ruta'),
('AC222BB', 'Actros 2645', 'Mercedes-Benz', 2020, 280000, 'Disponible'),
('AC999II', 'Actros 3342', 'Mercedes-Benz', 2020, 255000, 'En Taller'),
('AD444DD', 'TGX 18.440', 'MAN', 2021, 210000, 'En Ruta'),
('AE333CC', 'Cursor 13', 'Iveco', 2023, 95000, 'Disponible'),
('AF111AA', 'FH 460', 'Volvo', 2022, 160000, 'En Taller'),
('AF888HH', 'R450', 'Scania', 2022, 142000, 'Disponible'),
('AG666FF', 'Stralis 560', 'Iveco', 2024, 15000, 'En Taller'),
('AG789ZZ', 'R500', 'Scania', 2024, 45000, 'Disponible');

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
  MODIFY `id_incidentes` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `proveedor`
--
ALTER TABLE `proveedor`
  MODIFY `id_proveedor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `solicita`
--
ALTER TABLE `solicita`
  MODIFY `id_solicita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `trabajan`
--
ALTER TABLE `trabajan`
  MODIFY `id_trabajan` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuarios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  ADD CONSTRAINT `fk_incidente_chofer` FOREIGN KEY (`nro_legajo_id`) REFERENCES `chofer` (`nro_legajo`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_incidente_vehiculo` FOREIGN KEY (`patente_id`) REFERENCES `vehiculos` (`patente`) ON DELETE CASCADE;

--
-- Filtros para la tabla `repuestos`
--
ALTER TABLE `repuestos`
  ADD CONSTRAINT `fk_repuestos_usuario` FOREIGN KEY (`id_usuarios`) REFERENCES `usuario` (`id_usuarios`) ON DELETE SET NULL;

--
-- Filtros para la tabla `solicita`
--
ALTER TABLE `solicita`
  ADD CONSTRAINT `fk_solicita_proveedor` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedor` (`id_proveedor`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_solicita_repuesto` FOREIGN KEY (`cod_repuesto`) REFERENCES `repuestos` (`cod_repuesto`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_solicita_usuario` FOREIGN KEY (`id_usuarios`) REFERENCES `usuario` (`id_usuarios`) ON DELETE CASCADE;

--
-- Filtros para la tabla `trabajan`
--
ALTER TABLE `trabajan`
  ADD CONSTRAINT `fk_trabajan_incidente` FOREIGN KEY (`id_incidentes`) REFERENCES `incidentes` (`id_incidentes`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_trabajan_repuesto` FOREIGN KEY (`cod_repuesto`) REFERENCES `repuestos` (`cod_repuesto`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_trabajan_usuario` FOREIGN KEY (`id_usuarios`) REFERENCES `usuario` (`id_usuarios`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
