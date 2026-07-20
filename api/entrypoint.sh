#!/bin/sh

echo "⏳ Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 0.5
done
echo "✅ PostgreSQL is up."

echo "⏳ Waiting for Redis..."
while ! nc -z redis 6379; do
  sleep 0.5
done
echo "✅ Redis is up."

echo "🔄 Running migrations..."
python manage.py migrate

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "🚀 Starting Django..."
exec "$@"
