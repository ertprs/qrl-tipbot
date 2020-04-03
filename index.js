#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

'use strict';
const health = require('./_test/health/healthcheck');

const fs = require('fs');
const chalk = require('chalk');
const now = new Date();
const { spawn } = require('child_process');

console.log(chalk`
{cyan Discord Starting the QRL TipBot 
Time is: {green {dim ${now}}}}
  {blue {cyan {bold ℹ}} Running Checks...}
    `);

 // check for the config file
    fs.access('_config/config.json', error => {
      if (error) {
        console.log(chalk`
        {red {bold ℹ} Config NOT Found...}{grey Copy from /_config.config.json.example and fill out}
        `);
        return;
      }
      else {
        console.log(chalk`
        {blue Bot Details}
          {blue {cyan {bold ℹ}} Config Found!!}
          `);
      }
    });
const config = require('./_config/config.json');
console.log(chalk`
{blue Bot Details}
  {blue {cyan {bold ℹ}} :\t {grey ${config.bot_details.bot_name}}}
  {blue {cyan {bold ℹ}} :\t {grey ${config.bot_details.bot_url}}}
  {blue {cyan {bold ℹ}} :\t {grey ${config.bot_details.bot_donationAddress}}}
{blue Wallet Details}
  {blue {cyan {bold ℹ}} :\t {grey ${config.wallet.tx_fee}}}
  {blue {cyan {bold ℹ}} :\t {grey ${config.wallet.hold_address}}}
{blue TipBot Database Details}
  {blue {cyan {bold ℹ}} :\t {grey ${config.database.db_name}}}
  {blue {cyan {bold ℹ}} :\t {grey ${config.database.db_host}}}
  {blue {cyan {bold ℹ}} :\t {grey ${config.database.db_user}}}
  {blue {cyan {bold ℹ}} :\t {grey ${config.database.db_port}}}
{blue Discord Bot Details}
  {blue {cyan {bold ℹ}} :\t {grey ${config.discord.prefix}}}
  {blue {cyan {bold ℹ}} :\t {grey ${config.discord.bot_admin}}}  
{blue Faucet Details}
  {blue {cyan {bold ℹ}} :\t {grey ${config.faucet.faucet_wallet_pub}}}
  {blue {cyan {bold ℹ}} :\t {grey ${config.faucet.payout_interval}}}  
  {blue {cyan {bold ℹ}} :\t {grey ${config.faucet.min_payout}}}  
  {blue {cyan {bold ℹ}} :\t {grey ${config.faucet.max_payout}}}  
`);

// check SQL
/*
const mysqlCheck = health.MysqlCheck;
const SQLPromise = mysqlCheck();
SQLPromise.then(function(results) {
  console.log('results to confCheck: ' + JSON.stringify(results));
  if (!results[0].database_connected) {
    console.log(chalk`
    {red {bold ℹ} Discord Bot FAILED to start!}
    `);
    return;
  }
});

*/


/*
Spawn bots here.
Functions for each bot here. Using the healthcheck script add checks here to run for each bot
Give output like

  console.log(chalk`

  {blue {cyan {bold ℹ}} Discord Bot Started!}
  {blue {cyan {bold ℹ}} Discord Bot PID:\t {grey ${spawnDiscord.pid}}}
  `);

*/
function spawnDiscordBot() {
	console.log('Spawning the ' + chalk.bgCyan.black('Discord Bot') + '...');
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
  console.log(chalk`

  {blue {cyan {bold ℹ}} Discord Bot Started!}
  {blue {cyan {bold ℹ}} Discord Bot PID:\t {grey ${spawnDiscord.pid}}}
  `);
}


// spawn all bots here into background processes
spawnDiscordBot();

console.log(chalk`

  {blue {cyan {bold ℹ}} Checks Complete... {grey All Services started}}
{cyan ==========================================}
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