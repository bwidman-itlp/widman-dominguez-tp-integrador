<?php
// api/proveedores.php - CRUD de proveedores

require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET':
            $stmt = $pdo->query("SELECT id_proveedor, razon_social, telefono, email FROM proveedor ORDER BY id_proveedor ASC");
            echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()]);
            break;

        case 'POST':
            $razon    = trim($entrada['razon_social'] ?? '');
            $telefono = trim($entrada['telefono'] ?? '');
            $email    = trim($entrada['email'] ?? '');

            if (!$razon) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "La razon social es obligatoria."]);
                exit();
            }

            $sql = "INSERT INTO proveedor (razon_social, telefono, email) VALUES (?, ?, ?)";
            $pdo->prepare($sql)->execute([$razon, $telefono, $email]);
            echo json_encode(["status" => "ok", "message" => "Proveedor registrado.", "id_proveedor" => $pdo->lastInsertId()]);
            break;

        case 'PUT':
            $id       = intval($entrada['id_proveedor'] ?? 0);
            $razon    = trim($entrada['razon_social'] ?? '');
            $telefono = trim($entrada['telefono'] ?? '');
            $email    = trim($entrada['email'] ?? '');

            $sql = "UPDATE proveedor SET razon_social = ?, telefono = ?, email = ? WHERE id_proveedor = ?";
            $pdo->prepare($sql)->execute([$razon, $telefono, $email, $id]);
            echo json_encode(["status" => "ok", "message" => "Proveedor actualizado."]);
            break;

        case 'DELETE':
            $id = intval($_GET['id_proveedor'] ?? 0);
            $pdo->prepare("DELETE FROM proveedor WHERE id_proveedor = ?")->execute([$id]);
            echo json_encode(["status" => "ok", "message" => "Proveedor eliminado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}