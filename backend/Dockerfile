FROM python:3.12-slim

WORKDIR /app

# Installer les dépendances système pour PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    pkg-config \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements.txt et installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code
COPY . .

# Rendre le script d'entrée exécutable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]