var express = require("express");
var db = require("./database.js");
var app = express();
var jwt = require("jsonwebtoken");
app.use(require("body-parser").json());
app.use(require("morgan")("combined"));
app.set("json spaces", 4);

var jwtSecret = "mondo is the best";

app.get("/robots.txt", function(req, res) {
  res.send("User-agent: *\nDisallow: /");
});

app.get("/ping", function(req, res) {
  res.send("Hullo");
});

// POST /login with JSON-encoded body {"email": "...", "password": "..."}
//  - returns 401 and JSON-encoded error if the password isn't hunter2
//  - returns 200 and {"token": "..."} otherwise. This token can be used in subsequent requests
//    in the Authorization header to authenticate
app.post("/login", function (req, res, next) {
  if(req.body["password"] != "hunter2") {
    return res.status(401).json({
      error: "Cannot log in with the given email and password.",
    });
  }
  // init a database for this user if there isn't one already
  db.initUser(req.body["email"]);

  res.json({
    accessToken: jwt.sign({
      email: req.body["email"]
    }, jwtSecret, {
      expiresIn: req.body["expiry"] || "30m"
    })
  })
});

app.get("/dump", function(req, res, next) {
  res.json(db.dump());
});

// "Authentication" middleware
//   - Access tokens need to be passed in HTTP Authorization header as they were received from /login
var decodeToken = function(tokenString) {
  try {
    return jwt.verify(tokenString, jwtSecret);
  } catch(e) {
    return null;
  }
}
app.use(function(req, res, next) {
  req.token = decodeToken(req.headers["authorization"]);
  if(!req.token) {
    return res.status(401).json({error: "Access token invalid or couldn't be parsed. Please log in using /login."});
  }
  next();
});

app.get("/oAuthClients", function(req, res) {
  res.json({
    oAuthClients: db.getClients(req.token.email)
  });
});

app.get("/oAuthClients/:clientId/users", function(req, res) {
  var limit = parseInt(req.query.limit) || 25,
      offset = parseInt(req.query.offset) || 0;
  res.json({
    users: db.getUsers(req.token.email, req.params.clientId).slice(offset, offset+limit)
  });
});

app.put("/oAuthClients/:clientId", function(req, res) {
  res.json({
    client: db.updateClient(req.token.email, req.params.clientId, req.body)
  });
});


app.get("/", function(req, res) {
  res.json({
    "message": "The API is alive and your access token is valid :)",
    "token": req.token
  });
});

// We clean up data that hasn't been accessed in the last hour every minute or so to prevent
// applicants from (accidentally) nuking our dyno
setInterval(function(){
  db.reap(new Date(Date.now() - 60 * 60 * 1000));
}, 60 * 1000);

app.listen(process.env.PORT || 3000, function () {
  console.log('Example app listening on port 3000!');
});
