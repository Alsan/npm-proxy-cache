var url = require('url'),
  path = require('path'),
  fs = require('fs'),
  crypto = require('crypto'),
  mkdirp = require('mkdirp');


module.exports = function Cache(opts) {

  opts = opts || {}
  opts.ttl = opts.ttl || 1800;
  opts.path = opts.path || __dirname + '/../cache'


  this.gc = function() {};


  this.meta = function(key) {
    var fullpath = this.getPath(key).full;
    if (!fs.existsSync(fullpath))
      return null;

    var stat = fs.lstatSync(fullpath);
    if (Date.now() > stat.ctime.valueOf() + opts.ttl * 1000)
      return null;

    stat.type = 'application/octet-stream'
    if (path.extname(fullpath) === '')
      stat.type = 'application/json';

    return stat;
  };


  this.read = function(key) {
    var path = this.getPath(key);

    var file = fs.createReadStream(path.full);
    file.on('finish', function() {
      file.close();
    });

    return file;
  };


  this.write = function(key) {
    var path = this.getPath(key);

    mkdirp.sync(path.dir, 0755);

    var file = fs.createWriteStream(path.full);
    file.on('finish', function() {
      file.close();
    });

    return file;
  };


  this.getPath = function(key) {

    var file = crypto.createHash('md5').update(key).digest('hex').substring(0, 8) + path.extname(key);
    var dir = file.split('').splice(0, 3).join('/');

    return {
      dir: path.join(opts.path, dir),
      full: path.join(opts.path, dir, file),
      file: file,
      rel: path.join(dir, file)
    }
  };

  this.unlink = function(key) {
    fs.unlinkSync(this.getPath(key).full);
  };

};
