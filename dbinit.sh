#!/bin/bash
set -e

echo "
*********************************
dbinit.sh
*********************************
"

mongo -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD <<EOF
use $MONGO_INITDB_DATABASE
db.createUser({
  user:  '$MONGO_INITDB_ROOT_USERNAME',
  pwd: '$MONGO_INITDB_ROOT_PASSWORD',
  roles: [
    {
      role: 'readWrite',
      db: '$MONGO_INITDB_DATABASE'
    },
    {
      role: 'userAdminAnyDatabase',
      db: 'admin'
    },
    {
      role: 'clusterAdmin',
      db: 'admin'
    }
  ]
})

use $MONGO_TEST_DATABASE
db.createUser({
  user:  '$MONGO_INITDB_ROOT_USERNAME',
  pwd: '$MONGO_INITDB_ROOT_PASSWORD',
  roles: [
    {
      role: 'readWrite',
      db: '$MONGO_TEST_DATABASE'
    },
    {
      role: 'userAdminAnyDatabase',
      db: 'admin'
    },
    {
      role: 'clusterAdmin',
      db: 'admin'
    }
  ]
})
EOF