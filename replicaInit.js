cfg = {
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb1:27017" },
    { _id: 1, host: "mongodb2:27017" },
    { _id: 2, host: "mongodb3:27017" },
    { _id: 3, host: "mongodb4:27017" },
    { _id: 4, host: "mongodb5:27017" }
  ]
};

rs.initiate(cfg);

rs.status();

db.runCommand({ isMaster: 1 })

db = db.getSiblingDB('admin')

db.createUser({
  user:  '$MONGO_INITDB_ROOT_USERNAME',
  pwd: '$MONGO_INITDB_ROOT_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$MONGO_INITDB_DATABASE'
  }]
})