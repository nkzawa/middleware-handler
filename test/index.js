var expect = require('chai').expect,
  MiddlewareHandler = require('../');


describe('MiddlewareHandler', function() {

  describe('#use', function() {
    it('should append a middleware to stack', function() {
      var handler = new MiddlewareHandler(),
        middlewares = [
          function() {},
          function() {}
        ];

      middlewares.forEach(function(middleware) {
        handler.use(middleware);
      });
      expect(handler.stack).to.eql(middlewares);
    });
  });

  describe('#clear', function() {
    it('should empty stack', function() {
      var handler = new MiddlewareHandler();

      handler.use(function() {});
      handler.clear();
      expect(handler.stack.length).to.eql(0);
    });
  });

  describe('#handle', function() {
    it('should accept variable arguments', function(done) {
      var handler = new MiddlewareHandler(),
        argv = ['foo', 'bar', 'baz'],
        middleware = function(a, b, c, next) {
          expect([a, b, c]).to.eql(argv);
          next();
        };

      handler.use(middleware);
      handler.handle(argv, done);
    });

    it('should handle variable middlewares in series', function(done) {
      var handler = new MiddlewareHandler(),
        arg = 'foo',
        count = 0;

      [0, 1, 2].forEach(function(v, i) {
        handler.use(function(_arg, next) {
          expect(i).to.eql(count++);
          expect(_arg).to.eql(arg);
          next();
        });
      });
      handler.handle([arg], done);
    });
  });

});
