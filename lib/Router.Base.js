/* global ns:true*/

var routerDefaults = {

};

var Base = ns("deeplinker.Router").Base = function (context, settings) {
  this.context = context || global;
  this.settings = _.defaults(settings, routerDefaults);
  this.handlers = [];
};

Base.prototype.addHandler = function(path, handler) {
  this.handlers.push([path, handler]);
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

Base.prototype.execute = function(path) {
  return path && true;
};

ns.exports("deeplinker");