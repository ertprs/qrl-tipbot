#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

'use strict';
const health = require('./_test/health/healthcheck');

const fs = require('fs');
const chalk = require('chalk');
const now = new Date();
const { spawn } = require('child_process');

console.log(chalk`{cyan Starting the QRL TipBot 
Time is: {green {dim ${now}}}}
  {green {cyan {bold ℹ}} Running Checks...}`);

 // check for the config file
    fs.access('_config/config.json', error => {
      if (error) {
        console.log(chalk`  {red {bold ℹ} Config NOT Found...}{grey Copy from /_config.config.json.example and fill out}
        `);
        return;
      }
      else {
        console.log(chalk`
          `);
      }
    });
const config = require('./_config/config.json');
console.log(chalk`  {green {cyan {bold ℹ}} Config Found!!}
  {cyan Bot Details}
  {blue {cyan {bold ℹ}} bot_name: {grey ${config.bot_details.bot_name}}}
  {blue {cyan {bold ℹ}} bot_url: {grey ${config.bot_details.bot_url}}}
  {blue {cyan {bold ℹ}} bot_donationAddress: {grey ${config.bot_details.bot_donationAddress}}}
  {cyan Wallet Details}
  {blue {cyan {bold ℹ}} tx_fee: {grey ${config.wallet.tx_fee}}}
  {blue {cyan {bold ℹ}} hold_address: {grey ${config.wallet.hold_address}}}
  {cyan TipBot Database Details}
  {blue {cyan {bold ℹ}} db_name: {grey ${config.database.db_name}}}
  {blue {cyan {bold ℹ}} db_host: {grey ${config.database.db_host}}}
  {blue {cyan {bold ℹ}} db_user: {grey ${config.database.db_user}}}
  {blue {cyan {bold ℹ}} db_port: {grey ${config.database.db_port}}}
  {cyan Discord Bot Details}
  {blue {cyan {bold ℹ}} prefix: {grey ${config.discord.prefix}}}
  {blue {cyan {bold ℹ}} bot_admin: {grey ${config.discord.bot_admin}}}  
  {cyan Faucet Details}
  {blue {cyan {bold ℹ}} faucet_wallet_pub: {grey ${config.faucet.faucet_wallet_pub}}}
  {blue {cyan {bold ℹ}} payout_interval: {grey ${config.faucet.payout_interval}}}  
  {blue {cyan {bold ℹ}} min_payout: {grey ${config.faucet.min_payout}}}  
  {blue {cyan {bold ℹ}} max_payout: {grey ${config.faucet.max_payout}}}`);

// check SQL
const mysqlCheck = health.MysqlCheck;
const SQLPromise = mysqlCheck();
const mySQLPromise = SQLPromise()
mySQLPromise.then(function(results) {
  console.log('results to confCheck: ' + JSON.stringify(results));
  if (!results[0].database_connected) {
    console.log(chalk`
  {red {bold ℹ} Discord Bot FAILED to start!}
    `);
    return;
  }
  else {
    console.log(chalk`  {green {cyan {bold ℹ}} MySQL COnnected!!}
    }
  }
});



/*
Spawn bots here.
Functions for each bot here. Using the healthcheck script add checks here to run for each bot
Give output like

  console.log(chalk`

  {blue {cyan {bold ℹ}} Discord Bot Started!}
  {blue {cyan {bold ℹ}} Discord Bot PID: {grey ${spawnDiscord.pid}}}
  `);

*/
function spawnDiscordBot() {
	const service = 'discord';
  const out = fs.openSync('./' + service + '_bot.log', 'a');
  const err = fs.openSync('./' + service + '_bot.log', 'a');

  const spawnDiscord = spawn('./_scripts/discord/index.js', {
    detached: true,
    stdio: [ 'ignore', out, err ],
  });
  spawnDiscord.on('error', (err) => {
    console.error(chalk.red(' ! ') + chalk.bgRed(' Failed to start Discord Bot.' + err));
  });
  spawnDiscord.unref();
  // console.log('PID: ' + spawnDiscord.pid);
  console.log(chalk`  {blue {cyan {bold ℹ}} Discord Bot Started!}
  {blue {cyan {bold ℹ}} Discord Bot PID: {grey ${spawnDiscord.pid}}}`);
}


// spawn all bots here into background processes
spawnDiscordBot();

console.log(chalk`  {blue {cyan {bold ℹ}} Checks Complete... {grey All Services started}}
`);


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