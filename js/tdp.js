
var tdp = {

	//math
	//radians
	rad: function(a) {
		return a / 180 * Math.PI;
	},

	//degree
	deg: function(r) {
		return r * 180 / Math.PI;
	},

	//distance
	dis: function(p1, p2) {
		return this.pyth(p1.x - p2.x, p1.y - p2.y);
	},

	//direction
	dir: function(p1, p2) {
		return Math.atan2(p2.y - p1.y, p2.x - p1.x);
	},

	//pythagorean
	pyth: function(a, b, c = 1) {
		return Math.sqrt((a * a + b * b) * c);
	},

	//get intersection point of two lines
	lineIntersecionPoint(l1, l2) {
		l1.m = (l1.y1 - l1.y2) / (l1.x1 - l1.x2);
		l2.m = (l2.y1 - l2.y2) / (l2.x1 - l2.x2);
		if (l1.m - l2.m >= Number.EPSILON) {
			return {
				x: (l1.m * l1.x1 - l2.m * l2.x1 + l2.y1 - l1.y1) / (l1.m - l2.m),
				y: (l1.m * l2.m * (l2.x1 - l1.x1) + l2.m * l1.y1 - l1.m * l2.y1) / (l2.m - l1.m)
			};
		}
	},

	//collision detection
	//circle overlapping circle
	coc: function(c1, c2) {
		return this.dis(c1, c2) < c1.r + c2.r;
	},

	//circle overlapping rectangle
	cor: function(c, r) {
		var p = {
			x: c.x < r.x ? r.x : c.x > r.x + r.w ? r.x + r.w : c.x,
			y: c.y < r.y ? r.y : c.y > r.y + r.h ? r.y + r.h : c.y
		};
		return this.ptic(c, p);
	},

	//polygon overlapping polygon
	pop: function(p1, p2) {
		for (var i in p1) {
			if (this.ptip(p1[i], p2)) {
				return true;
			}
		}
		for (var i in p2) {
			if (this.ptip(p2[i], p1)) {
				return true;
			}
		}
		return false;
	},

	//circle overlapping polygon
	cop: function(c, p) {
		for (var i in p) {
			var j = i < p.length - 1 ? parseInt(i) + 1 : 0;
			if (this.col(c, {
				x1: p[i].x,
				y1: p[i].y,
				x2: p[j].x,
				y2: p[j].y
			})) {
				return true;
			}
		}
		return this.ptip(c, p);
	},

	//circle overlapping line
	col: function(c, l) {
		return this.cor(c, {
			x: l.x1 < l.x2 ? l.x1 : l.x2,
			y: l.y1 < l.y2 ? l.y1 : l.y2,
			w: l.x1 < l.x2 ? l.x2 - l.x1 : l.x1 - l.x2,
			h: l.y1 < l.y2 ? l.y2 - l.y1 : l.y1 - l.y2
		}) && this.coil(c, l);
	},

	coil: function(c, l) {
		return Math.pow(c.r * this.pyth((l.x2 - c.x) - (l.x1 - c.x), (l.y2 - c.y) - (l.y1 - c.y)), 2)
			- Math.pow((l.x1 - c.x) * (l.y2 - c.y) - (l.x2 - c.x) * (l.y1 - c.y), 2) >= 0;
	},

	//point in circle
	ptic: function(c, p) {
		return this.dis(c, p) < c.r;
	},

	//point in polygon
	ptip: function(pt, p) {
		var result = false;
		for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
			if ((p[i].y > pt.y) != (p[j].y > pt.y)
				&& (pt.x < (p[j].x - p[i].x) * (pt.y - p[i].y) / (p[j].y-p[i].y) + p[i].x)) {
				result = !result;
			}
		}
		return result;
	}

};