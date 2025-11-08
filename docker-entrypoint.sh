#!/bin/sh

if [ -z "$CERBERUS_API_URL" ]; then
  echo "ERROR: API_URL is not set!"
  exit 1
fi

sed -i "s|__API_URL__|$CERBERUS_API_URL|g" /usr/share/nginx/html/config.js

exec "$@"
