
// document.addEventListener('deviceready', onDeviceReady, false);

// function onDeviceReady(){
//     navigator.notification.confirm(
//                 'If you enjoy using ###, whould you mind taking a moment to rate it? It won\'t take more than a minute. Thanks for your support!',
//                 function(button) {
//                     // yes = 1, no = 2, later = 3
//                     if (button == '1') {    // Rate Now

//                         // <a href="https://itunes.apple.com/cn/app/mei-tao-jiahd/id591302737?mt=8&uo=4" target="itunes_store">美淘家HD - QIU GUISHUN</a>
//                         // window.open('itms-apps://itunes.apple.com/zh/app/mei-tao-jia/id605274602?ls=1&mt=8','_system'); // or itms://
//                         window.open('https://itunes.apple.com/cn/app/mei-tao-jia/id605274602?mt=8&uo=4','_system'); // or itms://
//                         // this.core.rate_app = false;
//                     } else if (button == '2') { // Later
//                         // this.core.rate_app_counter = 0;
//                     } else if (button == '3') { // No
//                         // this.core.rate_app = false;
//                     }
//     }, 'Rate ###', 'Rate ###,Remind me later, No Thanks!');
// }


var doc = document;

var clickEvent =  'ontouchstart' in window ? 'touchend' : 'click';

var Board = doc.querySelector('.board'),
    singleBtn,
    multiBtn,
    soundBtn;
var chesses = [];
var HOST = 'http://localhost:9090'

var SOCKET;

var img = [],
    imgNames = [
        "sprite"
    ],
    sound = [],
    soundNames = [
        'cow'
    ];



//go with HTML5 audio
soundManager.useHTML5Audio = true;
soundManager.preferFlash = false;

// 游戏选项
// endLess : 是不是无尽模式
// roles
//    type : 'people','computer','net-friend'
var options = {
    endLess : false,
    roles : {
        p1 : {
            type : 'people',
            name : 'p1',
            value : 'o'
        },
        p2 : {
            type : 'people',
            name : 'p2',
            value : 'x'
        }
    }
};


//棋盘的状态
var sta = {
    step : 0,
    round : 0,
    history : [],
    turn : options.roles.p1,
    offensive : options.roles.p1,
    array : [[null,null,null],[null,null,null],[null,null,null]],
    timer : 0,
    times : 0
};


//程序初始化
function init(){
    bindEvents();
    startTiming();
}

function bindEvents(){
    var _option = doc.getElementById('option');

    var _startWithType = function(type){
        _option.style.display = 'none';
        options.roles.p2.type = type;

        if(type == 'net-friend' && SOCKET == undefined){
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if(xhr.readyState === 4){
                    var key = xhr.responseText;
                    SOCKET = io.connect( HOST + '/' + key);
                    SOCKET.on('next',function(data){
                        console.log(data);
                        putChess(data.type,data.coord);
                        render();
                    });
                    start();
                }
            };
            xhr.open('GET', HOST + '/applyKey');
            xhr.send(null);  
            return;          
        }
        start();
    }

    doc.getElementById('option_1').addEventListener(clickEvent,function(){
        _startWithType('computer');
    },false);

    doc.getElementById('option_2').addEventListener(clickEvent,function(){
       _startWithType('people');
    },false);

    doc.getElementById('option_3').addEventListener(clickEvent,function(){
        _startWithType('net-friend');
    },false);


    Board.addEventListener(clickEvent,function(e){
        if(sta.turn.type !== 'people'){return false;}
        var array = sta.array;

        var _target = e.target;
        var x,y;
        e = e.changedTouches ? e.changedTouches[0] : e;
        if (e.pageX || e.pageY) { 
          x = e.pageX;
          y = e.pageY;
        }else { 
          x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
          y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
        } 
        x -= Board.offsetLeft;
        y -= Board.offsetTop;

        var w,h;
        w = Board.clientWidth;
        h = Board.clientHeight;

        var _v1 = ~~(y/h*3);
        var _v2 = ~~(x/w*3);

        if(!array[_v1]){return false;}
        if(array[_v1][_v2] !== null){chesses[_v1*3 + _v2].shake(); return false;}

        if(!!SOCKET){
            SOCKET.emit('next', { type: sta.turn.value , coord : {x:_v1,y:_v2} });
        }

        putChess(sta.turn.value,{x:_v1,y:_v2});
    },false);

}


