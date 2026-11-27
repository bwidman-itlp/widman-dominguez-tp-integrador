<?php
// api/vehiculos.php - CRUD de vehiculos

require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET':
            if (!empty($_GET['patente'])) {
                $stmt = $pdo->prepare("SELECT * FROM vehiculos WHERE patente = ?");
                $stmt->execute([strtoupper(trim($_GET['patente']))]);
                echo json_encode(["status" => "ok", "data" => $stmt->fetch()]);
                break;
            }
            $stmt = $pdo->query("SELECT * FROM vehiculos ORDER BY patente ASC");
            echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()]);
            break;

        case 'POST':
            $patente = strtoupper(trim($entrada['patente'] ?? ''));
            $modelo  = trim($entrada['modelo'] ?? '');
            $marca   = trim($entrada['marca'] ?? '');
            $anio    = intval($entrada['año'] ?? 0);
            $km      = intval($entrada['km_actuales'] ?? 0);
            $estado  = trim($entrada['Estado'] ?? 'Disponible');

            if (!$patente || !$modelo || !$marca || $anio < 1950) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Campos obligatorios incompletos."]);
                exit();
            }

            $existe = $pdo->prepare("SELECT patente FROM vehiculos WHERE patente = ?");
            $existe->execute([$patente]);
            if ($existe->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "La patente $patente ya existe."]);
                exit();
            }

            $sql = "INSERT INTO vehiculos (patente, modelo, marca, `año`, km_actuales, Estado) VALUES (?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$patente, $modelo, $marca, $anio, $km, $estado]);
            echo json_encode(["status" => "ok", "message" => "Vehiculo registrado."]);
            break;

        case 'PUT':
            $patente = strtoupper(trim($entrada['patente'] ?? ''));
            $modelo  = trim($entrada['modelo'] ?? '');
            $marca   = trim($entrada['marca'] ?? '');
            $anio    = intval($entrada['año'] ?? 0);
            $km      = intval($entrada['km_actuales'] ?? 0);
            $estado  = trim($entrada['Estado'] ?? 'Disponible');

            $sql = "UPDATE vehiculos SET modelo = ?, marca = ?, `año` = ?, km_actuales = ?, Estado = ? WHERE patente = ?";
            $pdo->prepare($sql)->execute([$modelo, $marca, $anio, $km, $estado, $patente]);
            echo json_encode(["status" => "ok", "message" => "Vehiculo actualizado."]);
            break;

        case 'DELETE':
            $patente = strtoupper(trim($_GET['patente'] ?? ''));
            $pdo->prepare("DELETE FROM vehiculos WHERE patente = ?")->execute([$patente]);
            echo json_encode(["status" => "ok", "message" => "Vehiculo eliminado."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}