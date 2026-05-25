import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST


def _usuario_admin(user):
    return bool(user and user.is_authenticated and (user.is_staff or user.is_superuser))


def _dados_usuario(request):
    user = request.user
    authenticated = user.is_authenticated
    is_admin = _usuario_admin(user)

    dados = {
        "authenticated": authenticated,
        "is_admin": is_admin,
        "csrf_token": get_token(request),
    }

    if authenticated:
        dados["username"] = user.get_username()

    return dados


def _json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return None


@csrf_protect
@require_POST
def login_admin(request):
    dados = _json_body(request)

    if dados is None:
        return JsonResponse({"error": "JSON invalido."}, status=400)

    username = dados.get("username")
    password = dados.get("password")

    if not username or not password:
        return JsonResponse(
            {"error": "Informe usuario e senha."},
            status=400,
        )

    user = authenticate(request, username=username, password=password)

    if user is None:
        return JsonResponse(
            {"error": "Usuario ou senha invalidos."},
            status=401,
        )

    if not (user.is_staff or user.is_superuser):
        return JsonResponse(
            {"error": "Este usuario nao tem permissao administrativa."},
            status=403,
        )

    login(request, user)

    return JsonResponse(_dados_usuario(request))


@csrf_protect
@require_POST
def logout_admin(request):
    logout(request)

    return JsonResponse(
        {
            "authenticated": False,
            "is_admin": False,
            "csrf_token": get_token(request),
        }
    )


@ensure_csrf_cookie
@require_GET
def me(request):
    return JsonResponse(_dados_usuario(request))
