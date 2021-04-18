#!/bin/bash

if [ -f mongodb.key ];
then
    echo 'Delted old key!'
    sudo rm mongodb.key
fi

openssl rand -base64 >> mongodb.key
chown 999:999 mongodb.key
chmod 400 mongodb.key
