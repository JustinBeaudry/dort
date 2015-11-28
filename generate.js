'use strict';

var fs = require('fs');
var numberOfServers = process.argv[2] || 100;
var basePort = process.argv[4] || 3000;

const CONFIG = 'config.json';

var output = {
	ids: [],
	data: {}
};

for (var i = 1; i <= numberOfServers; i++) {
	var thisPort = basePort + i;
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
	var graph = {};

	if (index > 1) {
		graph.left = port - 1;
	}
	if (index < numberOfServers) {
		graph.right = port + 1;
	}

	graph.value = Math.ceil(Math.random() * numberOfServers);

	return graph;
}


