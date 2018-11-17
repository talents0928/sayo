// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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
        itempf : cc.Prefab ,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.box = new cc.Node() ;
        this.node.addChild(this.box) ;
        this.nodePool = new cc.NodePool() ;
        this.poolSize = 10 ;
        window.hint = this ;
    },

    getItem : function(){
        var item ;
        if(this.nodePool.size()>0){
            item = this.nodePool.get() ;
        }else{
            item = cc.instantiate(this.itempf) ;
        }
        item.stopAllActions() ;
        item.x = item.y = item._ly = 0 ;
        item.opacity = 255 ;
        return item ;
    },
    backItem : function(item){
        if(this.nodePool.size()>=this.poolSize){
            this.removeFromParent(item) ;
        }else{
            this.nodePool.put(item) ;
        }
    },
    removeFromParent : function(nd){
        if(!nd || !nd.isValid) return ;
        nd.removeFromParent(true) ;
        nd.destroy() ;
    },

    pop : function(msg){
        var children = this.box.children ;
        if(children.length > 10){
            var del = children.slice(0 ,children.length-10) ;
            for(var i=0;i<del.length;i++){
                this.backItem(del[i]) ;
            }
        }
        var old = this.box.children.slice(0) ;
        var item = this.getItem() ;
        item.getComponent('hintMsg').init(msg) ;
        this.moveUp(item) ;
        this.box.addChild(item) ;
        
        for(var i=0;i<old.length;i++){
            this.moveAfter(old[i]);
        }
    },
    moveUp : function(nd){
        var y = nd.height ;
        var self = this ;
        var seq = cc.sequence(
            cc.moveBy(0.2,0,y),
            cc.delayTime(0.6),
            cc.fadeOut(0.2),
            cc.callFunc(function (target) {
                self.backItem(target);
            })
        );
        nd.runAction(seq);
    } ,
    
    moveAfter : function (nd) {
        nd.runAction(cc.moveBy(0.2, 0, nd.height));
    },



    // update (dt) {},
});
