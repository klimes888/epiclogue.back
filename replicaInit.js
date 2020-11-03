cfg = {
  _id: "rs0",
  members: [
    { _id: 0, host: "mongodb1:27017" },
    { _id: 1, host: "mongodb2:27017" },
    { _id: 2, host: "mongodb3:27017" },
  ]
};

rs.initiate(cfg);

rs.status();

primary = rs.isMaster().primary

admin = (new Mongo(primary)).getDB('lunarcat')

admin.auth('lunarcat', 'lunarcat1234!')

db.createUser({
  user:  'lunarcat_admin',
  pwd: '$MONGO_INITDB_ROOT_PASSWORD',
  roles: [{
    role: ['dbAdmin',],
    db: '$MONGO_INITDB_DATABASE'
  }]
})