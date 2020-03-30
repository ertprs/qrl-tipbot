'use strict';
// require the health check script

const health = require('./_test/health/healthcheck.js');
const fs = require('fs');
// const service = '';
  const service = 'discord';


// from https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
const { spawn } = require('child_process');
const out = fs.openSync('./' + service + 'out.log', 'a');
const err = fs.openSync('./' + service + 'out.log', 'a');



  const out = fs.openSync('./' + service + 'out.log', 'a');
  const err = fs.openSync('./' + service + 'out.log', 'a');
  const spawnDiscord = spawn('nodejs ', ['_script/discord/index.js'] , {
    detached: true,
    stdio: [ 'ignore', out, err ]
  })
  // spawnDiscord.on('error', (err) => {
    // console.error('Failed to start Discord Bot.');
  // });
  spawnDiscord.unref();



/*
const nodeCheck = health.NodeCheck();

nodeCheck.then(function(reutrns) {
// should return true if everything is correct, along with state and blockheight compair


// if not running give failure and exit

// if running but not synced, give expected blockheight and explorer blockheight


})

if (!nodeCheck) {
	// the node is not running or not synced. 
	if 
}


health.ConfigCheck()


// check for the config file
fs.access('_config/config.json', error => {
  if (!error) {
    // The check succeeded
    // console.log('Config Found!');
  }
  else {
  // The check failed
    console.log('Config NOT Found!');
    return;
  }
});
*/





