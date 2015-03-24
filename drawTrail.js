var drawTrail = (function() {
	var width = 20, mid = width / 2;
	var dashLength = 40, gapLength = 20, lineLength = dashLength + gapLength;
	var offset = 0, offsetSpeed = 100 / 1000, _offset = false;

	var source = (function() {
		var source = document.createElement("CANVAS");
		source.width = 60; source.height = lineLength;

		var context = source.getContext("2d");

		var gradient = context.createLinearGradient(0, 0, 0, dashLength);
		gradient.addColorStop(0, "white");
		gradient.addColorStop(1, "rgba(255,255,255,0)");

		context.fillStyle = "white";
		{ // head
			context.save(); context.translate(0, 0);

			context.beginPath();
			context.moveTo(mid, 0);
			context.lineTo(width, mid);
			context.lineTo(width, width);
			context.lineTo(mid, mid);
			context.lineTo(0, width);
			context.lineTo(0, mid);
			context.closePath();

			context.fill(); context.restore();
		}

		{ // tail
			context.save(); context.translate(0, 20);

			var circle = Math.PI * 2, halfCircle = Math.PI, quarterCircle = Math.PI / 2;
			var radius = Flag.radius, x = 20, c = Math.asin((width/2)/radius);

			context.beginPath();
			context.moveTo(mid, 0);
			context.arc(mid, mid + radius, radius, -quarterCircle + c, -quarterCircle - c, true);
			context.closePath();
			context.fill();

			source.tailOffset = Math.ceil(radius - Math.sqrt((radius * radius) - ((x / 2) * (x / 2))));

			context.restore();
		}
		{ // dash
			context.save(); context.fillStyle = gradient; context.translate(20, 0);

			context.beginPath();
			context.moveTo(mid, 0);
			context.lineTo(width, mid);
			context.lineTo(width, dashLength);
			context.lineTo(mid, dashLength - mid);
			context.lineTo(0, dashLength);
			context.lineTo(0, mid);
			context.closePath();

			context.fill(); context.restore();
		}

		window.addEventListener("load", function() {
			document.body.appendChild(source).style.cssText = (
				"position: absolute; top:0; left: 0; border:1px solid #999;"
			);
		});

		context.translate(20, 0);
		context.rect(20, 0, 20, lineLength); context.clip();
		source.render = function() {
			context.clearRect(20, 0, 20, 80);
			context.drawImage(source, width, 0, width, dashLength, width, -offset, 				width, dashLength);
			context.drawImage(source, width, 0, width, dashLength, width, -offset + lineLength, width, dashLength);
		};
		source.pattern = null;

		return source;
	})();

	var line = Line.new(), pattern;
	function drawTrail(from, to) {
		if (!_offset) {
			source.render();
			pattern = context.createPattern(source, "repeat-y");
			_offset = true;
		}

		line.from = from; line.to = to;
		
		context.save();
		context.rotate(line.angle);
		context.translate(line.fromX - width * 2.5, line.fromY);
		context.fillStyle = pattern;
		context.fillRect((width * 2), line.fromY, width, -line.distance);
		context.restore();
	};
	drawTrail.update = (function() {
		var time = +new Date(), newTime;
		return function() {
			offset = (offset + (offsetSpeed * ((newTime = +new Date()) - time))) % lineLength;
			//source.render();
			_offset = false;
			time = newTime;
		};
	})();

	return drawTrail;
})();