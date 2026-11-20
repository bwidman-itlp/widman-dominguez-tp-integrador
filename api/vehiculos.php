<?php
// api/vehiculos.php
require_once __DIR__ . '/config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Listar todos los vehículos o filtrar por patente
            if (isset($_GET['patente'])) {
                $stmt = $pdo->prepare("SELECT * FROM vehiculos WHERE patente = ?");
                $stmt->execute([strtoupper(trim($_GET['patente']))]);
                $data = $stmt->fetch();
                echo json_encode(["status" => "ok", "data" => $data]);
            } else {
                $stmt = $pdo->query("SELECT * FROM vehiculos ORDER BY patente ASC");
                $data = $stmt->fetchAll();
                echo json_encode(["status" => "ok", "data" => $data]);
            }
            break;

        case 'POST':
            // Alta de Vehículo (RF-02)
            $input = json_decode(file_get_contents("php://input"), true);
            $patente = strtoupper(trim($input['patente'] ?? ''));
            $modelo  = trim($input['modelo'] ?? '');
            $marca   = trim($input['marca'] ?? '');
            $anio    = intval($input['año'] ?? 0);
            $km      = intval($input['km_actuales'] ?? 0);
            $estado  = trim($input['Estado'] ?? 'Disponible');

            if (!$patente || !$modelo || !$marca || $anio < 1950) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Campos obligatorios incompletos."]);
                exit();
            }

            // Excepción RF-02: Patente duplicada
            $check = $pdo->prepare("SELECT patente FROM vehiculos WHERE patente = ?");
            $check->execute([$patente]);
            if ($check->fetch()) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Error RF-02: La patente $patente ya se encuentra registrada."]);
                exit();
            }

            $sql = "INSERT INTO vehiculos (patente, modelo, marca, `año`, km_actuales, Estado) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$patente, $modelo, $marca, $anio, $km, $estado]);

            echo json_encode(["status" => "ok", "message" => "Vehículo $patente dado de alta correctamente."]);
            break;

        case 'PUT':
            // Modificación de Vehículo / Estado del vehículo (DFD Proceso 2 y 3)
            $input = json_decode(file_get_contents("php://input"), true);
            $patente = strtoupper(trim($input['patente'] ?? ''));
            $modelo  = trim($input['modelo'] ?? '');
            $marca   = trim($input['marca'] ?? '');
            $anio    = intval($input['año'] ?? 0);
            $km      = intval($input['km_actuales'] ?? 0);
            $estado  = trim($input['Estado'] ?? 'Disponible');

            $sql = "UPDATE vehiculos SET modelo = ?, marca = ?, `año` = ?, km_actuales = ?, Estado = ? WHERE patente = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$modelo, $marca, $anio, $km, $estado, $patente]);

            echo json_encode(["status" => "ok", "message" => "Vehículo $patente actualizado."]);
            break;

        case 'DELETE':
            // Baja de Vehículo (RF-02)
            $patente = strtoupper(trim($_GET['patente'] ?? ''));
            if (!$patente) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Patente no especificada."]);
                exit();
            }
            $stmt = $pdo->prepare("DELETE FROM vehiculos WHERE patente = ?");
            $stmt->execute([$patente]);

            echo json_encode(["status" => "ok", "message" => "Vehículo $patente eliminado del sistema."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Método HTTP no permitido."]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>