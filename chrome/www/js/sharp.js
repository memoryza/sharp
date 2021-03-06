
var doc = document;

var clickEvent =  'ontouchstart' in window ? 'touchend' : 'click';

var  Board = doc.querySelector('.board');
var chesses = [];
var HOST = 'http://localhost:9090'

var SOCKET,
    touchSwitch = true;
    state = {
        sound : "on"
    };

var img = [],
    imgNames = [
        "sprite"
    ],
    sound = [],
    soundNames = "";

// 监测是否已经准备好了？
// var ready;

//go with HTML5 audio
soundManager.useHTML5Audio = true;
soundManager.preferFlash = false;
soundManager.defaultOptions.multiShot = true;


// 游戏选项
var options = {
    endLess : false, //是否为无尽模式
    roles : {
        p1 : {
            type  : 'people', //['people','computer','net-friend']
            name  : 'p1',
            value : 'o',
            win   : 0,        //获胜次数
            lose  : 0         //失败次数
        },
        p2 : {
            type  : 'people',
            name  : 'p2',
            value : 'x',
            win   : 0,
            lose  : 0
        }
    }
};


//棋盘的状态
var sta;

//程序初始化
function init(){
    resetSta();
    bindEvents();
}

function initBattleHidden(callback){
    $("#turnTips").removeClass("show");
    $("#back").removeClass("show");
    //let X face blank first
    chesses.forEach(function(chess, i){
        chess.setX(function(){
            if(i >= chesses.length -1){
                callback && callback();
            }
        });
        chess.setXBlank();
    })
}

function initBattleShow(callback){
    checkTipsStatusByTurn();
    $("#turnTips").addClass("show");
    $("#back").addClass("show");
    //let X face blank first
    chesses.forEach(function(chess, i){
        setTimeout(function(){
            chess.setW(function(){
                chess.setXNormal();
                if(i >= chesses.length -1){
                    callback && callback();
                }
            }); 
        }, i * 100)
    })
}


function calcWinRace(){
    if(options.roles.p2.win + options.roles.p1.win == 0){
        return 50;
    }
    else{
        return Math.round((options.roles.p1.win/(options.roles.p2.win + options.roles.p1.win))*100);
    }
}

function setBarStatus(status){
    var race = calcWinRace();
    if(race != null){
        $("#turnTips .scorebar").css("width", race + "%").removeClass("none");
    }
    else{
        $("#turnTips .scorebar").addClass("none");
    }
}


function bindEvents(){
    var _option = doc.getElementById('optionbg');

    var _startWithType = function(type){
        _option.style.display = 'none';
        options.roles.p2.type = type;

        options.roles.p1.win = 0;
        options.roles.p1.lose = 0;
        options.roles.p2.win = 0;
        options.roles.p2.lose = 0;


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
        initBattleShow(function(){
            //turn on the play switch
            touchSwitch = true;
            start();
        });
        
    }

    // 点击单人模式
    iTouch({
        element   : doc.getElementById('single'),
        click     : function(e,x,y){
            if(!touchSwitch) return;

            doc.getElementById('board').style.display = '';
            initBattleHidden();

            singleBtn.setO(function(){
                setTimeout(function(){
                    _startWithType('computer');
                }, 100)
                
            })

            setTimeout(function(){
                hideSplit();
            }, 100);
            setTimeout(function(){
                hideMulti();
            }, 200);

            doc.querySelector('#single .btnTips').classList.add('dismiss');

            touchSwitch = false;
        }
    });

    // 点击双人模式
    iTouch({
        element   : doc.getElementById('multi'),
        click     : function(e,x,y){
            if(!touchSwitch) return;
            doc.getElementById('board').style.display = '';
            initBattleHidden();

            multiBtn.setO(function(){
                setTimeout(function(){
                    _startWithType('people');
                }, 100)
            });

            setTimeout(function(){
                hideSplit();
            }, 100);
            setTimeout(function(){
                hideSingle();
            }, 200);

            doc.querySelector('#multi .btnTips').classList.add('dismiss');
            touchSwitch = false;
        }
    });


    // 返回按钮
    iTouch({
        element   : doc.getElementById('back'),
        click     : function(e,x,y){
            if(!touchSwitch) return;
                        resetSta();
                        initBattleHidden(function(){
                            doc.getElementById('board').style.display = 'none';
                            _option.style.display = 'block';
                            setTimeout(function(){
                                if(options.roles.p2.type === "computer"){
                                    showMulti();
                                    $("#single .btnTips").removeClass("dismiss");
                                    singleBtn.setW();
                                }
                                else{
                                    showSingle();

                                    $("#multi .btnTips").removeClass("dismiss");
                                    multiBtn.setW();
                                }
                                setTimeout(function(){
                                    showSplit();
                                }, 100);
                                setTimeout(function(){
                                    showSound();
                                    touchSwitch = true;
                                }, 200);
                            }, 100)
                        });
            touchSwitch = false;
        }       
    });
    
    // 棋盘
    iTouch({
        element   : Board,
        click     : function(e,x,y){
            if(sta.turn.type !== 'people'){return false;}
            // 当棋局完成后禁止点击
            if(!!sta.roundOver){return;}

            if(!touchSwitch){
                 console.log('sorry :( u have to wait!');
             }else{
                clickBoard(e,x,y);
            }
        }
    });
}


// 重置sta
function resetSta(){
    sta = {
        step : 0,
        round : 0,
        roundOver : false,
        history : [],
        turn : options.roles.p1,
        offensive : options.roles.p1,
        array : [[null,null,null],[null,null,null],[null,null,null]],
        timer : 0,
        times : 0
    };

    Board.classList.remove('x');
    Board.classList.add('o');
}

