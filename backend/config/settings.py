from pathlib import Path
from datetime import timedelta
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().resolve().parent.parent.parent


# =========================
# SECURITY
# =========================
SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-this-in-production')

DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = [
    '127.0.0.1',
    'localhost',
    '.onrender.com',  # Accepte tous les sous-domaines render.com
]


# =========================
# APPLICATIONS
# =========================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # REST
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',

    # apps locales
    'apps.users.apps.UsersConfig',
    'apps.produits.apps.ProduitsConfig',
    'apps.clients.apps.ClientsConfig',
    'apps.fournisseurs.apps.FournisseursConfig',
    'apps.achats.apps.AchatsConfig',
    'apps.ordonnances.apps.OrdonnancesConfig',
    'apps.stock.apps.StockConfig',
    'apps.ventes.apps.VentesConfig',
    'apps.rapports.apps.RapportsConfig',
    'apps.dashboard.apps.DashboardConfig',
]


AUTH_USER_MODEL = 'users.User'


# =========================
# MIDDLEWARE
# =========================
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'config.urls'

WSGI_APPLICATION = 'config.wsgi.application'


# =========================
# TEMPLATES
# =========================
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]


# =========================
# DATABASE - PostgreSQL sur Render
# =========================
# Ta base de données PostgreSQL sur Render
DATABASES = {
    'default': dj_database_url.config(
        default='postgresql://kendjino_pharma_db_user:WJjAuyafnW9H8jeiH0A6nexa6rRDs8zu@dpg-d7loqef7f7vs73ch16bg-a/kendjino_pharma_db',
        conn_max_age=600,
        ssl_require=True  # Render nécessite SSL
    )
}


# =========================
# STATIC FILES (WhiteNoise pour Render)
# =========================
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Dossier pour les fichiers média (si tu as des uploads)
MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# =========================
# PASSWORD VALIDATION
# =========================
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# =========================
# LANGUAGE / TIME
# =========================
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'America/Port-au-Prince'
USE_I18N = True
USE_TZ = True


# =========================
# DEFAULT AUTO FIELD
# =========================
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# =========================
# REST FRAMEWORK
# =========================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}


# =========================
# JWT
# =========================
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}


# =========================
# CORS (Cross-Origin Resource Sharing)
# =========================
# En développement, autorise tout (plus simple)
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    # En production, spécifie les origines autorisées
    CORS_ALLOWED_ORIGINS = [
        "https://ton-frontend.onrender.com",  # ⚠️ À REMPLACER PAR L'URL DE TON FRONTEND
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Si ton frontend utilise des requêtes avec cookies/credentials
    CORS_ALLOW_CREDENTIALS = True
    
    # Méthodes HTTP autorisées
    CORS_ALLOW_METHODS = [
        'DELETE',
        'GET',
        'OPTIONS',
        'PATCH',
        'POST',
        'PUT',
    ]
    
    # Headers autorisés
    CORS_ALLOW_HEADERS = [
        'accept',
        'accept-encoding',
        'authorization',
        'content-type',
        'dnt',
        'origin',
        'user-agent',
        'x-csrftoken',
        'x-requested-with',
    ]


# =========================
# CSRF (pour les formulaires Django, optionnel)
# =========================
if not DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        "https://kendjino-pharma.onrender.com",  
        "https://kendjino-pharma-api.onrender.com",  
    ]


# =========================
# SÉCURITÉ (recommandé pour production)
# =========================
if not DEBUG:
    # HTTPS
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    
    # HSTS (HTTP Strict Transport Security)
    SECURE_HSTS_SECONDS = 31536000  # 1 an
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Cookies sécurisés
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    # Autres en-têtes de sécurité
    X_FRAME_OPTIONS = 'DENY'
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True