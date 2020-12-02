const Player = (id, socket) => {
	const self = {};
	self.x = 0;
	self.y = 0;
	self.dx = 50;
	self.dy = 0;

	self.id = id;
	self.socket = socket;

	self.update = (timeDelta) => {
		const friction = 0.5;
		const gravity = 300;

		self.x +=  self.dx * timeDelta;
		self.y +=  self.dy * timeDelta;
		self.x = Math.max(self.x, 0);
		self.x = Math.min(self.x, 800 - 20);
		self.y = Math.max(0, self.y);
		self.y = Math.min(self.y, 600 - 40);


		self.dx -=  self.dx * (1 - friction) * timeDelta;
		self.dy -=  gravity * timeDelta;


		self.dy += Math.abs(self.dx) * 0.5 * (self.x == 0 || self.x == 800 - 20);

		self.dy *= self.y != 0;
		if (self.y == 600 - 40) self.dy = Math.min(0, self.dy);
		self.dx *= self.x != 0 && self.x != 800 - 20;

	}

	self.propagate = (sockets) => {
		const packet = new ArrayBuffer(2 + 4 * 4);
		const packet_data = new DataView(packet);
		packet_data.setInt8(0, 1);
		packet_data.setInt8(1, self.id);
		packet_data.setFloat32(2 + 4 * 0, self.x);
		packet_data.setFloat32(2 + 4 * 1, self.y);
		packet_data.setFloat32(2 + 4 * 2, self.dx);
		packet_data.setFloat32(2 + 4 * 3, self.dy);

		sockets.forEach(socket => {
			socket.send(packet);
		});
	}

	self.draw = (ctx, is_player) => {
		const fillStyle = ctx.fillStyle;
		if (is_player) ctx.fillStyle = '#0f0';
		ctx.fillRect(self.x, 600 - self.y - 40, 20, 40);
		if (is_player) ctx.fillStyle = fillStyle;
	};


	self.shoot = (sockets, x, y) => {
		const packet = new ArrayBuffer(2 + 4 * 4);
		const packet_data = new DataView(packet);
		packet_data.setInt8(0, 2);
		packet_data.setInt8(1, self.id);
		packet_data.setFloat32(2 + 4 * 0, self.x);
		packet_data.setFloat32(2 + 4 * 1, self.y);
		packet_data.setFloat32(2 + 4 * 2, x);
		packet_data.setFloat32(2 + 4 * 3, y);

		sockets.forEach(socket => {
			socket.send(packet);
		});
		
	}

	return self;
};


if (typeof module !== 'undefined' && module.exports) { 
	module.exports = {
		Player
	};
}
