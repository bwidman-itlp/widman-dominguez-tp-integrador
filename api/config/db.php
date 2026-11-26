<?php
// api/config/db.php - Conexion PDO a MySQL en XAMPP

header("Access-Control-Allow-Origin: *"); // Permite peticiones desde el frontend
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Metodos HTTP permitidos
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Cabeceras aceptadas
header("Content-Type: application/json; charset=UTF-8"); // Responde siempre en JSON UTF-8

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { // Responde rapido a preflight de CORS
    http_response_code(200);
    exit();
}

$host = "127.0.0.1";           // Servidor local de MySQL
$nombreBd = "vektor360_2";     // Nombre de la base en vektor360_2.sql
$usuario = "root";             // Usuario por defecto en XAMPP
$clave = "";                   // Sin clave por defecto en XAMPP
$charset = "utf8mb4";          // Soporta emojis y caracteres especiales

$dsn = "mysql:host=$host;dbname=$nombreBd;charset=$charset"; // Cadena de conexion
$opciones = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Lanza excepciones si falla SQL
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Devuelve filas como arrays asociativos
    PDO::ATTR_EMULATE_PREPARES   => false,                // Usa sentencias preparadas reales
];

try {
    $pdo = new PDO($dsn, $usuario, $clave, $opciones); // Crea la conexion PDO
} catch (PDOException $e) {
    http_response_code(500); // Error interno de servidor
    echo json_encode([
        "status" => "error",
        "message" => "Error de conexion a MySQL: " . $e->getMessage()
    ]);
    exit();
}