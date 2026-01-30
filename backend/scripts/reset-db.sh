#!/bin/bash

# Hot Desk Booking System - Database Reset Script
# This script resets the database and seeds initial data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "=================================================="
echo "  Hot Desk Booking System - Database Reset"
echo "=================================================="
echo ""

cd "$BACKEND_DIR"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Please copy .env.example to .env and configure your database settings."
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔄 Resetting database and seeding data..."
echo ""

# Run the seed script
npx ts-node src/seed.ts

echo ""
echo "✅ Database reset complete!"
