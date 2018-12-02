// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

function DoubleFinger(){
    this.alter = 4 ;
    this.count = 0 ;
    this.time = Date.now() ;
};
DoubleFinger.prototype = {
    getSize : function(touchs){
        var dx = touchs[1]._point.x - touchs[0]._point.x ;
        var dy = touchs[1]._point.y - touchs[0]._point.y ;
        var size = Math.sqrt(dx*dx+dy*dy) ;
        return size ;
    },
    receive : function(touchs){
        this.count ++ ;
        if(this.count < this.alter){
            return false ;
        }
        this.count = 0 ;
        var t = touchs[0] ;
        var size = this.getSize(touchs) ;
        // 超时重置状态
        if(t._lastModified-this.time > 100){
            this.time = t._lastModified ;
            this.size = size ;
            return false ;
        }
        this.time = t._lastModified ; // 更新时间
        var scale = size / this.size ;
        this.size = size ; // 更新长度
        return scale ;
        
    }
};
function Finger(touch){
    this.alter = 3 ;
    this.init(touch) ;
}
Finger.prototype = {
    init : function(touch){
        this.id = touch._id ;
        this.count = 0 ;
        this.updateInfo(touch) ;
    },
    updateInfo : function(touch){
        this.pointX = touch._point.x ;
        this.pointY = touch._point.y ;
        this.time = touch._lastModified ;
    },
    receive : function(touch){
        if(touch._lastModified-this.time > 100){
            this.updateInfo(touch) ;
            this.count = 0 ;
            return false ;
        }
        this.count ++ ;
        if(this.count == this.alter){
            this.count = 0 ;
            this.updateInfo(touch) ;
            return false;
        }
        if(this.count == this.alter-1){
            return {
                dx : touch._point.x - this.pointX ,
                dy : touch._point.y - this.pointY ,
            }
        }
        return false ;
    }

};


var Fingers = {
    touchs  : {} ,
    df : new DoubleFinger() ,
    receive : function(touch){
        var fg = this.touchs[touch._id] || (new Finger(touch)) ;
        this.touchs[fg.id] = fg ;
        return fg.receive(touch) ;
    },
    receiveDouble : function(touchs){
        var scale = this.df.receive(touchs) ;
        return scale ;
    },
    clear : function(touch){
        this.touchs[touch._id] = null ;
    }
};

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.doubleCount = this.singleCount = 0 ;
        var EventType = cc.Node.EventType ;
        this.node.on(EventType.TOUCH_START,this.startHandler,this) ;
        this.node.on(EventType.TOUCH_MOVE,this.moveHandler,this) ;
        this.node.on(EventType.TOUCH_END,this.endHandler,this) ;
        this.node.on(EventType.TOUCH_CANCEL,this.endHandler,this) ;

    },
    startHandler : function(evt){
        // cc.log(evt) ;
        // uiMgr.popHint(evt._touches.length) ;
    },
    moveHandler : function(evt){
        // uiMgr.popHint('move:'+evt._touches.length) ;
        if(evt._touches.length == 1){
            this.singleFinger(evt) ;
        }else if(evt._touches.length == 2){
            this.doubleFinger(evt) ;
        }
    },
    doubleFinger : function(evt){
        var result = Fingers.receiveDouble(evt._touches) ;
        hint.pop(result) ;
        if(result){
            this.upAnchor(0,1) ;
            this.node.scale *= result ;
        }
    },
    upAnchor : function(nX,nY){
        var node = this ;
        node.x += node.x*(nX-node.anchorX) ;
        node.y += node.y*(nY-node.anchorY) ;
        node.anchorX = nX ;
        node.anchorY = nY ;
    },
    singleFinger : function(evt){
        var result = Fingers.receive(evt._touches[0]) ;
        if(result){
            this.node.x += result.dx ;
            this.node.y += result.dy ;
        }
    },
    endHandler : function(evt){
        // cc.log(evt) ;
        // FIXME  简单设定为0
        this.doubleCount = this.singleCount = 0 ;
    },


    dispatchEvent : function(type,evt){
        var evt = new cc.Event.EventCustom(type, true);
        evt.setUserData(evt);
        this.node.dispatchEvent(evt);
    },
    

    // update (dt) {},
});
