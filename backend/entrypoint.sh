#!/bin/sh
set -e

# ─── Variables ──────────────────────────────────────────────────────────────────
export DJANGO_SETTINGS_MODULE="config.settings.prod"

echo "========================================"
echo "  Kendjino Pharma — Démarrage Backend"
echo "  Settings : $DJANGO_SETTINGS_MODULE"
echo "========================================"

# ─── Attente PostgreSQL via DATABASE_URL ─────────────────────────────────────
# Render injecte DATABASE_URL (pas DB_HOST/DB_PORT).
# On parse DATABASE_URL pour extraire l'hôte et le port.
if [ -n "$DATABASE_URL" ]; then
    # Format: postgresql://user:pass@host:port/dbname
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/?]*\).*|\1|p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
    DB_PORT=${DB_PORT:-5432}

    echo "Attente de PostgreSQL sur $DB_HOST:$DB_PORT ..."
    # python est disponible — utilisons-le pour le wait (pas besoin de netcat)
    python - <<EOF
import socket, time, sys

host = "$DB_HOST"
port = int("$DB_PORT")
max_tries = 30
for attempt in range(max_tries):
    try:
        s = socket.create_connection((host, port), timeout=3)
        s.close()
        print(f"PostgreSQL prêt après {attempt + 1} tentative(s).")
        sys.exit(0)
    except (OSError, ConnectionRefusedError):
        print(f"Tentative {attempt + 1}/{max_tries} — PostgreSQL pas encore prêt...")
        time.sleep(2)

print("ERREUR: PostgreSQL inaccessible après 30 tentatives.")
sys.exit(1)
EOF
else
    echo "AVERTISSEMENT: DATABASE_URL non définie. Vérifiez les variables d'environnement Render."
fi

# ─── Migrations ──────────────────────────────────────────────────────────────
echo "Exécution des migrations..."
python manage.py migrate --noinput

# ─── Fichiers statiques ───────────────────────────────────────────────────────
echo "Collecte des fichiers statiques..."
python manage.py collectstatic --noinput --clear

# ─── Démarrage Gunicorn ───────────────────────────────────────────────────────
echo "Démarrage de Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info

!/bin/sh