<?php
namespace App\Config;

use Slim\App;
use App\Controllers\AirlineController;

return function(App $app) {
    $ac = new AirlineController();

    // Naves (admin)
    $app->post('/naves', [$ac, 'createNave']);
    $app->get('/naves', [$ac, 'listNaves']);
    $app->put('/naves/{id}', [$ac, 'updateNave']);
    $app->delete('/naves/{id}', [$ac, 'deleteNave']);

    // Vuelos (admin)
    $app->post('/flights', [$ac, 'createFlight']);
    $app->get('/flights', [$ac, 'listFlights']);
    $app->put('/flights/{id}', [$ac, 'updateFlight']);
    $app->delete('/flights/{id}', [$ac, 'deleteFlight']);

    // Reservas (gestor)
    $app->post('/reservations', [$ac, 'createReservation']);
    $app->get('/reservations', [$ac, 'listReservations']);
    $app->put('/reservations/{id}/cancel', [$ac, 'cancelReservation']);
};
