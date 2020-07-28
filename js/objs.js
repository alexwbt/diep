
class GameObject {

	//collision detection
	static collision(o1, o2) {
		switch (o1.type + ":" + o2.type) {
			case "circle:circle":
				return tdp.coc(o1, o2);
			case "polygon:polygon":
				return tdp.pop(o1.getPts(), o2.getPts());

			case "circle:polygon":
				return tdp.cop(o1, o2.getPts());
			case "polygon:circle":
				return tdp.cop(o2, o1.getPts());
		}
	}

	constructor(x, y, r, color, team = "self", health = 100, bodyDamage = 1) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.rotate = 0;
		this.type = "circle";

		//render
		this.color = color;
		this.bdColor = "rgba(0, 0, 0, 0.3)";
		this.bdWidth = 0.1;
		this.healthBarColor = "rgba(0, 0, 0, 0.5)";
		this.healthColor = "rgba(0, 255, 0, 0.5)";
		this.doRenderHealthBar = true;
		this.renderOnMap = true;
		this.alpha = 1;

		//game
		this.team = team;
		this.health = health;
		this.maxHealth = health;
		this.bodyDamage = bodyDamage;
		this.bh = health;
		this.tookDamage = 0;

		//driver
		this.motions = [];
		this.moving = {x: 0, y: 0};
		this.movingSpeed = 0;
		this.movingDir = 0;

		this.partime = 20;
		this.particle = false;
	}

	//driver
	move(motion) {
		this.motions.push(motion);
	}

	//update
	update(time) {
		//update motions
		if (this.motions.length > 0) {
			this.moving = {x: 0, y: 0};
			for (var i in this.motions) {
				this.moving.x += Math.cos(tdp.rad(this.motions[i].dir)) * this.motions[i].speed;
				this.moving.y += Math.sin(tdp.rad(this.motions[i].dir)) * this.motions[i].speed;
			}
			if (this.motions.length > 1) {
				var d = Math.atan2(this.moving.y, this.moving.x);
				var l = tdp.pyth(this.moving.x, this.moving.y, 1 / this.motions.length);
				this.moving.x = Math.cos(d) * l;
				this.moving.y = Math.sin(d) * l;
			}
			this.motions = [];

			this.x += this.moving.x * time;
			this.y += this.moving.y * time;
			this.movingSpeed = tdp.pyth(this.moving.x, this.moving.y);
			this.movingDir = tdp.deg(Math.atan2(this.moving.y, this.moving.x));

			if (!this.particle) {
				for (var i in game.objs) {
					if (game.objs[i] !== this
						&& (this.team === "self" || this.team !== game.objs[i].team)
						&& GameObject.collision(this, game.objs[i])) {
						this.hit(game.objs[i]);
					}
				}
			}
		}
		else if (this.movingSpeed !== 0) {
			this.motions = [{
				dir: this.movingDir,
				speed: Math.floor(this.movingSpeed * 9.5) / 10
			}];
		}

		if (this.bh !== this.health) {
			this.tookDamage = this.bh - this.health;
			this.bh = this.health;
		}
		if (this.tookDamage > 0) {
			this.alpha = 0.5;
			this.tookDamage *= 0.5;
			if (this.tookDamage <= 0.1) {
				this.alpha = 1;
			}
		}
	}

	hit(obj) {
		obj.move({
			dir: tdp.deg(tdp.dir(this, obj)),
			speed: obj.movingSpeed + this.movingSpeed
		});
		obj.health -= this.bodyDamage;
		this.move({
			dir: tdp.deg(tdp.dir(obj, this)),
			speed: obj.movingSpeed + this.movingSpeed
		});
		this.health -= obj.bodyDamage;
	}

	parupdate(time) {
		this.doRenderHealthBar = false;
		this.partime -= time * 100;
		this.alpha = this.partime / 20;
	}

	future(time) {
		return {
			x: this.x + this.moving.x * time,
			y: this.y + this.moving.y * time
		};
	}

	line() {
		return {
			x1: this.x,
			y1: this.y,
			x2: this.x + this.moving.x,
			y2: this.y + this.moving.y
		};
	}

	//render
	onScreen() {
		return tdp.cor({x: this.osX, y: this.osY, r: this.osR},
			{x: 0, y: 0, w: canvas.width, h: canvas.height});
	}

	render() {
		this.osX = game.osX(this.x);
		this.osY = game.osY(this.y);
		this.osR = this.r * game.scale;

		if (!this.onScreen()) {
			return;
		}

		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.osX, this.osY, this.osR, 0, 2 * Math.PI);
		ctx.fill();

		ctx.strokeStyle = this.bdColor;
		ctx.lineWidth = this.osR * this.bdWidth;
		ctx.beginPath();
		ctx.arc(this.osX, this.osY, this.osR * (1 - this.bdWidth / 2) + 0.5, 0, 2 * Math.PI);
		ctx.stroke();

		if (this.doRenderHealthBar && this.health !== this.maxHealth) {
			this.renderHealthBar();
		}
	}

	renderHealthBar() {
		ctx.fillStyle = this.healthBarColor;
		ctx.fillRect(this.osX - this.osR,
			this.osY + this.osR * (1 + this.bdWidth / 2),
			this.osR * 2, this.osR * this.bdWidth);
		ctx.fillStyle = this.healthColor;
		ctx.fillRect(this.osX - this.osR,
			this.osY + this.osR * (1 + this.bdWidth / 2),
			this.osR * 2 * this.health / this.maxHealth, this.osR * this.bdWidth);
	}

	onMap() {
		return tdp.coc({x: this.omX, y: this.omY, r: this.omR}, miniMap);
	}

	mapRender() {
		this.omX = miniMap.omX(this.x);
		this.omY = miniMap.omY(this.y);
		this.omR = this.r * miniMap.scale;

		if (!this.onMap()) {
			return;
		}

		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.omX, this.omY, this.omR, 0, 2 * Math.PI);
		ctx.fill();
	}

}

