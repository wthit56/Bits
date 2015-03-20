HTML = document.createElement("CANVAS")
var context;
if (HTML.getContext && (context = HTML.getContext("2d"))) {
	view.setup();
	flags.add(0, 0);

	window.addEventListener("resize", function() {
		view.size.stale = true;
	});
	window.addEventListener("mousedown", input.down);
	window.addEventListener("mousemove", input.move);
	window.addEventListener("mouseup", input.up);

	requestAnimationFrame(function raf() {
		view.size.update();
		input.handle();

		//context.fillStyle = "hsl(0,0%,"+(Math.random()*0.05*100)+"%)";
		context.fillRect(0, 0, view.size.x, view.size.y);

		context.save();
		context.translate(view.centre.x, view.centre.y);
		flags.render();
		context.restore();

		requestAnimationFrame(raf);
	});
}
else {
	throw HTML.innerText = "Browser does not support Canvas.";
}