
class Weapon {

	static init(weapon, type) {
		weapon.reloadSpeed = 1;
		weapon.bulletSpeed = 1;
		weapon.bulletDamage = 1;
		weapon.bulletPenetration = 1;
		weapon.range = 200;
		weapon.mainComp = 0;
		switch (type) {
			case "singleCannon":
				weapon.comps.push(new Cannon(weapon.owner, 0, 0, 0.8, 1.5));
				break;
			case "twinCannon":
				weapon.comps.push(new Cannon(weapon.owner, 0, -0.5, 0.8, 1.5));
				weapon.comps.push(new Cannon(weapon.owner, 0, 0.5, 0.8, 1.5, 0, 0.5));
				weapon.reloadSpeed = 1.5;
				break;
			case "tripleCannon":
				weapon.comps.push(new Cannon(weapon.owner, 0, -0.5, 0.8, 1.5, 0, 0.5));
				weapon.comps.push(new Cannon(weapon.owner, 0, 0.5, 0.8, 1.5, 0, 0.5));
				weapon.comps.push(new Cannon(weapon.owner, 0, 0, 1, 1.6, 0, 0, 1, 1, 1.5));
				weapon.reloadSpeed = 1.5;
				weapon.bulletDamage = 1.5;
				weapon.mainComp = 2;
				break;
			case "pentaCannon":
				weapon.comps.push(new Cannon(weapon.owner, -0.2, 0, 0.9, 1.6, 45, 0.2));
				weapon.comps.push(new Cannon(weapon.owner, -0.2, 0, 0.9, 1.6, -45, 0.2));
				weapon.comps.push(new Cannon(weapon.owner, -0.1, 0, 0.9, 1.8, 22.5, 0.1));
				weapon.comps.push(new Cannon(weapon.owner, -0.1, 0, 0.9, 1.8, -22.5, 0.1));
				weapon.comps.push(new Cannon(weapon.owner, 0, 0, 0.9, 2));
				weapon.reloadSpeed = 1.2;
				weapon.mainComp = 4;
				break;
			case "sniperCannon":
				weapon.comps.push(new Cannon(weapon.owner, 0, 0, 0.8, 2.5, 0, 0, 2, 1.5, 1.5, 15, 500));
				weapon.reloadSpeed = 2;
				weapon.bulletSpeed = 1.5;
				weapon.bulletDamage = 1.5;
				weapon.bulletPenetration = 10;
				weapon.range = 500;
				break;
			case "destroyerCannon":
				weapon.comps.push(new Cannon(weapon.owner, 0, 0, 1.9, 2, 0, 0, 2, 0.5, 5, 20));
				weapon.reloadSpeed = 2;
				weapon.bulletSpeed = 0.5;
				weapon.bulletDamage = 5;
				weapon.bulletPenetration = 20;
				break;
		}
	}

	constructor(owner, type = "singleCannon") {
		this.owner = owner;
		this.type = type;
		this.firing = false;
		this.comps = [];
		Weapon.init(this, type);
	}

	fire(firing) {
		if (!firing && this.firing) {
			for (var i in this.comps) {
				this.comps[i].reloadCounter = 0;
			}
		}
		this.firing = firing;
		return this.firing;
	}

	update(time) {
		this.comps.forEach(c => c.update(time));
	}

	render() {
		this.comps.forEach(c => c.render());
	}

}

class Cannon {

	constructor(owner, x, y, width, length, rotate = 0,
		delay = 0, reloadSpeed = 1, bulletSpeed = 1,
		bulletDamage = 1, bulletPenetration = 1, range = 200, reqoil = 0.1) {
		this.owner = owner;
		this.x = x;
		this.y = y;
		this.width = width;
		this.length = length;
		this.rotate = rotate;

		this.delay = delay;
		this.reloadSpeed = reloadSpeed;
		this.bulletSpeed = bulletSpeed;
		this.bulletDamage = bulletDamage;
		this.bulletPenetration = bulletPenetration;
		this.range = range;
		this.reqoil = reqoil;

		this.reloadCounter = 0;

		this.type = "polygon";

		this.color = "#aaa";
	}

	getPts(onScreen = false, r = 0) {
		var o = tdp.rad(this.owner.rotate) + tdp.rad(this.rotate);

		var progress = this.reloadCounter / (this.reloadSpeed * this.owner.reloadSpeed);
		var length = this.length * (1 - this.reqoil + (progress > 1 ? 1 : progress) * this.reqoil);

		var pts = [
			{x: this.x + r, y: this.y - this.width / 2 + r},
			{x: this.x + length - r, y: this.y - this.width / 2 + r},
			{x: this.x + length - r, y: this.y + this.width / 2 - r},
			{x: this.x + r, y: this.y + this.width / 2 - r}
		];

		for (var i in pts) {
			var d = Math.atan2(pts[i].y, pts[i].x) + o;
			var l = tdp.pyth(pts[i].x, pts[i].y);
			pts[i] = {
				x: this.owner.x + Math.cos(d) * this.owner.r * l,
				y: this.owner.y + Math.sin(d) * this.owner.r * l
			};
		}

		if (onScreen) {
			for (var i in pts) {
				pts[i].x = game.osX(pts[i].x);
				pts[i].y = game.osY(pts[i].y);
			}
		}

		return pts;
	}

	ready(m = 1) {
		return this.reloadCounter >= this.reloadSpeed * this.owner.reloadSpeed * m;
	}

	update(time) {
		if (!this.ready(this.owner.weapon.firing ? 1 + this.delay : 1)) {
			this.reloadCounter += time * 100;
		}

		if (!this.owner.weapon.firing) {
			this.continuous = false;
		} else if (this.ready(this.continuous ? 1 : 1 + this.delay)) {
			this.reloadCounter = 0;
			this.continuous = true;
			var x = (this.x + this.length) * this.owner.r;
			var y = this.y * this.owner.r;
			var d = Math.atan2(y, x) + tdp.rad(this.owner.rotate) + tdp.rad(this.rotate);
			var l = tdp.pyth(x, y);
			game.add(new CannonBall(
				this.owner.x + Math.cos(d) * l,
				this.owner.y + Math.sin(d) * l,
				this.owner.r * this.width / 2,
				{dir: this.owner.rotate + this.rotate, speed: this.owner.bulletSpeed * this.bulletSpeed},
				this.owner.team,
				this.owner.bulletPenetration * this.bulletPenetration,
				this.owner.bulletDamage * this.bulletDamage,
				this.range
			));
		} 
	}

	//render
	onScreen() {
		return tdp.pop(this.osPts, [{x: 0, y: 0}, {x: canvas.width, y: 0},
			{x: canvas.width, y: canvas.height}, {x: 0, y: canvas.height}]);
	}

	render() {
		this.osPts = this.getPts(true);

		if (!this.onScreen()) {
			return;
		}

		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(this.osPts[0].x, this.osPts[0].y);
		for (var i = 1; i < this.osPts.length; i++) {
			ctx.lineTo(this.osPts[i].x, this.osPts[i].y);
		}
		ctx.closePath();
		ctx.fill();

		var ptsl = this.getPts(true, this.owner.bdWidth / 2);
		ctx.strokeStyle = this.owner.bdColor;
		ctx.lineWidth = this.owner.osR * this.owner.bdWidth;
		ctx.beginPath();
		ctx.moveTo(ptsl[0].x, ptsl[0].y);
		for (var i = 1; i < ptsl.length; i++) {
			ctx.lineTo(ptsl[i].x, ptsl[i].y);
		}
		ctx.closePath();
		ctx.stroke();
	}

}