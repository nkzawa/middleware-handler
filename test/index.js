var expect = require('chai').expect,
  MiddlewareHandler = require('../'),
  compose = MiddlewareHandler.compose;


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
        argv = ['foo', 'bar', 'baz'];

      handler.use(function(a, b, c, next) {
        expect([a, b, c]).to.eql(argv);
        next();
      });
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

    it('should call the callback with an error as the first argument', function(done) {
      var handler = new MiddlewareHandler(),
        err = new Error();

      handler.use(function(next) {
        next(err);
      });
      handler.handle(function(_err) {
        expect(_err).to.eql(err);
        done();
      });
    });

    it('should skip subsequence middleware calls when error', function(done) {
      var handler = new MiddlewareHandler();

      handler.use(function(next) {
        next(new Error());
      });
      handler.use(function() {
        throw new Error('Unexpected call');
      });
      handler.handle(function(err) {
        done();
      });
    });

    it('should call middlewares with an error if they accept larger arguments than values', function(done) {
      var handler = new MiddlewareHandler(),
        err = new Error(),
        arg = 'foo';

      handler.use(function(_err, v, next) {
        expect(_err).to.not.exist;
        expect(v).to.eql(arg);
        next();
      });
      handler.use(function(v, next) {
        next(err);
      });
      handler.use(function(_err, v, next) {
        expect(_err).to.eql(err);
        next(err);
      });
      handler.handle([arg], function(err) {
        done();
      });
    });

    it('should be able to pass arguments to next a middleware', function(done) {
      var handler = new MiddlewareHandler();

      handler.use(function(a, b, next) {
        next(null, a.toUpperCase(), b.toUpperCase());
      });
      handler.handle(['foo', 'bar'], function(_err, a, b) {
        expect(a).to.eql('FOO');
        expect(b).to.eql('BAR');
        done();
      });
    });

    it('should catch thrown errors', function(done) {
      var handler = new MiddlewareHandler(),
        err = new Error();

      handler.use(function(next) {
        throw err;
      });
      handler.handle(function(_err) {
        expect(_err).to.eql(err);
        done();
      });
    });
  });

  describe('#compose', function() {
    it('should create a function with the provided callback', function(done) {
      var handler = new MiddlewareHandler();

      handler.compose(done)();
    });

    it('should create a function accepts variable arguments', function(done) {
      var handler = new MiddlewareHandler(),
        args = ['foo', 'bar', 'baz'];

      handler.use(function(a, b, c, next) {
        expect([a, b, c]).to.eql(args);
        next();
      });

      handler.compose(done).apply(null, args);
    });
  });

  describe('compose', function() {
    it('should create a function with provided middlewares', function(done) {
      var value = 'foo',
        middleware = function(v, next) {
          expect(v).to.eql(value);
          next();
        },
        fn;

      fn = compose(middleware, middleware, function(v) {
        expect(v).to.eql(value);
        done();
      });
      fn(value);
    });
  });
});

