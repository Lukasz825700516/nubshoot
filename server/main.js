const WebSocket = require('ws');
const {Player} = require('../player');

const server = new WebSocket.Server({port: 8069});

const sockets = [];
const players = [];
let new_player_id = 0;

server.on('connection', (socket) => {
	sockets.push(socket);
	console.log('connection!');

	socket.on('message', (packet) => {
		if (packet.readInt8(0) == 1) {
			const player_id = packet.readInt8(1);
			let player = players.find(p => p.id == player_id);
			player.x = packet.readFloatBE(2 + 4 * 0);
			player.y = packet.readFloatBE(2 + 4 * 1);
			player.dx = packet.readFloatBE(2 + 4 * 2);
			player.dy = packet.readFloatBE(2 + 4 * 3);

			player.propagate(sockets.filter(s => s !== socket));
		}

		if (packet.readInt8(0) == 2) {
			const player_id = packet.readInt8(1);
			let player = players.find(p => p.id == player_id);
			const target_x = packet.readFloatBE(2 + 4 * 2);
			const target_y = packet.readFloatBE(2 + 4 * 3);

			player.shoot(sockets.filter(s => s !== socket), target_x, target_y);
			console.log('pew, piew');
		}
	});


	const packet = new Uint8Array(2);
	packet[0] = 0;
	packet[1] = new_player_id;
	socket.send(packet);

	players.push(Player(new_player_id, socket));

	new_player_id += 1;
});

const timeDelta = 1000/60;
setInterval(() => {
	players.forEach(player => {
		player.update(timeDelta/ 1000);
	});
}, timeDelta);

const networkTimeDelta = 1000/3;
setInterval(() => {
	players.forEach(player => {
		player.propagate(sockets);
	});
}, networkTimeDelta);
