#!/bin/bash

# Script to start test database
echo "Starting test database..."

# Start Docker Compose for test database
docker-compose -f docker-compose.test.yml up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
while ! docker exec cv-be-test-db pg_isready -U test_user -d cv_test > /dev/null 2>&1; do
  echo "Waiting for PostgreSQL..."
  sleep 1
done

echo "Test database is ready!"

# Apply migrations if you have a migration script
# npx drizzle-kit migrate

echo "Test database setup complete."
