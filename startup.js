'use strict';

var child_process = require('child_process');

const CONFIG_FILE = process.argv[2];
const PROCESS_NAME = process.argv[3];

const config = require(CONFIG_FILE);
console.log(config, process.argv);

config.ids.forEach(function(port, index) {
	child_process.spawn('node' , [PROCESS_NAME, CONFIG_FILE, port, index+1], {
		stdio:[0,1,2]
	});
});