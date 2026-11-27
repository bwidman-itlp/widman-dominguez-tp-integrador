<?php
// api/usuarios.php - CRUD de usuarios

require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET':
            $stmt = $pdo->query("SELECT id_usuarios, DNI, nombre, cargo, email FROM usuario ORDER BY id_usuarios ASC");
            echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()]);
            break;

        case 'POST':
            $dni    = trim($entrada['DNI'] ?? '');
            $nombre = trim($entrada['nombre'] ?? '');
            $cargo  = trim($entrada['cargo'] ?? '');
            $email  = trim($entrada['email'] ?? '');
            $clave  = trim($entrada['contraseña'] ?? 'P4$$W0RD');

            if (!$dni || !$nombre || !$cargo || !$email) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Complete todos los campos del usuario."]);
                exit();
            }

            $sql = "INSERT INTO usuario (DNI, nombre, cargo, email, `contraseña`) VALUES (?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$dni, $nombre, $cargo, $email, $clave]);
            echo json_encode(["status" => "ok", "message" => "Usuario creado.", "id_usuarios" => $pdo->lastInsertId()]);
            break;

        case 'PUT':
            $id     = intval($entrada['id_usuarios'] ?? 0);
            $dni    = trim($entrada['DNI'] ?? '');
            $nombre = trim($entrada['nombre'] ?? '');
            $cargo  = trim($entrada['cargo'] ?? '');
            $email  = trim($entrada['email'] ?? '');
            $clave  = trim($entrada['contraseña'] ?? '');

            if ($clave !== '') { // Si envio clave nueva la actualiza, si no mantiene la anterior
                $sql = "UPDATE usuario SET DNI = ?, nombre = ?, cargo = ?, email = ?, `contraseña` = ? WHERE id_usuarios = ?";
                $pdo->prepare($sql)->execute([$dni, $nombre, $cargo, $email, $clave, $id]);
            } else {
                $sql = "UPDATE usuario SET DNI = ?, nombre = ?, cargo = ?, email = ? WHERE id_usuarios = ?";
                $pdo->prepare($sql)->execute([$dni, $nombre, $cargo, $email, $id]);
            }

            echo json_encode(["status" => "ok", "message" => "Usuario actualizado."]);
            break;

        case 'DELETE':
            $id = intval($_GET['id_usuarios'] ?? 0);
            $pdo->prepare("DELETE FROM usuario WHERE id_usuarios = ?")->execute([$id]);
            echo json_encode(["status" => "ok", "message" => "Usuario eliminado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}