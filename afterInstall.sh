#!/bin/bash

if [ -f mongodb.key ];
then
    echo ' ***Deleted old key!*** '
    rm -rf mongodb.key
fi
echo ' ***create new key!*** '
openssl rand -base64 756 > mongodb.key
chown 999:999 mongodb.key
chmod 400 mongodb.key
