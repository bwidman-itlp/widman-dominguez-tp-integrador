<?php
// api/reporte_incidentes.php - API CRUD e informe de incidentes (RF-03)

require_once __DIR__ . '/config/db.php'; // Conexion PDO

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET': // Lista incidentes uniendo vehiculo, chofer y usuario
            $sql = "SELECT i.id_incidentes, i.fecha, i.detalles, i.lugar, i.Estado,
                           i.patente_id, v.marca, v.modelo,
                           i.nro_legajo_id, c.licencia, u.nombre AS nombre_chofer
                    FROM incidentes i
                    LEFT JOIN vehiculos v ON i.patente_id = v.patente
                    LEFT JOIN chofer c ON i.nro_legajo_id = c.nro_legajo
                    LEFT JOIN usuario u ON c.id_usuarios = u.id_usuarios
                    ORDER BY i.fecha DESC";
            $sentencia = $pdo->query($sql);
            echo json_encode(["status" => "ok", "data" => $sentencia->fetchAll()]);
            break;

        case 'POST': // Registra un incidente nuevo con validaciones del RF-03
            $fecha      = $entrada['fecha'] ?? date('Y-m-d H:i:s');
            $detalles   = trim($entrada['detalles'] ?? '');
            $lugar      = trim($entrada['lugar'] ?? '');
            $estado     = trim($entrada['Estado'] ?? 'Abierto');
            $patenteId  = strtoupper(trim($entrada['patente_id'] ?? ''));
            $legajoId   = intval($entrada['nro_legajo_id'] ?? 0);

            if (!$detalles || !$lugar || !$patenteId || $legajoId <= 0) { // Obligatorios completos
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Excepcion RF-03: Complete todos los campos obligatorios."]);
                exit();
            }

            $consultaVeh = $pdo->prepare("SELECT Estado FROM vehiculos WHERE patente = ?"); // Verifica si existe la unidad y su estado
            $consultaVeh->execute([$patenteId]);
            $vehiculo = $consultaVeh->fetch();

            if (!$vehiculo) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "La patente $patenteId no existe."]);
                exit();
            }

            if (strcasecmp($vehiculo['Estado'], 'Fuera de Servicio') === 0) { // No admite incidentes si esta fuera de servicio
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Excepcion RF-03: Unidad $patenteId Fuera de Servicio."]);
                exit();
            }

            $consultaCh = $pdo->prepare("SELECT nro_legajo FROM chofer WHERE nro_legajo = ?"); // Verifica existencia del chofer
            $consultaCh->execute([$legajoId]);
            if (!$consultaCh->fetch()) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "El legajo #$legajoId no existe."]);
                exit();
            }

            $sql = "INSERT INTO incidentes (fecha, detalles, lugar, Estado, patente_id, nro_legajo_id) VALUES (?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$fecha, $detalles, $lugar, $estado, $patenteId, $legajoId]);

            echo json_encode([
                "status" => "ok",
                "message" => "Incidente registrado.",
                "id_incidentes" => $pdo->lastInsertId() // Devuelve el ID generado en MySQL
            ]);
            break;

        case 'PUT': // Actualiza solo el estado del incidente
            $id     = intval($entrada['id_incidentes'] ?? 0);
            $estado = trim($entrada['Estado'] ?? 'En Revisión');

            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ID de incidente invalido."]);
                exit();
            }

            $pdo->prepare("UPDATE incidentes SET Estado = ? WHERE id_incidentes = ?")->execute([$estado, $id]);
            echo json_encode(["status" => "ok", "message" => "Incidente #$id actualizado a $estado."]);
            break;

        case 'DELETE': // Elimina un incidente por ID
            $id = intval($_GET['id_incidentes'] ?? 0);
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "ID de incidente no especificado."]);
                exit();
            }

            $pdo->prepare("DELETE FROM incidentes WHERE id_incidentes = ?")->execute([$id]);
            echo json_encode(["status" => "ok", "message" => "Incidente #$id eliminado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}