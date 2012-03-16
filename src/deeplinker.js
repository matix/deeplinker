(function(window){

window.deeplinker =  {
    /** Routing tree structure holder */
    _routes:{},
    /** Default callback function holder */
    _defaultCallback:null,
    /** Hash checking interval Id holder*/
    _checkInterval:null,
    /** Routing window reference holder */
    _window: null,
    /** Href buffer*/
    _href:null,
    /** Hash checking interval call default time span */
    _defaultUpdateRate:100,
    /** Flag that determines wether deeplinker is paused */
    _paused: false,
    
    /**
     * initializes the deeplinking mechanism.
     * 
     * routingWindow: the window where routes will be looked up.
     * 
     * returns: undefined
     */
    init: function(/** DOMWindow */ routingWindow, /** Number */ updateRate){
        this._window = routingWindow;

        // Modern browsers can detect hash changes so we don't need to be pulling window.location.href constantly.
        if ('onhashchange' in this._window) {
            this._window.addEventListener('hashchange', _checkHash, false);
        } else {
            this._checkInterval = setInterval(_checkHash, (updateRate || this._defaultUpdateRate));
        }
    },
    
    /**
     * Set a default function to be called when given route is not resolved 
     * to any callback.
     * 
     * returns: undefined
     */
    setDefaultCallback: function(/** function */ callback){
        this._defaultCallback = callback;
    },
    
    /**
     * Util: get the hash url of a given URL. Returns false if 
     * no route found.
     * 
     * returns: string or false
     */
    getRoute: function(/** string */ href){
        if(typeof href == "string"){
            var safeHref = href.split('?',2)[0];
            var hash = safeHref.split('#!',2)[1];
            return hash? hash:false;
        }
        else return false;
    },
    
    /**
     * Util: get the base url of the current page.
     * 
     * returns: string
     */
    getBasePath:function(){
        return  this._window.location.protocol 
                +'//'+this._window.location.hostname 
                + this._window.location.pathname;
    },
    
    /**
     * Fire routing mechanism for a given path.
     * If not callback was registered for the given path returns false.
     * If the registered callback produces an error, it is fowarded via
     * console.error
     * 
     * returns: true or false
     */
    route: function(/** string */path){
        var unfilteredPathItems = path.split("/");
        var pathItems = [];
        utils.forEach(unfilteredPathItems, function(item){
            if(item != ""){
                pathItems.push(item);
            }
        });
        var routeItem = _tree_run(this._routes, pathItems);
        if(routeItem){
            var routeCallback = routeItem.callback;
            var callbackArgs = _process_arguments(routeItem.args, routeItem.path, pathItems);
            
            var callable = _resolveCallback(routeCallback, callbackArgs);
            if(callable != false){
                try{
                    callable();
                }
                catch(e){
                    console.error(e);
                    return false;
                }
            }
            else{
                return false;
            }
        }
        else {
            return false;
        }

        return true;
    },
    
    /**
     * Register a route callback.
     * 
     * path: the route to register. A route is a ficticious path that fires
             * a given callback. It uses the following syntax:
             *  > relative:  path/to/something
             *               path/:with/:aguments
             *  > absolute:  /path/to/something
             *               /path/:with/:arguments             
             * 
     * callback: a reference to a method to call with the respective 
                 * arguments when the registered path is adressed.
                 * Can be defined in several ways:
                 *  > function: a reference to a function or an inline 
                 *              anonymous function definition.
                 *  > scoped function: a reference to a function and a 
                 *                     reference to a scope where the 
                 *                     execution of that function will 
                 *                     refer (this object).
                 *                     Should be passed as an object:
                 *                     {scope:ScopeObject, 
                 *                      method:functionReference}
                 *                     ScopeObject can be either a function 
                 *                     reference or a string representing a 
                 *                     member of the scope object that holds
                 *                     the function.
                 * > string with code: a string containig code to be 
                 *                     evaluated. In this case arguments 
                 *                     will be ignored.
     * args: the definition of the arguments to be passed to the callback 
             * when the registered path is adressed. Should be passed as 
             * an array where every value is passed as it is defined to the 
             * callback function except strings starting with ":", wich are 
             * resolved to argument definitions in the given path.
             * 
     * returns: undefined
     */
    addRoute: function (path, callback, args){
        var unfilteredPathItems = path.split("/");
        var pathItems = [];
        utils.forEach(unfilteredPathItems, function(item){
            if(item != ""){
                pathItems.push(item);
            }
        });
        var value = {callback:callback, args:args};
        _tree_set(this._routes, pathItems, value);
    },
    
    /**
     * Remove route callback for a given path.
     * 
     * path: the path to remove from the routing tree.
     * 
     * returns: undefined
     */
    removeRoute: function (path){
        var unfilteredPathItems = path.split("/");
        var pathItems = [];
        utils.forEach(unfilteredPathItems, function(item){
            if(item != ""){
                pathItems.push(item);
            }
        });
        _tree_set(this._routes, pathItems, null);
    },

    /**
     * Pauses the hash checking function.
     *
     * returns: undefined
     */
    pause : function () {
        this._paused = true;
    },

    /**
     * Resumes the hash checking function.
     *
     * returns: undefined
     */
    resume : function () {
        this._paused = false;
    },

    /**
     * Checks wether deeplinker is paused or not.
     *
     * returns: true if paused, false otherwise.
     */
    isPaused : function() {
        return this._paused;
    }
};

//private: recursively walks down the routing three  following the given path 
//until finds a callback. Returns false if no callback found.
function _tree_run(root, path) {
    if(path.length > 0){
        if(typeof root[path[0]] != "undefined"){
            return _tree_run(root[path[0]], path.slice(1));
        }
        else if (typeof root["*"] != "undefined"){
            return _tree_run(root["*"], path.slice(1));
        }
        else return false
    }
    else return root;
}

//private: recursively walks down the routing three  following the given path 
//and sets a callback in the final position.
function _tree_set(root, path, value, originalPath) {
    if(typeof originalPath == "undefined"){
        originalPath = [];
    }
    if(path.length > 1){
        var pathItem = path.shift();
        originalPath.push(pathItem);
        if(pathItem.indexOf(":") > -1){
            pathItem = "*";
        }
        if(typeof root[pathItem] == 'undefined'){
            root[pathItem] = {};
        }
        _tree_set(root[pathItem], path, value, originalPath);
    }
    else {
        originalPath.push(path[0]);
        value.path = originalPath;
        if(path[0].indexOf(":")>-1){
            path[0] = "*";
        }
        root[path[0]] = value;
    }
}

//private: resolve callback arguments if with values passed in the path.
function _process_arguments(declaredArgs, declaredPathItems, pathItems ){
    var args = [];
    utils.forEach(declaredArgs, function (arg){
        if(typeof arg == "string" && arg.indexOf(":") == 0){
            var pathItemIdx = utils.indexOf(declaredPathItems,arg);
            if(pathItemIdx > -1){
                args.push(pathItems[pathItemIdx]);
            }
            else{
                args.push(undefined);
            }
        }
        else{
            args.push(arg);
        }
    });
    return args;
}

//private: constalty check the hash path in the location of the routing window
//given and fire deeplinkig mechanism if registered route found.
function _checkHash(){
    if (deeplinker._paused) return;
    var oldhref = deeplinker._href;
    var newhref = deeplinker._window.location.href;
    if(oldhref != newhref){
        deeplinker._href = newhref;
        var route = deeplinker.getRoute(newhref);
        if(route){
            deeplinker.route(route);
        }
        else if (deeplinker._defaultCallback){
            deeplinker._defaultCallback();
        }
    }
}

// private: create a callback function proxy to be called given a callback in 
// any of the supported format. Return false if invalid format.
function _resolveCallback(callback, args){
    if(typeof callback == "function"){
        return function(){
            callback.apply(window,args);
        }
    }
    else if (typeof callback == "string"){
        return function(){
            eval(callback);
        }
    }
    else if (typeof callback == "object" && typeof callback.scope != "undefined"){
        if(typeof callback.method == "string"){
            return function(){
                callback.scope[callback.method].apply(callback.scope,args);
            }
        }
        else if (typeof callback.method == "function"){
            return function(){
                callback.method.apply(callback.scope,args);
            }
        }
        else return false;
    }
    else{
        return false;
    }
}

})(window);
