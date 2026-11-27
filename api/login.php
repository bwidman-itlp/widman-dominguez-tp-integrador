<?php
// api/login.php - Valida ingreso de usuario contra la tabla usuario

require_once __DIR__ . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Solo acepta POST
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    exit();
}

$entrada = json_decode(file_get_contents("php://input"), true) ?? [];
$email = trim($entrada['email'] ?? '');
$clave = trim($entrada['contraseña'] ?? '');

if (!$email || !$clave) { // Valida campos completos
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Complete email y contraseña."]);
    exit();
}

try {
    $sql = "SELECT id_usuarios, DNI, nombre, cargo, email FROM usuario WHERE email = ? AND `contraseña` = ? LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email, $clave]);
    $usuario = $stmt->fetch();

    if (!$usuario) { // Si no coincide email o contraseña
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Credenciales no validas."]);
        exit();
    }

    echo json_encode(["status" => "ok", "usuario" => $usuario]); // Devuelve datos del usuario logueado
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}