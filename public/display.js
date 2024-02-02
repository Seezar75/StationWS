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
let splines = [];
let splinesDictionary = {};
let stations = [];
let s1;
let mousePressed = false;
let curPoint = null;
let messages = [];
let mode = "";
let curTrain = null;

var connection;

connection = new WebSocket("ws://" + location.hostname + ":" + wsPort + "/");
connection.onopen = function () {
    let m = JSON.stringify({type: "message", message: 'Connesso!!'});
    connection.send(m);
};
connection.onerror = function(error) {console.log("WebSocket error: ", error)};
connection.onmessage = function(e) {
    let m = JSON.parse(e.data);
	let sp = splinesDictionary[m.line];
    let tr = new Message(0, sp);
    tr.text = m.message;
    if (tr.text.length <= 3) {
		tr.payload = m;
        messages.push(tr);
    }
};

function sendMessage() {
    let msg = document.getElementById("message").value;
    let m = JSON.stringify({type: "message", message: msg});
    connection.send(m);
}

function setup() {
	fetch("http://" + location.hostname + ":8080/graph_config.json").then(response => {
		return response.json();
		}).then(data => {
			// Work with JSON data here
			console.log(data);
			loadGraphConfig(data);
		}).catch(err => {
		// Do something for an error here
		console.log(err);
	});

	//let st = new Station("A", "green", new Point2D(310,50), 30);
	//stations.push(st);
	//console.log(ctx.font);
}

function loadGraphConfig(data) {
	for(let sp of data) {
		let s = new Spline(sp.name, 1/sp.step, sp.col);
		for (let i = 0; i< sp.points.length; i++) {
			s.points.push(new Point2D(sp.points[i].x, sp.points[i].y));
		}
		console.log(s);
		splines.push(s);
		splinesDictionary[sp.name] = s;

		let st = new Station(sp.name.substring(0,1), "green", s.points[1], 30);
		stations.push(st);

		let st2 = new Station(sp.name.substring(2,3), "green", s.points[s.points.length-2], 30);
		stations.push(st2);
	}
	console.log(splinesDictionary);
}

function loop() {
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	//Draw Spline
	for (let sp of splines) {
		sp.drawTracks(ctx, false);
		//sp.draw(ctx, false);
	}

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
		ctx.font = "10px sans-serif";
		ctx.fillText(m.text, -12, 4);
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

	for (let sp of stations) {
		sp.draw(ctx);
	}

	/*
	for (let s of splines) {
		s.drawCurvature(ctx, false);
	}
	*/

	//Draw points
	if (mode == "E") {
		for(let sp of splines) {
			sp.drawPoints(ctx, "yellow");
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

	if (mode == "E") {
		setPoint();
		if (curPoint) {
			curPoint.x = mousePos.x;
			curPoint.y = mousePos.y;
		}
	} else {
		getTrain();
		if(curTrain) {
			alert(JSON.stringify(curTrain.payload));
		}
	}

	//evt.preventDefault();
}

function mouseUpHandler(evt) {
	mousePos = getMousePos(canvas, evt);
	mousePressed = false;
	curPoint = null;
	curTrain = null;
}

function getTrain() {
	let d = canvas.height + canvas.width;
	let dTemp = 0;
	for (let t of messages) {
		let p = t.spline.getSplinePoint(t.t, false);
		dTemp = p.dist(mousePos);
		if (dTemp < d) {
			d = dTemp;
			curTrain = t;
		}
	}
	
	if (d > 10) {
		curTrain = null;
	}
}

function setPoint() {
	let d = canvas.height + canvas.width;
	let dTemp = 0;
	for (let sp of splines) {
		for (let p of sp.points) {
			dTemp = p.dist(mousePos);
			if (dTemp < d) {
				d = dTemp;
				curPoint = p;
			}
		}
	}
	
	if (d > 10) {
		curPoint = null;
	}
}

function keyDownHandler(evt) {
	if (evt.keyCode == 39) {
		// right
		messages.push(new Message(0, splines[0]));
	} else if (evt.keyCode == 69) {
		// E
		if (mode == "E") {
			mode = "";
		} else {
			mode = "E";
		}
	}
}

class Message {
	constructor(_t, _spline) {
		this.t = _t;
		this.spline = _spline;
		this.timer = null;
        this.text = "MSG";
		this.payload = null;
	}
}
