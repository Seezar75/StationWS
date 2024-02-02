/*
Catmull-Rom spline
https://lucidar.me/en/mathematics/catmull-rom-splines/
https://link.springer.com/article/10.1007/s42979-021-00770-x

try for P1
f(t) = at^6 + bt^4 + ct^2 + d
f'(t) = 6at^5 + 4bt^3 + 2ct
f(0) = 1, f(1) = 0, f(2) = 0, f'(2) = 0
a = -1/16, b = 9/16, c = -3/2, d = 1
=> q1 = -(1/16)*t^6 + (9/16)*t^4 - (3/2)*t^2 + 1
q1:f=-(1/16)*t^6+(9/16)*t^4-(3/2)t^2+1;

solve ( [ a+b+c+1=0 , 6*32*a+32*b+4*c=0, 64*a+16*b+4*c+1=0 ] , [ a,b,c ] );
q1:f=-(1/16)*t^6+(9/16)*t^4-(3/2)*t^2+1;
q2:t=r+1;
q3: subst (q2, q1);
string(expand(q3));





Alternativa
f(t) := a*t^4+b*t^3+c*t^2+d*t+e;
g(t) := 4*a*t^3+3*b*t^2+2*c*t+d;
solve([f(0)=1, f(1)=0, f(2)=0, g(0)=0, g(2)=0],[a,b,c,d,e]);
string(subst(solve([f(0)=1, f(1)=0, f(2)=0, g(0)=0, g(2)=0],[a,b,c,d,e]), f(t)));
string(subst(solve([f(0)=1, f(1)=0, f(2)=0, g(0)=0, g(2)=0],[a,b,c,d,e]), g(t)));

a = -1/2,b = 9/4,c = -11/4,d = 0,e = 1  => q2

q1 = -(1/2)*t^4+(1/4)*t^3+t^2-(3/4)*t
q'1 = -2*t^3+(3/4)*t^2+2*t-(3/4)
q''1 = -6*t^2+(3/2)*t+2

q2 = -(1/2)*t^4+(9/4)*t^3-(11/4)*t^2+1
q'2 = -2*t^3+(27/4)*t^2-(11/2)*t
q''2 = -6*t^2+(27/2)*t-(11/2)

q3 = -(1/2)*t^4-(1/4)*t^3+t^2+(3/4)*t
q'3 = -2*t^3-(3/4)*t^2+2*t+(3/4)
q''3 = -6*t^2-(3/2)*t+2

q4 = -(1/2)*t^4+(7/4)*t^3-(5/4)*t^2
q'4 = -2*t^3+(21/4)*t^2-(5/2)*t
q''4 = -6*t^2+(21/2)*t-(5/2)

*/

class Spline {
	constructor( _name, smoothness = 10, color = "grey") {
		this.step = 1 / smoothness;
		this.col = color;
		this.points = [];
		this.name = _name;
	}

	getSplinePoint(t, loop = false) {
		//continuous over t
		let p0, p1, p2, p3;

		if (loop) {
			p1 = Math.floor(t);
			p2 = (p1 + 1) % this.points.length;
			p3 = (p2 + 1) % this.points.length;
			p0 = (p1 - 1) % this.points.length;
			if (p0 < 0) p0 = this.points.length + p0;
		} else {
			p1 = Math.floor(t) + 1;
			p2 = p1 + 1;
			p3 = p2 + 1;
			p0 = p1 - 1;
		}

		t = t - Math.floor(t);

        let tt = t*t;
        let ttt = tt * t;
        let tttt = ttt * t;

        let q1 = -(1/2)*tttt+(1/4)*ttt+tt-(3/4)*t;
        let q2 = -(1/2)*tttt+(9/4)*ttt-(11/4)*tt+1;
        let q3 = -(1/2)*tttt-(1/4)*ttt+tt+(3/4)*t;
        let q4 = -(1/2)*tttt+(7/4)*ttt-(5/4)*tt;

		let tx =this.points[p0].x * q1 +
				this.points[p1].x * q2 +
				this.points[p2].x * q3 +
				this.points[p3].x * q4;

		let ty =this.points[p0].y * q1 +
				this.points[p1].y * q2 +
				this.points[p2].y * q3 +
				this.points[p3].y * q4;

		return new Point2D(tx, ty);
	}

	getSplineGardient(t, loop = false) {
		//continuous over t
		let p0, p1, p2, p3;

		if (loop) {
			p1 = Math.floor(t);
			p2 = (p1 + 1) % this.points.length;
			p3 = (p2 + 1) % this.points.length;
			p0 = (p1 - 1) % this.points.length;
			if (p0 < 0) p0 = this.points.length + p0;
		} else {
			p1 = Math.floor(t) + 1;
			p2 = p1 + 1;
			p3 = p2 + 1;
			p0 = p1 - 1;
		}

		t = t - Math.floor(t);

        let tt = t*t;
        let ttt = tt * t;

		let q1 = -2*ttt+(3/4)*tt+2*t-(3/4);
		let q2 = -2*ttt+(27/4)*tt-(11/2)*t;
		let q3 = -2*ttt-(3/4)*tt+2*t+(3/4);
		let q4 = -2*ttt+(21/4)*tt-(5/2)*t;

		let tx =this.points[p0].x * q1 +
				this.points[p1].x * q2 +
				this.points[p2].x * q3 +
				this.points[p3].x * q4;
		let ty =this.points[p0].y * q1 +
				this.points[p1].y * q2 +
				this.points[p2].y * q3 +
				this.points[p3].y * q4;
		return new Point2D(tx, ty);
	}

