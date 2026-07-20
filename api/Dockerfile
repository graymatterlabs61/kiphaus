FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    netcat-traditional \
    gdal-bin \
    libgdal-dev \
    python3-gdal \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

RUN addgroup --system django && adduser --system --ingroup django django

COPY --chown=django:django . .
RUN chmod +x /app/entrypoint.sh \
 && mkdir -p /app/staticfiles /app/media \
 && chown -R django:django /app/staticfiles /app/media

USER django

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
# Overridden by docker-compose for dev (runserver) / celery services.
# Production default: gunicorn, settings picked up from $DJANGO_SETTINGS_MODULE.
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
