
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var socket = require('socket.io');
var io = socket.listen(server);
var port = 9090;

//static server
app.use(express.static( __dirname + '/../ios/www'));

//view engine & view dir
app.set('view engine','jade');
app.set('views',__dirname + '/views');


//房间
var rooms = [];

//申请房间钥匙
app.get('/applyKey',function(req,res){
	var key = _getKey();
	res.send(key);
});

//Browser 
app.get('/r/:key',function(req,res){
  // var key;
  var key = req.params['key'];
  if(!rooms[key]){
    res.send(404, 'Sorry, we cannot find that!');
  }
  res.render('battle',{key:key}); 
});


//取房间钥匙。
function _getKey(){
  //钥匙
	var key = 'K' +  (Date.now() + ~~(Math.random()*1001+ 1000)).toString(36);

	var roomsocket = io
  	.of('/' + key)
  	.on('connection', function (socket) {
      socket.on('next',function(data){
        console.log(data)
        socket.broadcast.emit('next',data);
    });
  });

  rooms[key] = {
    key : key
  };

	return key;
}

server.listen(port);
console.log('sever start at:' + port);



