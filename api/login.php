<?php
// api/login.php - Valida ingreso, mantiene sesión activa y permite cerrar sesión

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];

// 1. GET: Verifica si ya existe una sesión activa al recargar la página
if ($metodo === 'GET') {
    if (!empty($_SESSION['usuario'])) {
        echo json_encode([
            "status" => "ok",
            "usuario" => $_SESSION['usuario']
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "No hay sesión activa."
        ]);
    }
    exit();
}

// 2. DELETE: Cierra la sesión en el servidor
if ($metodo === 'DELETE') {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params["path"],
            $params["domain"],
            $params["secure"],
            $params["httponly"]
        );
    }
    session_destroy();
    echo json_encode(["status" => "ok", "message" => "Sesión cerrada."]);
    exit();
}

// 3. POST: Inicia sesión validando credenciales
if ($metodo !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Método no permitido."]);
    exit();
}

$entrada = json_decode(file_get_contents("php://input"), true) ?? [];
$email = trim($entrada['email'] ?? '');
$clave = trim($entrada['contraseña'] ?? '');

if (!$email || !$clave) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Complete email y contraseña."]);
    exit();
}

try {
    // Traemos también `contraseña` para verificar el hash con password_verify
    $sql = "SELECT id_usuarios, DNI, nombre, cargo, email, `contraseña` FROM usuario WHERE email = ? LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email]);
    $fila = $stmt->fetch(PDO::FETCH_ASSOC);

    $claveValida = false;
    if ($fila) {
        $hashGuardado = $fila['contraseña'];
        // Verifica hash bcrypt o coincidencia directa si aún hubiera alguna clave sin hashear
        if (password_verify($clave, $hashGuardado) || hash_equals($hashGuardado, $clave)) {
            $claveValida = true;
        }
    }

    if (!$claveValida) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Credenciales no válidas."]);
        exit();
    }

    // Eliminamos la contraseña antes de guardar y devolver los datos del usuario
    unset($fila['contraseña']);

    session_regenerate_id(true);
    $_SESSION['usuario'] = $fila;
    $_SESSION['id_usuarios'] = $fila['id_usuarios'];
    $_SESSION['cargo'] = $fila['cargo'];

    echo json_encode([
        "status" => "ok",
        "usuario" => $fila
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}