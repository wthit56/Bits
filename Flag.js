var Flag = (function() {
	var all = [], count = 0, pool = [], poolEmpty = true;

	var circle = Math.PI * 2, halfCircle = Math.PI;

	var radius = 50, radiusSquared = radius * radius;
	var clickRadius = radius * 2, clickRadiusSquared = clickRadius * clickRadius;

	var i;

	function Flag() { throw "Do not use `new Flag()`."; }
	Flag.add = function(x, y, parent) {
		var obj;
		if (poolEmpty) {
			obj = Object.create({}, Flag.prototype);
		}
		else {
			obj = pool.pop();
			poolEmpty = (pool.length === 0);
		}
		
		obj.x = x;
		obj.y = y;
		obj.parent = parent;
		obj.complete = Math.random();
		obj.share = Math.random();
		all.push(obj);
		count++;
		
		return obj;
	};
	Flag.remove = function(flag) {
		var index = all.indexOf(flag);
		if (index === -1) {
			flag.parent = flag.children = null;
		}
		else {
			all.splice(index, 1);
			count--;
			pool.push(flag);
			flag.parent = null;
			flag.children.length = 0;
		}
	};

	var findFlag = (function() {
		var line = Line.new(), distanceSquared;
		return function findFlag(x, y, nearest) {
			var found = null;
			line.from.x = x; line.from.y = y;
			for (i = 0; i < count; i++) {
				line.to = all[i];
				if (line.distanceSquared <= radiusSquared) {
					found = all[i]; break;
				}
				else if (
					(line.distanceSquared <= clickRadiusSquared) &&
					((found === null) || (line.distanceSquared < distanceSquared))
				) {
					found = all[i];
					if (!nearest) { break; }
					distanceSquared = line.distanceSquared;
				}
			}
			return found;
		};
	})();

	Flag.findNearest = function(x, y) {
		return findFlag(x, y, true);
	};
	Flag.isNear = function(x, y) {
		return !findFlag(x, y, false);
	};

	var temp = Flag.temp = (function() {
		var parent = null;
		var dropping = false, show = false;
		var x = 0, y = 0, stale = true;

		var tempRadius = 30;

		var line = Line.new();

		var temp = {
			update: function() {
				if (parent) {
					if (stale) {
						show = Flag.isNear(x, y);
						line.toX = x; line.toY = y;
					}
				}
				if (dropping) {
					if (show) {
						Flag.add(x, y, this.parent);
						show = false;
					}
					this.parent = null;
					dropping = false;
				}
			},
			render: (function() {
				var toRadius;
				return function() {
					if (parent && (line.distanceSquared > radiusSquared)) {
						context.moveTo(line.fromX + (line.normX * radius), line.fromY + (line.normY * radius));
						if (show) {
							context.lineTo(line.toX - (line.normX * tempRadius), line.toY - (line.normY * tempRadius));

							context.save();
							
							context.translate(this.x, this.y);
							context.moveTo(tempRadius, 0);
							context.arc(0, 0, tempRadius, 0, circle, true);
							
							if (line.distance - radius - tempRadius > 30) {
								context.rotate(line.angle);
								context.moveTo(0, tempRadius);
								context.lineTo(10, tempRadius+20);
								context.lineTo(-10, tempRadius+20);
								context.lineTo(0, tempRadius);
							}

							context.restore();
						}
						else {
							context.lineTo(line.toX, line.toY);
						}
					}
				};
			})()
		};
		Object.defineProperties(temp, {
			parent: {
				get: function() { return parent; },
				set: function(value) {
					if (value !== parent) {
						parent = value;
						if (parent) {
							stale = true;
							line.from = this.parent;
						}
						else { dropping = true; }
					}
				}
			},

			x: {
				get: function() { return x; },
				set: function(value) {
					if (value !== x) {
						x = value;
						stale = true;
					}
				}
			},
			y: {
				get: function() { return y; },
				set: function(value) {
					if (value !== y) {
						y = value;
						stale = true;
					}
				}
			}
		});
		return temp;
	})();

	Flag.update = function() {
		temp.update();
	};
	Flag.render = function() {
		context.save();
		
		context.beginPath();
		
		temp.render();

		for (i = 0; i < count; i++) {
			context.save();
			context.translate(all[i].x, all[i].y);
			context.moveTo(radius, 0);
			context.arc(0, 0, radius, 0, circle, true);
			context.restore();
		}
		context.strokeStyle = "white"; context.stroke();
		context.restore();
	};

	//Flag.prototype = {};

	return Flag;
})();