	getSplineCurvature(t, loop = false) {
		let p0, p1, p2, p3;

		if (loop) {
			p1 = Math.floor(t);
			p2 = (p1 + 1) % this.points.length;
			p3 = (p2 + 1) % this.points.length;
			p0 = (p1 - 1) % this.points.length;
			if (p0 < 0) p0 = this.points.length + p0;
		} else {
			p1 = Math.floor(t) + 1;
			p2 = p1 + 1;
			p3 = p2 + 1;
			p0 = p1 - 1;
		}

		t = t - Math.floor(t);

        let tt = t*t;

		let q1 = -6*tt+(3/2)*t+2;
		let q2 = -6*tt+(27/2)*t-(11/2);
		let q3 = -6*tt-(3/2)*t+2;
		let q4 = -6*tt+(21/2)*t-(5/2);

		let tx =this.points[p0].x * q1 +
				this.points[p1].x * q2 +
				this.points[p2].x * q3 +
				this.points[p3].x * q4;
		let ty =this.points[p0].y * q1 +
				this.points[p1].y * q2 +
				this.points[p2].y * q3 +
				this.points[p3].y * q4;
		return new Point2D(tx, ty);
	}

	draw(ctx, loop = false) {
		let stop = 0
		if (!loop) {
			stop = 3
		}
		ctx.strokeStyle = this.col;
		ctx.beginPath();
		for (let t = 0.0; t < this.points.length - stop; t += this.step) {
			let p = this.getSplinePoint(t, loop);
			ctx.lineTo(p.x, p.y);
		}
		if (loop) {
			ctx.lineTo(this.points[0].x, this.points[0].y);
		}
		ctx.stroke();
	}

	drawTracks(ctx, loop = false) {
		let stop = 0
		if (!loop) {
			stop = 3
		}
		ctx.strokeStyle = this.col;
		ctx.lineWidth = 3;
		ctx.beginPath();

		for (let t = 0.0; t < this.points.length - stop; t += this.step) {
			let p = this.getSplinePoint(t, loop);
			let g = this.getSplineGardient(t, loop);
			g.normalize();
			g.multiply(new Point2D(0,5));

			p.add(g);
			ctx.lineTo(p.x, p.y);
		}
		if (loop) {
			ctx.lineTo(this.points[0].x, this.points[0].y);
		}
		ctx.stroke();

		ctx.beginPath();
		for (let t = 0.0; t < this.points.length - stop; t += this.step) {
			let p = this.getSplinePoint(t, loop);
			let g = this.getSplineGardient(t, loop);
			g.normalize();
			g.multiply(new Point2D(0,-5));

			p.add(g);
			ctx.lineTo(p.x, p.y);
		}
		if (loop) {
			ctx.lineTo(this.points[0].x, this.points[0].y);
		}
		ctx.stroke();

		ctx.strokeStyle = "brown";
		let t = 0.0;
		while (t < this.points.length - stop) {
			let p = this.getSplinePoint(t, loop);
			let g = this.getSplineGardient(t, loop);
			let increment = g.getModule();
			g.normalize();
			let q = new Point2D(p.x, p.y);
			let h = new Point2D(g.x, g.y);
			
			g.multiply(new Point2D(0,9));
			p.add(g);

			h.multiply(new Point2D(0,-9));
			q.add(h);


			ctx.beginPath();
			ctx.lineTo(p.x, p.y);
			ctx.lineTo(q.x, q.y);
			ctx.stroke();

			t += 15/increment;
		}
	}

	drawCurvature(ctx, loop = false) {
		let stop = 0
		if (!loop) {
			stop = 3
		}
		ctx.strokeStyle = "yellow";
		ctx.lineWidth = 1;
		for (let t = 0.0; t < this.points.length - stop; t += this.step) {
			let p = this.getSplinePoint(t, loop);
			let c = this.getSplineCurvature(t, loop);
			ctx.beginPath();
			c.multiplyScalar(0.03);
			ctx.lineTo(p.x, p.y);
			p.add(c);
			ctx.lineTo(p.x, p.y);
			ctx.stroke();
		}
	}

	getSplineGardAng(t, loop = false) {
		let g = this.getSplineGardient(t, loop);
		return Math.atan2(g.y, g.x);
	}

	drawPoints(ctx, col = "red") {
		for (let p of this.points) p.draw(ctx, col);
	}

	drawTangent(t, ctx) {
		let g = this.getSplineGardient(t, true);
		let a = g.getAngle();
		let p = this.getSplinePoint(t, true);
		ctx.strokeStyle = "green";
		ctx.beginPath();
		ctx.moveTo(p.x - Math.cos(a) * 50, p.y - Math.sin(a) * 50);
		ctx.lineTo(p.x + Math.cos(a) * 50, p.y + Math.sin(a) * 50);
		ctx.stroke();
		ctx.strokeRect(p.x - 2, p.y - 2, 5, 5);
	}

	drawCar(t, ctx) {
		let g = this.getSplineGardient(t, true);
		let a = g.getAngle();
		let p = this.getSplinePoint(t, true);
		ctx.strokeStyle = "Blue";
		ctx.beginPath();
		ctx.moveTo(p.x + Math.cos(a) * 20, p.y + Math.sin(a) * 20);
		ctx.lineTo(p.x - Math.cos(a + 1) * 12, p.y - Math.sin(a + 1) * 12);
		ctx.lineTo(p.x - Math.cos(a - 1) * 12, p.y - Math.sin(a - 1) * 12);
		ctx.lineTo(p.x + Math.cos(a) * 20, p.y + Math.sin(a) * 20);
		ctx.stroke();
	}
}