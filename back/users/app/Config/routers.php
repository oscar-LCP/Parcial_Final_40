<?php
namespace App\Config;

use Slim\App;
use App\Controllers\UsersController;

return function(App $app) {
    $app->post('/register', [UsersController::class, 'register']);
    $app->post('/login', [UsersController::class, 'login']);
    
    // Rutas protegidas
    $app->post('/logout', [UsersController::class, 'logout']);
    $app->get('/users', [UsersController::class, 'listUsers']);
    $app->put('/users/{id}', [UsersController::class, 'updateUser']);
};