/*
var flags = (function() {
	var flags = [], flagsCount = 0, pool = [];

	//window.flags_all = flags;

	var radius = 50, interactRadius = radius * 2,
		radiusSq = radius * radius, interactRadiusSq = interactRadius * interactRadius;
	var tempRadius = 30, tempRadiusSq = tempRadius * tempRadius;

	var shareLine = 5, completeLine = 10, outerLine = 2;
	var statPad = 2, innerRadius = radius - outerLine - statPad;

	var circle = Math.PI * 2, quarterCircle = Math.PI / 2;

	var childTrail = (function() {
		var toRadius, line = Line.new();
		return function childTrail() { // (line, temp) || (parent, child)
			var line, isTemp;
			if (arguments[0] instanceof Line) {
				line = line; temp = arguments[1];
			}
			else {
				line = Line.new(arguments[0], arguments[1]);
				isTemp = (arguments[1] === _.temp);
			}

			toRadius = (isTemp ? tempRadius : radius);
			if (line.distance - radius - toRadius > 0) {
				context.beginPath();
				context.moveTo(line.fromX + (line.normX * radius), line.fromY + (line.normY * radius));
				context.lineTo(line.toX - (line.normX * toRadius), line.toY - (line.normY * toRadius));
				context.stroke();
			}

			if (!(arguments[0] instanceof Line)) {
				line.destroy();
			}
		};
	})();

	var instance_destroy = (function() {
		var children;

		return function instance_destroy() {
			this.share = 0;
			this.parent = null;
			
			children = this.children;
			while (children.length) {
				children.pop().parent = null;
			}
			children = null;

			pool.push(this);

			this.dead = true;

			var index = flags.indexOf(this);
			if (index !== -1) { flag.splice(index, 1); }
			flagsCount--;
		};
	})();

	var i, flag;
	var _ = {};
	_.temp = {
		x: 0, y: 0,
		show: false, parent: null,
		display: function(parent) {
			this.parent = parent;
			this.show = true;
		},
		place: function() {
			if (this.show) {
				if (!_.findByPoint(this.x, this.y)) {
					_.add(this.x, this.y, this.parent);
				}
				this.parent = null;
				this.show = false;
			}
		}
	}

	_.add = function(x, y, parent) {
		var obj;
		if (pool.length) {
			obj = pool.pop();
			obj.x = x; obj.y = y;
			obj.parent = parent;
		}
		else {
			obj = {
				x: x, y: y,
				share: ((1 + Math.random() + 0) / 3),
				complete: ((1 + Math.random() + 0) / 3),
				parent: parent, children: [], dead: false,
				destroy: instance_destroy
			};
		}
		
		if (parent) { parent.children.push(obj); }
		flags.push(obj);
		flagsCount++;
		return obj;
	};
	_.remove = function(flag) {
		flag.destroy();
	};

	_.findByPoint = (function() {
		var distanceSq;

		var a, b, d;
		return function(x, y) {
			var result;
			for (i = 0; i < flagsCount; i++) {
				flag = flags[i];

				a = x - flag.x; a *= a;
				b = y - flag.y; b *= b;

				d = a + b;
				if (d < radiusSq) {
					result = flag;
					break;
				}
				else if (
					(d < interactRadiusSq) &&
					(
						!result ||
						(d < distanceSq)
					)
				) {
					result = flag;
					distanceSq = d;
				}
			}
			flag = null;

			return result;
		};
	})();

	_.render = (function() {
		var share, complete;
		var temp = _.temp;
		var normX, normY;
		var allowFlag = false;
		var norm;

		return function() {
			context.save();
			context.fillStyle = "white";

			if (temp.show) {
				allowFlag = !_.findByPoint(temp.x, temp.y);

				if (allowFlag) {
					childTrail(temp.parent, temp);

					context.save();
					context.translate(temp.x, temp.y);

					context.beginPath();
					context.moveTo(tempRadius, 0);
					context.arc(0, 0, tempRadius, 0, circle, true);
					context.arc(0, 0, tempRadius - outerLine, circle, 0, false);

					context.fill();

					context.restore();
				}
				else {
					var line = Line.new(temp.parent, temp);
					
					line.destroy();
				}
			}

			context.save();
			context.beginPath();
			for (i = 0; i < flagsCount; i++) {
				flag = flags[i];

				context.save();

				context.translate(flag.x, flag.y);

				share = (circle * flag.share) - quarterCircle;
				complete = (circle * flag.complete) - quarterCircle;

				// outer
				context.moveTo(radius, 0);

				context.arc(0, 0, radius, circle, 0, false);
				context.arc(0, 0, radius - outerLine, 0, circle, true);

				// inner
				context.moveTo(0, -(radius - statPad));
				context.arc(0, 0, innerRadius, -quarterCircle, share, false);
				context.arc(0, 0, innerRadius - shareLine, share, complete, complete < share);
				context.arc(0, 0, innerRadius - shareLine - completeLine, complete, -quarterCircle, true);
				context.lineTo(0, -innerRadius);

				context.restore();
			}
			context.fill();
			context.restore();

			context.restore();

			flag = null;
		};
	})();
	
	return _;
})();
*/