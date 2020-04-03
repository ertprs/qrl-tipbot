#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

'use strict';
const health = require('./_test/health/healthcheck');

const fs = require('fs');
const mysql = require('mysql');
const chalk = require('chalk');
const now = new Date();
const util = require('util');
const { spawn } = require('child_process');

console.log(chalk`{cyan Starting the QRL TipBot 
Time is: {green {dim ${now}}}}
{green Running Checks...}`);

 // check for the config file
    fs.access('_config/config.json', error => {
      if (error) {
        console.log(chalk`  {red {bold ℹ} Config NOT Found...}{grey Copy from /_config.config.json.example and fill out}
        `);
        return;
      }
    });
const config = require('./_config/config.json');
console.log(chalk`{green {cyan {bold ℹ}} Config Found!!}
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


// MySQL
// database connection info found in the config file
    const callmysql = mysql.createConnection({
      host: `${config.database.db_host}`,
      user: `${config.database.db_user}`,
      password: `${config.database.db_pass}`,
      database: `${config.database.db_name}`,
    });

function SQLQuery() {
  const query = util.promisify(callmysql.query).bind(callmysql);
  (async () => {
    try {
      // check for the bot and donate address, and confirm connection to sql.
      const rows = await query('select * from wallets where user_id=1');

      console.log(rows);
    }
    finally {
      callmysql.end();
    }
  })();
}

SQLQuery()
.then(function(results) {
  console.log(JSON.stringify(results));
});

 async function sqlCheck() {
    await callmysql.connect(function(err) {
      if (err) {
        console.log('error: ' + err.message);
        console.log('error complete: ' + JSON.stringify(err));
        return;
      }
      console.log('Connected to the MySQL server.');
    });
    await callmysql.end(function(err) {
      if (err) {
        return console.log('error:' + err.message);
      }
      console.log('Close the database connection.');
    });
}


// sqlCheck();



// check QRL Node

 // check for the config file
 const homeDir = require('os').homedir();
 console.log(homeDir);
    fs.access(homeDir + '/.qrl/data/state/LOCK', error => {
      if (error) {
        console.log(chalk`  {red {bold ℹ} QRL Dir NOT Found...}{grey Copy from /_config.config.json.example and fill out}
        `);
        return;
      }
    });
console.log(chalk`{green {cyan {bold ℹ}} QRL Dir Found!!}`);

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
  {blue {cyan {bold ℹ}} Discord Bot PID: {red ${spawnDiscord.pid}}}`);
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