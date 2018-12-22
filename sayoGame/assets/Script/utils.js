var utils = {} ;

utils.extend = function(){
	
	addMark(arguments) ;
	return tidy(extend.apply(null, arguments));
	
	function addMark(args){
		$.each(args||[],function(index,value){
			if( typeof value == 'object' && value!= null ){
				addMark(value) ;
				var len  = Object.keys(value).length ;
				if(('id' in value && len ==1)|| len == 0 ){
					value.destory  = true ;
				}
			}
		}) ;
		
	};
	function tidy(data){
		$.each(data||[],function(index,value){
			//防止无限循环
			if(value===data){
				return ;
			}
			if(jQuery.isPlainObject(value)||jQuery.isArray(value)){
				if(value['destory']){
					if(jQuery.isArray(data)){
						data = data.slice(0,index).concat(data.slice(index+1,data.length));
						tidy(data);
						return false;
					}else{
						delete data[index] ;
					}
				}else{
					data[index] = tidy(value);
				}
			}
		});
		return data;
	};
	
	function extend(){
		var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = true;

		if ( typeof target === "boolean" ) {
			deep = target;
			target = arguments[1] || {};
			i = 2;
		}
		if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
			target = {};
		}
		if ( length === i ) {
			target = this;
			--i;
		}
		for ( ; i < length; i++ ) {
			if ( (options = arguments[ i ]) != null ) {
				
				//清除数组
				if(jQuery.isArray(options)&&jQuery.isArray(target)&&!options.length){
					target = [] ;
				}
				
				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					if( jQuery.isPlainObject(copy) && ('id' in copy)&&jQuery.isArray(options)&&jQuery.isArray(target)){
						src = $.grep(target,function(value,index){
							return (value.id === copy.id)&&((name = index)||true)?true:false;
						})[0];
						if(src){
							target[ name ] = extend( deep, src, copy );
						}else{
							target.push(extend( deep, {}, copy )) ;
						}
					}
					// Recurse if we're merging plain objects or arrays
					else if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && jQuery.isArray(src) ? src : [];

						} else {
							clone = src && jQuery.isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = extend( deep, clone, copy );

					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
				
			}
		};
		
		return target ;
	}
	
	
};
window.utils = utils ;
module.exports = utils ;