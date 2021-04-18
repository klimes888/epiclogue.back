#!/bin/bash
set -e

echo "
**************************
Execute innerSetup.sh
**************************
"

sleep 15 | echo Sleeping

mongo mongodb://mongodb1:27017 <<EOF
use $MONGO_INITDB_DATABASE
db.auth('$MONGO_INITDB_ROOT_USERNAME', '$MONGO_INITDB_ROOT_PASSWORD')
cfg = {
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb1:27017" }
  ]
};

rs.initiate(cfg);

rs.conf();
EOF