//开始计时
function startTiming(){
    var nextFrame = (function () {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                return setTimeout(callback, 1);
            };
    })();

    var cancelFrame = (function () {
        return window.cancelRequestAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            clearTimeout;
    })();

    var start = Date.now();

    var step = function(){
        var _now = Date.now();

        if(_now - start > 1000){
            sta.timer++;
            start = _now;
            document.getElementById('infos').innerHTML = sta.timer;
        }
        nextFrame(step);
    };

    step();
}

//开局
function start(){
    sta.step = 0;
    sta.array = [[null,null,null],[null,null,null],[null,null,null]];
    sta.offensive = sta.round % 2 == 0 ? options.roles.p1 : options.roles.p2;
    sta.turn = sta.offensive;
    sta.history = [];
    sta.timer = 0;

    if(sta.turn.type == 'people'){
        console.log('wait for start!');
    }else if(sta.turn.type == 'computer'){
        comTurn();
    }else if(sta.turn.type == 'net-friend'){
        console.log('wait your net net-friend');
    }
    render();
}


//init loading images&sounds
function initLoader(callback){
    var loader = new PxLoader();
    var i, len, url;

    // queue each sound for loading
    for(i=0, len = soundNames.length; i < len; i++) {

        // see if the browser can play m4a
        url = 'sound/' + soundNames[i] + '.mp3';
        if (!soundManager.canPlayURL(url)) {
            // ok, what about ogg?
            url = 'sound/' + soundNames[i] + '.aac';
            if (!soundManager.canPlayURL(url)) {
                continue; // can't be played
            }
        }

        // queue the sound using the name as the SM2 id
        loader.addSound(soundNames[i], url);
    }

    var imgHolder;
    //queue each image for loading
    for(var n=0, nmax = imgNames.length; n<nmax; n++){
        imgHolder = new PxLoaderImage("img/"+ imgNames[n] + ".png");
        imgHolder.name = imgNames[n];
        loader.add(imgHolder);
    }

    // listen to load events
    loader.addProgressListener(function(e) {
        if(e.resource.sound){
            var soundId = e.resource.sound.sID;
            console.log("sound " + soundId + " loaded");
            sound[soundId] = function(){
                var id = soundId;
                return {
                    play : function(){
                        soundManager.play(id, {
                            onfinish: function() {
                                //sound[soundId].play();
                            }
                        });
                    }
                }
            }();
        }
        else if(e.resource.img){
            var imgId = e.resource.name;
            console.log("image " + e.resource.name + " loaded");
            img[imgId] = e.resource.img;
        }
    });

    // callback that will be run once images are ready
    loader.addCompletionListener(function() {
        callback && callback();
    });

    loader.start();

}


function initChess(){
    initLoader(function(){
        //button a t start
        singleBtn = Chess.create({
            kind:"single",
            parent:$(".option").get(0)

        });
        
        mulitBtn = Chess.create({
            kind:"mulit",
            parent:$(".option").get(0)

        });
        
        soundBtn = Chess.create({
            kind:"sound",
            parent:$(".option").get(0)

        });




        //vs model chess
        for(var i=0; i<9; i++){
            chesses[i] = Chess.create();
            chesses[i].setStyle("left", chesses[i].id % 3 * 214 + "px");
            chesses[i].setStyle("top", parseInt(i / 3, 10) * 214 + "px");
        }
       
    })
}


function comTurn(){
	if(sta.turn.type !== 'computer'){return false;}
    var _max = 0;
    var _putsArray = [];
    var _puts = findPuts(sta.turn.value);

    for(var i=0;i<_puts.length;i++){
        for(var j=0;j<_puts.length;j++){
            if(_puts[i][j] > _max ){
                _max = _puts[i][j];
                _putsArray = [];
            }
            if(_puts[i][j] == _max){
                _putsArray.push(i + ',' + j);
            }
        }
    }


    var num = Math.floor(Math.random()*_putsArray.length);
    var _x = ~~_putsArray[num].split(',')[0],
    _y = ~~_putsArray[num].split(',')[1];
    putChess(sta.turn.value,{x:_x,y:_y});
}

function putChess(type,coord){
    var array = sta.array;
    array[coord.x][coord.y] = type;
    next();
    sta.history.push(coord);
}


