#!/bin/bash

if [ -f mongodb.key ];
then
    echo ' ***Deleted old key!*** '
    sudo rm mongodb.key
fi

openssl rand -base64 756 > mongodb.key
sudo chown 999:999 mongodb.key
sudo chmod 400 mongodb.key