class RegularPolygon extends GameObject {

	static getPts(rp, onScreen = false, r = 1) {
		var pts = [];
		for (var i = 0; i < rp.g; i++) {
			var d = Math.PI * 2 / rp.g * i + tdp.rad(rp.rotate);
			pts[i] = {
				x: rp.x + Math.cos(d) * rp.r * r,
				y: rp.y + Math.sin(d) * rp.r * r
			};
			if (onScreen) {
				pts[i].x = game.osX(pts[i].x);
				pts[i].y = game.osY(pts[i].y);
			}
		}
		return pts;
	}

	constructor(x, y, r, g, color, team, health, bodyDamage) {
		super(x, y, r, color, team, health, bodyDamage);
		this.g = g;
		this.type = "polygon";
	}

	getPts(onScreen, r) {
		return RegularPolygon.getPts(this, onScreen, r);
	}

	update(time) {
		super.update(time);
		this.rotate += time;
	}

	shape() {
		var s = super.shape();
		s.g = this.g;
		s.getPts = this.getPts();
	}

	//render
	onScreen() {
		return tdp.pop(this.osPts, [{x: 0, y: 0}, {x: canvas.width, y: 0},
			{x: canvas.width, y: canvas.height}, {x: 0, y: canvas.height}]);
	}

	render() {
		this.osX = game.osX(this.x);
		this.osY = game.osY(this.y);
		this.osR = this.r * game.scale;
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

		var lpts = this.getPts(true, 1 - this.bdWidth / 2);
		ctx.strokeStyle = this.bdColor;
		ctx.lineWidth = this.r * this.bdWidth * game.scale;
		ctx.beginPath();
		ctx.moveTo(lpts[0].x, lpts[0].y);
		for (var i = 1; i < lpts.length; i++) {
			ctx.lineTo(lpts[i].x, lpts[i].y);
		}
		ctx.closePath();
		ctx.stroke();

		if (this.doRenderHealthBar && this.health !== this.maxHealth) {
			this.renderHealthBar();
		}
	}

}

class CannonBall extends GameObject {

	constructor(x, y, r, motion, team, health, bodyDamage, counter) {
		super(x, y, r, "red", team, health, bodyDamage);
		this.motion = motion;
		this.counter = counter;
		this.bdWidth = 0.2;

		this.doRenderHealthBar = false;
		this.renderOnMap = false;
	}

	update(time) {
		this.move(this.motion);
		super.update(time);

		this.counter -= time * 100;
		if (this.counter < 0) {
			this.health = 0;
		}
	}

}

class Tank extends GameObject {

	constructor(x, y, r, color, team, weapon, health, bodyDamage,
		movementSpeed = 50, reloadSpeed = 100, bulletSpeed = 100, bulletDamage = 5, bulletPenetration = 1) {
		super(x, y, r, color, team, health, bodyDamage);

		this.bdColor = "#555";

		this.movementSpeed = movementSpeed;
		this.reloadSpeed = reloadSpeed;
		this.bulletSpeed = bulletSpeed;
		this.bulletDamage = bulletDamage;
		this.bulletPenetration = bulletPenetration;

		this.weapon = new Weapon(this, weapon);
	}

	update(time) {
		this.weapon.update(time);
		super.update(time);
	}

	render() {
		this.weapon.render();
		super.render();
	}

	mapRender() {
		this.omX = miniMap.omX(this.x);
		this.omY = miniMap.omY(this.y);
		this.omR = this.r * miniMap.scale;

		if (!this.onMap()) {
			return;
		}

		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.omX, this.omY, this.omR, 0, 2 * Math.PI);
		ctx.fill();

		var d = tdp.rad(this.rotate);
		ctx.beginPath();
		ctx.moveTo(this.omX + Math.cos(d) * this.omR * 2,
			this.omY + Math.sin(d) * this.omR * 2);
		d += tdp.rad(30);
		ctx.lineTo(this.omX + Math.cos(d) * this.omR * 1.5,
			this.omY + Math.sin(d) * this.omR * 1.5);
		d -= tdp.rad(60);
		ctx.lineTo(this.omX + Math.cos(d) * this.omR * 1.5,
			this.omY + Math.sin(d) * this.omR * 1.5);
		ctx.closePath();
		ctx.fill();
	}

}

