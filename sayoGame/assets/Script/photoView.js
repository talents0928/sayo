// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


function Finger(touch){
    this.alter = 4 ;
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

}

var Fingers = {
    touchs  : {} ,
    receive : function(touch){
        var fg = this.touchs[touch._id] || (new Finger(touch)) ;
        this.touchs[fg._id] = fg ;
        return fg.receive(touch) ;
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
    follow : function(evt){
        var p = evt.touch._point ;
        var sp = evt.touch._startPoint ;
        this.node.x = this.originPos.x + p.x - sp.x ;
        this.node.y = this.originPos.y + p.y - sp.y ;
    } ,

    // update (dt) {},
});
