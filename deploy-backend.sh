#!/bin/bash

# Configura tus variables
LOCAL_BACKEND_DIR="/Users/r7vera/Documents/SDN-STAFF/backend/"
REMOTE_USER="root"
REMOTE_HOST="161.132.41.106"
REMOTE_DIR="/var/www/projects/sdn-staff/backend/"

# Sincroniza todo excepto archivos .env y env.example
rsync -avz --exclude='.env' --exclude='env.example' --exclude='.env.*' --exclude='node_modules' "$LOCAL_BACKEND_DIR" "${REMOTE_USER}@${REMOTE_HOST}:$REMOTE_DIR"