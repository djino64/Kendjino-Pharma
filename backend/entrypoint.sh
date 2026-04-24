#!/bin/sh

echo "Waiting for PostgreSQL to start..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "PostgreSQL started!"

# Appliquer les migrations
python manage.py migrate --noinput

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Démarrer Gunicorn
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000