var Transform = require('stream').Transform;
var inherits = require('util').inherits;

/**
 * Module `exports`
 */

module.exports = SlowTransform;

/**
 * Simulate a Transform stream with some delayed processing in the middle
 */

function SlowTransform(delay){
  Transform.call(this, { objectMode: true });
  this.delay = delay;
}

/**
 * Inherit from `Transform`
 */

inherits(SlowTransform, Transform);

/**
 * Slow transform function
 */

SlowTransform.prototype._transform = function(chunk, encoding, callback){
  setTimeout(function (){
    callback(null, chunk);
  }, this.delay);
};