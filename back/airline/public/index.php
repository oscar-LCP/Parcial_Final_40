<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

require __DIR__ . '/../app/Config/database.php';

$app = AppFactory::create();

$app->addBodyParsingMiddleware();

$app->addRoutingMiddleware();

$app->add(function (Request $request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
});

$app->add(function (Request $request, $handler) {
    $headers = $request->getHeader('Authorization');
    $token = $headers[0] ?? null;
    
    if (!$token) {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode(['error' => 'Token no provisto']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }

    $userRepo = new \App\Repositories\UserRepository();
    $user = $userRepo->getByToken($token);
    
    if (!$user) {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode(['error' => 'Token inválido']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }

    $request = $request->withAttribute('user', $user);
    return $handler->handle($request);
});

$routes = require __DIR__ . '/../app/Config/routers.php';
$routes($app);

$app->run();