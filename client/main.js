const server = new WebSocket('ws://localhost:8069');
const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');

const players = [];
const keys = [];
let rays = [];
let hp = 100;

server.onmessage = (message) => {
	message.data.arrayBuffer()
		.then(packet => {
			packet = new DataView(packet);
			if (packet.getUint8(0) == 0) {
				const player_id = packet.getUint8(1);
				players.push(Player(player_id, null));

			}
			if (packet.getUint8(0) == 1) {
				const player_id = packet.getUint8(1);
				let player = players.find(p => p.id == player_id);
				if (player == null) {
					player = Player(player_id, null);
					players.push(player);
				}
				if (player_id == players[0].id) return;
				player.x = packet.getFloat32(2 + 4 * 0);
				player.y = packet.getFloat32(2 + 4 * 1);
				player.dx = packet.getFloat32(2 + 4 * 2);
				player.dy = packet.getFloat32(2 + 4 * 3);

			}
			if (packet.getUint8(0) == 2) {
				const player_id = packet.getUint8(1);
				let player = players.find(p => p.id == player_id);
				if (player == null) {
					player = Player(player_id, null);
					players.push(player);
				}
				if (player_id == players[0].id) return;
				const src_x = player.x;
				const src_y = player.y;
				const target_x = packet.getFloat32(2 + 4 * 2);
				const target_y = packet.getFloat32(2 + 4 * 3);

				rays.push({sx: src_x, sy: src_y, tx: target_x, ty: target_y, d: 5});
			}
		});
}

const timeDelta = 1000/60;
setInterval(() => {
	
	if (keys['a']) players[0].dx += -10;
	if (keys['d']) players[0].dx += +10;
	if (keys['a'] || keys['d']) {
		players[0].propagate([server]);
	}

	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000';

	players.forEach(player => {
		player.update(timeDelta / 1000);
		player.draw(ctx,false);


	});
	players[0].draw(ctx,true);

	rays.forEach(r => {
		ctx.beginPath();
		ctx.moveTo(r.sx, 600 - r.sy);
		ctx.lineTo(r.tx, r.ty);
		ctx.stroke();
		r.d -= 1;

		const a = (r.ty - r.sy) / (r.tx - r.sx);
		const b = canvas.height - r.ty  - a * r.tx;

		players.forEach(player => {
			// works as intended ( ͡° ͜ʖ ͡°)
			const distance_x = Math.abs(((player.y + 40 /2) - b) / a - (player.x + 20 /2));
			const distance_y = Math.abs(a * player.x + b - (player.y + 40 / 2));
			if (distance_x <= 20 / 2 && distance_y <= 40 / 2) {
				hp --;

				if (hp < 1) {
					window.open('https://youtu.be/dQw4w9WgXcQ');
				}
			}
			console.log(distance_x, distance_y);
		});
	});
	rays = rays.filter(r => r.d > 0);

	ctx.fillText('HP: ' + hp, 400, 650);
}, timeDelta );

const networkTimeDelta = 1000/3;
setInterval(() => {
	players[0].propagate([server]);
}, networkTimeDelta );

window.onkeydown = (e) => {
	keys[e.key] = true;
	keyEvent = true;

	if (keys['w'] && players[0].y == 0) {
		players[0].dy = +500;
		players[0].propagate([server]);
	}
}

window.onkeyup = (e) => {
	keys[e.key] = false;
}

window.onclick = (e) => {
	const src_x = players[0].x + 10;
	const src_y = players[0].y + 20;
	const target_x = e.clientX;
	const target_y = e.clientY;
	rays.push({sx: src_x, sy: src_y, tx: target_x, ty: target_y, d: 5});

	players[0].shoot([server], target_x, target_y);
}

window.onresize = (e) => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

window.onresize();
