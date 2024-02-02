class Station {
    constructor( _name, color = "green", _position, _size = 30) {
		this.col = color;
		this.position = _position;
		this.name = _name;
        this.size = _size;
	}

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'black';
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeStyle = this.col;
        ctx.stroke();
        ctx.fillStyle = this.col;
        ctx.font = "30px sans-serif"
        ctx.fillText(this.name, this.position.x -10, this.position.y+10);
    }
}