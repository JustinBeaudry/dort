'use strict';

let fs = require('fs');
let numberOfServers = +(process.argv[2]) || 10;
let basePort = +(process.argv[3]) || 3000;

const CONFIG = 'config.json';

let output = {
	ids: [],
	data: {}
};

for (let i = 1; i <= numberOfServers; i++) {
	let thisPort = +(basePort + i);
	output.ids.push(thisPort);
	output.data[thisPort] = generateGraphEntry(i, thisPort);
}

console.info('Writing Config');
fs.writeFile(CONFIG, JSON.stringify(output, null, 2), function(err) {
	if (err) {
		console.error(err);
	}
	console.info('Config Written!');
});

function generateGraphEntry(index, port) {
	let graph = {};

	if (index > 1) {
		graph.left = port - 1;
	}
	if (index < numberOfServers) {
		graph.right = port + 1;
	}

	graph.value = Math.ceil(Math.random() * numberOfServers);

	return graph;
}


