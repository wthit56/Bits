var input = (function() {
	var input = [], flagging;
	input.down = function(e) {
		if (e.button === 0) { // left-click
			if (!flagging) {
				input.push(flagging = {
					type: "flag", flag: null, action: "",
					from: { x: e.pageX, y: e.pageY },
					to: { x: e.pageX, y: e.pageY }
				});
			}
		}
	};
	input.move = function(e) {
		if (flagging) {
			flagging.to.x = e.pageX;
			flagging.to.y = e.pageY;
		}
	};
	input.up = function(e) {
		if (e.button === 0) {
			console.log("up");
			if (flagging) {
				flagging.to.x = e.pageX;
				flagging.to.y = e.pageY;
				console.log("parent to null");
				Flag.temp.parent = null;
				flagging = null;
			}
		}
	};

	input.handle = (function() {
		var i, l, input, found;
		var x, y;
		return function() {
			for (i = 0, l = this.length; i < l; i++) {
				input = this[i];
				if (input.type === "flag") {
					if (!input.flag) {
						x = view.coord.x(input.from.x);
						y = view.coord.y(input.from.y);

						found = Flag.findNearest(x, y);
						if (found) {
							input.flag = found;
							console.log("nearest found", found);
							Flag.temp.parent = found;
							found = null;
						}
					}
					
					Flag.temp.x = view.coord.x(input.to.x);
					Flag.temp.y = view.coord.y(input.to.y);

					if (input !== flagging) {
						this.splice(i, 1); i--; l--;
					}
				}
			}
		};
	})();

	return input;
})();