#!/bin/sh

echo "Waiting for PostgreSQL to start on $DB_HOST:$DB_PORT..."

# Attendre que PostgreSQL soit prêt
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  echo "PostgreSQL not ready yet on $DB_HOST:$DB_PORT... waiting 1s"
  sleep 1
done

echo "PostgreSQL started on $DB_HOST:$DB_PORT!"

# Appliquer les migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collecter les fichiers statiques
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Démarrer Gunicorn
echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000