#!/bin/sh
set -e

# ─── Variables ──────────────────────────────────────────────────────────────────
export DJANGO_SETTINGS_MODULE="config.settings.prod"

echo "========================================"
echo "  Kendjino Pharma — Démarrage Backend"
echo "  Settings : $DJANGO_SETTINGS_MODULE"
echo "========================================"

# ─── Attente PostgreSQL via DATABASE_URL ─────────────────────────────────────
if [ -n "$DATABASE_URL" ]; then
    DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/?]*\).*|\1|p')
    DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')
    DB_PORT=${DB_PORT:-5432}

    echo "Attente de PostgreSQL sur $DB_HOST:$DB_PORT ..."
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
    echo "AVERTISSEMENT: DATABASE_URL non définie."
fi

# ─── Migrations ──────────────────────────────────────────────────────────────
echo "Exécution des migrations..."
python manage.py migrate --noinput

# ─── Création Superuser ──────────────────────────────────────────────────────
echo "Création du super utilisateur (si nécessaire)..."

python manage.py shell <<EOF
from django.contrib.auth import get_user_model
import os

User = get_user_model()

email = os.getenv("DJANGO_SUPERUSER_EMAIL")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if email and password:
    if not User.objects.filter(email=email).exists():
        print("Création du superuser...")
        User.objects.create_superuser(
            email=email,
            password=password
        )
        print("Superuser créé avec succès.")
    else:
        print("Superuser déjà existant.")
else:
    print("Variables du superuser manquantes (email/password).")
EOF

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