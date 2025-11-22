<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use App\Middlewares\Cors;

require __DIR__ . '/../vendor/autoload.php';

require __DIR__ . '/../app/Config/database.php';

$app = AppFactory::create();

$app->add(new Cors());

$app->add(function (Request $request, $handler) {
    if ($request->getMethod() === 'OPTIONS') {
        $response = new \Slim\Psr7\Response();
        return $response->withStatus(200);
    }

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

(require __DIR__ . '/../app/Config/routers.php')($app);

$app->run();
