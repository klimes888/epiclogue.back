#!/bin/bash
set -e

echo "
***************************************
dbinits.sh
***************************************
"

mongo admin<<EOF

db.createUser({
  user:  '$MONGO_INITDB_ROOT_USERNAME',
  pwd: '$MONGO_INITDB_ROOT_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$MONGO_INITDB_DATABASE'
  }]
})
EOF