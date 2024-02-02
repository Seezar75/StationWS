window.onload = function() {
	canvas = document.getElementById("myCanvas");
	ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	mousePos = {
		x: canvas.width / 2,
		y: canvas.height / 2
	};
	document.addEventListener("keydown", keyDownHandler, false);
	//document.addEventListener("keyup", keyUpHandler, false);
	canvas.addEventListener("mousemove", mouseMoveHandler, false);
	canvas.addEventListener("mousedown", mouseDownHandler, false);
	canvas.addEventListener("mouseup", mouseUpHandler, false);
	setup();
	window.requestAnimationFrame(loop);
};

let ctx;
let canvas;
let s1;
let mousePressed = false;
let curPoint = null;
let messages = [];

function setup() {
	s1 = new Spline(30);
	s1.points.push(new Point2D(10,10));
	s1.points.push(new Point2D(310,10));
	s1.points.push(new Point2D(310,310));
	s1.points.push(new Point2D(620,310));
	s1.points.push(new Point2D(620,620));
	s1.points.push(new Point2D(620,700));
}

function loop() {
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	//Draw points
	s1.drawPoints(ctx, "yellow");

	//Draw Spline
	//s1.draw(ctx, false);
	s1.drawTracks(ctx, false);

	let curTime = new Date().getTime();

	for(let i = 0; i < messages.length;i++ ) {
		let m = messages[i]
		let p = m.spline.getSplinePoint(m.t, false);
		let g = m.spline.getSplineGardient(m.t, false);
		ctx.save();
		ctx.translate(p.x, p.y);
		ctx.rotate(g.getAngle());
		ctx.fillStyle = "red";
		ctx.fillRect(-15, -9, 30, 18);
		ctx.fillStyle = "black";
		ctx.textAling = "center";
		ctx.fillText("MSG", -12, 4);
		ctx.restore();
		//m.t += (m.spline.points.length - 2) / 500;
		m.t += 1/g.getModule();
		if (m.t > m.spline.points.length - 3) {
			m.t = m.spline.points.length - 3.001
			if (m.timer == null) {
				m.timer = curTime;
			}
		}
		if (m.timer) {
			if (curTime - m.timer > 1000) {
				messages.splice(i, 1);
			}
		}
	}
	
	//Next frame
	window.requestAnimationFrame(loop);
}

function getMousePos(canvas, evt) {
	let rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function mouseMoveHandler(evt) {
	mousePos = getMousePos(canvas, evt);
	if (curPoint) {
		curPoint.x = mousePos.x;
		curPoint.y = mousePos.y;
	}

	//evt.preventDefault();
}

function mouseDownHandler(evt) {
	mousePos = getMousePos(canvas, evt);
	mousePressed = true;

	setPoint();
	if (curPoint) {
		curPoint.x = mousePos.x;
		curPoint.y = mousePos.y;
	}

	//evt.preventDefault();
}

function mouseUpHandler(evt) {
	mousePos = getMousePos(canvas, evt);
	mousePressed = false;
	curPoint = null;
	console.log(s1.points);
}

function setPoint() {
	let d = canvas.height + canvas.width;
	let dTemp = 0;
	for (let p of s1.points) {
		//console.log(mousePos);
		//console.log(p);
		dTemp = p.dist(mousePos);
		//console.log(dTemp);
		//console.log("_______");
		if (dTemp < d) {
			d = dTemp;
			curPoint = p;
		}
	}

	if (d > 10) {
		curPoint = null;
	}
	console.log(curPoint);
}

function keyDownHandler(evt) {
	if (evt.keyCode == 39) {
		// right
		messages.push(new Message(0, s1))
	}
}

class Message {
	constructor(_t, _spline) {
		this.t = _t;
		this.spline = _spline;
		this.timer = null;
	}
}