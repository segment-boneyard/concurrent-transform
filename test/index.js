var assert = require('assert');
var concurrent = require('..');
var Slow = require('./slow-transform');

describe('concurrent-transform', function (){
  it('should process entries in batches', function(done){
    var items = 0;
    var stream = new Slow(100);
    var total = 400;
    stream = concurrent(stream, 100)
      .on('data', function(data){ items++; })
      .on('error', function(err){ done(err); })
      .on('end', function(){ assert.equal(items, total); done(); });

    for (var i = 0; i < total; i++) stream.write(i);
    stream.end();
  });

  it('should process all the entries if there are fewer than `concurrency`', function(done){
    var items = 0;
    var stream = new Slow(100);
    var total = 40;
    stream = concurrent(stream, 100)
      .on('data', function(data){ items++; })
      .on('error', function(err){ done(err); })
      .on('end', function(){ assert.equal(items, total); done(); });

    for (var i = 0; i < total; i++) stream.write(i);
    stream.end();
  });

  it('should process a `_flush` with few items', function(done){
    var items = 0;
    var stream = new Slow(100);
    var total = 40;
    stream._flush = function(callback){
      this.push(1);
      setTimeout(callback, 10);
    };

    stream = concurrent(stream, 100)
      .on('data', function(data){ items++; })
      .on('error', function(err){ done(err); })
      .on('end', function(){ assert.equal(items, total+1); done(); });

    for (var i = 0; i < total; i++) stream.write(i);
    stream.end();
  });

  it('should process a `_flush` with many items', function(done){
    var items = 0;
    var stream = new Slow(100);
    var total = 500;
    stream._flush = function(callback){
      this.push(1);
      setTimeout(callback, 10);
    };

    stream = concurrent(stream, 100)
      .on('data', function(data){ items++; })
      .on('error', function(err){ done(err); })
      .on('end', function(){ assert.equal(items, total+1); done(); });

    for (var i = 0; i < total; i++) stream.write(i);
    stream.end();
  });

  it('should emit an error for a bad callback', function (done){
    var stream = new Slow(100);
    var processed = 0;

    stream._transform = function(chunk, encoding, callback){
      var err;
      if (processed++ > 40) err = new Error('BOOM!');
      setTimeout(function (){
        callback(err);
      }, 100);
    };

    stream = concurrent(stream, 100);

    stream
      .on('error', function (err) { assert(err); })
      .once('error', function(){ done(); }); // make sure done is called once

    for (var i = 0; i < 100; i++) stream.write(i);
    stream.end();
  });
});