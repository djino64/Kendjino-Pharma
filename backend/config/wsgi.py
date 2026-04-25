"""WSGI config for Kendjino Pharma — Production (Render)."""
import os
from django.core.wsgi import get_wsgi_application

# Pointe TOUJOURS sur prod en production
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.prod")

application = get_wsgi_application()