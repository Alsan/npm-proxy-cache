var assert = require('assert'),
  rimraf = require('rimraf'),
  fs = require('fs'),
  Cache = require('../lib/cache');

describe('cache', function() {

  var opts = {
    path: __dirname + '/cache',
    ttl: 10
  };

  before(function(done) {
    rimraf(opts.path, done);
  });

  after(function(done) {
    rimraf(opts.path, done);
  });


  describe('constructor()', function() {
    it('should create new instance of Cache', function() {
      var cache = new Cache(opts);
      assert(cache instanceof Cache);
    });
  });


  describe('set()', function() {
    it('should create new write stream', function() {
      var cache = new Cache(opts);
      var file = cache.write('/-/foo/bar.dat');
      file.end(new Buffer('This is a test'));
    });
  });


  describe('get()', function() {
    it('should create new read stream', function(done) {
      var cache = new Cache(opts);
      var readable = cache.read('/-/foo/bar.dat');

      readable.setEncoding('utf8');
      readable.on('data', function(data) {
        assert.equal(typeof data, 'string');
        assert.equal(data.toString(), 'This is a test');
        done();
      });

      readable.read();
    })
  });


  describe('meta()', function() {
    it('should return meta', function() {
      var cache = new Cache(opts);
      var meta = cache.meta('/-/foo/bar.dat')
      assert.equal(meta.size, 14);
      assert.equal(meta.type, 'application/octet-stream');
    });

    it('should return null', function() {
      var cache = new Cache(opts);
      assert.equal(cache.meta('/la/la'), null);
    });
  });


  describe('getPath()', function() {
    it('return path info', function() {
      var cache = new Cache(opts);
      var path = cache.getPath('/foo/bar/-/../baz.tgz');
      assert.equal(path.dir, opts.path + '/f/a/7');
      assert.equal(path.file, 'fa7bf9eb.tgz');
      assert.equal(path.full, opts.path + '/f/a/7/fa7bf9eb.tgz');
      assert.equal(path.rel, 'f/a/7/fa7bf9eb.tgz');
    });
  });

});
