var HTML;

var canvas = HTML = document.createElement("CANVAS");
var context;
if (!HTML.getContext || !(context = HTML.getContext("2d"))) {
	throw HTML.innerHTML = "Browser does not support Canvas.";
}

var width = HTML.width = 500, height = HTML.height = 300;
HTML.offset = null;

var circle = Math.PI * 2;

context.fillRect(0, 0, width, height);
context.font = "bold 120px courier new";
context.textAlign = "center";
context.textBaseline = "middle";

var view = {
	bits: [], attractors: [],
	offset: { x: 0, y: 0 },
	coord: function(dimension, value) {
		return value - HTML.offset[dimension] - this.offset[dimension];
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
Attractor.clickRange = 100;
Attractor.clickRangeSq = Attractor.clickRange * Attractor.clickRange;
Attractor.countPerMS = 10 / 1000;
Attractor.render = function(attractor) {
	context.save();
	context.globalAlpha = 0.25 + (0.25 * attractor.interfacing);
	if (attractor.interfacing && (attractor.count === 100)) { context.fillStyle = "red"; }
	context.beginPath();
	context.arc(attractor.x, attractor.y, 100, 0, circle, true);
	context.fill();
	context.restore();

	context.beginPath();
	context.arc(attractor.x, attractor.y, Attractor.clickRange, 0, circle, true);
	context.arc(attractor.x, attractor.y, Attractor.clickRange * 0.9, 0, circle, false);
	context.fill();

	context.fillText(attractor.countString, attractor.x, attractor.y, Attractor.clickRange * Math.PI / 2);
};

for (var i = 0; i < 100; i++) {
	view.bits.push(new Bit(Math.random() * width, Math.random() * height));
}
view.attractors.push(new Attractor(250, 150));

var mouse = { x: -1, y: -1, active: false };
var input = [], drag, attract;
input.handle = function(input) {
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
		console.log("handle attract");
		if (!input.attractor) {
			var attractors = view.attractors, range = Attractor.clickRangeSq;
			var found = false;
			
			// offset
			logger.style.position = "absolute";
			logger.style.left = input.centre.x + "px";
			logger.style.top = input.centre.y + "px";
			logger.style.backgroundColor = "red";

			var x = view.coord("x", input.centre.x), y = view.coord("y", input.centre.y);
			var a, b;

			for (var i = 0, l = attractors.length; i < l; i++) {
				a = x - attractors[i].x; a *= a;
				b = y - attractors[i].y; b *= b;
				console.log(a + b, range);
				if (a + b <= range) {
					input.attractor = attractors[i];
					attractors[i].interfacing = true;
					found = true;
					break;
				}
			}

			if (!found) {
				attract = null; return true;
			}
		}

		if (input.attractor.count < 100) {
			var to = +new Date();

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

/*
window.addEventListener("mousemove", function(e) {
	if (e.target === HTML) {
		mouse.x = e.offsetX; mouse.y = e.offsetY;
		mouse.active = true;
	}
	else {
		mouse.active = false;
	}
});
*/
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
			from: +new Date(),
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

requestAnimationFrame(function() {
	HTML.offset = { x: HTML.offsetLeft, y: HTML.offsetTop };
});

requestAnimationFrame(function frame() {
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
		context.fillRect(0, 0, width, height);

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
