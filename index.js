'use strict';
// require the health check script

const health = require('./_test/health/healthcheck');
const fs = require('fs');
const service = '';
console.log('1');

// from https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
const { spawn } = require('child_process');
//const out = fs.openSync('./' + service + 'out.log', 'a');
//const err = fs.openSync('./' + service + 'out.log', 'a');

const pwd = spawn("pwd", ["./"]);
console.log('2');


pwd.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
});
console.log('3');

pwd.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
});
console.log('4');

pwd.on('error', (error) => {
    console.log(`error: ${error.message}`);
});
console.log('5');


pwd.on("close", code => {
    console.log(`child process exited with code ${code}`);
});


console.log('');




function spawnDiscordBot() {
	console.log('1.1');

  const service = 'discord';
  const out = fs.openSync('./' + service + 'out.log', 'a');
  console.log('1.2');

  const err = fs.openSync('./' + service + 'out.log', 'a');
  console.log('1.3');

  const spawnDiscord = spawn('nodejs ', ['./_scripts/discord/index.js'] , {
    detached: true,
    stdio: [ 'ignore', out, err ]
  })
  // spawnDiscord.on('error', (err) => {
    // console.error('Failed to start Discord Bot.');
  // });
  spawnDiscord.unref();
}

spawnDiscordBot();


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





