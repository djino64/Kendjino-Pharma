#!/bin/sh

echo "=== Démarrage du backend Django ==="

# Vérifier les variables d'environnement
if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    echo "Attente de PostgreSQL sur $DB_HOST:$DB_PORT..."
    while ! nc -z "$DB_HOST" "$DB_PORT"; do
        sleep 1
    done
    echo "PostgreSQL est prêt !"
else
    echo "Variables DB_HOST/DB_PORT non définies, utilisation de DATABASE_URL"
fi

# Afficher les packages installés (debug)
echo "=== Packages Python installés ==="
pip list

# Appliquer les migrations
echo "=== Application des migrations ==="
python manage.py migrate --noinput

# Collecter les fichiers statiques
echo "=== Collecte des fichiers statiques ==="
python manage.py collectstatic --noinput

# Démarrer Gunicorn
echo "=== Démarrage de Gunicorn ==="
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 60