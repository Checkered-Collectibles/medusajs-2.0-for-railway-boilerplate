#!/bin/sh
set -e

# If the command is "pnpm start", try to run migrations first
if [ "$1" = "pnpm" ] && [ "$2" = "start" ]; then
    echo "--- Entrypoint: Starting Medusa ---"
    
    echo "--- Entrypoint: Running Migrations (db:migrate) ---"
    npx medusa db:migrate
    
    # Optional: Sync links (Required for Medusa v2+ module associations)
    # If this fails, you can comment it out, but it is usually recommended.
    # echo "--- Entrypoint: Syncing Links (db:sync-links) ---"
    # npx medusa db:sync-links

    echo "--- Entrypoint: Starting Server ---"
fi

exec "$@"