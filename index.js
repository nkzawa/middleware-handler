var slice = [].slice;

function MiddlewareHandler() {
  this.clear();
}

MiddlewareHandler.compose = function() {
  var handler = new MiddlewareHandler(),
    middlewares = slice.call(arguments);

  middlewares.forEach(function(middleware) {
    handler.use(middleware);
  });
  return handler.compose();
};

MiddlewareHandler.prototype.use = function(middleware) {
  this.stack.push(middleware);
};

MiddlewareHandler.prototype.clear = function() {
  this.stack = [];
};

MiddlewareHandler.prototype.handle = function(args, callback) {
  var index = 0,
    _this = this,
    length;

  if ('function' === typeof args) {
    callback = args;
    args = [];
  }

  // Count of arguments a middleware accepts
  length = args.length + 1;

  function next(err) {
    var middleware = _this.stack[index++],
      _args;

    if (!middleware) {
      if (callback) {
        args.unshift(err);
        callback.apply(null, args);
      }
      return;
    }

    _args = args.slice();
    _args.push(next);
    if (middleware.length > length) {
      _args.unshift(err);
    } else if (err) {
      // This middleware can't accept error
      next(err);
      return;
    }

    middleware.apply(null, _args);
  }

  next();
};

MiddlewareHandler.prototype.compose = function(callback) {
  var _this = this;

  return function() {
    var args = slice.call(arguments);

    _this.handle(args, callback);
  };
};

module.exports = MiddlewareHandler;

