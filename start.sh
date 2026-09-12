#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating superadmin..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
import os
U = get_user_model()
email = os.environ.get('ADMIN_EMAIL', 'majogadgets@admin.com')
password = os.environ.get('ADMIN_PASSWORD')
if not password:
    print('ADMIN_PASSWORD not set, skipping superadmin creation')
elif not U.objects.filter(email=email).exists():
    U.objects.create_superuser(email=email, name='Majo Gadgets', password=password)
    print('Superadmin created')
else:
    print('Superadmin already exists')
"

echo "Seeding districts..."
python manage.py seed_districts

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting gunicorn..."
exec gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
