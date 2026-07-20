#!/bin/sh

# db/redis hostnames only exist under docker-compose; on Render (or any host
# without those service names) we must resolve the real host:port from the
# DATABASE_URL/REDIS_URL env vars instead.
python - <<'PY'
import os
import socket
import time
from urllib.parse import urlparse


def wait_for(url_env, default_host, default_port, label):
    url = os.environ.get(url_env)
    if url:
        parsed = urlparse(url)
        host, port = parsed.hostname, parsed.port or default_port
    else:
        host, port = default_host, default_port
    print(f"⏳ Waiting for {label} ({host}:{port})...")
    while True:
        try:
            socket.create_connection((host, port), timeout=2).close()
            break
        except OSError:
            time.sleep(0.5)
    print(f"✅ {label} is up.")


wait_for("DATABASE_URL", "db", 5432, "PostgreSQL")
wait_for("REDIS_URL", "redis", 6379, "Redis")
PY

echo "🔄 Running migrations..."
python manage.py migrate

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting Django..."
exec "$@"
