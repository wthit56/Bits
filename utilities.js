function distanceSq(fromX, fromY, toX, toY) {
	fromX = toX - fromX; fromY = toY - fromY;
	return (fromX * fromX) + (fromY * fromY);
}

var normalize = function normalize(into, x, y, d, dSq) {
	if (!into) { into = { x: 0, y: 0 }; }
	if (d == null) {
		if (dSq != null) { d = Math.sqrt(dSq); }
		else { d = Math.sqrt(distanceSq(0, 0, x, y)); }
	}
	into.x = x / d; into.y = y / d;
	return into;
}