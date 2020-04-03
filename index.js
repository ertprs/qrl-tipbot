#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

'use strict';
// const health = require('./_test/health/healthcheck');
const wallet = require('./_scripts/qrl/walletTools');
const listAddresses = wallet.listAll;
const fs = require('fs');
const mysql = require('mysql');
const chalk = require('chalk');
const now = new Date();
const { spawn } = require('child_process');

console.log(chalk`{cyan Starting the QRL TipBot 
Time is: {green {dim ${now}}}}
{green Running Checks...}`);

 // check for the config file
    fs.access('_config/config.json', error => {
      if (error) {
        console.log(chalk`  {red {bold ℹ} Config NOT Found...}{grey \nCopy from /_config.config.json.example and fill out}
        `);
        return;
      }
    });
const config = require('./_config/config.json');
console.log(chalk`{green {cyan {bold ℹ}} Config Found!!}
  {cyan Bot Details}
  {blue {cyan {bold ℹ}} bot_name: {grey \n${config.bot_details.bot_name}}}
  {blue {cyan {bold ℹ}} bot_url: {grey \n${config.bot_details.bot_url}}}
  {blue {cyan {bold ℹ}} bot_donationAddress: {grey \n${config.bot_details.bot_donationAddress}}}
  {cyan Wallet Details}
  {blue {cyan {bold ℹ}} tx_fee: {grey \n${config.wallet.tx_fee}}}
  {blue {cyan {bold ℹ}} hold_address: {grey \n${config.wallet.hold_address}}}
  {cyan TipBot Database Details}
  {blue {cyan {bold ℹ}} db_name: {grey \n${config.database.db_name}}}
  {blue {cyan {bold ℹ}} db_host: {grey \n${config.database.db_host}}}
  {blue {cyan {bold ℹ}} db_user: {grey \n${config.database.db_user}}}
  {blue {cyan {bold ℹ}} db_port: {grey \n${config.database.db_port}}}
  {cyan Discord Bot Details}
  {blue {cyan {bold ℹ}} prefix: {grey \n${config.discord.prefix}}}
  {blue {cyan {bold ℹ}} bot_admin: {grey \n${config.discord.bot_admin}}}  
  {cyan Faucet Details}
  {blue {cyan {bold ℹ}} faucet_wallet_pub: {grey \n${config.faucet.faucet_wallet_pub}}}
  {blue {cyan {bold ℹ}} payout_interval: {grey \n${config.faucet.payout_interval}}}  
  {blue {cyan {bold ℹ}} min_payout: {grey \n${config.faucet.min_payout}}}  
  {blue {cyan {bold ℹ}} max_payout: {grey \n${config.faucet.max_payout}}}`);


// MySQL
// database connection info found in the config file
    const callmysql = mysql.createConnection({
      host: `${config.database.db_host}`,
      user: `${config.database.db_user}`,
      password: `${config.database.db_pass}`,
      database: `${config.database.db_name}`,
    });

const BotWalPubQuery = function() {
  return new Promise(function(resolve, reject) {
    callmysql.query(
      'select wallets.wallet_pub AS wallet_pub from wallets where user_id=1',
      function(err, rows) {
        if(rows === undefined) {
          reject(new Error('Error rows is undefined'));
        }
        else {
          resolve(rows);
        }
      }
      );
    callmysql.end();
  });
};

const FaucetCheckReq = function() {
  return new Promise(function(resolve, reject) {
    listAddresses().then(function(addresses) {
      const addressArray = JSON.parse(JSON.stringify(addresses));
      // sconsole.log('faucet wallet pub check: ' + addressArray.indexOf(config.faucet.faucet_wallet_pub));
      const faucetPubCheck = addressArray.indexOf(config.faucet.faucet_wallet_pub);
      if (faucetPubCheck === -1) {
        reject(new Error('faucet address not found in wallets.json'));
      }
      else {
        const faucetAddyFound = true;
        resolve(faucetAddyFound);
      }
    });
  });
};

const HoldCheckReq = function() {
  return new Promise(function(resolve, reject) {
    listAddresses().then(function(addresses) {
      const addressArray = JSON.parse(JSON.stringify(addresses));
      // sconsole.log('faucet wallet pub check: ' + addressArray.indexOf(config.faucet.faucet_wallet_pub));
      const HoldPubCheck = addressArray.indexOf(config.wallet.hold_address);
      if (HoldPubCheck === -1) {
        reject(new Error('Hold address not found in wallets.json'));
      }
      else {
        const HoldPubFound = true;
        resolve(HoldPubFound);
        console.log(chalk`  {blue {cyan {bold ℹ}} Hold Address Set Correct!}`);
      }
    });
  });
};

BotWalPubQuery()
.then(function(WalPubQueryresults) {
  // the query should find the same address in the config.bot_details.bot_donationAddress
  // console.log(JSON.stringify(WalPubQueryresults));
  console.log(chalk`{green Database Connected!!}`);
  const bot_wallet_pub = WalPubQueryresults[0].wallet_pub;
  // console.log('bot_wallet_pub' + bot_wallet_pub);
  // console.log('bot_wallet_pub' + config.bot_details.bot_donationAddress);

  if (bot_wallet_pub !== config.bot_details.bot_donationAddress) {
    console.log(chalk`  {red {bold ℹ} Bot Address and config address don't match... }{grey \nensure the bot is user 1 in the database and has the same address as the bot_donationAddress}`);
    // return;
  }
  else {
    console.log(chalk`  {blue {cyan {bold ℹ}} Bot Address Set Correct!}`);
  }

// query the list of addresses and make sure both faucet and hold address exist in the list
FaucetCheckReq()
.then(function(FaucetCheckReqRes) {
  // console.log('FaucetCheckReqRes: ' + FaucetCheckReqRes);
  if (!FaucetCheckReqRes) {
    console.log(chalk`  {red {bold ℹ} Failed to find the config.faucet.faucet_wallet_pub address you have set in the config.json in the walletd.json file... }{grey \nThis address must exist in the walletd.json!!}`);
  }
  else {
    console.log(chalk`  {blue {cyan {bold ℹ}} Faucet Address Set Correct!}`);
  }
// check the hold address
HoldCheckReq()
.then(function(HoldCheckReqRes) {
    if (!HoldCheckReqRes) {
    console.log(chalk`  {red {bold ℹ} Failed to find the config.wallet.hold_address you have set in the config.json in the walletd.json file... }{grey \nThis address must exist in the walletd.json!!}`);
  }
  else {
    console.log(chalk`  {blue {cyan {bold ℹ}} Hold Address Set Correct!}`);
  }


// check QRL Node
 // check for the config file
 const homeDir = require('os').homedir();
 // console.log(homeDir);
    fs.access(homeDir + '/.qrl/data/state/LOCK', error => {
      if (error) {
        console.log(chalk`  {red {bold ℹ} QRL Dir NOT Found...}{grey \nCopy from /_config.config.json.example and fill out}
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
  {blue {cyan {bold ℹ}} Discord Bot PID: {grey \n${spawnDiscord.pid}}}
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
    console.log(chalk`  {blue {cyan {bold ℹ}} Checks Complete... {grey \nAll Services started}}
    `);
  });
});
});
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