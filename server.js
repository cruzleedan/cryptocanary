//Install express server
const express = require('express');
const path = require('path');

const app = express();

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/cryptocanary'));

// middleware
//basic authentication for the prototype
var basicAuth = require('basic-auth');

var auth = function (req, res, next) {
  if (cfg.env === 'development') {
    return next();
  }

  function unauthorized(res) {
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.send(401);
  }

  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return unauthorized(res);
  }

  if (user.name === cfg.basicAuth.user && user.pass === cfg.basicAuth.pass) {
    return next();
  } else {
    return unauthorized(res);
  }
};

app.use(auth());

app.get('/*', function (req, res) {

  res.sendFile(path.join(__dirname + '/dist/cryptocanary/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
