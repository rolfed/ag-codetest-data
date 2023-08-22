import { WebSocketServer, type WebSocket } from 'ws';
import http from 'http';
import express from 'express';
import { LoremIpsum } from 'lorem-ipsum';
import sqlite3 from 'sqlite3';

const initialCount = 100000;

const db = new sqlite3.Database(':memory:');

type DataRow = {
	id: number;
	timestamp: number;
	body: string;
};

db.serialize(() => {
	db.run(
		'CREATE TABLE data (id INTEGER PRIMARY KEY, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, body TEXT)'
	);
});

const lorem = new LoremIpsum();

type EventType = 'insert' | 'delete' | 'mutate';

const dbError = (type: EventType | 'get', err: Error) => {
	throw new Error(`DB Error on event ${type}: ${err}`);
};

const wss = new WebSocketServer({ noServer: true });

type ConnInfo = object;
const wsConn = new Map<WebSocket, ConnInfo>();

wss.on('connection', function (ws) {
	wsConn.set(ws, {});
	ws.on('error', console.error);

	ws.on('message', function (message) {
		console.log(`Received message ${message}`);
	});
});

const broadcast = (type: EventType, timestamp: number, body: object) => {
	// console.log(`${type} @ ${timestamp} => ${JSON.stringify(body)}`);

	const msg = JSON.stringify({
		type,
		...body
	});

	for (const [conn] of wsConn.entries()) {
		conn.send(msg);
	}
};

const updater = (() => {
	function randInt(max: number) {
		return Math.floor(Math.random() * max);
	}

	function randTS() {
		let ts = Math.round(+new Date() / 1000);

		if (!randInt(1)) {
			ts += randInt(60 * 60 * 24 * 30);
		} else {
			ts -= randInt(60 * 60 * 24 * 30);
		}

		return ts;
	}

	const opInsert = () => {
		const timestamp = randTS();
		const body = lorem.generateSentences(randInt(4));
		db.each<DataRow>(
			'INSERT INTO data (timestamp, body) VALUES (?, ?) RETURNING *',
			[timestamp, body],
			function (err, row) {
				if (err !== null) {
					dbError('insert', err);
				}
				broadcast('insert', row.timestamp, row);
			}
		);
	};

	const opDelete = () => {
		db.each<DataRow>(
			'SELECT * FROM data WHERE id IN (SELECT id FROM data ORDER BY RANDOM() LIMIT 1)',
			[],
			(err, row) => {
				if (err !== null) {
					dbError('delete', err);
				}

				db.run('DELETE FROM data WHERE id = ?', [row.id], () => {
					broadcast('delete', row.timestamp, row);
				});
			}
		);
	};

	const opMutate = () => {
		db.each<DataRow>(
			'SELECT * FROM data WHERE id IN (SELECT id FROM data ORDER BY RANDOM() LIMIT 1)',
			[],
			(err, row) => {
				if (err !== null) {
					dbError('delete', err);
				}

				const newRow = { ...row, body: lorem.generateSentences(randInt(4)) };

				db.run('UPDATE data SET body = ? WHERE id = ?', [newRow.body, row.id], (err) => {
					if (err !== null) {
						dbError('mutate', err);
					}

					broadcast('mutate', row.timestamp, { old: row, new: newRow });
				});
			}
		);
	};

	// Populate the initial dataset.
	console.info(`Populating with initial count of ${initialCount} records...`);
	db.serialize(() => {
		for (let i = 0; i < initialCount; i++) {
			opInsert();
		}
	});

	const operations = [opInsert, opInsert, opInsert, opMutate, opDelete];
	return () => {
		console.info('Updating records...');

		for (let i = 0, n = randInt(32); i < n; i++) {
			operations[randInt(operations.length)]();
		}
	};
})();

updater();
setInterval(updater, 1000);

const app = express();
app.set('etag', 'strong');

app.get('/data', (req, res) => {
	const knownQueryKeys = ['start', 'stop'];

	for (const k in req.query) {
		if (knownQueryKeys.includes(k)) {
			continue;
		}

		res.status(400).send(`unkown parameter ${k}\r\n`);
		return;
	}

	const where = [];
	const args = [];

	function decodeInt(k: string): number {
		const s = req.query[k];
		if (typeof s !== 'string') {
			res.status(400).send(`${k} must be a single value\r\n`);
			return NaN;
		}

		const n = parseInt(s);

		if (isNaN(n)) {
			res.status(400).send(`${k} must be an integer\r\n`);
			return NaN;
		}

		return n;
	}

	if (req.query['start']) {
		const v = decodeInt('start');

		if (isNaN(v)) {
			return;
		}

		where.push('timestamp >= ?');
		args.push(v);
	}

	if (req.query['stop']) {
		const v = decodeInt('stop');

		if (isNaN(v)) {
			return;
		}

		where.push('timestamp < ?');
		args.push(v);
	}

	let query = 'SELECT * from data';

	if (where.length > 0) {
		query += ' WHERE ' + where.join(' AND ');
	}

	query += ' ORDER BY timestamp';

	db.all<DataRow>(query, args, (err, rows) => {
		if (err !== null) {
			dbError('get', err);
		}
		res.json(rows);
	});
});

const server = http.createServer(app);

server.on('upgrade', function (request, socket, head) {
	if (request.url !== '/data') {
		socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
		socket.destroy();
		return;
	}

	wss.handleUpgrade(request, socket, head, function (ws) {
		wss.emit('connection', ws, request);
	});
});

const port = 3000;
server.listen(port, () => console.info(`Listening on port ${port} for requests...`));

export {};
