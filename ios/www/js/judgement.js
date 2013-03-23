
//<----------------- Judgement class
var Judgement = Judgement || {};
(function(exports){

    exports.create = function(param){
        var newObj = Object.create(Fn);
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
        return newObj;
    }

    var Fn = {
        init:function(){
            var that = this;
            this.elem = $$(this.template).get(0);
            this.shadowElem = $$(this.elem).find(".shadow").get(0);

            $$(this.elem).on("webkitTransitionEnd", function(){
                that._transitionend();
            })
            //animationend
            $$(this.elem).on("webkitAnimationEnd", function(){
                that._animationend();
            })

            $$(this.parent).append(this.elem);
        },
        setStyle:function(){
            var __elem = $$(this.elem);
            __elem.style.apply(__elem, arguments);
        },
        clearAnim:function(){
            $$(this.elem)
            .removeClass("o2w")
            .removeClass("o2x")
            .removeClass("x2w")
            .removeClass("x2o")
            .removeClass("w2x")
            .removeClass("w2o");
        },
        setX:function(){
            if(!(this.status === "x")){
                this.showShadow();
                this.clearAnim();
            }
            if(this.status === "w"){
                $$(this.elem).addClass("w2x");
            }
            else if(this.status === "o"){
                $$(this.elem).addClass("o2x");
            }
            this.status = "x";
        },
        setO:function(){
            if(!(this.status === "o")){
                this.showShadow();
                this.clearAnim();
            }
            if(this.status === "w"){
                $$(this.elem).addClass("w2o");
            }
            else if(this.status === "x"){
                $$(this.elem).addClass("x2o");
            }
            this.status = "o";
        },
        setW:function(){
            if(!(this.status === "w")){
                this.showShadow();
                this.clearAnim();
            }
            if(this.status === "x"){
                $$(this.elem).addClass("x2w");
            }
            else if(this.status === "o"){
                $$(this.elem).addClass("o2w");
            }
            this.status = "w";
        },
        shake:function(){
            $$(this.elem).addClass("shake");
        },
        _transitionend:function(){
            if($$(this.elem).hasClass("showShadow")){
                this.hideShadow();
            }
        },
        _animationend:function(){
            $$(this.elem).removeClass("shake");
        },
        showShadow:function(){
            $$(this.elem).addClass("showShadow");
            $$(this.shadowElem).addClass("flash");
            this.setStyle("-webkit-transform", "translateZ(1000px)");
        },
        hideShadow:function(){
            $$(this.elem).removeClass("showShadow");
            $$(this.shadowElem).removeClass("flash");
            this.setStyle("-webkit-transform", "translateZ(0px)");
        }
    }

})(Judgement)
//cube class------------------->
