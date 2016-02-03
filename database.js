var faker = require("faker");

var dbs = {};

var _getClientsForUser = function(userId) {
  if(!dbs[userId]) { return []; }
  dbs[userId].accessed = new Date();
  return dbs[userId].oAuthClients;
};

var _getClientForUser = function(userId, clientId) {
  return _getClientsForUser(userId).filter(function(c){
    return c.id === clientId;
  })[0];
};

// Removes the `users` key from a client
var _stripClient = function(c) {
  return {
    id: c.id,
    name: c.name,
    created: c.created,
    logo: c.logo
  };
};

function _random(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

// Ensures that there's data in this user's database
var initUser = function(userId) {
  if (dbs[userId]) { return false; }
  dbs[userId] = {
    created: new Date(),
    accessed: new Date(),
    oAuthClients: []
  };
  var numClients = _random(2,5);
  for(var i=0; i<numClients; i++) {
    // generate some users
    var client = {
      id: faker.random.uuid(),
      name: faker.commerce.productName(),
      description: faker.lorem.sentence(),
      logo: faker.image.imageUrl(400, 400, "animals"),
      created: faker.date.past(),
      users: [],
    };
    dbs[userId].oAuthClients.push(client);

    var numUsers = _random(55,200);
    for(var j=0; j<numUsers; j++) {
      client.users.push({
        id: faker.random.uuid(),
        name: faker.name.findName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
      });
    }
  };
  return true;
};

var getClients = function(userId) {
  return _getClientsForUser(userId).map(function(c){
    return _stripClient(c);
  });
};

// Returns an array of all users for a given client
var getUsers = function(userId, clientId) {
  var client = _getClientForUser(userId, clientId);
  if(!client) return [];
  return client.users;
};

// Updates a client
var updateClient = function(userId, clientId, updates) {
  var client = _getClientForUser(userId, clientId);
  if(!client) return null;
  Object.keys(updates).forEach(function(key) {
    if(key != "users" && key != "created") client[key] = updates[key];
  });
  return _stripClient(client);
}

// Erases all databases that haven't been used after cutoff
var reap = function(cutoff) {
  console.log("Running the reaper!");
  Object.keys(dbs).forEach(function(userId){
    if(dbs[userId].accessed < cutoff) {
      console.log("Deleting data for user " + userId + " because it hasn't been used since " + dbs[userId].accessed.toString())
      delete dbs[userId];
    }
  });
};

var dump = function() {
  return dbs;
};

module.exports = {
  dump: dump,
  reap: reap,
  getClients: getClients,
  initUser: initUser,
  getUsers: getUsers,
  updateClient: updateClient
};
