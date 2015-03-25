var drawTrail = (function() {
	var width = 20, mid = width / 2, tailOffset;
	var dashLength = width * 2.5, gapLength = width, lineLength = dashLength + gapLength;
	var offset = 0, offsetSpeed = lineLength * 2 / 1000, _offset = false;

	var source = (function() {
		var source = document.createElement("CANVAS");
		source.width = (width * 3) + 2; source.height = lineLength;

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

		{ /* tail
			context.save(); context.translate(0, 20);

			var circle = Math.PI * 2, halfCircle = Math.PI, quarterCircle = Math.PI / 2;
			var radius = Flag.radius, x = 20, c = Math.asin((width/2)/radius);

			context.beginPath();
			context.moveTo(mid, 0);
			context.arc(mid, mid + radius, radius, -quarterCircle + c, -quarterCircle - c, true);
			context.closePath();
			context.fill();

			tailOffset = Math.ceil(radius - Math.sqrt((radius * radius) - ((x / 2) * (x / 2))));

			context.restore();
		//*/ }
		{ // dash
			context.save(); context.fillStyle = gradient; context.translate(width + 1, 0);

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

		/*
		window.addEventListener("load", function() {
			document.body.appendChild(source).style.cssText = (
				"position: absolute; top:0; left: 0; border:1px solid #999;"
			);
		});
		//*/

		context.translate((width + 1) * 2, 0);
		context.beginPath(); context.rect(0, 0, width, lineLength); context.clip();
		source.render = function() {
			context.clearRect(0, 0, width, lineLength);
			context.drawImage(source, width + 1, 0, width, dashLength, 0, -offset, width, dashLength);
			context.drawImage(source, width + 1, 0, width, dashLength, 0, lineLength-offset, width, dashLength);
			//context.drawImage(source, (width + 1) * 2, 0, 0, dashLength, width, -offset,              width, dashLength);
			//context.drawImage(source, (width + 1) * 2, 0, 0, dashLength, width, -offset + lineLength, width, dashLength);
		};
		source.pattern = null;

		return source;
	})();

	var radius = Flag.radius;
	var outFrom, outTo, outPoint;
	//(function() {
		var quarterCircle = Math.PI / 2;
		var c = Math.asin((width / 2) / radius);
		outFrom = -quarterCircle - c; outTo = -quarterCircle + c;
		outPoint = radius + mid - Math.sqrt((radius * radius) - ((width / 2) * (width / 2)));
	//})();

	var line = Line.new(), pattern;
	function drawTrail(fromX, fromY, toX, toY, offset, precise) {
		precise = (precise !== false);
		if (!_offset) {
			source.render();
			pattern = context.createPattern(source, "repeat-y");
			_offset = true;
		}
		offset *= lineLength;

		line.fromX = fromX; line.fromY = fromY;
		line.toX = toX; line.toY = toY;
		if (!precise) {
			toX = line.toX - (line.normX * radius);
			toY = line.toY - (line.normY * radius);
			line.toX = toX; line.toY = toY;
		}

		//console.log(line.fromX, line.fromY, line.toX, line.toY);
		console.log(line.fromX);

		context.save();
		context.rotate(line.angle);
		context.translate(line.fromX, line.fromY);

		if (line.distance > radius) {
			if (line.distance >= radius + mid) {
				context.beginPath();
				context.arc(0, 0, radius, -quarterCircle - c, -quarterCircle + c, false);
				context.lineTo(mid, -(line.distance - mid));
				context.lineTo(0, -(line.distance));
				context.lineTo(-mid, -(line.distance - mid));
				context.closePath();
				context.clip();

				context.drawImage(source, 0, 0, width, width, -mid, -Flag.radius - mid, width, width);
				context.drawImage(source, 0, 0, width, width, -mid, -line.distance, width, width);

				context.translate((-width * 2.5) - 2, offset);
				context.fillStyle = pattern;
				context.fillRect((width * 2) + 2, line.fromY - offset, width, -line.distance);
			}
			else {
				context.beginPath();
				context.moveTo(0, -(radius + mid - tailOffset));
				context.arc(0, 0, radius, -quarterCircle - c, -quarterCircle + c, false);
				context.closePath();
				context.fillStyle = "white"; context.fill();
			}
		}

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