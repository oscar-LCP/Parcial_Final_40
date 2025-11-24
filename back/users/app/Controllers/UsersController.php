<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\UserRepository;

class UsersController {
    private UserRepository $userRepo;

    public function __construct() {
        $this->userRepo = new UserRepository();
    }

    // 1.1 - Registro de usuarios (requiere ser administrador, excepto el primer registro)
    public function register(Request $request, Response $response) {
        $data = (array)$request->getParsedBody();
        
        // Verificar si hay usuarios en el sistema
        $existingUsers = $this->userRepo->getAll();
        
        // Si ya hay usuarios, verificar que quien registra sea administrador
        if (count($existingUsers) > 0) {
            // Verificar que la petición tenga token (está autenticado)
            $headers = $request->getHeader('Authorization');
            $token = $headers[0] ?? null;
            
            if (!$token) {
                $response->getBody()->write(json_encode(['error' => 'Solo administradores pueden registrar usuarios']));
                return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
            }
            
            $user = $this->userRepo->getByToken($token);
            if (!$user || $user->role !== 'administrador') {
                $response->getBody()->write(json_encode(['error' => 'Solo administradores pueden registrar usuarios']));
                return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
            }
        }
        
        // Crear el usuario
        $user = $this->userRepo->create($data);
        $response->getBody()->write(json_encode($user));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    // 1.2 y 1.3 - Login con generación de token
    public function login(Request $request, Response $response) {
        $data = (array)$request->getParsedBody();
        
        $user = $this->userRepo->getByEmailAndPassword($data['email'], $data['password']);
        if (!$user) {
            $response->getBody()->write(json_encode(['error' => 'Credenciales inválidas']));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }
        
        // 1.3 - Generar token aleatorio
        $token = bin2hex(random_bytes(32));
        $this->userRepo->updateToken($user->id, $token);
        
        $response->getBody()->write(json_encode([
            'token' => $token, 
            'role' => $user->role,
            'name' => $user->name
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // 1.4 - Logout (eliminar token)
    public function logout(Request $request, Response $response) {
        $user = $request->getAttribute('user');
        $this->userRepo->updateToken($user->id, null);
        $response->getBody()->write(json_encode(['message' => 'Sesión cerrada correctamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // 1.8 - Listar usuarios (solo administrador)
    public function listUsers(Request $request, Response $response) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            $response->getBody()->write(json_encode(['error' => 'Acceso denegado']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        
        $users = $this->userRepo->getAll();
        $response->getBody()->write(json_encode($users));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // 1.9 y 1.10 - Actualizar usuario (solo administrador)
    public function updateUser(Request $request, Response $response, array $args) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            $response->getBody()->write(json_encode(['error' => 'Acceso denegado']));
            return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
        }
        
        $data = (array)$request->getParsedBody();
        $this->userRepo->update($args['id'], $data);
        
        $response->getBody()->write(json_encode(['message' => 'Usuario actualizado correctamente']));
        return $response->withHeader('Content-Type', 'application/json');
    }
}