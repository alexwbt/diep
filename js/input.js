
//keyboard
var keys = {
	down: [],
	listeners: [],

	pressed: function(keyCode) {
		for (var i in this.down) {
			if (keyCode === this.down[i].keyCode) {
				return true;
			}
		}
		return false;
	},

	callListeners: function(keyCode) {
		if (this.listeners[keyCode]) {
			for (var i in this.listeners[keyCode]) {
				this.listeners[keyCode][i]();
			}
		}
	},

	addListener: function(keyCode, func) {
		if (!this.listeners[keyCode]) {
			this.listeners[keyCode] = [];
		}
		this.listeners[keyCode].push(func);
		return func;
	},

	removeListener: function(keyCode, func) {
		if (!this.listeners[keyCode]) {
			return;
		}
		this.listeners[keyCode] = this.listeners[keyCode].filter(i => i !== func);
		if (this.listeners[keyCode].length < 1) {
			this.listeners[keyCode] = undefined;
		}
	}
};

window.addEventListener("keydown", function(e) {
	for (var i in keys.down) {
		if (e.keyCode === keys.down[i].keyCode) {
			keys.down[i] = e;
			return;
		}
	}

	keys.down.push(e);
	keys.callListeners(e.keyCode);
});

window.addEventListener("keyup", function(e) {
	for (var i in keys.down) {
		if (e.keyCode === keys.down[i].keyCode) {
			keys.down[i] = undefined;
		}
	}

	keys.down = keys.down.filter(e => e);
});

//mouse
var mouse = {
	x: 0,
	y: 0,
	down: [],

	pressed: function(button) {
		for (var i in this.down) {
			if (button === this.down[i].button) {
				return true;
			}
		}
		return false;
	},

	callListeners: function(button) {
		if (this.listeners[button]) {
			for (var i in this.listeners[button]) {
				this.listeners[button][i]();
			}
		}
	},

	addListener: function(button, func) {
		if (!this.listeners[button]) {
			this.listeners[button] = [];
		}
		this.listeners[button].push(func);
		return func;
	},

	removeListener: function(button, func) {
		if (!this.listeners[button]) {
			return;
		}
		this.listeners[button] = this.listeners[button].filter(i => i !== func);
		if (this.listeners[button].length < 1) {
			this.listeners[button] = undefined;
		}
	}
};

window.addEventListener("wheel", function(e) {
	// if (game.running) {
	// 	game.scale += e.wheelDelta / Math.abs(e.wheelDelta) / 5;
	// 	if (game.scale < 1) game.scale = 1;
	// }
});

window.addEventListener("mousemove", function(e) {
	mouse.x = e.x;
	mouse.y = e.y;
});

window.addEventListener("mousedown", function(e) {
	for (var i in mouse.down) {
		if (e.button === mouse.down[i].button) {
			mouse.down[i] = e;
			return;
		}
	}

	mouse.down.push(e);
});

window.addEventListener("mouseup", function(e) {
	for (var i in mouse.down) {
		if (e.button === mouse.down[i].button) {
			mouse.down[i] = undefined;
		}
	}

	mouse.down = mouse.down.filter(e => e);
});
