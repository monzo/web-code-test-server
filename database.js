var faker = require("faker");

var dbs = {};

var _getAppsForUser = function(userId) {
  if(!dbs[userId]) { return []; }
  dbs[userId].accessed = new Date();
  return dbs[userId].Apps;
};

var _getAppForUser = function(userId, appId) {
  return _getAppsForUser(userId).filter(function(a){
    return a.id === appId;
  })[0];
};

// Removes the `users` key from a app
var _stripApp = function(a) {
  return {
    id: a.id,
    name: a.name,
    created: a.created,
    logo: a.logo
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
    Apps: []
  };
  var numApps = _random(2,5);
  for(var i=0; i<numApps; i++) {
    // generate some users
    var app = {
      id: faker.random.uuid(),
      name: faker.commerce.productName(),
      logo: faker.image.imageUrl(400, 400, "animals"),
      created: faker.date.past(),
      users: [],
    };
    dbs[userId].Apps.push(app);

    var numUsers = _random(55,200);
    for(var j=0; j<numUsers; j++) {
      app.users.push({
        id: faker.random.uuid(),
        name: faker.name.findName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
      });
    }
  };
  return true;
};

var getApps = function(userId) {
  return _getAppsForUser(userId).map(function(c){
    return _stripApp(c);
  });
};

// Returns an array of all users for a given app
var getUsers = function(userId, appId) {
  var app = _getAppForUser(userId, appId);
  if(!app) return [];
  return app.users;
};

// Updates a app
var updateApp = function(userId, appId, updates) {
  var app = _getAppForUser(userId, appId);
  if(!app) return null;
  Object.keys(updates).forEach(function(key) {
    if(key != "users" && key != "created") app[key] = updates[key];
  });
  return _stripApp(app);
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
  getApps: getApps,
  initUser: initUser,
  getUsers: getUsers,
  updateApp: updateApp
};
