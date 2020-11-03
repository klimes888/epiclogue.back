#!/bin/bash
set -e

echo "
***************************************
dbinits.sh on shell
***************************************
"

mongod --bind_ip_all --replSet rs0

# after execute mongod, instruction below may ignore

echo "
***************************************
db.createUser
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

db.grantRolesToUser(
   "admin",
   [{ role: "clusterManager", db: "lunarcat" }]
)
EOF

echo "
***************************************
end!
***************************************
"