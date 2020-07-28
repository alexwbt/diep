
var miniMap = {

	radius: 500,

	x: 0,
	y: 0,
	r: 200,

	scale: 1,
	size: 2.75,

	show: true,
	bgColor: "#efefef",
	bdColor: "#555",
	alpha: 0.9,

	omX(x) {
		return (x - game.camera.x) * this.scale + this.x;
	},

	omY(y) {
		return (y - game.camera.y) * this.scale + this.y;
	},

	update: function(time) {
		if (keys.pressed(188)) {
			this.shrink();
		} else if (keys.pressed(190)) {
			this.enlarge();
		}
	},

	render: function() {
		this.radius = game.view;
		this.r = canvas.smallerSide() / this.size / 2;
		this.x = this.r + this.r / 5;
		this.y = this.r + this.r / 5;
		this.scale = this.r / this.radius;

		ctx.save();

		ctx.globalAlpha = this.alpha;

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
		ctx.clip();

		ctx.fillStyle = this.bgColor;
		ctx.fill();

		ctx.globalAlpha = 1;

		//render objs
		game.objs.forEach(o => {
			if (o.renderOnMap) {
				o.mapRender();
			}
		});

		ctx.restore();

		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);

		ctx.lineWidth = 3;
		ctx.strokeStyle = this.bdColor;
		ctx.stroke();

		ctx.lineWidth = 1;
		for (var i = 0; i < 360; i += 5) {
			var d = tdp.rad(i);
			ctx.beginPath();
			ctx.moveTo(this.x + Math.cos(d) * this.r, this.y + Math.sin(d) * this.r);
			ctx.lineTo(this.x + Math.cos(d) * this.r * 0.95, this.y + Math.sin(d) * this.r * 0.95);
			ctx.stroke();
		}
	},

	shrink() {
		if (miniMap.size < 5) {
			miniMap.size += 0.01;
		}
	},

	enlarge() {
		if (miniMap.size > 1.25) {
			miniMap.size -= 0.01;
		}
	},

	toggleShow() {
		miniMap.show = !miniMap.show;
	}

};

// keys.addListener(188, miniMap.shrink);
// keys.addListener(190, miniMap.enlarge);
keys.addListener(77, miniMap.toggleShow);