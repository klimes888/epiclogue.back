#!/bin/bash
set -e

echo "
**************************
Execute innerSetup.sh
**************************
"

sleep 5 | echo Sleeping

mongo mongodb://mongodb1:27017 replicaInit.js