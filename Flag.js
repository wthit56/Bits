var Flag = (function() {
	var all = [], count = 0, pool = [], poolEmpty = true;

	var circle = Math.PI * 2, halfCircle = Math.PI;

	var radius = 50, radiusSquared = radius * radius;
	var clickRadius = radius * 2, clickRadiusSquared = clickRadius * clickRadius;

	var i;

	function Flag() { throw "Do not use `new Flag()`."; }
	Flag.radius = radius;
	
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

		var line = Line.new(), trailLine = Line.new();

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
				function render() {
					if (parent && (line.distanceSquared > radiusSquared) && show) {
						context.save();

						context.translate(this.x, this.y);
						context.moveTo(tempRadius, 0);
						context.arc(0, 0, tempRadius, 0, circle, true);

						context.restore();
					}
				}
				render.line = function() {
					if (parent && (line.distanceSquared > radiusSquared)) {
						drawTrail(parent, temp);
					}
				};

				return render;
			})()
		};
		Object.defineProperties(temp, {
			radius: { get: function() { return tempRadius; } },

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
			show: { get: function() { return show; } },

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
		drawTrail.update();
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
		context.stroke();

		context.restore();

		temp.render.line();
	};

	return Flag;
})();