function distanceSq(fromX, fromY, toX, toY) {
	fromX = toX - fromX; fromY = toY - fromY;
	return (fromX * fromX) + (fromY * fromY);
}
