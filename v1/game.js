var HTML;

var canvas = HTML = document.createElement("CANVAS");
var context;
if (!HTML.getContext || !(context = HTML.getContext("2d"))) {
	throw HTML.innerHTML = "Browser does not support Canvas.";
}

HTML.offset = null;

var circle = Math.PI * 2;

var view = {
	setup: function() {
		context.fillStyle = "black";
		context.font = "bold " + Attractor.radius + "px 'courier new'";
		console.log(context.font);
		context.textAlign = "center";
		context.textBaseline = "middle";
	},
	bits: [], attractors: [],
	offset: { x: 0, y: 0 },
	coord: function(dimension, value) {
		return value - HTML.offset[dimension] - this.offset[dimension];
	},
	size: {
		x: 0, y: 0,
		update: function() {
			this.x = HTML.width = window.innerWidth;
			this.y = HTML.height = window.innerHeight;
			this.stale = false;
			view.setup();
		},
		stale: true
	}
};

function Bit(x, y) {
	this.x = x; this.y = y;
}
Bit.render = function(bit) {
	context.fillRect(bit.x - 1, bit.y - 1, 2, 2);
};
Bit.update = function(bit) {
	
};

function Attractor(x, y) {
	this.x = x; this.y = y;
	this.interfacing = false;
	this.count = 1; this.countString = "1";
}
Attractor.radius = 50; Attractor.radiusSq = Attractor.radius * Attractor.radius;
Attractor.clickRange = Attractor.radius * 2;
Attractor.clickRangeSq = Attractor.clickRange * Attractor.clickRange;
Attractor.countPerMS = 50 / 1000;
Attractor.render = function(attractor) {
	context.save();
	context.globalAlpha = 0.25 + (0.25 * attractor.interfacing);
	if (attractor.interfacing && (attractor.count === 100)) { context.fillStyle = "red"; }
	context.beginPath();
	context.arc(attractor.x, attractor.y, Attractor.radius, 0, circle, true);
	context.fill();
	context.restore();

	context.beginPath();
	context.arc(attractor.x, attractor.y, Attractor.radius, 0, circle, true);
	context.arc(attractor.x, attractor.y, Attractor.radius * 0.9, 0, circle, false);
	context.fill();

	context.fillText(attractor.countString, attractor.x, attractor.y, Attractor.radius * Math.PI / 2);
};

context.fillRect(0, 0, Infinity, Infinity);

var mouse = { x: -1, y: -1, active: false };
var input = [], drag, attract;
input.handle = (function() {
	var attractors = view.attractors, range = Attractor.clickRangeSq, radius = Attractor.radiusSq;
	var attractorCandidate = { distanceSq: -1, attractor: null };
	var i, l;
	var x, y;
	var a, b;
	var to;
	
	return function(input) {
		if (input.type === "drag") {
			if (input.from.x !== input.to.x) { view.offset.x += input.to.x - input.from.x; }
			if (input.from.y !== input.to.y) { view.offset.y += input.to.y - input.from.y; }

			if (input === drag) {
				input.from.x = input.to.x;
				input.from.y = input.to.y;
			}
			else { return true; }
		}
		else if (input.type === "attract") {
			if (!input.attractor) {
				// offset
				logger.style.position = "absolute";
				logger.style.left = input.centre.x + "px";
				logger.style.top = input.centre.y + "px";
				logger.style.backgroundColor = "red";

				x = view.coord("x", input.centre.x); y = view.coord("y", input.centre.y);

				for (i = 0, l = attractors.length; i < l; i++) {
					a = x - attractors[i].x; a *= a;
					b = y - attractors[i].y; b *= b;

					if (a + b <= radius) {
						attractorCandidate.attractor = attractors[i];
						break;
					}
					else if (
						(a + b <= range) && 
						((attractorCandidate.distanceSq === -1) || (a + b < attractorCandidate.distanceSq))
					) {
						attractorCandidate.distanceSq = a + b;
						attractorCandidate.attractor = attractors[i];
					}
				}

				if (attractorCandidate.attractor) {
					input.attractor = attractorCandidate.attractor;
					attractorCandidate.attractor.interfacing = true;
					
					// reset
					attractorCandidate.attractor = null;
					attractorCandidate.distanceSq = -1;
				}
				else {
					// add new Attractor
					view.attractors.push(input.attractor = new Attractor(x, y));
				}
			}

			if (input.attractor.count < 100) {
				to = (input.to !== null ? input.to : +new Date());

				if (input.from < to) {
					input.attractor.count += (to - input.from) * Attractor.countPerMS;
					if (input.attractor.count > 100) {
						input.attractor.count = 100;
						input.attractor.countString = "100";
					}
					else {
						input.attractor.countString = (input.attractor.count | 0) + "";
					}

					// reset time
					input.from = to;
				}
			}

			if (input !== attract) {
				input.attractor.interfacing = false;
				return true;
			}
		}
	};
})();

for (var i = 0; i < 100; i++) {
	view.bits.push(new Bit(Math.random() * 100, Math.random() * 100));
}
input.push({
	type: "attract", attractor: null,
	from: +new Date(), to: +new Date() + 1000,
	centre: { x: 100, y: 100 }
});
input.push({
	type: "attract", attractor: null,
	from: +new Date(), to: +new Date() + 1000,
	centre: { x: 100, y: 201 }
});

window.addEventListener("mousedown", function(e) {
	if (e.button === 1) {
		input.push(drag = {
			type: "drag",
			from: { x: e.pageX, y: e.pageY },
			to: { x: e.pageX, y: e.pageY }
		});
	}
	else if (e.button === 0) {
		input.push(attract = {
			type: "attract", attractor: null,
			from: +new Date(), to: null,
			centre: { x: e.pageX, y: e.pageY }
		});
	}
});
window.addEventListener("mousemove", function(e) {
	if (drag) {
		drag.to.x = e.pageX;
		drag.to.y = e.pageY;
	}
});
window.addEventListener("mouseup", function(e) {
	if (e.button === 1) {
		if (drag) {
			drag.to.x = e.pageX;
			drag.to.y = e.pageY;
			drag = null;
		}
	}
	else if (e.button === 0) {
		if (attract) {
			attract.attractor.interfacing = false;
			attract.to = +new Date();
			attract = null;
		}
	}
});

window.addEventListener("resize", function() { view.size.stale = true; });

requestAnimationFrame(function() {
	HTML.offset = { x: HTML.offsetLeft, y: HTML.offsetTop };
});

requestAnimationFrame(function frame() {
	if (view.size.stale) { // resize
		view.size.update();
	}

	{ // update
		for (var i = 0, l = input.length; i < l; i++) {
			if (input.handle(input[i])) {
				input.splice(i, 1);
				i--; l--;
			}
		}

		view.bits.forEach(Bit.update);
	}

	{ // render
		// bg
		context.fillRect(0, 0, view.size.x, view.size.y);

		// view
		context.save();
		context.translate(view.offset.x, view.offset.y);

		// bits
		context.fillStyle = "white";
		view.bits.forEach(Bit.render);
		
		// attractors
		view.attractors.forEach(Attractor.render);

		context.restore();
	}

	requestAnimationFrame(frame);
});
