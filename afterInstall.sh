#!/bin/bash
cd /home/ubuntu/build
if [ -f mongodb.key ];
then
    echo ' ***already exist key!*** '
    docker-compose down
    docker-compose up --build -d
else
    echo ' ***create new key!*** '
    openssl rand -base64 756 > mongodb.key
    chown 999:999 mongodb.key
    chmod 400 mongodb.key
    docker-compose up -d
fi