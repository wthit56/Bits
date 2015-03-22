var view = {
	setup: function() {
		context.fillStyle = "black";
		context.strokeStyle = "white"//, "rgba(255,255,255,0.5)";
		context.lineWidth = 1.5;
		//context.fillRect(0, 0, this.size.x, this.size.y);
	},
	centre: {
		x: 150, y: 75
	},
	coord: {
		x: function(value) { return value - view.centre.x; },
		y: function(value) { return value - view.centre.y; }
	},
	size: {
		x: 300, y: 150, stale: true,
		update: (function() {
			var oldX, oldY;
			return function() {
				if (this.stale) {
					oldX = this.x; oldY = this.y;
					
					this.x = HTML.width = window.innerWidth;
					this.y = HTML.height = window.innerHeight;

					view.centre.x += (this.x - oldX) / 2;
					view.centre.y += (this.y - oldY) / 2;

					this.stale = false;
					view.setup();
				}
			};
		})()
	}
};
