'use strict';

let child_process = require('child_process');
let fs = require('fs');

const CONFIG_FILE = process.argv[2];
const PROCESS_NAME = process.argv[3];
const CONFIG = require(CONFIG_FILE);

let server = {};
let nodes = [];

CONFIG.nodes.forEach(function(port, index) {
	let id = index + 1;
	let node = child_process.spawn('node' , [PROCESS_NAME, CONFIG_FILE, port, id]);

	node.stdout.on('data', function(data) {
		let response = data.toString();

		// comment out below when debugging
//		 /*
		var serverNumber = findServerNumber(response);
		var serverValue = findServerValue(response);

		if (serverNumber && serverValue) {
			server[serverNumber] = {
				sorted: serverValue,
				raw: CONFIG.data[port].value
			};
			checkIfComplete();
		}
//		 */
	});

	node.on('close', function() {
		console.info('Server %d Killed!', index + 1);
	});

	nodes.push(node);
});


function checkIfComplete() {
	if (Object.keys(server).length === nodes.length) {
		console.info('Operation Complete!\n');
		destroyNodes();
		console.info('\nWriting output to output.json\n');
		fs.writeFileSync('output.json', JSON.stringify(server, null, 2));
	}
}

function destroyNodes() {
	console.info('Killing %d Servers', CONFIG.nodes.length);
	nodes.forEach(function(node, id) {
		node.kill('SIGTERM');
	});
}

function findServerNumber(data) {
	return +(findItem(data, 'server'));
}

function findServerValue(data) {
	return +(findItem(data, 'value'));
}

function findItem(item, match) {
	var regExp = new RegExp('\\d+(?=.' + match + ')');
	var found = item.match(regExp);
	if (found && found[0]) {
		return found[0];
	}
	return null;
}