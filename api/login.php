<?php
// api/login.php - Valida usuario y contraseña contra la tabla usuario en MySQL

require_once __DIR__ . '/config/db.php'; // Reutiliza la conexión $pdo y cabeceras JSON

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Solo acepta peticiones POST
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
    exit();
}

$entrada = json_decode(file_get_contents("php://input"), true) ?? []; // Lee JSON enviado desde JS
$email = trim($entrada['email'] ?? '');
$clave = trim($entrada['contraseña'] ?? '');

if (!$email || !$clave) { // Valida que no vengan vacíos
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Complete email y contraseña."]);
    exit();
}

try {
    $sql = "SELECT id_usuarios, DNI, nombre, cargo, email FROM usuario WHERE email = ? AND `contraseña` = ? LIMIT 1"; // Busca coincidencia exacta
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email, $clave]);
    $usuario = $stmt->fetch();

    if (!$usuario) { // Si no existe o no coincide la clave
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Credenciales no válidas."]);
        exit();
    }

    echo json_encode(["status" => "ok", "usuario" => $usuario]); // Devuelve el usuario sin exponer la clave
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}