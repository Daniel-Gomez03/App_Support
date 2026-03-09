<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Departments;
use OpenApi\Attributes as OA;

class DepartmentsController extends Controller
{
    #[OA\Get(
        path: "/api/departments",
        summary: "Obtener todos los departamentos",
        tags: ["Departamentos"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Successful operation",
            ),
        ]
    )]

    public function index ()
    {
        $departments = Departments::all();
        return response()->json($departments);
    }
}
