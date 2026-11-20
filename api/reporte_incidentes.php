<?php
// api/reporte_incidentes.php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Informe de registro de incidentes con JOIN a vehículos y chofer/usuario
            $sql = "SELECT i.id_incidentes, i.fecha, i.detalles, i.lugar, i.Estado, 
                           i.patente_id, v.marca, v.modelo, 
                           i.nro_legajo_id, c.licencia, u.nombre AS nombre_chofer
                    FROM incidentes i
                    LEFT JOIN vehiculos v ON i.patente_id = v.patente
                    LEFT JOIN chofer c ON i.nro_legajo_id = c.nro_legajo
                    LEFT JOIN usuario u ON c.id_usuarios = u.id_usuarios
                    ORDER BY i.fecha DESC";
            $stmt = $pdo->query($sql);
            echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()]);
            break;

        case 'POST':
            // Alta de Incidente (RF-03)
            $input = json_decode(file_get_contents("php://input"), true);
            $fecha      = $input['fecha'] ?? date('Y-m-d H:i:s');
            $detalles   = trim($input['detalles'] ?? '');
            $lugar      = trim($input['lugar'] ?? '');
            $estado     = trim($input['Estado'] ?? 'Abierto');
            $patente_id = strtoupper(trim($input['patente_id'] ?? ''));
            $legajo_id  = intval($input['nro_legajo_id'] ?? 0);

            // Excepción RF-03: Campos obligatorios vacíos
            if (!$detalles || !$lugar || !$patente_id || $legajo_id <= 0) {
                http_response_code(400);
                echo json_encode([
                    "status" => "error",
                    "message" => "Excepción RF-03: Todos los campos obligatorios deben completarse."
                ]);
                exit();
            }

            // Excepción RF-03: Verificar estado del vehículo
            $stmtVeh = $pdo->prepare("SELECT Estado FROM vehiculos WHERE patente = ?");
            $stmtVeh->execute([$patente_id]);
            $vehiculo = $stmtVeh->fetch();

            if (!$vehiculo) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "La patente $patente_id no existe."]);
                exit();
            }

            if (strcasecmp($vehiculo['Estado'], 'Fuera de Servicio') === 0) {
                http_response_code(409);
                echo json_encode([
                    "status" => "error",
                    "message" => "Excepción RF-03: No se puede reportar incidente sobre una unidad Fuera de Servicio ($patente_id)."
                ]);
                exit();
            }

            // Verificar existencia del chofer
            $stmtCh = $pdo->prepare("SELECT nro_legajo FROM chofer WHERE nro_legajo = ?");
            $stmtCh->execute([$legajo_id]);
            if (!$stmtCh->fetch()) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "El legajo de chofer #$legajo_id no existe."]);
                exit();
            }

            $sql = "INSERT INTO incidentes (fecha, detalles, lugar, Estado, patente_id, nro_legajo_id) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$fecha, $detalles, $lugar, $estado, $patente_id, $legajo_id]);

            echo json_encode([
                "status" => "ok",
                "message" => "Incidente registrado correctamente.",
                "id_incidentes" => $pdo->lastInsertId()
            ]);
            break;

        case 'PUT':
            // Actualizar estado del incidente
            $input = json_decode(file_get_contents("php://input"), true);
            $id     = intval($input['id_incidentes'] ?? 0);
            $estado = trim($input['Estado'] ?? 'En Revisión');

            $stmt = $pdo->prepare("UPDATE incidentes SET Estado = ? WHERE id_incidentes = ?");
            $stmt->execute([$estado, $id]);

            echo json_encode(["status" => "ok", "message" => "Estado del incidente #$id actualizado a $estado."]);
            break;

        case 'DELETE':
            $id = intval($_GET['id_incidentes'] ?? 0);
            $stmt = $pdo->prepare("DELETE FROM incidentes WHERE id_incidentes = ?");
            $stmt->execute([$id]);

            echo json_encode(["status" => "ok", "message" => "Incidente #$id eliminado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Método no permitido."]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>