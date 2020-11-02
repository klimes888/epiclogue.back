#!/bin/bash
set -e

echo "
**************************
Execute innerSetup.sh
**************************
"

sleep 10 | echo Sleeping

mongo mongodb://mongodb1:27017 -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD replicaInit.js