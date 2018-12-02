cc.Class({
    extends: cc.Component,
    properties: {
        
    },
    // use this for initialization
    onLoad: function onLoad() {
        var self = this ;
        self.tick = 0 ;
        this.node.on('tap',function(e){
            if(e.target.name != self.node.name){
                self.tick = new Date().getTime() ;
                self.tickEvt = e ;
            }
        })
    },
    handler: function handler(e) {
        if( new Date().getTime()-this.tick<50 ){
            e.resEvt = this.tickEvt ;
        }
        var p = e.touch._point;
        var sp = e.touch._startPoint;
        if (sp && Math.abs(p.x - sp.x) < 10 && Math.abs(p.y - sp.y) < 10) {
            var evt = new cc.Event.EventCustom('tap', true);
            evt.setUserData(e);
            this.node.dispatchEvent(evt);
        }
    },
    onEnable : function(){
        this.node.on('touchend',this.handler,this) ;
    },
    onDisable : function(){
        this.node.off('touchend',this.handler,this) ;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
