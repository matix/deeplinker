
if(!global.utils){
    global.utils = {};
}

global.utils.forEach = function(arr, callback, context){
    if(!arr || arr.length == 0){return;}
    
    if(context){
        callback = utils.scope(context, callback);
    }
    
    if(callback){
        for(var idx = 0; idx < arr.length; idx++){
            callback(arr[idx],idx,arr);
        }
    }
}

global.utils.scope = function(context, method){
    if(!context || !method) {return false};
    if(typeof method == "function"){
        return function(){
            method.apply(context,arguments);
        }
    }
    else if(typeof method == "string" && context[method]){
        return function(){
            context[method].apply(context,arguments);
        }
    }
    else return false;
}

global.utils.indexOf = function(array,value,fromIndex,findLast){
    var step = 1, end = array.length || 0, i = 0;
    if(findLast){
            i = end - 1;
            step = end = -1;
    }
    if(fromIndex != undefined){i = fromIndex;}
    if((findLast && i > end) || i < end) {
            for(; i != end; i += step){
                    if(array[i] == value){return i;}
            }
    }
    return -1;
}

global.utils.lastIndexOf = function(array,value,fromIndex){
    return utils.indexOf(array, value, fromIndex, true);
}