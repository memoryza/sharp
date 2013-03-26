
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = 9090;

//static server
app.use(express.static( __dirname + '/../ios/www'));

//房间
var rooms = [];

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

//申请房间钥匙
app.get('/applyKey',function(req,res){
	var key = _getKey();
	res.send(key);
});

function _getKey(){	
	return key;
}

server.listen(port);
console.log('sever start at:' + port);



