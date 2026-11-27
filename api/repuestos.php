<?php
// api/repuestos.php - CRUD de stock y repuestos

require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET':
            $stmt = $pdo->query("SELECT cod_repuesto, Stock, Stock_minimo, Costo_unitario, id_usuarios FROM repuestos ORDER BY cod_repuesto ASC");
            echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()]);
            break;

        case 'POST':
            $codigo    = strtoupper(trim($entrada['cod_repuesto'] ?? ''));
            $stock     = intval($entrada['Stock'] ?? 0);
            $stockMin  = intval($entrada['Stock_minimo'] ?? 0);
            $costo     = floatval($entrada['Costo_unitario'] ?? 0);
            $idUsuario = !empty($entrada['id_usuarios']) ? intval($entrada['id_usuarios']) : null;

            if (!$codigo) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "El codigo de repuesto es obligatorio."]);
                exit();
            }

            $sql = "INSERT INTO repuestos (cod_repuesto, Stock, Stock_minimo, Costo_unitario, id_usuarios) VALUES (?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$codigo, $stock, $stockMin, $costo, $idUsuario]);
            echo json_encode(["status" => "ok", "message" => "Repuesto registrado."]);
            break;

        case 'PUT':
            $codigo   = strtoupper(trim($entrada['cod_repuesto'] ?? ''));
            $stock    = intval($entrada['Stock'] ?? 0);
            $stockMin = intval($entrada['Stock_minimo'] ?? 0);
            $costo    = floatval($entrada['Costo_unitario'] ?? 0);

            $sql = "UPDATE repuestos SET Stock = ?, Stock_minimo = ?, Costo_unitario = ? WHERE cod_repuesto = ?";
            $pdo->prepare($sql)->execute([$stock, $stockMin, $costo, $codigo]);
            echo json_encode(["status" => "ok", "message" => "Repuesto actualizado."]);
            break;

        case 'DELETE':
            $codigo = strtoupper(trim($_GET['cod_repuesto'] ?? ''));
            $pdo->prepare("DELETE FROM repuestos WHERE cod_repuesto = ?")->execute([$codigo]);
            echo json_encode(["status" => "ok", "message" => "Repuesto eliminado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}