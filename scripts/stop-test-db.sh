#!/bin/bash

# Script to stop test database
echo "Stopping test database..."

# Stop and remove Docker containers
docker-compose -f docker-compose.test.yml down -v

echo "Test database stopped and volumes removed."
