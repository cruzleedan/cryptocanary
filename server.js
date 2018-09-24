// //Install express server
// const express = require('express');
// const path = require('path');

// const app = express();

// // Serve only the static files form the dist directory
// app.use(express.static(__dirname + '/dist/cryptocanary'));

// app.get('/*', function (req, res) {

//   res.sendFile(path.join(__dirname + '/dist/cryptocanary/index.html'));
// });

// // Start the app by listening on the default Heroku port
// app.listen(process.env.PORT || 8080);

var server = require('auth-static')

server({
    options: {
        cache: 3600,
        gzip: true
    },
    password: process.env.PASSWORD,
    port: 1234,
    realm: 'Private',
    root: path.join(__dirname + '/dist/cryptocanary/index.html'),
    username: process.env.USERNAME
})
