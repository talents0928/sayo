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
    this.timeStamp = Date.now() ;
};
DoubleFinger.prototype = {
    getInfo : function(touchs){
        var dx = touchs[1]._point.x - touchs[0]._point.x ;
        var dy = touchs[1]._point.y - touchs[0]._point.y ;
        var ax = (touchs[0]._point.x + touchs[1]._point.x) / 2 ;
        var ay = (touchs[0]._point.y + touchs[1]._point.y) / 2 ;
        var size = Math.sqrt(dx*dx+dy*dy) ;
        return {
            timeStamp : touchs[0]._lastModified ,
            size : size ,
            ax : ax ,
            ay : ay 
        } ;
    },
    receive : function(touchs){
        this.count ++ ;
        if(this.count < this.alter){
            return false ;
        }
        this.count = 0 ;
        // var size = this.getSize(touchs) ;
        var info = this.getInfo(touchs) ;
        // 超时重置状态
        if(info.timeStamp - this.timeStamp > 100){
            this.timeStamp = info.timeStamp  ;
            this.size = info.size ;
            return false ;
        }
        this.timeStamp = info.timeStamp  ; // 更新时间
        var scale = info.size / this.size ;
        this.size = info.size ; // 更新长度
        return {
            scale : scale ,
            ax : info.ax ,
            ay : info.ay 
        } ;
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
        var result = this.df.receive(touchs) ;
        return result ;
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
        redPointpf : cc.Prefab ,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.MaxScale = 1.5 ;
        this.MinScale = 0.692 ;
    },

    start () {
        var EventType = cc.Node.EventType ;
        this.node.on(EventType.TOUCH_START,this.startHandler,this) ;
        this.node.on(EventType.TOUCH_MOVE,this.moveHandler,this) ;
        this.node.on(EventType.TOUCH_END,this.endHandler,this) ;
        this.node.on(EventType.TOUCH_CANCEL,this.endHandler,this) ;

    },
    startHandler : function(evt){
        // uiMgr.popHint(this.node.scale) ;
    },
    moveHandler : function(evt){
        if(evt._touches.length == 1){
            this.singleFinger(evt) ;
        }else if(evt._touches.length == 2){
            this.doubleFinger(evt) ;
        }
    },
    doubleFinger : function(evt){
        var result = Fingers.receiveDouble(evt._touches) ;
        // uiMgr.popHint(result) ;
        if(result){
            // this.upAnchor(result.ax,result.ay) ;
            var scale = this.node.scale * result.scale ;
            if(scale<=this.MaxScale && scale>=this.MinScale){
                this.node.scale = scale ;
            }
        }
    },
    upAnchor : function(ax,ay){
        var vec2 = this.node.parent.convertToNodeSpaceAR(cc.v2(ax,ay)) ; 
        // this.addRed(vec2);
        var node = this.node ;

        return false ;

        vec2.x /= node.scaleX ;
        vec2.y /= node.scaleY ;
        var offX = vec2.x - node.x ;
        var offY = vec2.y - node.y ;
        node.x = vec2.x ;
        node.y = vec2.y ;
        node.anchorX = offX/node.width + node.anchorX ;
        node.anchorY = offY/node.height + node.anchorY ;
        uiMgr.popHint(node.anchorY) ;
        
    },
    setAnchor : function(anchorX,anchorY){
        var node = this.node ;
        node.x += (anchorX - node.anchorX)*node.width*node.scaleX ;
        node.y += (anchorY - node.anchorY)*node.height*node.scaleY ;
        node.anchorX = anchorX ;
        node.anchorY = anchorY ;
    },
    addRed : function(vec2){
        var point = cc.instantiate(this.redPointpf) ;
        this.node.parent.addChild(point) ;
        point.position = vec2 ;
    },
    // upAnchor : function(nX,nY){
    //     var node = this ;
    //     node.x += node.x*(nX-node.anchorX) ;
    //     node.y += node.y*(nY-node.anchorY) ;
    //     node.anchorX = nX ;
    //     node.anchorY = nY ;
    // },
    singleFinger : function(evt){
        var delta = evt.getDelta() ;
        camera.node.position = cc.pSub(camera.node.position,delta) ;
        return ;
        var result = Fingers.receive(evt._touches[0]) ;
        if(result){
            this.node.x += result.dx ;
            this.node.y += result.dy ;
        }
    },
    endHandler : function(evt){
        // cc.log(evt) ;
    },



    // update (dt) {},
});
