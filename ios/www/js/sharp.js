var doc = document;

var clickEvent =  'ontouchstart' in window ? 'touchend' : 'click';

var  Board = doc.querySelector('.board');
var chesses = [];
var history = [];

//游戏选项
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
    array : [[null,null,null],[null,null,null],[null,null,null]]
};

function init(){
    sta.step = 0;
    sta.array = [[null,null,null],[null,null,null],[null,null,null]];
    render();
}

function initChess(){
    for(var i=0; i<9; i++){
        chesses[i] = Chess.create();
        chesses[i].setStyle("left", chesses[i].id % 3 * 101 + "px");
        chesses[i].setStyle("top", parseInt(chesses[i].id / 3, 10) * 101 + "px");
    }
}

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

    putChess(sta.turn.value,{x:_v1,y:_v2})
},false);

function comTurn(){
	if(sta.turn.type !== 'computer'){return false;}
    var _max = 0;
    var _putsArray = [];
    var _puts = findPuts();

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
    putChess('x',{x:_x,y:_y});
}



function putChess(type,coord){
    var array = sta.array;
    array[coord.x][coord.y] = type;
    next();
    history.push(coord);
}


//每个格都有权重分配
//查找自己能够获胜的点 权重分配为 ＋40
//查找对方能够获胜的点 权重分配为 ＋18
//能为自己连成2个点并且可以获胜 权重 ＋3
//有获胜希望的 权重 ＋1
//能够阻止对方连成2个点 并有获胜希望的 权重 ＋2
function findPuts(){
    var array = sta.array;
    var wight_array = [[0,0,0],[0,0,0],[0,0,0]];
    for(var i=0;i<array.length;i++){
        for(var j=0;j<array.length;j++){
            if(array[i][j] !== null ){continue;}

            var x1 = array[i][(j+1)%3],x2 = array[i][(j+2)%3],
            y1 = array[(i+1)%3][j],y2 = array[(i+2)%3][j],
            o1,o2,o3,o4;
            o1 = o2 = o3 = o4 = undefined;

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
                if(x1=='x'){
                    wight_array[i][j] += 40;
                }else{
                    wight_array[i][j] += 18;
                    // console.log(i + ',' + j);
                }
            }

            if(y1 == y2 && y1 !== null){
                if(y1 == 'x'){
                    wight_array[i][j] += 40;
                }else{
                    wight_array[i][j] += 18;
                    // console.log(i + ',' + j);
                }
            }

            if( (x1 !== null && x2 == null) || (x1 == null && x2 !== null) ){
                if(x1 == 'x' || x2 == 'x'){
                    wight_array[i][j] += 3;
                }else{
                    wight_array[i][j] += 2;
                }
            }

            if( (y1 !== null && y2 == null) || (y1 == null && y2 !== null) ){
                if(x1 == 'x' || x2 == 'x'){
                    wight_array[i][j] += 3;
                }else{
                    wight_array[i][j] += 2;
                }
            }

            if( x1 == null && x2 == null ){
                wight_array[i][j] += 1;
            }

            if( y1 == null && y2 == null ){
                wight_array[i][j] += 1;
            }

            if(o1 !== undefined){
                if(o1 == o2 && o1 !== null){
                    if(o1=='x'){
                        wight_array[i][j] += 40;
                    }else{
                        wight_array[i][j] += 18;
                        // console.log(i + ',' + j);
                    }
                }
                if( (o1 !== null && o2 == null) || (o1 == null && o2 !== null) ){
                    if(o1 == 'x' || o2 == 'x'){
                        wight_array[i][j] += 3;
                    }else{
                        wight_array[i][j] += 2;
                    }
                }
                if( o1 == null && o2 == null ){
                    wight_array[i][j] += 1;
                }
            }

            if(o3 !== undefined){
                if(o3 == o4 && o3 !== null){
                    if(o3=='x'){
                        wight_array[i][j] += 40;
                    }else{
                        wight_array[i][j] += 18;
                    }
                }
                if( (o3 !== null && o4 == null) || (o3 == null && o4 !== null) ){
                    if(o3 == 'x' || o4 == 'x'){
                        wight_array[i][j] += 3;
                    }else{
                        wight_array[i][j] += 2;
                    }
                }
                if( o3 == null && o4 == null ){
                    wight_array[i][j] += 1;
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

    //当步骤为8的时候 移除一个。
    // if(step >= 8){
    //     var _coord = history[step-8];
    //     array[_coord.x][_coord.y] = null;
    // }

    render();

    var finish = judgeWin();
    if(!!finish){
        setTimeout(function(){
            init();
        },1000);
    	return;
    }

    if(sta.turn == options.roles.p1){
        sta.turn = options.roles.p2;

    }else{
        sta.turn = options.roles.p1;
    }

    if(sta.turn.type == 'computer'){
        setTimeout(function(){
             comTurn();
        },500);
    }


    // if(turn == 'p1'){
    //     turn = 'p2';
    //     setTimeout(function(){
    //         comTurn();
    //     },500);
    // }else{
    //     turn = 'p1';
    // }
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

    if(sta.step >=9 || hasWiner ){
    	if(!!winner){
            if(winner == 'o'){
                //document.getElementById('info').innerHTML = '你赢了:)';
            }else{
                //document.getElementById('info').innerHTML = '你输了:(';
            }
    	}else{
            //document.getElementById('info').innerHTML = '平局!';
    	}
    	finished = true;
    }
    return finished;
}



initChess();
init();