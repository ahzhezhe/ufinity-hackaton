#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load .env file
ENV_FILE="$(dirname "$0")/../api/.env"
if [ -f "$ENV_FILE" ]; then
  export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
fi

# Get database config from .env or use defaults
DB_HOST=${DATABASE_HOST:-localhost}
DB_PORT=${DATABASE_PORT:-3306}
DB_USER=${DATABASE_USER:-root}
DB_PASSWORD=${DATABASE_PASSWORD:-password}
DB_NAME=${DATABASE_NAME:-seat_booking}

DB_DIR="$(dirname "$0")/init"

if [ ! -d "$DB_DIR" ]; then
    echo -e "${RED}✗ Database directory not found: $DB_DIR${NC}"
    exit 1
fi

SQL_FILES=($(ls -1 "$DB_DIR"/*.sql 2>/dev/null | sort))

if [ ${#SQL_FILES[@]} -eq 0 ]; then
    echo -e "${YELLOW}No SQL files found in $DB_DIR${NC}"
    exit 0
fi

echo -e "${YELLOW}Running database migrations...${NC}\n"

MYSQL_CMD="mysql -h $DB_HOST -P $DB_PORT -u $DB_USER"

if [ -n "$DB_PASSWORD" ]; then
    MYSQL_CMD="$MYSQL_CMD -p$DB_PASSWORD"
fi

for file in "${SQL_FILES[@]}"; do
    echo -e "${YELLOW}Executing: $(basename $file)${NC}"

    # For the first file, don't specify database; for others, select it
    if [ "$(basename $file)" == "000_init_database.sql" ]; then
        CMD="$MYSQL_CMD"
    else
        CMD="$MYSQL_CMD -D $DB_NAME"
    fi

    if $CMD < "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ $(basename $file) completed${NC}\n"
    else
        echo -e "${RED}✗ Error executing $(basename $file)${NC}"
        $CMD < "$file"
        exit 1
    fi
done

echo -e "${GREEN}✓ All migrations completed successfully!${NC}"
