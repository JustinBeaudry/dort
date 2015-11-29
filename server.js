'use strict';

let Hapi = require('hapi');
let winston = require('winston');
let request = require('request');

let id = process.argv[4];
let port = process.argv[3];
let configFile = process.argv[2];
const config = require(configFile);

let graph = config.data[port];

const server = new Hapi.Server();

server.connection({ port: port });

// state
let round = 1;
let value = graph.value;
let messages = {}
let haveSent = false;
let havePosted = false;
function done() {
	return round === config.nodes.length;
}

server.route({
	method: 'POST',
	path: '/',
	handler: handleMessage
});

server.start(function(err) {
	if (err) {
		console.error(err);
	}
//	console.time('server: ' + id + ', time');
	act(0);
});

function act(timeout) {
//	console.info('============ haveSent %s & haveRecieved %s on server %d on round %d===========\n\n', haveSent.toString(), haveRecieved().toString(), id, round);
	if (done()) {
		if (!havePosted) {
//			console.info('SERVER %d COMPLETE', id);
			console.info('%d server %s value', id, value);
//			console.timeEnd('server: ' + id + ', time');
			havePosted = true;
		}
		return;
	} else {
		if (!haveSent) {
			return sendToNeighbor(timeout);
		}

		if (haveSent && haveRecieved()) {
//			console.info('\n\n\n\n ============ SERVER %d DONE WITH ROUND %d =============\n\n\n\n', id, round);
			// exchange
			if (getPosition() === 'left') {
				takeIfLess(messages[round]);
			} else if (getPosition() === 'right') {
				takeIfGreater(messages[round]);
			}
			if (round <= config.nodes.length) {
				round = round + 1;
				haveSent = false;
			}
			act(0);
		}
	}
}

function sendToNeighbor(timeout) {
	let port = getNeighborPort();
	if (!port) {
//		console.info('Server %d has no neighbor for Round %d', id, round);
		haveSent = true;
		// just send a message for the round
		messages[round] = {
			round: round,
			value: value
		};
		return act(0);
	}
//	console.info('\n\n===== sending message on server %s to server %d on round %d\n\n', id, port.toString(), round);
	request.post({
		url: 'http://localhost:' + port,
		body: {
			id: id,
			round: round,
			value: value
		},
		json: true
	}, function(err) {
		if (err) {
			console.error(err);
			timeout += 1000;
			return setTimeout(act, timeout);
		}
		haveSent = true;
		act(0);
	});
}

// sync messages
function isEven(value) {
	return (value % 2 === 0);
}

function isOdd(value) {
	return !isEven(value);
}

function getNeighborPort() {
	let position = getPosition();
	if (position === 'left') {
		return graph.right;
	} else {
		return graph.left;
	}
}

function takeIfLess(message) {
	if (message.value < value) {
		value = message.value;
	}
}

function takeIfGreater(message) {
	if (message.value > value) {
		value = message.value;
	}
}

function handleMessage(request, reply) {
//	console.info('\n\n==== message recieved on server %s from server %d on round %d\n\n', id, request.payload.id, round);
	storeMessage(request);
	reply(id);
	act(0);
}

function storeMessage(request) {
	let message = request.payload;

//	console.info(JSON.stringify(message, null, 2));
	if (!messages[message.round]) {
		messages[message.round] = message;
	} else {
//		console.error('value already set for round');
	}
}

function getPosition() {
	if (isOdd(id) && isOdd(round)) {
		return 'left';
	} else if (isOdd(id) && isEven(round)) {
		return 'right';
	} else if (isEven(id) && isOdd(round)) {
		return 'right';
	} else if (isEven(id) && isEven(round)) {
		return 'left';
	}
}

function haveRecieved() {
	return !!messages[round];
}
