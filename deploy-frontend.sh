#!/bin/bash

# Configura tus variables
LOCAL_DIST_DIR="/Users/r7vera/Documents/SDN-STAFF/frontend/sdn-staff/dist/"
REMOTE_USER="root"
REMOTE_HOST="161.132.41.106"
REMOTE_DIR="/var/www/projects/sdn-staff"

# Sincroniza todo excepto archivos .env y env.example
rsync -avz --delete --exclude='.env' --exclude='env.example' --exclude='.env.*' --exclude='node_modules' --exclude='backend' "$LOCAL_DIST_DIR" "${REMOTE_USER}@${REMOTE_HOST}:$REMOTE_DIR"