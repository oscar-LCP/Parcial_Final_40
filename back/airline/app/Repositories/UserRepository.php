<?php
namespace App\Repositories;

use App\Models\User;

class UserRepository {
    public function getByToken(string $token) {
        return User::where('token', $token)->first();
    }
}
