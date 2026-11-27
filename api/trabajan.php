<?php
// api/trabajan.php - CRUD de ordenes de taller (descuenta stock al crear)

require_once __DIR__ . '/config/db.php';

$metodo = $_SERVER['REQUEST_METHOD'];
$entrada = json_decode(file_get_contents("php://input"), true) ?? [];

try {
    switch ($metodo) {
        case 'GET':
            $stmt = $pdo->query("SELECT id_trabajan, id_incidentes, cod_repuesto, id_usuarios, fecha, cantidad FROM trabajan ORDER BY id_trabajan DESC");
            echo json_encode(["status" => "ok", "data" => $stmt->fetchAll()]);
            break;

        case 'POST':
            $idIncidente = intval($entrada['id_incidentes'] ?? 0);
            $codRepuesto = strtoupper(trim($entrada['cod_repuesto'] ?? ''));
            $idUsuario   = intval($entrada['id_usuarios'] ?? 1);
            $fecha       = $entrada['fecha'] ?? date('Y-m-d H:i:s');
            $cantidad    = intval($entrada['cantidad'] ?? 0);

            if ($idIncidente <= 0 || !$codRepuesto || $cantidad <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Datos de orden de taller incompletos."]);
                exit();
            }

            $pdo->beginTransaction(); // Asegura insertar orden y descontar stock juntos

            $consultaRep = $pdo->prepare("SELECT Stock FROM repuestos WHERE cod_repuesto = ? FOR UPDATE");
            $consultaRep->execute([$codRepuesto]);
            $rep = $consultaRep->fetch();

            if (!$rep || intval($rep['Stock']) < $cantidad) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Stock insuficiente para $codRepuesto."]);
                exit();
            }

            $pdo->prepare("UPDATE repuestos SET Stock = Stock - ? WHERE cod_repuesto = ?")->execute([$cantidad, $codRepuesto]);

            $sql = "INSERT INTO trabajan (id_incidentes, cod_repuesto, id_usuarios, fecha, cantidad) VALUES (?, ?, ?, ?, ?)";
            $pdo->prepare($sql)->execute([$idIncidente, $codRepuesto, $idUsuario, $fecha, $cantidad]);
            $nuevoId = $pdo->lastInsertId();

            $pdo->commit();
            echo json_encode(["status" => "ok", "message" => "Orden de taller registrada.", "id_trabajan" => $nuevoId]);
            break;

        case 'DELETE':
            $id = intval($_GET['id_trabajan'] ?? 0);
            $pdo->prepare("DELETE FROM trabajan WHERE id_trabajan = ?")->execute([$id]);
            echo json_encode(["status" => "ok", "message" => "Orden eliminada."]);
            break;

        default:
            http_response_code(405);
            echo json_encode(["status" => "error", "message" => "Metodo no permitido."]);
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}