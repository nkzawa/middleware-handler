var __slice = [].slice;

function MiddlewareHandler() {
  this.clear();
}

MiddlewareHandler.prototype.use = function(middleware) {
  this.stack.push(middleware);
};

MiddlewareHandler.prototype.clear = function() {
  this.stack = [];
};

MiddlewareHandler.prototype.handle = function(args, callback) {
  var length = args.length,
    index = 0,
    _this = this;

  function next(err) {
    var middleware = _this.stack[index++],
      _args;

    if (!middleware) {
      args.unshift(err);
      callback.apply(null, args);
      return;
    }

    _args = args.slice();
    if (err) {
      if (middleware.length <= length) {
        next(err);
        return;
      }

      _args.unshift(err);
    }

    _args.push(next);
    middleware.apply(null, _args);
  }

  next();
};

MiddlewareHandler.prototype.compose = function(callback) {
  var _this = this;

  return function() {
    var args = arguments.length ? __slice.call(arguments, 0) : [];

    _this.handle(args, callback);
  };
};

module.exports = MiddlewareHandler;

