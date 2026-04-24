#!/bin/sh
set -e

echo "Attente de MySQL..."
while ! nc -z db 3306; do
  sleep 1
done
echo "MySQL disponible."

echo "Migrations..."
python manage.py migrate --noinput

echo "Collecte des fichiers statiques..."
python manage.py collectstatic --noinput --clear

echo "Création superuser si absent..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='$DJANGO_SUPERUSER_EMAIL').exists():
    User.objects.create_superuser(
        email='$DJANGO_SUPERUSER_EMAIL',
        password='$DJANGO_SUPERUSER_PASSWORD',
        nom='Admin',
        prenom='Kendjino'
    )
    print('Superuser créé.')
else:
    print('Superuser déjà existant.')
"

echo "Démarrage Gunicorn..."
exec gunicorn config.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --worker-class gthread \
    --threads 2 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -