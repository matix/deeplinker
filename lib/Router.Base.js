/* global ns:true*/

var routerDefaults = {

};

var PATH_ARGUMENT_PREFIX = ":";

var Base = ns("deeplinker.Router").Base = function (context, settings) {
  this.context = context || global;
  this.settings = _.defaults(settings, routerDefaults);
  this.handlers = [];
};

Base.prototype.addHandler = function(path, handler, context) {
  this.handlers.push([path, handler, context || global]);
};

Base.prototype.removeHandler = function(path, handler) {
  var idx,
      target = _.find(this.handlers, function (item, i) {
        if(item[0] === path && item[1] === handler){
          idx = i;
          return true;
        }
      });

  if(target){
    this.handlers.splice(idx,1);
  }

  return target;
};

/**
 * @method start
 * Initializes the router functionality and executes handlers for the current path.
*/
Base.prototype.start = function() {
  if(_.isFunction(this.initialize)) {
    this.initialize();
  }
  var path;

  try {
    path = _.isFunction(this.getPath) && this.getPath();
  }
  catch(e) {
    throw new Error("Could not resolve current path.", e);
  }

  if(path) {
    this.navigate(path);
  }
};

/**
 * @method listen
 * @alias start
*/
Base.prototype.listen = Base.prototype.start;

function matchPaths (path, pattern) {
  if(path===pattern) {
    return [];
  }

  path = path.split("/");
  pattern = pattern.split("/");

  if(path.length === pattern.length) {
    return _.filter(path, function (pathItem, i) {
      if(pattern[i].indexOf(PATH_ARGUMENT_PREFIX) === 0) {
        return true;
      }
    });
  }
  else {
    return false;
  }
}

/**
 * @method navigate
 * Executes handlers assosiated with a given path.
 * @arg path The path which handlers are being executed.
*/
Base.prototype.navigate = function (path) {
  _.each(this.handlers, function (handler) {
    var pattern = handler[0],
        args = matchPaths(path, pattern);
    if(args) {
      var handlerFunc = handler[1],
          context = handler[2];
      if(_.isFunction(handlerFunc)) {
        handlerFunc.apply(context, args);

        return true; //break
      }
    }
  });
};