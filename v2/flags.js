var flags = (function() {
	var flags = [], flagsCount = 0, pool = [];

	//window.flags_all = flags;

	var radius = 50, interactRadius = radius * 2,
		radiusSq = radius * radius, interactRadiusSq = interactRadius * interactRadius;
	var tempRadius = 30, tempRadiusSq = tempRadius * tempRadius;

	var shareLine = 5, completeLine = 10, outerLine = 2;
	var statPad = 2, innerRadius = radius - outerLine - statPad;

	var circle = Math.PI * 2, quarterCircle = Math.PI / 2;

	var toRadius;
	function childTrail(parent, child) {
		d = Math.sqrt(distanceSq(child.x, child.y, parent.x, parent.y));
		toRadius = (child === _.temp ? tempRadius : 0);
		if (d - radius - toRadius > 0) {
			normX = (child.x - parent.x) / d; normY = (child.y - parent.y) / d;
			context.beginPath();
			context.moveTo(parent.x + (normX * radius), parent.y + (normY * radius));
			context.lineTo(child.x - (normX * toRadius), child.y - (normY * toRadius));
			context.stroke();
		}
	}

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
					normalize(temp.x - temp.parent.x, temp.y - temp.parent.y, norm);
					
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