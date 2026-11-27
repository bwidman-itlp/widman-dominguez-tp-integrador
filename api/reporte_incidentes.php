<?php
// api/reporte_incidentes.php - CRUD e informe de incidentes

require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET':
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
            $fecha     = $entrada['fecha'] ?? date('Y-m-d H:i:s');
            $detalles  = trim($entrada['detalles'] ?? '');
            $lugar     = trim($entrada['lugar'] ?? '');
            $estado    = trim($entrada['Estado'] ?? 'Abierto');
            $patenteId = strtoupper(trim($entrada['patente_id'] ?? ''));
            $legajoId  = intval($entrada['nro_legajo_id'] ?? 0);

            if (!$detalles || !$lugar || !$patenteId || $legajoId <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Complete todos los campos obligatorios."]);
                exit();
            }

            $consultaVeh = $pdo->prepare("SELECT Estado FROM vehiculos WHERE patente = ?");
            $consultaVeh->execute([$patenteId]);
            $vehiculo = $consultaVeh->fetch();

            if (!$vehiculo) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "La patente $patenteId no existe."]);
                exit();
            }

            if (strcasecmp($vehiculo['Estado'], 'Fuera de Servicio') === 0) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Unidad $patenteId Fuera de Servicio."]);
                exit();
            }

            $sql = "INSERT INTO incidentes (fecha, detalles, lugar, Estado, patente_id, nro_legajo_id) VALUES (?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$fecha, $detalles, $lugar, $estado, $patenteId, $legajoId]);
            echo json_encode(["status" => "ok", "message" => "Incidente registrado.", "id_incidentes" => $pdo->lastInsertId()]);
            break;

        case 'PUT':
            $id     = intval($entrada['id_incidentes'] ?? 0);
            $estado = trim($entrada['Estado'] ?? 'En Reparación');
            $lugar  = trim($entrada['lugar'] ?? '');
            $det    = trim($entrada['detalles'] ?? '');

            if ($lugar !== '' || $det !== '') {
                $sql = "UPDATE incidentes SET Estado = ?, lugar = ?, detalles = ? WHERE id_incidentes = ?";
                $pdo->prepare($sql)->execute([$estado, $lugar, $det, $id]);
            } else {
                $pdo->prepare("UPDATE incidentes SET Estado = ? WHERE id_incidentes = ?")->execute([$estado, $id]);
            }

            echo json_encode(["status" => "ok", "message" => "Incidente actualizado."]);
            break;

        case 'DELETE':
            $id = intval($_GET['id_incidentes'] ?? 0);
            $pdo->prepare("DELETE FROM incidentes WHERE id_incidentes = ?")->execute([$id]);
            echo json_encode(["status" => "ok", "message" => "Incidente eliminado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}