class AiTank extends Tank {

	constructor(x, y, r, color, team, weapon, targetTeam, fire = true, dodge = true, chase = true, hold = false,
		health, bodyDamage, movementSpeed, reloadSpeed, bulletSpeed, bulletDamage, bulletPenetration) {
		super(x, y, r, color, team, weapon, health, bodyDamage,
			movementSpeed, reloadSpeed, bulletSpeed, bulletDamage, bulletPenetration);

		this.targetTeam = targetTeam;
		this.fire = fire;
		this.dodge = dodge;
		this.chase = chase;
		this.hold = hold;

		this.targetDir = 0;
	}

	update(time) {
		super.update(time);

		//target
		var td, target;

		//move
		var move = [];

		for (var i in game.objs) {
			var o = game.objs[i];
			var d = tdp.dis(this, o);

			//dodge
			if (this.dodge && o.team !== this.team && d > tdp.dis(this.future(1), o.future(1))) {
				if (o.movingSpeed !== 0
					&& tdp.coil({x: this.x, y: this.y, r: this.r + o.r * 2}, o.line())
					&& (d - this.r - o.r) / o.movingSpeed <= (this.r + o.r) * 2 / this.movementSpeed
				) {
					var i = tdp.deg(tdp.dir(o, this)) - o.movingDir;
					if (Math.abs(i) > 180) {
						i = -i;
					}
					move.push(tdp.rad(o.movingDir + (i === 0 ? 1 : i / Math.abs(i)) * 90));
				}
				else if (this.movingSpeed !== 0
					&& tdp.coil({x: o.x, y: o.y, r: this.r + o.r * 2}, this.line())
					&& d <= (this.r + o.r) * 2
				) {
					var i = tdp.deg(tdp.dir(this, o)) - this.movingDir;
					if (Math.abs(i) > 180) {
						i = -i;
					}
					move.push(tdp.rad(this.movingDir - (i === 0 ? 1 : i / Math.abs(i)) * 90));
				}
			}

			//target
			if (o instanceof Tank
				&& o.team === this.targetTeam
				&& (!target || d < td)) {
				target = o;
				td = tdp.dis(this, o);
			}
		}

		//target
		var bs = this.bulletSpeed * this.weapon.bulletSpeed;

		if (!this.dodge || move.length < 1 && this.movingSpeed === 0) {
			if (this.chase && target) {
				var i = td - (this.weapon.range / 2 * bs + target.r);
				if (Math.abs(i) > this.r * 2) {
					move.push(i > 0 ? tdp.dir(this, target) : tdp.dir(target, this));
				}
			} else if (this.hold && tdp.dis(this, this.hold) > this.r) {
				move.push(tdp.dir(this, this.hold));
			}
		}

		if (this.weapon.fire(this.fire && target !== undefined)) {
			td /= bs;
			var fp, bfp, dir;
			var c = 0;
			do {
				fp = target.future(td);
				dir = tdp.dir(this, fp);
				bfp = {
					x: this.x + Math.cos(dir) * bs * td,
					y: this.y + Math.sin(dir) * bs * td
				};

				td = tdp.dis(this, fp) / bs;

				if (target.movingSpeed >= bs || ++c >= 100) {
					break;
				}
			} while (Math.floor(tdp.dis(bfp, fp) + 0.9));
			this.targetDir = tdp.deg(dir);
		}

		//move
		if (move.length > 0) {
			var x = 0;
			var y = 0;
			for (var i in move) {
				x += Math.cos(move[i]);
				y += Math.sin(move[i]);
			}
			this.move({dir: tdp.deg(Math.atan2(y, x)), speed: this.movementSpeed});
		}

		//rotate
		if (this.rotate !== this.targetDir) {
			// var i = this.rotate - this.targetDir;

			// if (Math.abs(i) > 180) {
			// 	i = -i;
			// }

			// if (Math.abs(i) >= 1)
			// i = i === 0 ? 1 : i / Math.abs(i);

			// this.rotate -= i;
			this.rotate = this.targetDir;
		}
	}

}

class Player extends Tank {

	constructor(x, y, r, color, team, weapon, health, bodyDamage,
		movementSpeed, reloadSpeed, bulletSpeed, bulletDamage, bulletPenetration) {
		super(x, y, r, color, team, weapon, health, bodyDamage,
			movementSpeed, reloadSpeed, bulletSpeed, bulletDamage, bulletPenetration);

		this.playerKeys = [
			{code: 87, dir: -90},
			{code: 65, dir: 180},
			{code: 83, dir: 90},
			{code: 68, dir: 0},
		];
	}

	update(time) {
		for (var i in this.playerKeys) {
			if (keys.pressed(this.playerKeys[i].code)) {
				this.move({
					dir: this.playerKeys[i].dir,
					speed: this.movementSpeed
				});
			}
		}
		this.weapon.fire(mouse.pressed(0));
		this.rotate = tdp.deg(tdp.dir(this,
			{x: game.osX(mouse.x, true), y: game.osY(mouse.y, true)}));

		super.update(time);
	}

}