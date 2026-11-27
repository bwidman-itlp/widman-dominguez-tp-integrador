<?php
// api/config/db.php - Conexion PDO a MySQL (XAMPP)

header("Access-Control-Allow-Origin: *"); // Permite peticiones desde el navegador
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Verbos HTTP aceptados
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Cabeceras permitidas
header("Content-Type: application/json; charset=UTF-8"); // Responde siempre en JSON UTF-8

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { // Responde rapido a verificaciones previas del navegador
    http_response_code(200);
    exit();
}

$host = "127.0.0.1";       // Servidor local XAMPP
$nombreBd = "vektor360_3"; // Base de datos importada en phpMyAdmin
$usuario = "root";         // Usuario por defecto
$clave = "";               // Sin clave por defecto
$charset = "utf8mb4";      // Soporta tildes y ñ

$dsn = "mysql:host=$host;dbname=$nombreBd;charset=$charset";
$opciones = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Muestra errores SQL como excepciones
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Devuelve filas como arrays asociativos
    PDO::ATTR_EMULATE_PREPARES   => false,                // Usa consultas preparadas reales
];

try {
    $pdo = new PDO($dsn, $usuario, $clave, $opciones); // Crea la conexion
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error de conexion MySQL: " . $e->getMessage()]);
    exit();
}