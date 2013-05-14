/* exported ns,namespace,desync */

var privateNamespace = {};

function string_split(string, separator, count){
    string = string||"";
    separator = separator||"";
    count = (count>=0)? count:0;
    
    var split = string.split(separator);
    var result = split.splice(0,count-1);
    if(split.length){
        result.push(split.join(separator));
    }

    return result;
}

function getNamespace (namespace, context) {    
    if(!namespace) {
        return undefined;
    }
    context = context || privateNamespace;

    var path = string_split(namespace,".",2);
    if(path.length === 1){
        return context[path[0]];
    }
    else{
        var nextContext = context[path[0]];
        if(nextContext){
            return getNamespace(path[1], nextContext);
        }
        else{
            return undefined;
        }
    }
}

function setNamespace (namespace, value, override, context) {
    context = context || privateNamespace;  
    var path = string_split(namespace,".",2);
    if(path.length === 1){
        if(context[path[0]] == null || override){
            context[path[0]] = value;
        }
        else{
            throw new Error(path[0] + 
                            " is already defined on " + 
                            context +
                            ", use override flag to write over it.");
        }
    }
        
    else{
        var nextContext;
        if(context[path[0]] == null){
            nextContext = context[path[0]] = {};
        }
        else{
            nextContext = context[path[0]];
        }
        setNamespace(path[1], value, override, nextContext);
    }
}

function desync (fn, timeout){
    timeout = (typeof timeout === "number")?timeout:1;
    return function(){
        var args = arguments;
        var self = this;
        if(fn.__desynced){
            clearTimeout(fn.__desynced);
        }
        fn.__desynced = setTimeout(function(){
            delete fn.__desynced;
            fn.apply(self,args);
        },timeout);
    };
}

function namespace (_namespace, context){
    var target = getNamespace(_namespace, context);

    if(!target) {
        setNamespace(_namespace, target = {}, true, context);
    }
        
    return target;
}

namespace.exports = function (_namespace) {
    return setNamespace(_namespace, namespace(_namespace), true, global);
};

var ns = namespace;