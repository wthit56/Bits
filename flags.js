var flags = (function() {
	var flags = [], flagsCount = 0, pool = [];

	//window.flags_all = flags;

	var radius = 50, interactRadius = radius * 2,
		radiusSq = radius * radius, interactRadiusSq = interactRadius * interactRadius;

	var shareLine = 5, completeLine = 10, outerLine = 2;
	var statPad = 2, innerRadius = radius - outerLine - statPad;

	var circle = Math.PI * 2, quarterCircle = Math.PI / 2;

	function instance_destroy() {
		this.share = 0;
		this.parent = null;
		console.log("*TODO handle flag children");
		pool.push(this);
		flagsCount--;
	}

	var i, flag;
	return {
		add: function(x, y) {
			var obj;
			if (pool.length) {
				obj = pool.pop();
				obj.x = x; obj.y = y;
			}
			else {
				obj = {
					x: x, y: y,
					share: ((1 + Math.random() + 0) / 3),
					complete: ((1 + Math.random() + 0) / 3),
					parent: null, children: null,
					destroy: instance_destroy
				};
			}
			flags.push(obj);
			flagsCount++;
			return obj;
		},

		findByPoint: (function() {
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
		})(),

		render: (function() {
			var share, complete;

			return function() {
				for (i = 0; i < flagsCount; i++) {
					flag = flags[i];

					context.save();

					context.translate(flag.x, flag.y);

					share = (circle * flag.share) - quarterCircle;
					complete = (circle * flag.complete) - quarterCircle;

					context.beginPath();
					
					// Path2D?
					context.arc(0, 0, radius, -quarterCircle, circle - quarterCircle, true);
					context.arc(0, 0, radius - outerLine, circle - quarterCircle, -quarterCircle, false);

					context.moveTo(0, -(radius - statPad));
					context.arc(0, 0, innerRadius, -quarterCircle, share, false);
					context.arc(0, 0, innerRadius - shareLine, share, complete, complete < share);
					context.arc(0, 0, innerRadius - shareLine - completeLine, complete, -quarterCircle, true);
					context.lineTo(0, -innerRadius);

					context.fillStyle = "white"; context.fill();

					context.restore();
				}
				flag = null;
			};
		})()
	};
})();