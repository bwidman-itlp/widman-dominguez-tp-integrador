<?php
// api/choferes.php - CRUD de choferes

require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET':
            $stmt = $pdo->query("SELECT nro_legajo, licencia, id_usuarios FROM chofer ORDER BY nro_legajo ASC");
            echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()]);
            break;

        case 'POST':
            $legajo    = intval($entrada['nro_legajo'] ?? 0);
            $licencia  = strtoupper(trim($entrada['licencia'] ?? ''));
            $idUsuario = !empty($entrada['id_usuarios']) ? intval($entrada['id_usuarios']) : null;

            if ($legajo <= 0 || !$licencia) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Legajo y licencia obligatorios."]);
                exit();
            }

            $sql = "INSERT INTO chofer (nro_legajo, licencia, id_usuarios) VALUES (?, ?, ?)";
            $pdo->prepare($sql)->execute([$legajo, $licencia, $idUsuario]);
            echo json_encode(["status" => "ok", "message" => "Chofer registrado."]);
            break;

        case 'PUT':
            $legajo    = intval($entrada['nro_legajo'] ?? 0);
            $licencia  = strtoupper(trim($entrada['licencia'] ?? ''));
            $idUsuario = !empty($entrada['id_usuarios']) ? intval($entrada['id_usuarios']) : null;

            $sql = "UPDATE chofer SET licencia = ?, id_usuarios = ? WHERE nro_legajo = ?";
            $pdo->prepare($sql)->execute([$licencia, $idUsuario, $legajo]);
            echo json_encode(["status" => "ok", "message" => "Chofer actualizado."]);
            break;

        case 'DELETE':
            $legajo = intval($_GET['nro_legajo'] ?? 0);
            $pdo->prepare("DELETE FROM chofer WHERE nro_legajo = ?")->execute([$legajo]);
            echo json_encode(["status" => "ok", "message" => "Chofer eliminado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}