//每个格都有权重分配
//查找自己能够获胜的点 权重分配为 ＋40
//查找对方能够获胜的点 权重分配为 ＋18
function findPuts(value){
    var array = sta.array;
    var _v = value ;  
    var wight_array = [[0,0,0],[0,0,0],[0,0,0]];
    for(var i=0;i<array.length;i++){
        for(var j=0;j<array.length;j++){
            if(array[i][j] !== null ){continue;}
            var x1 = array[i][(j+1)%3],x2 = array[i][(j+2)%3],
            y1 = array[(i+1)%3][j],y2 = array[(i+2)%3][j],
            o1,o2,o3,o4;
            o1 = o2 = o3 = o4 = undefined;

            wight_array[i][j]+=1;

            if(i == 0 && j == 0){
                o1 = array[1][1];
                o2 = array[2][2];
            }

            if(i == 1 && j == 1){
                o1 = array[0][0];
                o2 = array[2][2];
                o3 = array[0][2];
                o4 = array[2][0];
            }

            if(i == 2 && j == 2){
                o1 = array[0][0];
                o2 = array[1][1];
            }

            if(i == 0 && j == 2){
                o1 = array[2][0];
                o2 = array[1][1];
            }

            if(i == 2 && j == 0){
                o1 = array[0][2];
                o2 = array[1][1];
            }

            if(x1==x2 && x1 !== null){
                if(x1==_v){
                    wight_array[i][j] += 40;
                }else{
                    wight_array[i][j] += 18;
                }
            }

            if(y1 == y2 && y1 !== null){
                if(y1 == _v){
                    wight_array[i][j] += 40;
                }else{
                    wight_array[i][j] += 18;
                }
            }

            if(o1 !== undefined){
                if(o1 == o2 && o1 !== null){
                    if(o1==_v){
                        wight_array[i][j] += 40;
                    }else{
                        wight_array[i][j] += 18;
                    }
                }
            }

            if(o3 !== undefined){
                if(o3 == o4 && o3 !== null){
                    if(o3==_v){
                        wight_array[i][j] += 40;
                    }else{
                        wight_array[i][j] += 18;
                    }
                }
            }

        }
    }
    return wight_array;
}

function render(){

    for(var i=0;i<sta.array.length;i++){
        for(var j=0;j<sta.array[i].length;j++){
            var _chess = chesses[i*3 + j];
            if(sta.array[i][j] !== null ){
                if(sta.array[i][j] == 'o'){
                    _chess.setO();
            	}else{
                    _chess.setX();
            	}
            }else{
                _chess.setW();
            }
        }
    }

}

function next(){
    sta.step++;
    render();
    var finish = judgeWin();
    if(!!finish){
        //game over and start again!
        setTimeout(function(){
            sta.round++;
            start();
        },500)
        return;
    }

    if(sta.step >= 6){
        var _coord = sta.history[sta.step -6];
        var _chess = chesses[_coord.x*3 + _coord.y];
        _chess.rock();
    }

    //当步骤为8的时候 移除一个。
    if(sta.step >= 7){
        var _coord = sta.history[sta.step-7];
        sta.array[_coord.x][_coord.y] = null;
        render();
    }

    sta.turn = sta.turn == options.roles.p1 ?  options.roles.p2 :  options.roles.p1;

    if(sta.turn.type == 'computer'){
        setTimeout(function(){
             comTurn();
        },500);
    }
    // render();
}

function judgeWin(){
	if(sta.step < 4){return;}
	var winner;
	var hasWiner = false;
	var finished = false;
    var array = sta.array;

    for(var i=0;i<array.length;i++){
        for(var j=0;j<array[i].length;j++){
            if(array[i][j] == null){continue;}

            if(array[i][j%3] == array[i][(j+1)%3] && array[i][(j+1)%3]  == array[i][(j+2)%3] ){
                winner = array[i][j];
                hasWiner = true;
                break;
            }

            if(array[i%3][j] == array[(i+1)%3][j] &&  array[(i+1)%3][j]  ==  array[(i+2)%3][j] ){
                winner = array[i][j];
                hasWiner = true;
                break;
            }
        }
    }

	if(array[0][0] && array[0][0] == array[1][1] && array[1][1]  == array[2][2]){
        winner = array[0][0];
        hasWiner = true;
	}

    if(array[2][0] && array[2][0] == array[1][1] && array[1][1]  == array[0][2]){
        winner = array[2][0];
        hasWiner = true;
    }

    if(hasWiner){
    	finished = true;
    }
    return finished;
}

soundManager.onready(function() {
    initChess();
});

init();