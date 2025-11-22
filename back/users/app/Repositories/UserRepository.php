<?php
namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function create(array $data)
    {
        return User::create($data);
    }

    public function getByEmailAndPassword(string $email, string $password)
    {
        return User::where('email', $email)->where('password', $password)->first();
    }

    public function updateToken(int $userId, ?string $token)
    {
        $user = User::find($userId);
        if ($user) {
            $user->token = $token;
            $user->save();
        }
    }

    public function getByToken(string $token)
    {
        return User::where('token', $token)->first();
    }

    public function getAll()
    {
        return User::all();
    }

    public function update(int $id, array $data)
    {
        $user = User::find($id);
        if ($user) {
            $user->update($data);
        }
    }
}
