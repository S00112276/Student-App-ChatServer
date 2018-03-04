let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);
const mongo = require('mongodb').MongoClient;

mongo.connect('mongodb://Breakpoint:breakpoint@breakpoint-shard-00-00-ti5q0.mongodb.net:27017,breakpoint-shard-00-01-ti5q0.mongodb.net:27017,breakpoint-shard-00-02-ti5q0.mongodb.net:27017/breakpoint?ssl=true&replicaSet=Breakpoint-shard-0&authSource=admin', function (err, db) {
  if (err) {
    throw err;
  }

  io.on('connection', (socket) => {
    let chat = db.collection('chats');

    console.log('User Connected...');

    socket.on('retrieve-history', function (data) {

      // Get chats from mongo collection 
      chat.find().limit(100).sort({ _id: 1 }).toArray(function (err, res) {
        if (err) {
          throw err;
        }
      data(res);        
      });

    });

    socket.on('disconnect', function () {
      io.emit('users-changed', { user: socket.username, event: 'left' });
    });

    socket.on('set-username', (username) => {
      socket.username = username;
      io.emit('users-changed', { user: username, event: 'joined' });
    });

    socket.on('add-message', (message) => {
      io.emit('message', { text: message.text, from: socket.username, created: new Date() });

      chat.insert({ text: message.text, from: socket.username, created: new Date() }, () => {
      });
    });
  });

  var port = process.env.PORT || 3001;

  http.listen(port, function () {
    console.log('listening in http://localhost:' + port);
  });
});