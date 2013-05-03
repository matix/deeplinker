var routerDefaults = {

};

var Base = _.ns.prv("deeplinker.Router").Base = function (context, settings) {
  this.context = context || global;
  this.settings = _.defaults(settings, routerDefaults);
};

Base.prototype.addHandler = function(path, handler) {
  return path && handler && true;
};

Base.prototype.removeHandler = function(path, handler) {
  return path && handler && true;
};

Base.prototype.hasHandler = function(path) {
  return path && false;
};

Base.prototype.execute = function(path) {
  return path && true;
};