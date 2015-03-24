HTML = document.createElement("CANVAS")
HTML.style.transform = "0, 0, 0";
var context;
if (HTML.getContext && (context = HTML.getContext("2d"))) {
	view.setup();
	Flag.add(0, 0);

	window.addEventListener("resize", function() {
		view.size.stale = true;
	});
	window.addEventListener("mousedown", input.down);
	window.addEventListener("mousemove", input.move);
	window.addEventListener("mouseup", input.up);

	requestAnimationFrame(function raf() {
		view.size.update();
		input.handle();
		Flag.update();
		drawTrail.update();

		context.fillRect(0, 0, view.size.x, view.size.y);

		context.save();
		context.translate(view.centre.x, view.centre.y);

		Flag.render();
		context.restore();

		requestAnimationFrame(raf);
	});
}
else {
	throw HTML.innerText = "Browser does not support Canvas.";
}