<?php
// api/vehiculos.php - API CRUD de vehiculos (RF-02)

require_once __DIR__ . '/config/db.php'; // Trae $pdo y cabeceras JSON

$metodo = $_SERVER['REQUEST_METHOD']; // Lee GET, POST, PUT o DELETE
$entrada = json_decode(file_get_contents("php://input"), true) ?? []; // Lee cuerpo JSON si existe

try {
    switch ($metodo) {
        case 'GET':
            if (!empty($_GET['patente'])) { // Busca un solo vehiculo por patente
                $sentencia = $pdo->prepare("SELECT * FROM vehiculos WHERE patente = ?");
                $sentencia->execute([strtoupper(trim($_GET['patente']))]);
                echo json_encode(["status" => "ok", "data" => $sentencia->fetch()]);
                break;
            }

            $sentencia = $pdo->query("SELECT * FROM vehiculos ORDER BY patente ASC"); // Lista toda la flota
            echo json_encode(["status" => "ok", "data" => $sentencia->fetchAll()]);
            break;

        case 'POST': // Alta de vehiculo
            $patente = strtoupper(trim($entrada['patente'] ?? ''));
            $modelo  = trim($entrada['modelo'] ?? '');
            $marca   = trim($entrada['marca'] ?? '');
            $anio    = intval($entrada['año'] ?? 0);
            $km      = intval($entrada['km_actuales'] ?? 0);
            $estado  = trim($entrada['Estado'] ?? 'Disponible');

            if (!$patente || !$modelo || !$marca || $anio < 1950) { // Valida campos minimos
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Campos obligatorios incompletos."]);
                exit();
            }

            $existe = $pdo->prepare("SELECT patente FROM vehiculos WHERE patente = ?"); // Evita patentes repetidas
            $existe->execute([$patente]);
            if ($existe->fetch()) {
                http_response_code(409); // Conflicto por duplicado
                echo json_encode(["status" => "error", "message" => "La patente $patente ya existe."]);
                exit();
            }

            $sql = "INSERT INTO vehiculos (patente, modelo, marca, `año`, km_actuales, Estado) VALUES (?, ?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$patente, $modelo, $marca, $anio, $km, $estado]); // Inserta seguro con ?

            echo json_encode(["status" => "ok", "message" => "Vehiculo $patente registrado."]);
            break;

        case 'PUT': // Modifica datos o estado de un vehiculo existente
            $patente = strtoupper(trim($entrada['patente'] ?? ''));
            $modelo  = trim($entrada['modelo'] ?? '');
            $marca   = trim($entrada['marca'] ?? '');
            $anio    = intval($entrada['año'] ?? 0);
            $km      = intval($entrada['km_actuales'] ?? 0);
            $estado  = trim($entrada['Estado'] ?? 'Disponible');

            if (!$patente) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Patente requerida para actualizar."]);
                exit();
            }

            $sql = "UPDATE vehiculos SET modelo = ?, marca = ?, `año` = ?, km_actuales = ?, Estado = ? WHERE patente = ?";
            $pdo->prepare($sql)->execute([$modelo, $marca, $anio, $km, $estado, $patente]);

            echo json_encode(["status" => "ok", "message" => "Vehiculo $patente actualizado."]);
            break;

        case 'DELETE': // Baja de vehiculo por patente
            $patente = strtoupper(trim($_GET['patente'] ?? ''));
            if (!$patente) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Patente no especificada."]);
                exit();
            }

            $sentencia = $pdo->prepare("DELETE FROM vehiculos WHERE patente = ?");
            $sentencia->execute([$patente]);

            echo json_encode(["status" => "ok", "message" => "Vehiculo $patente eliminado."]);
            break;

        default: // Cualquier otro verbo HTTP no soportado
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}