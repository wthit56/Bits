var Line = (function() {
  var secret = {}, pool = [];

  var circle = Math.PI * 2, quarterCircle = Math.PI / 2;
  
  var Line = function() {
    throw "Please use `Line.new()` instead.";
  };
  Line.new = function Line_new(from, to) {
    var obj;
    if (pool.length) { obj = pool.pop(); }
    else { obj = Object.create(prototype); obj.cache = newCache(); }
    if (from) { obj.from.x = from.x; obj.from.y = from.y; }
    if (to) { obj.to.x = to.x; obj.to.y = to.y; }
    return obj;
  };
  
  function newCache() {
    var cache = {
      from: { x: 0, y: 0 }, to: { x: 0, y: 0 },
      dSq: 0, _dSq: false,
      d: 0, _d: false,
      diff: { x: 0, _x: false, y: 0, _y: false },
      norm: { x: 0, _x: false, y: 0, _y: false },
      a: 0, _a: false
    };
    return function(_secret) {
      if (_secret === secret) {
        return cache;
      }
      else {
        throw "Authentication failed.";
      }
    };
  }
  
  var vcomp;
  var prototype = Line.prototype = Object.create({}, {
    from: {
      get: (function() {
        var getter = Object.create({}, {
          x: {
            get: function() { var r = vcomp.fromX; vcomp = null; return r; },
            set: function(value) { vcomp.fromX = value; vcomp = null; }
          },
          y: {
            get: function() { var r = vcomp.fromY; vcomp = null; return r; },
            set: function(value) { vcomp.fromY = value; vcomp = null; }
          }
        });
    
        return function() { vcomp = this; return getter; };
      })(),
      set: function(value) {
      	this.fromX = value.x; this.fromY = value.y;
      }
    },
    fromX: {
      get: function() {
        var r = this.cache(secret).from.x; vcomp = null; return r;
      },
      set: function(value) {
        var c = this.cache(secret);
        if (value !== c.from.x) {
          c.from.x = value;
          c.diff._x = c._dSq = c._d = c.norm._x = c.norm._y = c._a = false;
        }
        c = null;
      }
    },
    fromY: {
      get: function() {
        var r = this.cache(secret).from.y; vcomp = null; return r;
      },
      set: function(value) {
        var c = this.cache(secret);
        if (value !== c.from.y) {
          c.from.y = value;
          c.diff._y = c._dSq = c._d = c.norm._x = c.norm._y = c._a = false;
        }
        c = null;
      }
    },

    to: {
      get: (function() {
        var getter = Object.create({}, {
          x: {
            get: function() { var r = vcomp.toX; vcomp = null; return r; },
            set: function(value) { vcomp.toX = value; vcomp = null; }
          },
          y: {
            get: function() { var r = vcomp.toY; vcomp = null; return r; },
            set: function(value) { vcomp.toY = value; vcomp = null; }
          }
        });
    
        return function() { vcomp = this; return getter; };
      })(),
      set: function(value) {
      	this.toX = value.x; this.toY = value.y;
      }
    },
    toX: {
      get: function() {
        var r = this.cache(secret).to.x; vcomp = null; return r;
      },
      set: function(value) {
        var c = this.cache(secret);
        if (value !== c.to.x) {
          c.to.x = value;
          c.diff._x = c._dSq = c._d = c.norm._x = c.norm._y = c._a = false;
        }
        c = null;
      }
    },
    toY: {
      get: function() {
        var r = this.cache(secret).to.y; vcomp = null; return r;
      },
      set: function(value) {
        var c = this.cache(secret);
        if (value !== c.to.y) {
          c.to.y = value;
          c.diff._y = c._dSq = c._d = c.norm._x = c.norm._y = c._a = false;
        }
        c = null;
      }
    },
    
    d: { get: function() {
        var c = this.cache(secret), r;
        if (c._d) { r = c.d; }
        else {
          r = c.d = (
            (c.from.x === c.to.x) ? (this.diffY < 0 ? -this.diffY : this.diffY) :
            (c.from.y === c.to.y) ? (this.diffX < 0 ? -this.diffX : this.diffX) :
            Math.sqrt(this.dSq)
          );
          c._d = true;
        }
        c = null; return r;
    } },
    distance: { get: function() { return this.d; } },
    
    dSq: { get: (function() {
      var a, b;
      return function() {
        var c = this.cache(secret), r;
        if (c._dSq) { r = c.dSq; }
        else {
          if (c._d) { r = c.dSq = c.d * c.d; }
          else {
            a = this.diffX; a *= a;
            b = this.diffY; b *= b;
            r = c.dSq = a + b;
          }
          c._dSq = true;
        }
        c = null; return r;
      };
    })() },
    distanceSquared: { get: function() { return this.dSq; } },
    
    diff: { get: (function() {
      var getter = Object.create({}, {
        x: { get: function() { var r = vcomp.diffX; vcomp = null; return r; } },
        y: { get: function() { var r = vcomp.diffY; vcomp = null; return r; } }
      });
      
      return function() { vcomp = this; return getter; };
    })() },
    difference: { get: function() { return this.diff; } },
    diffX: { get: function() {
      var c = this.cache(secret), r;
      if (c.diff._x) { r = c.diff.x; }
      else { r = c.diff.x = c.to.x - c.from.x; c.diff._x = true; }
      c = null; return r;
    } },
    differenceX: { get: function() { return this.diffX; } },
    diffY: { get: function() {
      var c = this.cache(secret).diff, r;
      if (c._y) { r = c.y; }
      else { r = c.y = this.to.y - this.from.y; c._y = true; }
      c = null; return r;
    } },
    differenceY: { get: function() { return this.diffY; } },
  
    norm: { get: (function() {
      var getter = Object.create({}, {
        x: { get: function() { var r = vcomp.normX; vcomp = null; return r; } },
        y: { get: function() { var r = vcomp.normY; vcomp = null; return r; } }
      });
      
      return function() { vcomp = this; return getter; };
    })() },
    normalized: { get: function() { return this.norm; } },
    
    normX: { get: function() {
      var c = this.cache(secret).norm, r;
      if (c._x) { r = c.x; }
      else {
        r = c.x = (this.d !== 0) ? this.diffX / this.d : NaN;
        c._x = true;
      }
      c = null; return r;
    } },
    normalizedX: { get: function() { return this.norm.x; } },
    
    normY: { get: function() {
      var c = this.cache(secret).norm, r;
      if (c._y) { r = c.y; }
      else {
        r = c.y = (this.d !== 0) ? this.diffY / this.d : NaN;
        c._y = true;
      }
      c = null; return r;
    } },
    normalizedY: { get: function() { return this.norm.y; } },

    angle: {
    	get: function() {
    		var c = this.cache(secret), r;
    		if (c._a) { r = c.a; }
    		else {
    			r = c.a = Math.atan2(this.diffX, -this.diffY);
    			c._a = true;
    		}
    		c = null; return r;
    	}
    }
  });
  prototype.destroy = function() {
    if (pool.length < Line.maxPoolSize) {
      var c = this.cache(secret);
      c.from.x = c.from.y = c.to.x = c.to.y = 0;
      c._dSq = c._d = c.diff._x = c.diff._y = c.norm._x = c.norm._y = false;
      
      pool.push(this);
      c = null;
    }
  };
  (function() {
    var maxPoolSize = Infinity;
    Object.defineProperty(Line, "maxPoolSize", {
      get: function() { return maxPoolSize; },
      set: function(value) {
        maxPoolSize = value;
        if (pool.length > maxPoolSize) { pool.length = maxPoolSize; }
      }
    });
  })();
  
  return Line;
})();