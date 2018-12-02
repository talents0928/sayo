
module.exports = (function(window,undefined){
	var cQuery = function(node){
			return new cQuery.fn.init(node);
		} ,
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty,
		push = Array.prototype.push,
		slice = Array.prototype.slice,
		trim = String.prototype.trim,
		indexOf = Array.prototype.indexOf,

		class2type = {};

	cQuery.fn = cQuery.prototype = {
		constructor : cQuery ,
		init : function(node){
			this.node = node ;
			return this;
		},
		on : function(types,name,handler,num){
			if(typeof name == 'function'){
				handler = name ;
				name = null ;
			}
			if(num == 1){
				var origFn = handler ;
				var self = this ;
				handler = function(evt){
					cQuery().off.call(self,types,name);
					return origFn.apply( this, arguments );
				}
			}
			cQuery.event.add(this,types,name,handler);
			return this ;
		},
		one : function(types,name,handler){
			return this.on.call(this,types,name,handler,1);
		},
		off : function(types,name){
			cQuery.event.remove( this, types, name );
			return this ;
		},
		trigger : function(types,name){

		},
		renderItem : function(){
			return getRNode(this.node);
			function getRNode(n){
				if(n == null || n == undefined){
					return null ;
				}else{
					return n.render ? n : getRNode(n.parent);
				}
			}
		},
		butlerItem : function(){
			return getBulter(this.node)();
			function getBulter(n){
				if(n === null || n === undefined){
					return new Function() ;
				}else{
					return n.butler ? n.butler : getBulter(n.parent);
				}
			}
		},
		parent : function(){
			return cQuery(this.node.parent) ;
		},
		parents : function(name){
			return cQuery(loop(this.node)) ;
			function loop(node){
				if(node){
					return node.parent.name == name ? node.parent : loop(node.parent);
				}else{
					return null ;
				}
			}
		},
		index : function(){
			var index = -1 ; 
			var node = this.node ;
			$.each(node.parent.children||[],function(v,i){
				if(v == node){
					index = i ;
				}
			})
			return index ;
		},
		//先将就这个方法
		removeAllChildren : function(){
			var node = this.node ;
			if(node && node.isValid){
				node.destroyAllChildren();
			}
			return this ;
		}
	};
	
	cQuery.event = {
		add : function(target,types,name,handler){
			var evt = {
				types: types,
				id: target.node.uuid + types,
				name: name,
				handler: handler
			};
			var evts = this.global.events;
			if (!evts[evt.id]) {
				evts[evt.id] = [];
				var f = this.global.fns[evt.id] = function (e) {
						if(e.detail.resEvt){
							var result ;
							$.each(evts[evt.id],function(value,index){
								if(value.name == e.detail.resEvt.target.name ){
									result = value.result ;
								}
							});
							if(result === false){
								//中断执行
								return ;
							}
						}
						var name = e.target.name;
						$.each(evts[evt.id], function (value, index) {
							if (value.name == name || value.name == null) {
								var n = value.name == null ? e.currentTarget : e.target;
								// value.handler && value.handler.call(n,e) ;
								if (value.handler) {
									try {
										evt.result = value.handler.call(n, e);
									} catch (bug) {
										cc.log(bug);
									}
								}
							}
						});
					}
				target.node.on(evt.types, f);
				//TODO 未监听节点销毁
			}
			evts[evt.id].push(evt);

		},
		remove : function(target,types,name){
			var id = target.node.uuid + types ;
			var arr = [] ;
			$.each( this.global.events[id]||[],function(v,i){
				if(v.name != name){
					arr.push(v);
				}
			});
			if(arr.length == 0){
				target.node.off(types, this.global.fns[id], target.node);
				delete this.global.events[id] ;
				delete this.global.fns[id] ;
			}else{
				this.global.events[id] = arr ;
			}
		},
		global : {
			events : {} ,
			fns : {} 
		} ,
		trigger : function(target,types,name){
			//貌似没有意义
		}
	};
	cQuery.each = function (obj, iterator, context) {
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


	

	cQuery.fn.init.prototype = cQuery.fn ;


	cQuery.extend = cQuery.fn.extend = function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && !cQuery.isFunction(target) ) {
			target = {};
		}

		// extend cQuery itself if only one argument is passed
		if ( length === i ) {
			target = this;
			--i;
		}

		for ( ; i < length; i++ ) {
			// Only deal with non-null/undefined values
			if ( (options = arguments[ i ]) != null ) {
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( cQuery.isPlainObject(copy) || (copyIsArray = cQuery.isArray(copy)) ) ) {
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && cQuery.isArray(src) ? src : [];

						} else {
							clone = src && cQuery.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = cQuery.extend( deep, clone, copy );

					// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	};

	cQuery.extend({

		isFunction: function( obj ) {
			return cQuery.type(obj) === "function";
		},

		isArray: Array.isArray || function( obj ) {
			return cQuery.type(obj) === "array";
		},

		// A crude way of determining if an object is a window
		isWindow: function( obj ) {
			return obj && typeof obj === "object" && "setInterval" in obj;
		},

		isNumeric: function( obj ) {
			return obj != null && rdigit.test( obj ) && !isNaN( obj );
		},

		type: function( obj ) {
			return obj == null ?
				String( obj ) :
				class2type[ toString.call(obj) ] || "object";
		},

		isPlainObject: function( obj ) {
			// Must be an Object.
			// Because of IE, we also have to check the presence of the constructor property.
			// Make sure that DOM nodes and window objects don't pass through, as well
			if ( !obj || cQuery.type(obj) !== "object" || obj.nodeType || cQuery.isWindow( obj ) ) {
				return false;
			}

			try {
				// Not own constructor property must be Object
				if ( obj.constructor &&
					!hasOwn.call(obj, "constructor") &&
					!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
					return false;
				}
			} catch ( e ) {
				// IE8,9 Will throw exceptions on certain host objects #9897
				return false;
			}

			// Own properties are enumerated firstly, so to speed up,
			// if last one is own, then all properties are own.

			var key;
			for ( key in obj ) {}

			return key === undefined || hasOwn.call( obj, key );
		},

		isEmptyObject: function( obj ) {
			for ( var name in obj ) {
				return false;
			}
			return true;
		},

	});
	
	cQuery.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(name, i) {
		class2type[ "[object " + name + "]" ] = name.toLowerCase();
	});

	cQuery.extend({
		cache : {} ,
		data : function(key,value){
			if(value == undefined){
				return this.cache[key] ;
			}else{
				this.cache[key] = value ;
			}
		},
		removeData : function(key){
			delete this.cache[key] ;
		}
	});

	// cQuery.extend({
		
	// });

	//用于处理init数据初始化状态重置
	cQuery.extend({
		mark : [] ,
		setMark : function(fn){
			this.mark.push(fn) ;
		},
		cleanMark : function(){
			this.each(this.mark,function(value,index){
				if(typeof value == 'function'){
					value()
				}
			})
		}
	});


	window.cQuery = window.$ = cQuery ;
	return cQuery ;
})(window)

