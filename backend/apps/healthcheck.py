"""Health check view — répond 200 pour le healthcheck Render."""
from django.http import JsonResponse
from django.db import connection


def healthcheck(request):
    """Vérifie que Django et la DB PostgreSQL répondent."""
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False

    status = 200 if db_ok else 503
    return JsonResponse(
        {
            "status": "ok" if db_ok else "db_error",
            "database": "postgresql" if db_ok else "unreachable",
        },
        status=status,
    )