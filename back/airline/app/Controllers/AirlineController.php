<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\Nave;
use App\Models\Flight;
use App\Models\Reservation;

class AirlineController {
    // ========== NAVES (Solo Administrador) ==========
    public function createNave(Request $request, Response $response) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            return $this->forbidden($response);
        }
        $data = (array)$request->getParsedBody();
        $nave = Nave::create($data);
        $response->getBody()->write(json_encode($nave));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function listNaves(Request $request, Response $response) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            return $this->forbidden($response);
        }
        $naves = Nave::all();
        $response->getBody()->write(json_encode($naves));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function updateNave(Request $request, Response $response, array $args) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            return $this->forbidden($response);
        }
        $data = (array)$request->getParsedBody();
        $nave = Nave::find($args['id']);
        if (!$nave) {
            return $this->notFound($response);
        }
        $nave->update($data);
        $response->getBody()->write(json_encode(['message' => 'Nave actualizada']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function deleteNave(Request $request, Response $response, array $args) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            return $this->forbidden($response);
        }
        $nave = Nave::find($args['id']);
        if (!$nave) {
            return $this->notFound($response);
        }
        $nave->delete();
        $response->getBody()->write(json_encode(['message' => 'Nave eliminada']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // ========== VUELOS ==========
    // Crear vuelo (Solo Administrador)
    public function createFlight(Request $request, Response $response) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            return $this->forbidden($response);
        }
        $data = (array)$request->getParsedBody();
        $flight = Flight::create($data);
        $response->getBody()->write(json_encode($flight));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Listar vuelos (Administrador y Gestor pueden consultar)
    public function listFlights(Request $request, Response $response) {
        $user = $request->getAttribute('user');
        // Tanto administrador como gestor pueden consultar vuelos
        if (!in_array($user->role, ['administrador', 'gestor'])) {
            return $this->forbidden($response);
        }
        
        $params = $request->getQueryParams();
        $query = Flight::query();
        
        if (!empty($params['origin'])) {
            $query->where('origin', $params['origin']);
        }
        if (!empty($params['destination'])) {
            $query->where('destination', $params['destination']);
        }
        if (!empty($params['date'])) {
            $query->whereDate('departure', $params['date']);
        }
        
        $flights = $query->get();
        $response->getBody()->write(json_encode($flights));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Actualizar vuelo (Solo Administrador)
    public function updateFlight(Request $request, Response $response, array $args) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            return $this->forbidden($response);
        }
        $data = (array)$request->getParsedBody();
        $flight = Flight::find($args['id']);
        if (!$flight) {
            return $this->notFound($response);
        }
        $flight->update($data);
        $response->getBody()->write(json_encode(['message' => 'Vuelo actualizado']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // Eliminar vuelo (Solo Administrador)
    public function deleteFlight(Request $request, Response $response, array $args) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'administrador') {
            return $this->forbidden($response);
        }
        $flight = Flight::find($args['id']);
        if (!$flight) {
            return $this->notFound($response);
        }
        $flight->delete();
        $response->getBody()->write(json_encode(['message' => 'Vuelo eliminado']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // ========== RESERVAS (Solo Gestor) ==========
    public function createReservation(Request $request, Response $response) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'gestor') {
            return $this->forbidden($response);
        }
        
        $data = (array)$request->getParsedBody();
        
        // Asignar automáticamente el user_id del gestor autenticado
        $data['user_id'] = $user->id;
        
        // Validar que el vuelo exista
        $flight = Flight::find($data['flight_id']);
        if (!$flight) {
            $response->getBody()->write(json_encode(['error' => 'Vuelo inexistente']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }
        
        // Crear la reserva
        $reservation = Reservation::create($data);
        $response->getBody()->write(json_encode($reservation));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public function listReservations(Request $request, Response $response) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'gestor') {
            return $this->forbidden($response);
        }
        
        // El gestor puede ver todas las reservas
        $params = $request->getQueryParams();
        $query = Reservation::query();
        
        // Filtrar por user_id si se proporciona (Requerimiento 4.3)
        if (!empty($params['user_id'])) {
            $query->where('user_id', $params['user_id']);
        }
        
        $reservations = $query->orderBy('id', 'desc')->get();
        
        $response->getBody()->write(json_encode($reservations));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function cancelReservation(Request $request, Response $response, array $args) {
        $user = $request->getAttribute('user');
        if ($user->role !== 'gestor') {
            return $this->forbidden($response);
        }
        
        $reservation = Reservation::find($args['id']);
        if (!$reservation) {
            return $this->notFound($response);
        }
        
        // El gestor puede cancelar cualquier reserva
        $reservation->update(['status' => 'cancelada']);
        $response->getBody()->write(json_encode(['message' => 'Reserva cancelada']));
        return $response->withHeader('Content-Type', 'application/json');
    }

    // ========== HELPERS ==========
    private function forbidden(Response $response): Response {
        $response->getBody()->write(json_encode(['error' => 'Acceso denegado']));
        return $response->withStatus(403)->withHeader('Content-Type', 'application/json');
    }

    private function notFound(Response $response): Response {
        $response->getBody()->write(json_encode(['error' => 'Recurso no encontrado']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
}