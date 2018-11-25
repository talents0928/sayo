// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var StateDef = {
    STAND : 0 ,
    FRONT : 1 ,
    RIGHT : 2 ,
    LEFT : 3 ,
    BACK : 4
} ;


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
        window.master = this ;
        this.state = StateDef.STAND ;
        this.dist = 5 ;
    },
    playState : function(animName){
        var anim = this.node.getComponent(cc.Animation) ;
        anim.play(animName) ;
    },
    toFront : function(){
        this.state = StateDef.FRONT ;
        this.playState('front') ;
    },
    toBack : function(){
        this.state = StateDef.BACK ;
        this.playState('back') ;
    },
    toRight : function(){
        this.state = StateDef.RIGHT ;
        this.playState('right') ;
    },
    toLeft : function(){
        this.state = StateDef.LEFT ;
        this.playState('left') ;
    },

    update (dt) {
        // cc.log(dt) ;
        // return ;
        switch(this.state){
            case StateDef.FRONT : 
                this.node.y -= this.dist*dt ;
                break ;
            case StateDef.RIGHT :
                this.node.x += this.dist*dt ;
                break ;
            case StateDef.LEFT :
                this.node.x -= this.dist*dt ;
                break ;
            case StateDef.BACK : 
                this.node.y += this.dist*dt ;
                break ;
            default : 
                break ;
        }

    },
});
