
//<----------------- Chess class
var Chess = Chess || {};
(function(exports){

    exports.count = 0;
    exports.first = null;      //the first Chess in the square
    exports.last = null;   //the last Chess in the square
    exports.chesses = [];
    "setX setO setW shake rock stopRock setXBlank setXNormal setWBlank setWNormal setOBlank setONormal".split(" ").forEach(function(name){
        exports[name] = function(){
            exports.chesses.forEach(function(chess){
                chess[name]();
            })
        }
    })

    exports.create = function(param){
        var newChess = Object.create(chessFn);
        var def = {
            id:null,
            turnoverFn:null,
            elem:null,
            kind:"",
            status:"w",
            parent:$(".board").get(0),
            template:'<div class="chess"><div class="shadow animated"></div><div class="trig animated hinge"><div class="rotate animated"><div class="faceO face"></div><div class="faceX face"></div><div class="faceW face"></div></div></div></div>'
        };
        $.extend(def, param);
        $.extend(newChess, def);
        newChess.init();
        //record the first and the last one
        if(exports.count === 0){
            exports.first = newChess;
        }
        else{
            exports.last = newChess;
        }
        exports.chesses.push(newChess);
        newChess.id = exports.count;
        exports.count++;
        return newChess;
    }

    var chessFn = {
        init:function(){
            var that = this;
            this.elem = $(this.template).get(0);

            if(this.kind){
                $(this.elem).addClass(this.kind);
            }
            this.shadowElem = $(this.elem).find(".shadow").get(0);
            this.rotateElem = $(this.elem).find(".rotate").get(0);
            this.xElem = $(this.elem).find(".faceX").get(0);
            this.oElem = $(this.elem).find(".faceO").get(0);
            this.wElem = $(this.elem).find(".faceW").get(0);


            $(this.elem).on("webkitTransitionEnd", function(){
                that._transitionend();
            })
            //animationend
            $(this.elem).on("webkitAnimationEnd", function(){
                that._animationend();
            })

            $(this.parent).append(this.elem);
        },
        setStyle:function(){
            var __elem = $(this.elem);
            __elem.css.apply(__elem, arguments);
        },
        clearAnim:function(){
            $(this.elem)
            .removeClass("rockO")
            .removeClass("rockX")
            .removeClass("o2w")
            .removeClass("o2x")
            .removeClass("x2w")
            .removeClass("x2o")
            .removeClass("w2x")
            .removeClass("w2o");

            $(this.rotateElem)
            .removeClass("infinite");
        },
        setXBlank:function(){
            $(this.xElem).addClass("blank");
        },
        setXNormal:function(){
            $(this.xElem).removeClass("blank");
            // console.log("setXNormal");
        },
        setWBlank:function(){
            $(this.wElem).addClass("blank");
        },
        setWNormal:function(){
            $(this.wElem).removeClass("blank");
        },
        setOBlank:function(){
            $(this.oElem).addClass("blank");
        },
        setONormal:function(){
            $(this.oElem).removeClass("blank");
        },
        setX:function(callback){
            if(!(this.status === "x")){
                this.showShadow();
                this.clearAnim();
            }
            else{
                callback && callback();
            }
            if(this.status === "w"){
                $(this.elem).addClass("w2x");
            }
            else if(this.status === "o"){
                $(this.elem).addClass("o2x");
            }
            this.turnoverFn = callback;
            this.status = "x";
            this._setStaticClass();
        },
        setO:function(callback){
            if(!(this.status === "o")){
                this.showShadow();
                this.clearAnim();
            }
            else{
                callback && callback();
            }
            if(this.status === "w"){
                $(this.elem).addClass("w2o");
            }
            else if(this.status === "x"){
                $(this.elem).addClass("x2o");
            }
            this.turnoverFn = callback;
            this.status = "o";
            this._setStaticClass();
        },
        setW:function(callback){
            if(!(this.status === "w")){
                this.showShadow();
                this.clearAnim();
            }
            else{
                callback && callback();
            }
            if(this.status === "x"){
                $(this.elem).addClass("x2w");
            }
            else if(this.status === "o"){
                $(this.elem).addClass("o2w");
            }
            this.turnoverFn = callback;
            this.status = "w";
            this._setStaticClass();
        },
        rock:function(){
            $(this.rotateElem).addClass("infinite");
            if(this.status === "x"){
                $(this.elem).addClass("rockX");
            }
            else if(this.status === "o"){
                $(this.elem).addClass("rockO");
            }
        },
        stopRock:function(){
            $(this.rotateElem).removeClass("infinite");
            $(this.elem).removeClass("rockX");
            $(this.elem).removeClass("rockO");
        },
        shake:function(){
            this.showShadow();
            $(this.elem).addClass("shake");
        },
        _setStaticClass:function(){
            var that =this;
            $(that.elem).removeClass("x").removeClass("o");
            if(that.status === "x"){
                $(that.elem).addClass("x");
            }
            else if(that.status === "o"){
                $(that.elem).addClass("o");
            }
            
        },
        _transitionend:function(){

        },
        _animationend:function(){
            $(this.elem).removeClass("shake");
            this._setStaticClass();
            var that = this;


            if($(this.shadowElem).hasClass("flash")){
                this.hideShadow();
            }

            setTimeout(function(){
                that.clearAnim();
                if(that.turnoverFn){
                    that.turnoverFn && that.turnoverFn();
                    delete that.turnoverFn;
                }
            }, 0)
        },
        showShadow:function(){
            $(this.shadowElem).addClass("flash");
            this.setStyle("-webkit-transform", "translateZ(1000px)");
        },
        hideShadow:function(){
            $(this.shadowElem).removeClass("flash");
            this.setStyle("-webkit-transform", "translateZ(0px)");
        }
    }

})(Chess)
//cube class------------------->
