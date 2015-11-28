const Hapi = require('hapi');
const winston = require('winston');
const request = require('request');

var id = process.argv[4];
var port = process.argv[3];
var configFile = process.argv[2];
const config = require(configFile);

var graph = config.data[port];

const server = new Hapi.Server();

server.connection({ port: port });

// state
var round = 1;
var value = graph.value;
var messages = {};
var haveSent = false;
var havePosted = false;

server.route({
	method: 'POST',
	path: '/',
	handler: handleMessage
});

server.start(function(err) {
	if (err) {
		console.error(err);
	}
	console.time('Value Sorted');
	act(0);
});

function act(timeout) {
//	console.info('\n\n============ haveSent %s & haveRecieved %s on server %d on round %d===========\n\n', haveSent.toString(), haveRecieved().toString(), id, round);
	if (round === config.ids.length + 1 && !havePosted) {
		console.info('\n\nThe Sorted Value for server %d equals %s\n\n', id, value);
		console.timeEnd('Value Sorted');
		havePosted = true;
		return;
	}
	if (!haveSent) {
		return sendToNeighbor(timeout);
	}

	if (haveSent && haveRecieved()) {
//		console.info('\n\n\n\n ============ SERVER %d DONE WITH ROUND %d =============\n\n\n\n', id, round);
		// exchange
		if (getPosition() === 'left') {
			takeIfLess(messages[round]);
		} else if (getPosition() === 'right') {
			takeIfGreater(messages[round]);
		}
		round = round + 1;
		haveSent = false;
		act(0);
	}
}

function sendToNeighbor(timeout) {
	var port = getNeighborPort();
	if (!port) {
		haveSent = true;
		// set an empty message for the round
		messages[round] = {
			round: round,
			value: value
		};
		return act(0);
	}
//	console.info('\n\n===== sending message on server %s to server %d on round %d\n\n', id, port.toString().charAt(3), round);
	request.post({
		url: 'http://localhost:' + port,
		body: {
			id: id,
			round: round,
			value: value
		},
		json: true
	}, function(err, response, body) {
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
	var position = getPosition();
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
	var message = request.payload;

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
