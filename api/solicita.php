<?php
// api/solicita.php - CRUD de solicitudes de compra (suma stock al marcar Recibido)

require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET':
            $stmt = $pdo->query("SELECT id_solicita, id_proveedor, cod_repuesto, id_usuarios, fecha, cantidad, estado FROM solicita ORDER BY id_solicita DESC");
            echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()]);
            break;

        case 'POST':
            $idProveedor = intval($entrada['id_proveedor'] ?? 0);
            $codRepuesto = strtoupper(trim($entrada['cod_repuesto'] ?? ''));
            $idUsuario   = intval($entrada['id_usuarios'] ?? 1);
            $fecha       = $entrada['fecha'] ?? date('Y-m-d H:i:s');
            $cantidad    = intval($entrada['cantidad'] ?? 0);
            $estado      = trim($entrada['estado'] ?? 'Pendiente');

            if ($idProveedor <= 0 || !$codRepuesto || $cantidad <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Complete proveedor, repuesto y cantidad."]);
                exit();
            }

            $sql = "INSERT INTO solicita (id_proveedor, cod_repuesto, id_usuarios, fecha, cantidad, estado) VALUES (?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$idProveedor, $codRepuesto, $idUsuario, $fecha, $cantidad, $estado]);
            echo json_encode(["status" => "ok", "message" => "Solicitud creada.", "id_solicita" => $pdo->lastInsertId()]);
            break;

        case 'PUT':
            $id     = intval($entrada['id_solicita'] ?? 0);
            $estado = trim($entrada['estado'] ?? 'Recibido');

            $pdo->beginTransaction();

            $consulta = $pdo->prepare("SELECT cod_repuesto, cantidad, estado FROM solicita WHERE id_solicita = ? FOR UPDATE");
            $consulta->execute([$id]);
            $sol = $consulta->fetch();

            if ($sol && strcasecmp($sol['estado'], 'Recibido') !== 0 && strcasecmp($estado, 'Recibido') === 0) {
                $pdo->prepare("UPDATE repuestos SET Stock = Stock + ? WHERE cod_repuesto = ?")->execute([$sol['cantidad'], $sol['cod_repuesto']]);
            }

            $pdo->prepare("UPDATE solicita SET estado = ? WHERE id_solicita = ?")->execute([$estado, $id]);
            $pdo->commit();

            echo json_encode(["status" => "ok", "message" => "Solicitud actualizada."]);
            break;

        case 'DELETE':
            $id = intval($_GET['id_solicita'] ?? 0);
            $pdo->prepare("DELETE FROM solicita WHERE id_solicita = ?")->execute([$id]);
            echo json_encode(["status" => "ok", "message" => "Solicitud eliminada."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}