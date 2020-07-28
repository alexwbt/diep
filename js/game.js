
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.smallerSide = function() {
	return canvas.width > canvas.height ? canvas.height : canvas.width;
};

canvas.largerSide = function() {
	return canvas.width > canvas.height ? canvas.width : canvas.height;
};

canvas.diagonal = function() {
	return tdp.pyth(canvas.width, canvas.height);
};

var game = {

	//settings
	bgLineSpacing: 10,
	bgLineWidth: 1,
	bgColor: "white",
	bgLineColor: "#eee",

	//display
	osX: function(x, r = false) {
		return r ? (x - canvas.width / 2) / this.scale + this.camera.x
			: (x - this.camera.x) * this.scale + canvas.width / 2;
	},

	osY: function(y, r = false) {
		return r ? (y - canvas.height / 2) / this.scale + this.camera.y
			: (y - this.camera.y) * this.scale + canvas.height / 2;
	},

	//camera
	view: 500,
	camera: {
		x: 0,
		y: 0
	},
	scale: 3,

	//objs
	objs: [],
	particles: [],
	huds: [],

	add: function(obj) {
		for (var i in game.objs) {
			if (game.objs[i] === obj
				|| ((obj.team === "self" || obj.team !== game.objs[i].team)
					&& GameObject.collision(obj, game.objs[i]))) {
				return;
			}
		}
		this.objs.push(obj);
	},

	parti: function(particle) {
		particle.particle = true;
		this.particles.push(particle);
	},

	//init
	init: function() {
		this.particles = [];

		this.huds = [miniMap];

		this.objs = [];
		this.player = new Player(-100, 0, 10, "#0af", "player", "singleCannon"
			// , 1000000, 100, 10, 5, 50, 100, 100
			);
		this.add(this.player);

		this.add(new GameObject(-150, 0, 10, "yellow"))

		this.add(new AiTank(50, 0, 10, "yellow", "yellow", "twinCannon", "red"));
		this.add(new AiTank(50, 50, 10, "yellow", "yellow", "twinCannon", "red"));

		this.add(new AiTank(-50, 0, 10, "red", "red", "tripleCannon", "yellow"));
		this.add(new AiTank(-50, 50, 10, "red", "red", "pentaCannon", "yellow"));

		for (var i = 0; i < 50; i++) {
			var x = Math.random() * 1000 - 500;
			var y = Math.random() * 1000 - 500;
			var r = Math.random() * 20 + 5;
			this.add(new RegularPolygon(x, y, r, 5, "#06f", "obstacle", r * 5));
		}
		for (var i = 0; i < 50; i++) {
			var x = Math.random() * 1000 - 500;
			var y = Math.random() * 1000 - 500;
			var r = Math.random() * 20 + 5;
			this.add(new RegularPolygon(x, y, r, 4, "orange", "obstacle", r * 5));
		}
	},

	//gameloop
	lastTime: 0,
	delta: 0,
	step: 1 / 60,
	running: false,
	loop: function(time) {
		if (game.running) {
			game.delta += (time - game.lastTime) / 1000;
			while (game.delta > game.step) {
				game.update(game.step);
				game.delta -= game.step;
				if (game.delta > 0.1) {
					game.delta = 0;
				}
			}
		}
		game.render();
		game.lastTime = time;
		window.requestAnimationFrame(game.loop);
	},

	start: function() {
		if (this.running) {
			return false;
		}
		this.running = true;
		window.requestAnimationFrame(this.loop);
		
		console.log("started");
		return this.running;
	},

	stop: function() {
		if (!this.running) {
			return false;
		}
		this.running = false;
		
		console.log("stopped");
		return !this.running;
	},

	update: function(time) {
		//update objects
		this.objs.forEach(o => o.update(time));
		this.objs = this.objs.filter(o => {
			if (o.health <= 0) {
				this.parti(o);
				return false;
			}
			return true;
		});

		//update particles
		this.particles.forEach(p => {
			p.update(time);
			p.parupdate(time);
		});
		this.particles = this.particles.filter(p => p.partime > 0);

		//update camera
		this.camera.x = this.player.x;
		this.camera.y = this.player.y;

		//update huds
		this.huds.forEach(h => h.update(time));
	},

	render: function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		this.scale = canvas.diagonal() / (this.view + this.player.r * 4);
		
		//render background
		ctx.fillStyle = this.bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		ctx.strokeStyle = this.bgLineColor;
		ctx.lineWidth = this.bgLineWidth * this.scale;
		var s = this.bgLineSpacing * this.scale;
		for (var x = this.osX(0) % s; x < canvas.width; x += s) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvas.height);
			ctx.stroke();
		}
		for (var y = this.osY(0) % s; y < canvas.height; y += s) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(canvas.width, y);
			ctx.stroke();
		}

		//render objs
		this.objs.forEach(o => {
			ctx.globalAlpha = o.alpha;
			o.render();
			ctx.globalAlpha = 1;
		});
		this.particles.forEach(p => {
			ctx.globalAlpha = p.alpha;
			p.render();
			ctx.globalAlpha = 1;
		});

		//render huds
		this.huds.forEach(h => {
			if (h.show) {
				h.render();
			}
		});
	}

};

keys.addListener(27, function() {
	if (game.running) {
		game.stop();
	} else {
		game.start();
	}
});