function checkTipsStatusByTurn(){
    setBarStatus(sta.turn.value);
}

// 点击面板
function clickBoard(e,x,y){

    var array = sta.array;
    var _target = e.target;
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
}


//开局
function start(){
    sta.step = 0;
    sta.roundOver = false;
    sta.array = [[null,null,null],[null,null,null],[null,null,null]];
    sta.offensive = sta.round % 2 == 0 ? options.roles.p1 : options.roles.p2;
    sta.turn = sta.offensive;
    sta.history = [];
    sta.timer = 0;
    sta.times++;

    setBoardClass(sta.turn.value);

    if(sta.turn.type == 'people'){
        console.log('wait for start!');
        render();
    }else if(sta.turn.type == 'computer'){
        comTurn();
        render();
    }else if(sta.turn.type == 'net-friend'){
        console.log('wait your net net-friend');
    }
    setBarStatus();
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

//<<------option shense

"Sound Split Multi Single".split(" ").forEach(function(name){
    window["hide" + name] = function(){
        $("#" + name.toLowerCase()).css("-webkit-transform", "translateY(" + (name === "Single" ? "-" : "") + "1200px)");
    }
    window["show" + name] = function(){
        $("#" + name.toLowerCase()).css("-webkit-transform", "translateY(0px)");
    }
})

//option shense--------->>


function initChess(){
    initLoader(function(){
        //button a t start
        singleBtn = Chess.create({
            kind:"single",
            parent:$("#singleHold").get(0)
        });
        
        multiBtn = Chess.create({
            kind:"multi",
            parent:$("#multiHold").get(0)

        });
        
        soundBtn = Chess.create({
            kind:"sound",
            parent:$("#soundHold").get(0)

        });

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
    next(checkTipsStatusByTurn);
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

function render(winnerType){
    checkTipsStatusByTurn();
    var callback = function(){
        //touchSwitch = true;
    }


    if(!!winnerType && winnerType == 'o'){
        for(var i=0;i<sta.array.length;i++){
            for(var j=0;j<sta.array[i].length;j++){
                var _chess = chesses[i*3 + j];
                _chess.setO();
            }
        }
    }else if(!!winnerType && winnerType == 'x'){
        for(var i=0;i<sta.array.length;i++){
            for(var j=0;j<sta.array[i].length;j++){
                var _chess = chesses[i*3 + j];
                _chess.setX();
            }
        }
    }else{
        for(var i=0;i<sta.array.length;i++){
            for(var j=0;j<sta.array[i].length;j++){
                var _chess = chesses[i*3 + j],
                    n = i*3 + j;
                if(sta.array[i][j] !== null ){
                    if(sta.array[i][j] == 'o'){
                        _chess.setO( n >= 8 ? callback : null);
                    }else{
                        _chess.setX( n >= 8 ? callback : null);
                    }
                }else{
                    _chess.setW( n >= 8 ? callback : null);
                }
            }
        }
    }
}

function next(callback){
    if(!!sta.roundOver){return;}
    sta.step++;
    var winnerType = judgeWin();
    if(!!winnerType){
        // game over and start again!
        setTimeout(function(){
            sta.round++;
            start();
        },1000);

        sta.roundOver = true;
        render(winnerType);
    }
    else{
        if(sta.step >= 6){
            var _coord = sta.history[sta.step -6];
            var _chess = chesses[_coord.x*3 + _coord.y];
            _chess.rock();
        }

        //当步骤为8的时候 移除一个。
        if(sta.step >= 7){
            var _coord = sta.history[sta.step-7];
            sta.array[_coord.x][_coord.y] = null;
        }

        sta.turn = sta.turn == options.roles.p1 ?  options.roles.p2 :  options.roles.p1;

        setBoardClass(sta.turn.value);

        if(sta.turn.type == 'computer'){
            setTimeout(function(){
                 comTurn();
            },500);
        }       

        render(); 
    }
}

//判断是否已经有人赢了
function judgeWin(){
	if(sta.step < 4){return;}
	var winnerType = null;
	var hasWiner = false;
	var finished = false;
    var array = sta.array;

    for(var i=0;i<array.length;i++){
        for(var j=0;j<array[i].length;j++){
            if(array[i][j] == null){continue;}

            if(array[i][j%3] == array[i][(j+1)%3] && array[i][(j+1)%3]  == array[i][(j+2)%3] ){
                winnerType = array[i][j];
                hasWiner = true;
                break;
            }

            if(array[i%3][j] == array[(i+1)%3][j] &&  array[(i+1)%3][j]  ==  array[(i+2)%3][j] ){
                winnerType = array[i][j];
                hasWiner = true;
                break;
            }
        }
    }

	if(array[0][0] && array[0][0] == array[1][1] && array[1][1]  == array[2][2]){
        winnerType = array[0][0];
        hasWiner = true;
	}

    if(array[2][0] && array[2][0] == array[1][1] && array[1][1]  == array[0][2]){
        winnerType = array[2][0];
        hasWiner = true;
    }

    //当不是无尽模式的时候 还要考虑平局的情况。
    if(hasWiner){
    	finished = true;
        if(options.roles.p1.value === winnerType){
            options.roles.p1.win++;
            options.roles.p2.lose++;
        }else{
            options.roles.p2.win++;
            options.roles.p1.lose++;
        }
    }
    return winnerType;
}

soundManager.onready(function() {
    initChess();
    initBattleHidden();
});

function setBoardClass(c){
    Board.classList.remove('x');
    Board.classList.remove('o');
    Board.classList.add(c);
}

// document.addEventListener('deviceready', init, false);

init();
