
var each = function(obj, iterator, context) {
    if (!obj)
        return;
    if (obj instanceof Array) {
        for (var i = 0, li = obj.length; i < li; i++) {
            if (iterator.call(context, obj[i], i) === false)
                return;
        }
    } else {
        for (var key in obj) {
            if (iterator.call(context, obj[key], key) === false)
                return;
        }
    }
};
var extend = $.extend ;
var Aide = function(butler){
    this.bt = butler ;
};
var proto = Aide.prototype ;
proto.clone = function (){
    each(this.sheep||[],function(value,index){
        value.active = false ;
    },this) ;
    each(this.data||[],function(value,index){
        var node = this.sheep[index] ;
        if(!node){
            var btNode = this.bt.node ;
            node = cc.instantiate(btNode);
            node.parent = btNode.parent ;
            node.setSiblingIndex(btNode.getSiblingIndex()) ;
            this.sheep.push(node) ;
        }
        node.active = true ;
        var butler = node.getComponent('butler') ;
        butler.index = index ;
        butler.renew(value,this.bt.context) ;
    },this) ;
    this.bt.node.active = false ;
};
proto.record = function(){
    if(this.copy){
        this.bt.watch(this.data,this.copy) ;
    }
    this.cope = $.extend(true,{},this.data) ;
};
proto.update = function (option,index){
    if(option){
        this.data = typeof  option == 'function' ?  option(this.data) :  option ;
    }
    if(this.data instanceof Array){
        this.sheep = this.sheep||[] ;
        this.clone() ;
    }else{
        this.index = index ===undefined ? this.index : index ;
        this.bt.setValue(this.data,this.index) ;
        this.record() ;
    }
};

cc.Class({
    // extends: require('viewCell'),
    extends : cc.Component ,
    properties: {
        
    },
    ctor : function(){
        this.aide = new Aide(this) ;
    },
    //外部调用函数
    setValue: function(data,index){

    },
    //外部重载setValue方法
    reValue : function(fn){
        this.setValue = fn || this.setValue ;
    },
    // 对比新旧数据函数
    watch : function(now,old){},
    // 刷新视图函数
    renew : function(option,context){
        // return false ;
        this.context = context || this.context ;
        this.aide.update(option,this.index) ;
    },
    // update (dt) {},
});
