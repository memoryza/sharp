var doc = document;

var clickEvent =  'ontouchstart' in window ? 'touchend' : 'click';

var  Board = doc.querySelector('.board');
var Chesses = doc.querySelectorAll('.chess');

var array,step,turn;
function init(){
    array = [[null,null,null],[null,null,null],[null,null,null]];
    step = 0;
    render();
    turn = 'human';
}

init();

Board.addEventListener(clickEvent,function(e){
 if(turn !== 'human'){return false;}

    var _target = e.target;

    // if(_target.classList.contains(''))



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

    console.log(x + ',' + y);

    var w,h;
    w = Board.clientWidth;
    h = Board.clientHeight;

    var _v1 = ~~(y/h*3);
    var _v2 = ~~(x/w*3);

    if(!array[_v1]){return false;}
    if(array[_v1][_v2] !== null){return false;}
    array[_v1][_v2] = 'you';
    next();
},false);

function comTurn(){
	if(turn !== 'computer'){return false;}
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
    array[_x][_y] = 'com';
    next();
}



//每个格都有权重分配
//查找自己能够获胜的点 权重分配为 ＋40
//查找对方能够获胜的点 权重分配为 ＋18
//能为自己连成2个点并且可以获胜 权重 ＋3
//有获胜希望的 权重 ＋1
//能够阻止对方连成2个点 并有获胜希望的 权重 ＋2
function findPuts(){
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
                if(x1=='com'){
                    wight_array[i][j] += 40;
                }else{
                    wight_array[i][j] += 18;
                    // console.log(i + ',' + j);
                }
            }

            if(y1 == y2 && y1 !== null){
                if(y1 == 'com'){
                    wight_array[i][j] += 40;
                }else{
                    wight_array[i][j] += 18;
                    // console.log(i + ',' + j);
                }
            }

            if( (x1 !== null && x2 == null) || (x1 == null && x2 !== null) ){
                if(x1 == 'com' || x2 == 'com'){
                    wight_array[i][j] += 3;
                }else{
                    wight_array[i][j] += 2;
                }
            }

            if( (y1 !== null && y2 == null) || (y1 == null && y2 !== null) ){
                if(x1 == 'com' || x2 == 'com'){
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
                    if(o1=='com'){
                        wight_array[i][j] += 40;
                    }else{
                        wight_array[i][j] += 18;
                        // console.log(i + ',' + j);
                    }
                }
                if( (o1 !== null && o2 == null) || (o1 == null && o2 !== null) ){
                    if(o1 == 'com' || o2 == 'com'){
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
                    if(o3=='com'){
                        wight_array[i][j] += 40;
                    }else{
                        wight_array[i][j] += 18;
                    }
                }
                if( (o3 !== null && o4 == null) || (o3 == null && o4 !== null) ){
                    if(o3 == 'com' || o4 == 'com'){
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

    // console.log('=============')
    // console.log(wight_array[0]);
    // console.log(wight_array[1]);
    // console.log(wight_array[2]);

    return wight_array;
}

function render(){
    for(var i=0;i<array.length;i++){
        for(var j=0;j<array[i].length;j++){
            var _chess = Chesses[i*3 + j];
            if(array[i][j] !== null ){
                if(array[i][j] == 'you'){
                    _chess.classList.remove('x');
                    _chess.classList.add('o');
            	}else{
                    _chess.classList.remove('o');
                    _chess.classList.add('x');
            	}
            }else{
                _chess.classList.remove('o');
                _chess.classList.remove('x');
            }
        }
    }

}

function next(){
	render();
    step++;
    var finish = judgeWin();
    if(!!finish){
    	init();
    	return;
    }
    if(turn == 'human'){
        turn = 'computer';
        comTurn();
    }else{
        turn = 'human';
        console.log('wait for human!');
    }
}

function judgeWin(){
	if(step < 4){return;}
	var winner;
	var hasWiner = false;
	var finished = false;

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

    if((step >= 9 && !hasWiner) || hasWiner ){
    	if(!!winner){
            if(winner == 'you'){
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


//
doc.querySelector('.board').addEventListener('touchend',function(){});




//<----------------- cube class
// var Cube;
// ;(function(exports){

//     exports.count = 0;
//     exports.top = null;      //the first cube in the square
//     exports.bottom = null;   //the last cube in the square

// })(Cube)
//cube class------------------->
