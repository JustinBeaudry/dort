#Installation

requires `node v5.0`, use `nvm`

`npm i -g nvm`
`cd /path/to/dort/`
`nvm use`

If you see the error:  `N/A: version "v5.0" is not yet installed` then `nvm install 5.0`

If you see any errors about syntax or reserved word errors (e.g. noting `let`, etc.) then `nvm use` again 

the `.nvmrc` defaults the project to node `5.0`

#Use

`npm run generate` to generate graph

`npm run start` to start the servers

NOTE that enabling any log messaging in the server.js breaks the startup.js auto-kill and log script
