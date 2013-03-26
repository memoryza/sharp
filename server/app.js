
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io');
var io = socket.listen(server);
var port = 9090;

//static server
app.use(express.static( __dirname + '/../ios/www'));

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('next',function(data){
  	console.log(this);
  	console.log(data);
  });
});



//房间
var rooms = [];

//申请房间钥匙
app.get('/applyKey',function(req,res){
	var key = _getKey();
	res.send(key);
});

function _getKey(){
	var key = Date.now().toString(36);

	var chat = io
  	.of('/' + key)
  	.on('connection', function (socket) {
    socket.emit('a message', {
        that: 'only'
      , '/chat': 'will get'
    });
    chat.emit('a message', {
        everyone: 'in'
      , '/chat': 'will get'
    });
    socket.on('next',function(data){
    	console.log(data);
    });

  });

	return key;
}


server.listen(port);
console.log('sever start at:' + port);



